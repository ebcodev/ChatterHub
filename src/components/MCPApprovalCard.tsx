import React, { useState } from 'react';
import { MCPApprovalRequest } from '@/lib/ai/types';
import { Shield, CheckCircle, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MCPApprovalCardProps {
  approvalRequest: MCPApprovalRequest;
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
}

export const MCPApprovalCard: React.FC<MCPApprovalCardProps> = ({
  approvalRequest,
  onApprove,
  onDeny,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);

  // Parse arguments safely
  let parsedArgs: any = {};
  try {
    parsedArgs = approvalRequest.arguments ? JSON.parse(approvalRequest.arguments) : {};
  } catch (e) {
    parsedArgs = { raw: approvalRequest.arguments };
  }

  // Format the tool name to be more readable
  const formatToolName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Extract key information from arguments for summary
  const getSummaryInfo = () => {
    const info = [];

    // Common patterns to extract
    if (parsedArgs.query) {
      info.push(`Search: "${parsedArgs.query}"`);
    }
    if (parsedArgs.url) {
      info.push(`URL: ${parsedArgs.url}`);
    }
    if (parsedArgs.urls && Array.isArray(parsedArgs.urls)) {
      info.push(`URLs: ${parsedArgs.urls.length} sites`);
    }
    if (parsedArgs.max_results) {
      info.push(`Max results: ${parsedArgs.max_results}`);
    }

    return info;
  };

  const summaryInfo = getSummaryInfo();

  const handleApprove = () => {
    setHasResponded(true);
    onApprove(approvalRequest.id);
  };

  const handleDeny = () => {
    setHasResponded(true);
    onDeny(approvalRequest.id);
  };

  return (
    <div className="my-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-700">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
            Tool Approval Required
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          The assistant wants to use a tool that requires your approval:
        </div>

        {/* Tool Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-2 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {formatToolName(approvalRequest.name)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
              {approvalRequest.serverLabel}
            </span>
          </div>

          {/* Summary Info */}
          {summaryInfo.length > 0 && (
            <div className="space-y-1 mt-2">
              {summaryInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Info className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 break-all">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Expandable Details */}
          <div className="mt-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Hide full details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show full details
                </>
              )}
            </button>

            {showDetails && (
              <div className="mt-2">
                <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
                  {JSON.stringify(parsedArgs, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          This tool can access external services on your behalf. Only approve if you trust this action.
        </p>

        {/* Action Buttons */}
        {!hasResponded && (
          <div className="flex gap-2">
            <Button
              onClick={handleDeny}
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white"
            >
              <XCircle className="h-4 w-4" />
              Deny
            </Button>
            <Button
              onClick={handleApprove}
              variant="default"
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          </div>
        )}

        {/* Response Status */}
        {hasResponded && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Response sent
          </div>
        )}
      </div>
    </div>
  );
};