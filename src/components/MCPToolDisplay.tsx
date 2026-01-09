import React, { useState, useEffect } from 'react';
import { MCPToolCall } from '@/lib/ai/types';
import { ChevronDown, ChevronRight, Loader2, CheckCircle, XCircle, Wrench } from 'lucide-react';

interface MCPToolDisplayProps {
  toolCall: MCPToolCall;
  isCompact?: boolean;
}

export const MCPToolDisplay: React.FC<MCPToolDisplayProps> = ({ toolCall, isCompact = false }) => {
  // Control whether the details panel is open.
  // - Default to expanded for actionable states (pending/executing/failed) so users see live progress/errors.
  // - Default to collapsed for completed calls to keep the thread compact.
  const shouldAutoExpand = toolCall.status === 'pending' || toolCall.status === 'executing' || toolCall.status === 'failed';
  const [isExpanded, setIsExpanded] = useState(isCompact ? false : shouldAutoExpand);

  // If the tool transitions to completed, auto-collapse to reduce visual noise.
  useEffect(() => {
    if (toolCall.status === 'completed') {
      setIsExpanded(false);
    }
  }, [toolCall.status]);

  // Parse tool arguments (stringified JSON from the stream). If parsing fails, keep the raw string for inspection.
  let parsedArgs: any = {};
  try {
    parsedArgs = toolCall.arguments ? JSON.parse(toolCall.arguments) : {};
  } catch (e) {
    parsedArgs = { raw: toolCall.arguments };
  }

  // Parse tool result which can arrive as JSON (string) or a raw object. Fallback to original value on parse errors.
  let parsedResult: any = null;
  if (toolCall.result) {
    try {
      parsedResult = typeof toolCall.result === 'string' ? JSON.parse(toolCall.result) : toolCall.result;
    } catch (e) {
      parsedResult = toolCall.result;
    }
  }

  // Normalize error for safe rendering in React.
  // React cannot render plain objects as children, so coerce to a string and pretty-print JSON when possible.
  let normalizedError: string | null = null;
  if (toolCall.error !== undefined && toolCall.error !== null) {
    try {
      if (typeof toolCall.error === 'string') {
        // Attempt JSON parse for nicer formatting; otherwise render the raw string.
        const maybeObj = JSON.parse(toolCall.error);
        normalizedError = typeof maybeObj === 'object' ? JSON.stringify(maybeObj, null, 2) : String(toolCall.error);
      } else if (typeof toolCall.error === 'object') {
        normalizedError = JSON.stringify(toolCall.error, null, 2);
      } else {
        normalizedError = String(toolCall.error);
      }
    } catch {
      normalizedError = String(toolCall.error);
    }
  }

  const getStatusIcon = () => {
    switch (toolCall.status) {
      case 'pending':
      case 'executing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Wrench className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (toolCall.status) {
      case 'pending':
        return 'Preparing...';
      case 'executing':
        return 'Running...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  // Present tool names in a more human-readable form (e.g., "web_search" -> "Web Search").
  const formatToolName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="my-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Tool Header: status icon, tool name, server label, expand/collapse chevron */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {formatToolName(toolCall.name)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">
              {toolCall.serverLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getStatusText()}
          </span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Tool Details: arguments, result, and error sections */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Arguments: show parsed JSON input sent to the MCP tool */}
          {Object.keys(parsedArgs).length > 0 && (
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Arguments:
              </div>
              <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                {JSON.stringify(parsedArgs, null, 2)}
              </pre>
            </div>
          )}

          {/* Result: only shown on completion. Pretty-print objects, preserve simple text as-is. */}
          {toolCall.status === 'completed' && parsedResult && (
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Result:
              </div>
              {typeof parsedResult === 'object' ? (
                <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto">
                  {JSON.stringify(parsedResult, null, 2)}
                </pre>
              ) : (
                <div className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                  {String(parsedResult)}
                </div>
              )}
            </div>
          )}

          {/* Error: show normalized error safely (string/pretty JSON) when the tool fails. */}
          {toolCall.status === 'failed' && normalizedError && (
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                Error:
              </div>
              {normalizedError.trim().startsWith('{') || normalizedError.trim().startsWith('[') ? (
                <pre className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-x-auto">
                  {normalizedError}
                </pre>
              ) : (
                <div className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded whitespace-pre-wrap break-words">
                  {normalizedError}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
