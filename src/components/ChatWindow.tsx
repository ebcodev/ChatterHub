'use client';

import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import { Chat, Message, db, ModelParameters, ImageAttachment } from '@/lib/db';
import { deleteMessage } from '@/lib/data/operations';
import { ChevronDown, X, Move, Star, Trash2, Edit2, Settings, MoreVertical, StopCircle, Copy, RefreshCw, ChevronLeft, ChevronRight, ArrowDown, FileText, Code, Network, AlertCircle } from 'lucide-react';
import { MCPToolDisplay } from '@/components/MCPToolDisplay';
import { MCPApprovalCard } from '@/components/MCPApprovalCard';
import { MCPToolCall, MCPApprovalRequest } from '@/lib/ai/types';
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
import { v4 as uuidv4 } from 'uuid';
import { useLiveQuery } from 'dexie-react-hooks';
import { AVAILABLE_MODELS, getAllModels, getProviderLogo } from '@/lib/models';
import { useCustomModels } from '@/hooks/data/useCustomModels';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useImageAttachments, processMessageContent } from '@/hooks/useImageAttachments';
import { formatContextWindow } from '@/lib/utils';
import { extractPlainText, preserveMarkdown, copyToClipboard } from '@/lib/utils/copyUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  isLoading: boolean;
  onModelChange: (chatId: string, model: string) => void;
  onActiveToggle: (chatId: string, isActive: boolean) => void;
  onClose: (chatId: string) => void;
  onAbort?: (chatId: string) => void;
  onRetry?: (chatId: string, messageId: string) => void;
  position: number;
  totalChats: number;
  layout: 'vertical' | 'horizontal' | '2x2' | '2x3' | '3x3' | 'freeform';
  pendingApproval?: MCPApprovalRequest | null;
  onApproveToolCall?: (requestId: string) => void;
  onDenyToolCall?: (requestId: string) => void;
}

