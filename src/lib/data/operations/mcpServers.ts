import { v4 as uuidv4 } from 'uuid';
import { db, MCPServer } from '@/lib/db';

// Pre-built MCP servers
export const BUILTIN_MCP_SERVERS: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Tavily Search',
    serverUrl: 'https://mcp.tavily.com/mcp/?tavilyApiKey=YOUR_API_KEY',
    serverLabel: 'tavily',
    description: 'Real-time web search and content extraction for AI agents',
    requireApproval: 'never',
    isActive: false,
    isBuiltin: true,
  },
  {
    name: 'Exa Search',
    serverUrl: 'https://mcp.exa.ai/mcp?exaApiKey=YOUR_API_KEY',
    serverLabel: 'exa',
    description: 'AI-optimized semantic search with company research, crawling, LinkedIn search, and deep research capabilities',
    requireApproval: 'never',
    isActive: false,
    isBuiltin: true,
  },
];

// Initialize built-in servers (called on first load)
export async function initializeBuiltinMCPServers(): Promise<void> {
  // Use atomic transaction to ensure consistency
  await db.transaction('rw', db.mcpServers, async () => {
    const existingServers = await db.mcpServers.toArray();

    // Remove Firecrawl servers (no longer supported due to SSE requirements)
    const firecrawlServers = existingServers.filter(s =>
      s.serverLabel === 'firecrawl' ||
      s.serverUrl?.includes('mcp.firecrawl.dev')
    );
    for (const server of firecrawlServers) {
      if (server.id) {
        await db.mcpServers.delete(server.id);
      }
    }

    // Group servers by label for deduplication
    const serversByLabel = new Map<string, MCPServer[]>();

    for (const server of existingServers) {
      if (server.isBuiltin && server.serverLabel) {
        const servers = serversByLabel.get(server.serverLabel) || [];
        servers.push(server);
        serversByLabel.set(server.serverLabel, servers);
      }
    }

    // Merge duplicates intelligently
    for (const [label, servers] of serversByLabel) {
      if (servers.length > 1) {
        // Create merged configuration taking best of all duplicates
        const keeper = servers[0];
        if (!keeper) continue; // Safety check

        const merged: Partial<MCPServer> = {
          // Take configured URL (without YOUR_API_KEY) if any exist
          serverUrl: servers.find(s => s.serverUrl && !s.serverUrl.includes('YOUR_API_KEY'))?.serverUrl || keeper.serverUrl,
          // Active if any duplicate is active
          isActive: servers.some(s => s.isActive),
          // Keep custom headers if any exist
          customHeaders: servers.find(s => s.customHeaders && Object.keys(s.customHeaders).length > 0)?.customHeaders || keeper.customHeaders,
          // Use stricter approval setting (prefer 'always' over 'never')
          requireApproval: servers.find(s => s.requireApproval === 'always')?.requireApproval || keeper.requireApproval,
          // Update timestamp
          updatedAt: new Date()
        };

        // Update the keeper with merged data
        await db.mcpServers.update(keeper.id!, merged);

        // Delete the other duplicates
        for (let i = 1; i < servers.length; i++) {
          const serverToDelete = servers[i];
          if (serverToDelete?.id) {
            await db.mcpServers.delete(serverToDelete.id);
          }
        }
      }
    }

    // Add any missing built-in servers
    const currentLabels = new Set([...serversByLabel.keys()]);
    for (const server of BUILTIN_MCP_SERVERS) {
      if (!currentLabels.has(server.serverLabel)) {
        await addMCPServer(server);
      }
    }
  });
}

// Add a new MCP server
export async function addMCPServer(server: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = uuidv4();
  const now = new Date();

  await db.mcpServers.add({
    ...server,
    id,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

// Update an existing MCP server
export async function updateMCPServer(id: string, updates: Partial<Omit<MCPServer, 'id' | 'createdAt' | 'isBuiltin'>>): Promise<void> {
  const server = await db.mcpServers.get(id);
  if (server && server.isBuiltin) {
    // For built-in servers, only allow updating certain fields
    const allowedUpdates: Partial<MCPServer> = {};
    if (updates.isActive !== undefined) allowedUpdates.isActive = updates.isActive;
    if (updates.serverUrl !== undefined) allowedUpdates.serverUrl = updates.serverUrl;
    if (updates.customHeaders !== undefined) allowedUpdates.customHeaders = updates.customHeaders;
    if (updates.requireApproval !== undefined) allowedUpdates.requireApproval = updates.requireApproval;
    if (updates.authorizationToken !== undefined) allowedUpdates.authorizationToken = updates.authorizationToken;
    if (updates.allowedTools !== undefined) allowedUpdates.allowedTools = updates.allowedTools;
    if (updates.availableTools !== undefined) allowedUpdates.availableTools = updates.availableTools;
    if (updates.toolsLastFetched !== undefined) allowedUpdates.toolsLastFetched = updates.toolsLastFetched;

    await db.mcpServers.update(id, {
      ...allowedUpdates,
      updatedAt: new Date(),
    });
  } else {
    await db.mcpServers.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }
}

// Delete an MCP server
export async function deleteMCPServer(id: string): Promise<void> {
  const server = await db.mcpServers.get(id);
  // Don't allow deleting built-in servers
  if (server && !server.isBuiltin) {
    await db.mcpServers.delete(id);
  }
}

// Toggle MCP server active status
export async function toggleMCPServerStatus(id: string): Promise<void> {
  const server = await db.mcpServers.get(id);
  if (server) {
    await updateMCPServer(id, { isActive: !server.isActive });
  }
}

// Get all MCP servers
export async function getMCPServers(): Promise<MCPServer[]> {
  return await db.mcpServers.toArray();
}

// Get active MCP servers
export async function getActiveMCPServers(): Promise<MCPServer[]> {
  const servers = await db.mcpServers.toArray();
  return servers.filter(s => s.isActive);
}

// Get MCP server by ID
export async function getMCPServerById(id: string): Promise<MCPServer | undefined> {
  return await db.mcpServers.get(id);
}