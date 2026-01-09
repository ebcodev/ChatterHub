'use client';

import { useState, useEffect } from 'react';
import { X, Star, ExternalLink } from 'lucide-react';
import { Message, ChatGroup, db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { AVAILABLE_MODELS } from '@/lib/models';
import { Modal } from '../ui/modal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils/copyUtils';
import toast from 'react-hot-toast';

interface StarredMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToChat: (chatGroupId: string) => void;
}

export default function StarredMessagesModal({ isOpen, onClose, onNavigateToChat }: StarredMessagesModalProps) {
  // Fetch all starred messages
  const starredMessages = useLiveQuery(
    () => db.messages.where('starred').equals(1).reverse().sortBy('createdAt'),
    []
  ) || [];

  // Fetch all chat groups for navigation
  const chatGroups = useLiveQuery(() => db.chatGroups.toArray()) || [];

  const handleUnstar = async (messageId: string) => {
    await db.messages.update(messageId, { starred: false });
  };

  const handleGoToChat = (chatGroupId: string) => {
    onNavigateToChat(chatGroupId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Starred Messages
            </h2>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              ({starredMessages.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
          {starredMessages.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Star className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium">No starred messages yet</p>
              <p className="text-sm mt-2">Star messages to save them for later</p>
            </div>
          ) : (
            <div className="space-y-4">
              {starredMessages.map((message) => {
                const chatGroup = chatGroups.find(cg => cg.id === message.chatGroupId);
                const modelInfo = message.model ? AVAILABLE_MODELS.find(m => m.id === message.model) : null;
                const isError = message.role === 'assistant' && message.content.startsWith('Error:');
                
                return (
                  <div
                    key={message.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {/* Message Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            message.role === 'user' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {message.role === 'user' ? 'You' : modelInfo?.name || 'Assistant'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {chatGroup && (
                          <button
                            onClick={() => handleGoToChat(chatGroup.id!)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>{chatGroup.title}</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleUnstar(message.id!)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Unstar message"
                      >
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </button>
                    </div>

                    {/* Message Content */}
                    <div className={`text-sm ${
                      isError 
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {message.role === 'assistant' && !isError ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Custom rendering for code blocks with syntax highlighting
                              code({ inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const code = String(children).replace(/\n$/, '');

                                return !inline && match ? (
                                  <div className="relative group my-2">
                                    <div className="absolute right-2 top-2 z-10">
                                      <button
                                        onClick={() => {
                                          copyToClipboard(code).then(success => {
                                            if (success) {
                                              toast.success('Code copied!');
                                            } else {
                                              toast.error('Failed to copy');
                                            }
                                          });
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded flex items-center gap-1"
                                        title="Copy code"
                                      >
                                        <Copy className="h-3 w-3" />
                                        Copy
                                      </button>
                                    </div>
                                    <SyntaxHighlighter
                                      language={match[1]}
                                      style={vscDarkPlus}
                                      customStyle={{
                                        margin: 0,
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        padding: '1rem',
                                      }}
                                      showLineNumbers={code.split('\n').length > 10}
                                      wrapLines={true}
                                      {...props}
                                    >
                                      {code}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              // Simplified rendering for other elements
                              p({ children }: any) {
                                return <p className="mb-2 last:mb-0">{children}</p>;
                              },
                              a({ href, children }: any) {
                                return (
                                  <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300"
                                  >
                                    {children}
                                  </a>
                                );
                              },
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}