const ChatWindow = memo(function ChatWindow({
  chat,
  messages,
  isLoading,
  onModelChange,
  onActiveToggle,
  onClose,
  onAbort,
  onRetry,
  position,
  totalChats,
  layout,
  pendingApproval,
  onApproveToolCall,
  onDenyToolCall
}: ChatWindowProps) {
  const { activeCustomModels } = useCustomModels();
  const allModels = getAllModels(activeCustomModels);
  
  // === DOM Refs ===
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  const reasoningDropdownRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  // === UI State - Dropdowns/Modals ===
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showModelSettings, setShowModelSettings] = useState(false);
  const [showReasoningDropdown, setShowReasoningDropdown] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<{ url: string; filename: string } | null>(null);
  
  // === Model Settings State ===
  const [temperature, setTemperature] = useState<number | null>(null);
  const [presencePenalty, setPresencePenalty] = useState<number | null>(null);
  const [frequencyPenalty, setFrequencyPenalty] = useState<number | null>(null);
  const [topP, setTopP] = useState<number | null>(null);
  const [maxTokens, setMaxTokens] = useState<number | null>(null);
  const [reasoningEffort, setReasoningEffort] = useState<'low' | 'medium' | 'high' | null>(null);
  
  // === Message Interaction State ===
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  
  // === Search/Filter State ===
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [hasActiveMCPServers, setHasActiveMCPServers] = useState(false);
  
  // === Scroll Management State ===
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // === Helper Functions ===
  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = editTextareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height based on scrollHeight
    const newHeight = Math.min(textarea.scrollHeight, 500); // Max height of 500px
    textarea.style.height = `${newHeight}px`;
  };
  
  // === Database Queries ===
  // Load model parameters from database - only when model changes
  const modelParameters = useLiveQuery(
    () => chat.model ? db.modelParameters.where('modelId').equals(chat.model).first() : undefined,
    [chat.model]
  );
  
  // Check if there are active MCP servers
  const activeMCPServers = useLiveQuery(
    () => db.mcpServers.where('isActive').equals(1).toArray(),
    []
  );
  
  useEffect(() => {
    setHasActiveMCPServers((activeMCPServers?.length || 0) > 0);
  }, [activeMCPServers]);
  
  // Get chatGroupId from first message (all messages in a window share the same chatGroupId)
  const chatGroupId = useMemo(() => messages[0]?.chatGroupId || '', [messages]);
  const { imageUrls, imageAttachments } = useImageAttachments(chatGroupId);
  
  // Create a map of message IDs to their attachments
  const messageAttachments = useMemo(() => {
    const map = new Map<string, ImageAttachment[]>();
    imageAttachments.forEach(attachment => {
      const messageId = attachment.messageId;
      if (!map.has(messageId)) {
        map.set(messageId, []);
      }
      map.get(messageId)!.push(attachment);
    });
    return map;
  }, [imageAttachments]);

  // Handle scroll events to detect user scrolling
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50; // 50px threshold
    
    // If user scrolled up (not at bottom), mark as user scrolling
    if (!isAtBottom) {
      setIsUserScrolling(true);
      setShowScrollButton(true);
    } else {
      // If scrolled back to bottom, re-enable auto-scroll
      setIsUserScrolling(false);
      setShowScrollButton(false);
    }
  };

  // Scroll to bottom when button is clicked
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsUserScrolling(false);
    setShowScrollButton(false);
  };

  // Smart auto-scroll: only scroll if user hasn't manually scrolled
  useEffect(() => {
    // Only auto-scroll if:
    // 1. User hasn't manually scrolled up
    // 2. This chat is currently loading (receiving new messages)
    // 3. Not in freeform layout (to prevent canvas scrolling)
    if (!isUserScrolling && isLoading && layout !== 'freeform') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isUserScrolling, layout]);

  // Reset user scrolling when a new user message is sent
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      setIsUserScrolling(false);
      // Scroll to bottom for new user messages (except in freeform layout)
      if (layout !== 'freeform') {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [messages, layout]);

  // Scroll to bottom immediately when switching to a different chat
  useEffect(() => {
    // Reset scroll state and scroll to bottom when chat changes (except in freeform layout)
    setIsUserScrolling(false);
    setShowScrollButton(false);
    if (layout !== 'freeform') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [chatGroupId, layout]); // chatGroupId is computed from messages[0]?.chatGroupId

  // Load parameters when model parameters change
  useEffect(() => {
    if (modelParameters) {
      setTemperature(modelParameters.temperature ?? null);
      setPresencePenalty(modelParameters.presencePenalty ?? null);
      setFrequencyPenalty(modelParameters.frequencyPenalty ?? null);
      setTopP(modelParameters.topP ?? null);
      setMaxTokens(modelParameters.maxTokens ?? null);
      setReasoningEffort(modelParameters.reasoningEffort ?? null);
    } else {
      setTemperature(null);
      setPresencePenalty(null);
      setFrequencyPenalty(null);
      setTopP(null);
      setMaxTokens(null);
      setReasoningEffort(null);
    }
  }, [modelParameters]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
      }
      if (deleteConfirmRef.current && !deleteConfirmRef.current.contains(event.target as Node)) {
        setShowDeleteConfirm(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false);
      }
      if (reasoningDropdownRef.current && !reasoningDropdownRef.current.contains(event.target as Node)) {
        setShowReasoningDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate grid position classes based on layout
  const gridClasses = useMemo(() => {
    if (layout === 'vertical') {
      return 'h-full min-h-[250px]';
    } else if (layout === 'freeform') {
      return 'h-full';
    }
    return 'h-full w-full min-h-0';
  }, [layout]);

  return (
    <div className={`relative flex flex-col bg-white dark:bg-gray-900 ${layout !== 'freeform' ? 'border border-gray-200 dark:border-gray-700 rounded-lg' : ''} ${gridClasses}`}>
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          {/* Drag Handle for freeform mode */}
          {layout === 'freeform' && (
            <div className="drag-handle cursor-grab p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <Move className="h-4 w-4 text-gray-500" />
            </div>
          )}
          
          {/* Model Selector, Reasoning, and Checkbox */}
          <div className="relative flex items-center gap-2" ref={modelSelectorRef}>
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-1.5 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {allModels.find(m => m.id === chat.model)?.name || chat.model}
              </span>
              <ChevronDown className="h-3 w-3 text-gray-600 dark:text-gray-400" />
              {(() => {
                const currentModel = allModels.find(m => m.id === chat.model);
                if (!currentModel?.supportsMCP && hasActiveMCPServers) {
                  return (
                    <div className="group/warning relative ml-1">
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/warning:opacity-100 transition-opacity pointer-events-none z-[9999]">
                        MCP servers inactive for this model
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </button>
            
            {/* Reasoning Effort Dropdown - Only show for models that support it */}
            {(() => {
              const currentModel = allModels.find(m => m.id === chat.model);
              if (!currentModel?.supportsReasoningEffort) return null;
              
              return (
                <div className="relative" ref={reasoningDropdownRef}>
                  <button
                    onClick={() => setShowReasoningDropdown(!showReasoningDropdown)}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Set reasoning effort level"
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {reasoningEffort ? reasoningEffort.charAt(0).toUpperCase() + reasoningEffort.slice(1) : 'Medium'} Reasoning
                    </span>
                    <ChevronDown className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  {showReasoningDropdown && (
                    <div className="absolute left-0 top-full mt-1 w-[150px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9998]">
                      {['low', 'medium', 'high'].map((effort) => (
                        <button
                          key={effort}
                          onClick={async () => {
                            const effortValue = effort as 'low' | 'medium' | 'high';
                            setReasoningEffort(effortValue);
                            setShowReasoningDropdown(false);
                            
                            // Save to database
                            if (chat.model) {
                              const existing = await db.modelParameters.where('modelId').equals(chat.model).first();
                              if (existing) {
                                await db.modelParameters.update(existing.id!, {
                                  reasoningEffort: effortValue,
                                  updatedAt: new Date()
                                });
                              } else {
                                await db.modelParameters.add({
                                  id: uuidv4(),
                                  modelId: chat.model,
                                  reasoningEffort: effortValue,
                                  createdAt: new Date(),
                                  updatedAt: new Date()
                                });
                              }
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                        >
                          <span className="capitalize">{effort}</span>
                          {(reasoningEffort || 'medium') === effort && (
                            <span className="text-blue-500">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            
            {/* Active Checkbox */}
            <input
              type="checkbox"
              checked={chat.isActive}
              onChange={(e) => onActiveToggle(chat.id!, e.target.checked)}
              className="h-4 w-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              title={chat.isActive ? 'Chat receives input' : 'Chat does not receive input'}
            />

            {showModelSelector && (
              <div className="absolute left-0 top-full mt-1 w-[320px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[9998] max-h-[400px] flex flex-col">
                {/* Search Bar */}
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <input
                    type="text"
                    placeholder="Search models..."
                    value={modelSearchQuery}
                    onChange={(e) => setModelSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 text-xs"
                    autoFocus
                  />
                </div>

                {/* Models List with Scroll */}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800" style={{ maxHeight: '350px' }}>
                  {allModels
                    .filter(model =>
                      model.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
                      model.id.toLowerCase().includes(modelSearchQuery.toLowerCase())
                    )
                    .map((model) => {
                      const logoPath = getProviderLogo(model.provider);
                      return (
                        <button
                          key={model.id}
                          onClick={() => {
                            onModelChange(chat.id!, model.id);
                            setShowModelSelector(false);
                            setModelSearchQuery('');
                            
                            // Show warning if selecting a model that doesn't support MCP when MCP servers are active
                            if (hasActiveMCPServers && !model.supportsMCP) {
                              toast('This model doesn\'t support MCP servers', {
                                icon: '⚠️',
                                style: {
                                  borderRadius: '10px',
                                  background: '#333',
                                  color: '#fff',
                                },
                              });
                            }
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            chat.model === model.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''
                          } flex items-center justify-between group`}
                        >
                          <div className="flex items-center gap-2">
                            {logoPath && (
                              <div className="w-5 h-5 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <Image
                                  src={logoPath}
                                  alt={model.provider}
                                  width={20}
                                  height={20}
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{model.name}</span>
                              {model.supportsMCP && (
                                <div className="group/mcp relative">
                                  <Network className="h-3 w-3 text-blue-500" />
                                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/mcp:opacity-100 transition-opacity pointer-events-none z-[9999]">
                                    Supports MCP servers
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {hasActiveMCPServers && !model.supportsMCP && (
                              <div className="group/warning relative">
                                <AlertCircle className="h-3 w-3 text-yellow-500" />
                                <div className="absolute right-0 bottom-full mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/warning:opacity-100 transition-opacity pointer-events-none z-[9999]">
                                  MCP servers won't work with this model
                                </div>
                              </div>
                            )}
                            <span className="text-gray-400 dark:text-gray-500 text-[10px]">{formatContextWindow(model.contextWindow)}</span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Settings Dropdown */}
          <div className="relative" ref={settingsDropdownRef}>
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title="Settings"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
            
            {showSettingsDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-[9998]">
                <button
                  onClick={() => {
                    setShowModelSettings(true);
                    setShowSettingsDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Model Settings
                </button>
              </div>
            )}
          </div>

          {/* Abort Button - Show when loading */}
          {isLoading && onAbort && (
            <button
              onClick={() => onAbort(chat.id!)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Stop generating"
            >
              <StopCircle className="h-4 w-4 text-red-500" />
            </button>
          )}

          {/* Close Button */}
          {totalChats > 1 && (
            <div className="relative" ref={deleteConfirmRef}>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title="Remove chat"
              >
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
              
              {/* Delete Confirmation Popup */}
              {showDeleteConfirm && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-[9998]">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Are you sure you want to delete this chat window? All messages will be lost.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onClose(chat.id!);
                        setShowDeleteConfirm(false);
                      }}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-2 sm:p-4 overflow-y-auto overflow-x-hidden relative">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              <p>No messages yet</p>
            </div>
          )}

          {messages
            // Filter out empty assistant messages (they're created when streaming starts)
            // These will be shown as loading dots instead when isLoading is true
            // Also filter to show only active versions when there are retries
            .filter((message) => {
              if (message.role === 'assistant' && message.content === '') {
                return false; // Skip empty assistant messages
              }
              // Show only active versions (undefined means it's not a retry, so show it)
              if (message.isActiveVersion !== undefined && !message.isActiveVersion) {
                return false; // Skip inactive versions
              }
              return true;
            })
            .map((message, index, filteredMessages) => {
            const isError = message.role === 'assistant' && message.content.startsWith('Error:');
            const modelInfo = message.model ? allModels.find(m => m.id === message.model) : null;
            const isLastMessage = index === filteredMessages.length - 1;
            const isLastAssistantMessage = isLastMessage && message.role === 'assistant';
            
            const handleStarToggle = async () => {
              if (message.id) {
                await db.messages.update(message.id, { starred: !message.starred });
              }
            };

            const handleDeleteMessage = () => {
              if (message.id) {
                setMessageToDelete(message.id);
              }
            };
            
            const handleCopyAsText = async () => {
              const plainText = extractPlainText(message.content);
              const success = await copyToClipboard(plainText);
              if (success) {
                toast.success('Copied as plain text');
              } else {
                toast.error('Failed to copy text');
              }
            };

            const handleCopyAsMarkdown = async () => {
              const markdown = preserveMarkdown(message.content);
              const success = await copyToClipboard(markdown);
              if (success) {
                toast.success('Copied as markdown');
              } else {
                toast.error('Failed to copy markdown');
              }
            };

            const handleRetryMessage = (message: Message) => {
              if (onRetry && message.id) {
                onRetry(chat.id!, message.id);
              }
            };

            const handleVersionSwitch = async (message: Message, direction: number) => {
              if (!message.siblingMessageIds || !message.id) return;
              
              const currentIndex = message.siblingMessageIds.indexOf(message.id);
              const newIndex = currentIndex + direction;
              
              if (newIndex < 0 || newIndex >= message.siblingMessageIds.length) return;
              
              const targetMessageId = message.siblingMessageIds[newIndex];
              
              // Update all siblings to set the active version
              for (const siblingId of message.siblingMessageIds) {
                await db.messages.update(siblingId, {
                  isActiveVersion: siblingId === targetMessageId
                });
              }
            };

            const handleEditMessage = () => {
              if (message.id && message.role === 'user') {
                setEditingMessageId(message.id);
                setEditContent(message.content);
                // Auto-resize after content is set
                setTimeout(() => adjustTextareaHeight(), 0);
              }
            };

            const handleSaveEdit = async () => {
              if (editingMessageId) {
                await db.messages.update(editingMessageId, { content: editContent });
                setEditingMessageId(null);
                setEditContent('');
              }
            };

            const handleCancelEdit = () => {
              setEditingMessageId(null);
              setEditContent('');
            };
            
            return (
              <div
                key={message.id}
                className="group"
              >
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {/* Edit Mode - completely separate structure */}
                  {editingMessageId === message.id && message.role === 'user' ? (
                    <div className="w-full">
                      <div className="bg-gray-800 dark:bg-gray-900 rounded-xl p-3 shadow-xl border border-gray-700 dark:border-gray-600">
                        <textarea
                          ref={(ref) => {
                            editTextareaRef.current = ref;
                            if (ref) {
                              // Auto-focus and place cursor at end
                              ref.focus();
                              ref.setSelectionRange(ref.value.length, ref.value.length);
                              adjustTextareaHeight();
                            }
                          }}
                          value={editContent}
                          onChange={(e) => {
                            setEditContent(e.target.value);
                            adjustTextareaHeight();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              handleCancelEdit();
                            }
                          }}
                          className="w-full bg-transparent text-white text-sm border-b border-gray-600 focus:border-blue-400 focus:outline-none resize-none overflow-y-auto pb-1 px-2 placeholder-gray-500"
                          style={{ minHeight: '24px' }}
                          placeholder="Edit message..."
                        />
                        <div className="flex justify-end gap-3 mt-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                  /* Normal Message Display */
                  <div className="relative max-w-[85%]">
                    <div className="flex flex-col gap-1">
                      {/* Show model info for assistant messages */}
                      {message.role === 'assistant' && modelInfo && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 px-1 flex items-center gap-2">
                          <span>{modelInfo.name}</span>
                          {/* Show version navigation if there are siblings */}
                          {message.siblingMessageIds && message.siblingMessageIds.length > 1 && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleVersionSwitch(message, -1)}
                                disabled={message.siblingMessageIds.indexOf(message.id!) <= 0}
                                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Previous version"
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </button>
                              <span className="text-[9px]">
                                {message.siblingMessageIds.indexOf(message.id!) + 1} of {message.siblingMessageIds.length}
                              </span>
                              <button
                                onClick={() => handleVersionSwitch(message, 1)}
                                disabled={message.siblingMessageIds.indexOf(message.id!) >= message.siblingMessageIds.length - 1}
                                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Next version"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <div
                        className={`relative rounded-xl px-3 py-2 text-sm ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : isError
                            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                            : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                      {/* Display reasoning summary at the top for o-series and gpt-5 models */}
                      {message.role === 'assistant' && message.reasoningSummary && (() => {
                        // Split reasoning by bold header sections like "**Section Title**"
                        const splitByBoldHeaders = (text: string): string[] => {
                          const lines = text.split(/\n/);
                          const sections: string[] = [];
                          let current = '';
                          const isHeader = (line: string) => /^\*\*[^\n]+\*\*/.test(line.trim());
                          for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];
                            if (line && isHeader(line)) {
                              if (current.trim()) sections.push(current.trim());
                              current = line.trim();
                            } else {
                              current += (current ? '\n' : '') + line;
                            }
                          }
                          if (current.trim()) sections.push(current.trim());
                          // Fallback to paragraph split if no bold headers detected
                          if (sections.length <= 1) {
                            return text.split(/\n\n+/).filter(s => s.trim());
                          }
                          return sections;
                        };
                        const sections = splitByBoldHeaders(message.reasoningSummary);
                        return (
                          <details className="mb-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                            <summary className="cursor-pointer px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium">
                              Thought for a few seconds
                            </summary>
                            <div className="p-3 space-y-2">
                              {sections.map((section, index) => (
                                <div key={index} className="flex gap-2">
                                  {/* Timeline dots with consistent connectors */}
                                  <div className="flex flex-col items-center pt-1 w-3">
                                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0"></div>
                                    {index < sections.length - 1 && (
                                      <div className="w-px flex-1 bg-gray-300 dark:bg-gray-600 mt-1"></div>
                                    )}
                                  </div>
                                  {/* Section content */}
                                  <div className="flex-1 pb-1">
                                    <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                      {section}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        );
                      })()}
                      
                  {message.role === 'assistant' && !isError ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-gray-600 dark:prose-li:marker:text-gray-400">
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
                        // Custom rendering for paragraphs
                        p({ children }: any) {
                          return <p className="mb-2 last:mb-0">{children}</p>;
                        },
                        // Custom rendering for lists
                        ul({ children }: any) {
                          // Use list-outside to prevent markers from appearing on a new line
                          return <ul className="list-disc list-outside pl-5 mb-2 space-y-1 marker:text-gray-600 dark:marker:text-gray-400">{children}</ul>;
                        },
                        ol({ children }: any) {
                          // Use list-outside to prevent numbers from appearing on a new line
                          return <ol className="list-decimal list-outside pl-5 mb-2 space-y-1 marker:text-gray-600 dark:marker:text-gray-400">{children}</ol>;
                        },
                        li({ children }: any) {
                          // Avoid extra padding so wrapped lines align with the marker
                          return <li className="pl-0">{children}</li>;
                        },
                        // Custom rendering for links
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
                        // Custom rendering for blockquotes
                        blockquote({ children }: any) {
                          return (
                            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 italic">
                              {children}
                            </blockquote>
                          );
                        },
                        // Custom rendering for headings
                        h1({ children }: any) {
                          return <h1 className="text-lg font-bold mb-2">{children}</h1>;
                        },
                        h2({ children }: any) {
                          return <h2 className="text-base font-bold mb-2">{children}</h2>;
                        },
                        h3({ children }: any) {
                          return <h3 className="text-sm font-bold mb-1">{children}</h3>;
                        },
                        // Custom rendering for tables
                        table({ children }: any) {
                          return (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                {children}
                              </table>
                            </div>
                          );
                        },
                        th({ children }: any) {
                          return (
                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              {children}
                            </th>
                          );
                        },
                        td({ children }: any) {
                          return (
                            <td className="px-2 py-1 text-xs text-gray-700 dark:text-gray-300">
                              {children}
                            </td>
                          );
                        },
                      }}
                    >
                      {processMessageContent(message.content, imageUrls)}
                    </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">
                        {message.role === 'user' ? (
                          // Render user messages with ReactMarkdown to support images
                          <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                // Simple image rendering for user messages
                                img({ src, alt }: any) {
                                  return (
                                    <img 
                                      src={src} 
                                      alt={alt || 'Image'} 
                                      className="max-w-full h-auto rounded my-2"
                                    />
                                  );
                                },
                                // Prevent extra spacing in user messages
                                p({ children }: any) {
                                  return <span>{children}</span>;
                                }
                              }}
                            >
                              {processMessageContent(message.content, imageUrls)}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          // For system messages or other roles, just show text
                          processMessageContent(message.content, imageUrls)
                        )}
                      </div>
                    )}
                      </div>
                      
                      {/* Display tool calls */}
                      {message.toolCalls && message.toolCalls.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.toolCalls.map((toolCall, index) => (
                            <MCPToolDisplay
                              key={`${toolCall.id}-${index}`}
                              toolCall={toolCall as MCPToolCall}
                              isCompact={false}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Display attached images */}
                      {message.id && messageAttachments.get(message.id) && messageAttachments.get(message.id)!.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {messageAttachments.get(message.id)!.map((attachment) => {
                            const imageUrl = imageUrls.get(attachment.id!);
                            return imageUrl ? (
                              <div key={attachment.id} className="relative">
                                <img
                                  src={imageUrl}
                                  alt={attachment.filename}
                                  className="max-w-[200px] max-h-[200px] rounded-lg border border-gray-200 dark:border-gray-700 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setEnlargedImage({ url: imageUrl, filename: attachment.filename })}
                                />
                              </div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </div>
                
                {/* Action buttons - below message */}
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mt-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <div className="flex items-center gap-1 px-1">
                    <button
                      onClick={handleStarToggle}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      title={message.starred ? "Unstar message" : "Star message"}
                    >
                      <Star className={`h-3.5 w-3.5 ${message.starred ? 'fill-yellow-500 text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Copy message"
                        >
                          <Copy className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" side="bottom" className="w-48">
                        <DropdownMenuItem
                          onClick={handleCopyAsText}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <FileText className="h-4 w-4" />
                          <span>Copy as text</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleCopyAsMarkdown}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Code className="h-4 w-4" />
                          <span>Copy as markdown</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {message.role === 'assistant' && isLastAssistantMessage && (
                      <button
                        onClick={() => handleRetryMessage(message)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Retry message"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      </button>
                    )}
                    {message.role === 'user' && (
                      <button
                        onClick={handleEditMessage}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Edit message"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      </button>
                    )}
                    <button
                      onClick={handleDeleteMessage}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Display pending approval if present */}
          {pendingApproval && onApproveToolCall && onDenyToolCall && (
            <MCPApprovalCard
              approvalRequest={pendingApproval}
              onApprove={onApproveToolCall}
              onDeny={onDenyToolCall}
            />
          )}

          {isLoading && (() => {
            // Check if there's an assistant message being streamed with content
            const lastMessage = messages[messages.length - 1];
            const hasStreamingContent = lastMessage && 
              lastMessage.role === 'assistant' && 
              lastMessage.content !== '';
            const hasReasoningContent = lastMessage && 
              lastMessage.role === 'assistant' && 
              lastMessage.reasoningSummary;
            
            // Show reasoning if available for reasoning models
            if (!hasStreamingContent && hasReasoningContent && lastMessage.reasoningSummary) {
              // Split reasoning by bold header sections like "**Section Title**"
              const splitByBoldHeaders = (text: string): string[] => {
                const lines = text.split(/\n/);
                const sections: string[] = [];
                let current = '';
                const isHeader = (line: string) => /^\*\*[^\n]+\*\*/.test(line.trim());
                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i];
                  if (line && isHeader(line)) {
                    if (current.trim()) sections.push(current.trim());
                    current = line.trim();
                  } else {
                    current += (current ? '\n' : '') + line;
                  }
                }
                if (current.trim()) sections.push(current.trim());
                if (sections.length <= 1) {
                  return text.split(/\n\n+/).filter(s => s.trim());
                }
                return sections;
              };
              const sections = splitByBoldHeaders(lastMessage.reasoningSummary);
              return (
                <div className="flex justify-start">
                  <div className="flex flex-col gap-1">
                    {/* Show model info for loading message */}
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 px-1">
                      {allModels.find(m => m.id === chat.model)?.name || chat.model}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Thinking...</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {sections.map((section, index) => (
                          <div key={index} className="flex gap-2">
                            {/* Timeline dots with consistent connectors */}
                            <div className="flex flex-col items-center pt-1 w-3">
                              <div className={`w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0 ${index === sections.length - 1 ? 'animate-pulse' : ''}`}></div>
                              {index < sections.length - 1 && (
                                <div className="w-px flex-1 bg-gray-300 dark:bg-gray-600 mt-1"></div>
                              )}
                            </div>
                            {/* Section content */}
                            <div className="flex-1 pb-1">
                              <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                {section}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            // Only show loading dots if there's no content and no reasoning yet
            else if (!hasStreamingContent) {
              return (
                <div className="flex justify-start">
                  <div className="flex flex-col gap-1">
                    {/* Show model info for loading message */}
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 px-1">
                      {allModels.find(m => m.id === chat.model)?.name || chat.model}
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Scroll to Bottom Button - Positioned at bottom right of chat window */}
      <div 
        className={`absolute bottom-4 right-4 z-10 transition-all duration-300 ease-in-out ${
          showScrollButton ? 'opacity-50 hover:opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <button
          onClick={scrollToBottom}
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full p-2.5 shadow-lg transition-all duration-200 hover:scale-110"
          title="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      
      {/* Model Settings Modal */}
      {showModelSettings && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {allModels.find(m => m.id === chat.model)?.name} Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Configure model parameters. Leave empty to use defaults.
                  </p>
                </div>
                <button
                  onClick={() => setShowModelSettings(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Temperature
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {temperature !== null ? temperature.toFixed(1) : 'DEFAULT'}
                    </span>
                    {temperature !== null && (
                      <button
                        onClick={() => setTemperature(null)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature || 0.7}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Higher values make output more random, lower values more focused
                </p>
              </div>

              {/* Presence Penalty */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Presence Penalty
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {presencePenalty !== null ? presencePenalty.toFixed(1) : 'DEFAULT'}
                    </span>
                    {presencePenalty !== null && (
                      <button
                        onClick={() => setPresencePenalty(null)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={presencePenalty || 0}
                  onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Penalizes new tokens based on whether they appear in text so far
                </p>
              </div>

              {/* Frequency Penalty */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Frequency Penalty
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {frequencyPenalty !== null ? frequencyPenalty.toFixed(1) : 'DEFAULT'}
                    </span>
                    {frequencyPenalty !== null && (
                      <button
                        onClick={() => setFrequencyPenalty(null)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={frequencyPenalty || 0}
                  onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Penalizes new tokens based on their frequency in text so far
                </p>
              </div>

              {/* Top P */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Top P
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {topP !== null ? topP.toFixed(2) : 'DEFAULT'}
                    </span>
                    {topP !== null && (
                      <button
                        onClick={() => setTopP(null)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={topP || 1}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Nucleus sampling: considers tokens with top_p probability mass
                </p>
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Max Tokens
                  </label>
                  {maxTokens !== null && (
                    <button
                      onClick={() => setMaxTokens(null)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Reset to default
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  max="32000"
                  value={maxTokens || ''}
                  onChange={(e) => setMaxTokens(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="DEFAULT"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maximum number of tokens to generate
                </p>
              </div>

              {/* Reasoning Effort (for models that support it) */}
              {allModels.find(m => m.id === chat.model)?.supportsReasoningEffort && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reasoning Effort
                    </label>
                    {reasoningEffort !== null && (
                      <button
                        onClick={() => setReasoningEffort(null)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <select
                    value={reasoningEffort || ''}
                    onChange={(e) => setReasoningEffort(e.target.value as 'low' | 'medium' | 'high' | null || null)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <option value="">DEFAULT (Medium)</option>
                    <option value="low">Low - Faster responses</option>
                    <option value="medium">Medium - Balanced</option>
                    <option value="high">High - Best reasoning</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Constrains effort on reasoning for reasoning models
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <button
                onClick={() => {
                  // Reset all settings to defaults
                  setTemperature(null);
                  setPresencePenalty(null);
                  setFrequencyPenalty(null);
                  setTopP(null);
                  setMaxTokens(null);
                  setReasoningEffort(null);
                }}
                className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                Restore All Defaults
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModelSettings(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const params: ModelParameters = {
                      id: modelParameters?.id || uuidv4(),
                      modelId: chat.model,
                      temperature,
                      presencePenalty,
                      frequencyPenalty,
                      topP,
                      maxTokens,
                      reasoningEffort,
                      createdAt: modelParameters?.createdAt || new Date(),
                      updatedAt: new Date(),
                    };

                    if (modelParameters) {
                      await db.modelParameters.update(modelParameters.id!, params);
                    } else {
                      await db.modelParameters.add(params);
                    }
                    
                    setShowModelSettings(false);
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Image Enlargement Modal */}
      {enlargedImage && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={enlargedImage.url}
              alt={enlargedImage.filename}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white text-center mt-2 text-sm">
              {enlargedImage.filename}
            </p>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Message Confirmation Dialog */}
      <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this message. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (messageToDelete) {
                  await deleteMessage(messageToDelete);
                  setMessageToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo - only re-render if these props actually changed
  return (
    prevProps.chat.id === nextProps.chat.id &&
    prevProps.chat.model === nextProps.chat.model &&
    prevProps.chat.isActive === nextProps.chat.isActive &&
    prevProps.messages === nextProps.messages &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.position === nextProps.position &&
    prevProps.totalChats === nextProps.totalChats &&
    prevProps.layout === nextProps.layout
  );
});

export default ChatWindow;
