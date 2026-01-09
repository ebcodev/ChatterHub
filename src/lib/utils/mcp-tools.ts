import { MCPTool } from '@/lib/db';

/**
 * Fetches MCP server tools via our built-in proxy API
 * This handles CORS issues and supports both JSON and SSE responses
 */
export async function fetchMCPServerTools(
  mcpUrl: string,
  authToken?: string,
  useProxy: boolean = true
): Promise<MCPTool[]> {
  try {
    // For localhost connections, try direct connection first if proxy is disabled
    if (!useProxy && (mcpUrl.includes('localhost') || mcpUrl.includes('127.0.0.1'))) {
      // Direct connection attempt for localhost (mostly for testing)
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
      };

      if (authToken) {
        headers['Authorization'] = authToken.startsWith('Bearer ') 
          ? authToken 
          : `Bearer ${authToken}`;
      }

      const response = await fetch(mcpUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          jsonrpc: "2.0", 
          id: 1, 
          method: "tools/list", 
          params: {} 
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.result?.tools) {
        throw new Error('Invalid response: missing tools in result');
      }

      return data.result.tools.map((tool: any) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema
      }));
    }

    // Use our built-in proxy API for all other cases
    const response = await fetch('/api/mcp-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: mcpUrl,
        authToken
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: Request failed`;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        }
      } catch (e) {
        // Keep the default error message if JSON parsing fails
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.tools;
  } catch (error: any) {
    console.error('Failed to fetch MCP tools:', error);
    
    // Pass through specific error messages
    if (error.message?.includes('Authentication failed') ||
        error.message?.includes('MCP endpoint not found') ||
        error.message?.includes('Unable to connect') ||
        error.message?.includes('No valid tool list found') ||
        error.message?.includes('Failed to parse server response')) {
      throw error;
    }
    
    // Handle network errors
    if (error.message?.includes('Failed to fetch')) {
      throw new Error(
        'Unable to connect to MCP server. ' +
        'Please verify the server URL and try again.'
      );
    }
    
    // Pass through any other errors as-is
    throw error;
  }
}

/**
 * Validate MCP server URL
 */
export function validateMCPServerUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Optional: Listen for live tool list changes
 * Returns an EventSource that emits when tools change
 */
export function listenForToolChanges(
  mcpUrl: string,
  authToken?: string,
  onToolsChanged?: () => void
): EventSource | null {
  // Only works if the server supports GET SSE endpoint
  try {
    const url = new URL(mcpUrl);
    
    // Add auth token as query param if needed (some servers prefer this for EventSource)
    if (authToken) {
      url.searchParams.set('auth', authToken);
    }

    const es = new EventSource(url.toString());

    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.method === "notifications/tools/list_changed") {
          onToolsChanged?.();
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    es.onerror = (err) => {
      console.error("SSE connection error:", err);
      es.close();
    };

    return es;
  } catch (error) {
    console.error('Failed to setup EventSource:', error);
    return null;
  }
}