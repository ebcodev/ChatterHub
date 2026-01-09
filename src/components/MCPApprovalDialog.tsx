import React, { useState } from 'react';
import { MCPApprovalRequest } from '@/lib/ai/types';
import { Shield, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MCPApprovalDialogProps {
  approvalRequest: MCPApprovalRequest | null;
  isOpen: boolean;
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
}

export const MCPApprovalDialog: React.FC<MCPApprovalDialogProps> = ({
  approvalRequest,
  isOpen,
  onApprove,
  onDeny,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!approvalRequest) return null;

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

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            Tool Approval Required
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The assistant wants to use a tool that requires your approval:
              </p>
              
              {/* Tool Info */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {formatToolName(approvalRequest.name)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">
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
                    className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {showDetails ? 'Hide' : 'Show'} full details
                  </button>
                  
                  {showDetails && (
                    <div className="mt-2">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
                        {JSON.stringify(parsedArgs, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                This tool can access external services on your behalf. Only approve if you trust this action.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onDeny(approvalRequest.id)}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Deny
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onApprove(approvalRequest.id)}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};