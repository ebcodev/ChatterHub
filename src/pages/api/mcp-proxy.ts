import { NextApiRequest, NextApiResponse } from 'next';

type JsonRpcReq = { jsonrpc: "2.0"; id: number; method: string; params?: any };
type JsonRpcRes<T = unknown> = { jsonrpc: "2.0"; id: number; result: T };

interface McpToolResponse {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

interface MCPTool {
  name: string;
  description?: string;
  input_schema?: Record<string, unknown>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, authToken } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = authToken.startsWith('Bearer ')
        ? authToken
        : `Bearer ${authToken}`;
    }

    const request: JsonRpcReq = { 
      jsonrpc: "2.0", 
      id: 1, 
      method: "tools/list", 
      params: {} 
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // Provide more helpful error messages
      if (response.status === 401 || response.status === 403) {
        return res.status(response.status).json({
          error: 'Authentication failed. Check your authorization token.'
        });
      }
      if (response.status === 404) {
        return res.status(response.status).json({
          error: 'MCP endpoint not found. Verify the server URL.'
        });
      }
      return res.status(response.status).json({
        error: `HTTP ${response.status}: ${response.statusText}`
      });
    }

    const contentType = response.headers.get('content-type') || '';

    // Handle JSON response
    if (contentType.includes('application/json')) {
      const json: JsonRpcRes<{ tools: McpToolResponse[] }> = await response.json();
      
      if (!json.result?.tools) {
        return res.status(500).json({
          error: 'Invalid response: missing tools in result'
        });
      }

      const tools: MCPTool[] = json.result.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema
      }));

      return res.status(200).json({ tools });
    }

    return res.status(415).json({
      error: `Unsupported content type: ${contentType}. Expected application/json.`
    });
  } catch (error: any) {
    console.error('MCP Proxy error:', error);
    
    // Provide more helpful error messages
    if (error.message?.includes('Failed to fetch') || error.message?.includes('ENOTFOUND')) {
      return res.status(500).json({
        error: 'Unable to connect to MCP server. The server may be unavailable or the URL may be incorrect.'
      });
    }
    
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};