import { useLiveQuery } from 'dexie-react-hooks';
import { db, MCPServer } from '@/lib/db';
import {
  addMCPServer,
  updateMCPServer,
  deleteMCPServer,
  toggleMCPServerStatus,
  initializeBuiltinMCPServers,
} from '@/lib/data/operations/mcpServers';
import { useEffect, useRef } from 'react';

export function useMCPServers() {
  // Use ref to prevent double initialization in React StrictMode
  const initialized = useRef(false);
  
  // Initialize built-in servers on first load
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializeBuiltinMCPServers();
    }
  }, []);

  // Get all MCP servers with live updates
  const mcpServers = useLiveQuery(
    () => db.mcpServers.toArray()
  ) || [];

  // Get only active MCP servers
  const activeMCPServers = useLiveQuery(
    () => db.mcpServers.toArray().then(servers => servers.filter(s => s.isActive))
  ) || [];

  // Separate built-in and custom servers
  const builtinServers = mcpServers.filter(s => s.isBuiltin);
  const customServers = mcpServers.filter(s => !s.isBuiltin);

  return {
    mcpServers,
    activeMCPServers,
    builtinServers,
    customServers,
    addMCPServer,
    updateMCPServer,
    deleteMCPServer,
    toggleMCPServerStatus,
  };
}

// Hook to get a single MCP server by ID
export function useMCPServer(id: string | null) {
  const mcpServer = useLiveQuery(
    () => id ? db.mcpServers.get(id) : undefined,
    [id]
  );

  return mcpServer;
}