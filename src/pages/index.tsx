'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { AIMessage } from '@/lib/ai/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { deleteChat, deleteChatGroup, updateLastActivity, saveDraft, clearDraft, getDraft } from '@/lib/data/operations';
import ChatSidebar from '@/components/sidebar/ChatSidebar';
import NavigationSidebar from '@/components/sidebar/NavigationSidebar';
import { LicenseProvider, useLicense } from '@/contexts/LicenseContext';
import { ApiKeysProvider, useApiKeys } from '@/contexts/ApiKeysContext';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import toast from 'react-hot-toast';
import LayoutGrid from '@/components/LayoutGrid';
import FreeformLayout from '@/components/FreeformLayout';
import StarredMessagesModal from '@/components/modals/StarredMessagesModal';
import UpgradeModal from '@/components/modals/UpgradeModal';
import { Send, Square, Plus, Minus, Grid, Columns, Rows, Grid2x2, Grid3x3, Move, Settings, Edit2, Sparkles, ShieldCheck, Mic } from 'lucide-react';
import { db, ChatGroup, Chat, Message } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { getAllModels } from '@/lib/models';
import { useCustomModels } from '@/hooks/data/useCustomModels';
import { useSpeechRecording } from '@/hooks/useSpeechRecording';
import { useDebounce } from '@/hooks/use-debounce';
import AudioVisualizer from '@/components/AudioVisualizer';
import ChatSettingsModal from '@/components/modals/ChatSettingsModal';
import { ChatInputArea, UploadedImage } from '@/components/ChatInputArea';
import { saveImageAttachments, fileToBlob } from '@/lib/data/operations/images';
import { aiService } from '@/lib/ai/service';
import { useLocalStorage } from 'usehooks-ts';
import { MCPToolCall, MCPApprovalRequest, MCPApprovalResponse } from '@/lib/ai/types';
import WelcomeModal from '@/components/modals/WelcomeModal';

/**
 * Main chat page component that manages the entire chat interface
 * Handles multiple sub-chats, layouts, messages, and user interactions
 */
function ChatPageContent() {
  // Context hooks for license, API keys, and settings
  const { isLicensed, canCreateSubchat, canUseSystemPrompts, checkMessageLimit, todayMessageCount } = useLicense();
  const { openAIKey, anthropicKey, geminiKey, xaiKey, deepseekKey, openRouterKey, moonshotKey, groqKey } = useApiKeys();
  const { activeCustomModels } = useCustomModels();
  const { speechSettings } = useSettings();
  const router = useRouter();
  const allModels = getAllModels(activeCustomModels);

  // Core state for chat functionality
  const [input, setInput] = useState(''); // User input text
  const debouncedInput = useDebounce(input, 500); // Debounced value for auto-saving drafts
  const [loadingChats, setLoadingChats] = useState<Set<string>>(new Set()); // Track which chats are currently streaming
  const [currentChatGroupId, setCurrentChatGroupId] = useState<string | null>(null); // Active chat group
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null); // Active folder in sidebar

  // UI state for various panels and modals
  const [showSidebar, setShowSidebar] = useState(true);
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage('CH_hasSeenWelcome', false);
  const [firstUseTimestamp] = useLocalStorage('CH_firstUseTimestamp', Date.now()); // Used for knowing how long to show the welcome modal for

  // Chat configuration state
  const [effectiveSystemPrompt, setEffectiveSystemPrompt] = useState<string>(''); // Resolved system prompt for current chat
  const [mainChatModel, setMainChatModel] = useState('gpt-4o-mini'); // Default model for new chats
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]); // Images attached to current message
  const [chatWidth, setChatWidth] = useLocalStorage('CH_chatWidth', 400); // Persisted chat width preference

  // MCP tool state
  const [pendingApprovalRequests, setPendingApprovalRequests] = useState<Map<string, MCPApprovalRequest>>(new Map());
  const [chatResponseIds, setChatResponseIds] = useState<Map<string, string>>(new Map()); // Maps chatId to responseId for approval continuation
  const approvalResponseRef = useRef<{ approved: boolean; requestId: string } | null>(null);

  // Refs for DOM elements and intervals
  const layoutSelectorRef = useRef<HTMLDivElement>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null); // Interval for cleaning up temporary chats
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map()); // Abort controllers for streaming responses
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for the message input textarea
  const shouldCreateChatForPromptRef = useRef<boolean>(false); // Track if we should create a new chat for prompt

  // Initialize speech recording hook for voice input
  const {
    isRecording,
    isTranscribing,
    error: speechError,
    audioLevel,
    recordingDuration,
    toggleRecording,
    cancelRecording
  } = useSpeechRecording({
    onTranscription: (text) => {
      setInput(text); // Set transcribed text as input
    },
    openAIKey,
    model: speechSettings.model,
    systemPrompt: speechSettings.systemPrompt
  });

  // Live queries for reactive data from Dexie (IndexedDB)
  const chatGroups = useLiveQuery(() => db.chatGroups.toArray()) || [];
  const folders = useLiveQuery(() => db.folders.toArray()) || [];

  // Current chat group reactive query
  const currentChatGroup = useLiveQuery(
    () => currentChatGroupId ? db.chatGroups.get(currentChatGroupId) : undefined,
    [currentChatGroupId]
  );

  // All sub-chats for the current chat group
  const chats = useLiveQuery(
    () => currentChatGroupId ?
      db.chats.where('chatGroupId').equals(currentChatGroupId).toArray() : [],
    [currentChatGroupId]
  ) || [];

  // Check if any of the current chat group's chats are loading (streaming responses)
  const currentChatsLoading = useMemo(() => {
    return chats.some(chat => chat.id && loadingChats.has(chat.id));
  }, [chats, loadingChats]);

  // All messages for the current chat group's chats
  const messages = useLiveQuery(
    () => {
      if (!currentChatGroupId || chats.length === 0) return [];
      const chatIds = chats.map(c => c.id!).filter(id => id !== undefined);
      return db.messages.where('chatId').anyOf(chatIds).toArray();
    },
    [currentChatGroupId, chats]
  ) || [];

  // Group and sort messages by chat - memoized to prevent recalculation
  const messagesByChat = useMemo(() => {
    const map = new Map<string, Message[]>();
    messages.forEach(msg => {
      if (!map.has(msg.chatId)) {
        map.set(msg.chatId, []);
      }
      map.get(msg.chatId)!.push(msg);
    });

    // Sort messages within each chat chronologically
    map.forEach((msgs) => {
      msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    return map;
  }, [messages]);

  // Check if this is the user's first visit
  // Temporarily disabled - landing page not ready
  // useEffect(() => {
  //   if (!hasSeenWelcome) {
  //     setShowWelcomeModal(true);
  //   }
  // }, [hasSeenWelcome]);

  // Handle URL parameters on mount for deep linking and purchase callbacks
  useEffect(() => {
    // Check for chat ID in URL query parameters
    if (router.isReady) {
      if (router.query.id) {
        const chatId = router.query.id as string;
        if (chatId) {
          setCurrentChatGroupId(chatId);
        }
      }

      // Check for purchase success parameters from payment gateway
      if (router.query.success === 'true' && router.query.checkout_id) {
        setShowPurchaseSuccess(true);
        setShowUpgradeModal(true);

        // Clean up URL parameters after showing the modal
        const cleanUrl = router.query.id
          ? `/?id=${router.query.id}`
          : '/';
        window.history.replaceState({ ...window.history.state }, '', cleanUrl);
      }

      // Check for prompt from Prompt Library
      if (router.query.prompt) {
        const promptContent = router.query.prompt as string;
        setInput(promptContent);
        
        // Mark that we should create a new chat if none exists
        if (!currentChatGroupId) {
          shouldCreateChatForPromptRef.current = true;
        }
        
        // Focus the textarea after a short delay
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 100);
        
        // Clean up URL to avoid keeping prompt in history
        router.replace('/', undefined, { shallow: true });
      }

      // Check for temporary parameter (incognito mode)
      // Privacy mode is handled in ChatSidebar when creating temporary chats
    }
  }, [router.isReady, router.query.id, router.query.temporary, router.query.success, router.query.checkout_id, router.query.prompt]);

  // Create new chat when prompt is loaded but no chat exists
  useEffect(() => {
    if (shouldCreateChatForPromptRef.current && !currentChatGroupId) {
      shouldCreateChatForPromptRef.current = false; // Reset the flag
      handleNewChatGroup(false);
    }
  }, [currentChatGroupId]);

  // Clear uploaded images when switching chats to avoid confusion
  useEffect(() => {
    setUploadedImages([]);
  }, [currentChatGroupId]);

  // Load draft when switching to a different chat
  useEffect(() => {
    const loadDraft = async () => {
      if (currentChatGroupId) {
        const draft = await getDraft(currentChatGroupId);
        // Always set input - either to saved draft or empty string
        setInput(draft || '');
      }
    };
    loadDraft();
  }, [currentChatGroupId]);

  // Auto-save draft when input changes (debounced)
  useEffect(() => {
    const saveDraftToDb = async () => {
      if (currentChatGroupId && debouncedInput !== undefined) {
        await saveDraft(currentChatGroupId, debouncedInput);
      }
    };
    saveDraftToDb();
  }, [debouncedInput, currentChatGroupId]);

  // Update URL when current chat group changes for browser history and sharing
  useEffect(() => {
    const updateUrl = async () => {
      if (currentChatGroupId !== null) {
        // Check if this is a temporary/incognito chat
        const chatGroup = await db.chatGroups.get(currentChatGroupId);
        const isTemp = chatGroup?.isTemporary || false;

        // Update URL without causing a navigation
        const url = isTemp
          ? `/?id=${currentChatGroupId}&temporary=true`
          : `/?id=${currentChatGroupId}`;
        window.history.replaceState({ ...window.history.state }, '', url);
      } else {
        // Remove the id parameter if no chat is selected
        window.history.replaceState({ ...window.history.state }, '', '/');
      }
    };
    updateUrl();
  }, [currentChatGroupId]);

  // Calculate effective system prompt for current chat group based on hierarchy
  useEffect(() => {
    const calculateEffectivePrompt = async () => {
      // Only use system prompts if user has premium license
      if (!canUseSystemPrompts) {
        setEffectiveSystemPrompt('');
        return;
      }

      if (!currentChatGroup) {
        setEffectiveSystemPrompt('');
        return;
      }

      // Priority 1: Chat group's own system prompt
      if (currentChatGroup.systemPrompt) {
        setEffectiveSystemPrompt(currentChatGroup.systemPrompt);
        return;
      }

      // Priority 2: Traverse folder hierarchy to find inherited prompt
      let currentFolderId = currentChatGroup.folderId;
      let foundPrompt = '';

      while (currentFolderId && !foundPrompt) {
        const folder = folders.find(f => f.id === currentFolderId);
        if (folder) {
          if (folder.systemPrompt) {
            foundPrompt = folder.systemPrompt;
            break;
          }
          currentFolderId = folder.parentId;
        } else {
          break;
        }
      }

      setEffectiveSystemPrompt(foundPrompt);
    };

    calculateEffectivePrompt();
  }, [currentChatGroup, folders, canUseSystemPrompts]);

  // Close dropdown selectors when clicking outside (for better UX)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layoutSelectorRef.current && !layoutSelectorRef.current.contains(event.target as Node)) {
        setShowLayoutSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset textarea height when input is cleared
  useEffect(() => {
    if (textareaRef.current && input === '') {
      textareaRef.current.style.height = '42px';
    }
  }, [input]);

  // Cleanup temporary/incognito chats after 5 minutes of inactivity
  useEffect(() => {
    const cleanupTemporaryChats = async () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // Get all temporary chat groups
      const allChats = await db.chatGroups.toArray();
      const tempChats = allChats.filter(chat => chat.isTemporary === true);

      for (const chat of tempChats) {
        // Skip if this is the currently active chat
        if (chat.id === currentChatGroupId) continue;

        // Skip if URL has temporary=true and this chat ID
        if (router.query.temporary === 'true' && router.query.id === chat.id) continue;

        // Delete if last activity is older than 5 minutes
        if (chat.lastActivityAt && chat.lastActivityAt < fiveMinutesAgo) {
          // Use centralized delete function that handles image attachments
          await deleteChatGroup(chat.id!);
        }
      }
    };

    // Run cleanup every minute
    cleanupIntervalRef.current = setInterval(cleanupTemporaryChats, 60000);

    // Run cleanup immediately on mount
    cleanupTemporaryChats();

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [currentChatGroupId, router.query]);

  /**
   * Save the edited chat group title
   */
  const handleSaveTitle = async () => {
    if (currentChatGroupId && titleInput.trim()) {
      await db.chatGroups.update(currentChatGroupId, {
        title: titleInput.trim(),
        updatedAt: new Date()
      });
    }
    setIsEditingTitle(false);
  };

  /**
   * Create a new chat group with an initial sub-chat
   * @param isPrivacyMode - Whether this is an incognito/temporary chat
   * @param folderId - Optional folder to place the chat in
   */
  const handleNewChatGroup = async (isPrivacyMode: boolean = false, folderId?: string | null) => {
    // Use provided folderId, or current folder if not provided
    const targetFolderId = folderId !== undefined ? folderId : currentFolderId;

    // Get min order for positioning at the top of the folder
    const itemsInFolder = chatGroups.filter(cg => cg.folderId === targetFolderId);
    const minOrder = Math.min(0, ...itemsInFolder.map(cg => cg.order || 0));

    const chatGroupId = uuidv4();
    const newChatGroup: ChatGroup = {
      id: chatGroupId,
      title: isPrivacyMode ? 'Incognito Chat' : 'New Chat',
      layout: 'horizontal',
      folderId: targetFolderId,
      order: minOrder - 1, // Place at top
      isTemporary: isPrivacyMode,
      lastActivityAt: isPrivacyMode ? new Date() : undefined, // Track for auto-deletion
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.chatGroups.add(newChatGroup);

    // Create initial chat with selected model
    const newChat: Chat = {
      id: uuidv4(),
      chatGroupId,
      model: mainChatModel,
      position: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.chats.add(newChat);

    setCurrentChatGroupId(chatGroupId);
  };

  /**
   * Continue streaming after approval/denial
   */
  const continueStreamWithApproval = async (chatId: string, responseId: string, requestId: string, approved: boolean) => {
    // Get the chat and latest message
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    // Get the latest assistant message
    const chatMessages = messagesByChat.get(chatId) || [];
    const lastMessage = chatMessages[chatMessages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') return;

    // Set loading state
    setLoadingChats(prev => new Set([...prev, chatId]));

    // Clear response ID
    setChatResponseIds(prev => {
      const newMap = new Map(prev);
      newMap.delete(chatId);
      return newMap;
    });

    try {
      // Get API configuration
      const modelInfo = allModels.find(m => m.id === chat.model);
      const provider = modelInfo?.provider || 'openai';
      const apiKey = provider === 'anthropic' ? anthropicKey :
        provider === 'gemini' ? geminiKey :
        provider === 'xai' ? xaiKey :
        provider === 'deepseek' ? deepseekKey :
        provider === 'openrouter' ? openRouterKey :
        provider === 'moonshot' ? moonshotKey :
        provider === 'groq' ? groqKey :
          openAIKey;

      const customModel = activeCustomModels.find(m => m.modelId === chat.model);
      const customHeaders = customModel?.customHeaders;
      const customBodyParams = customModel?.customBodyParams;

      // Get model parameters
      const modelParams = await db.modelParameters.where('modelId').equals(chat.model).first();

      // Create approval response
      const approvalResponse: MCPApprovalResponse = {
        type: 'mcp_approval_response',
        approve: approved,
        approval_request_id: requestId
      };

      // Create abort controller
      const abortController = new AbortController();
      abortControllersRef.current.set(chatId, abortController);

      // Continue the stream with approval response
      const approvalStream = aiService.streamWithRetry({
        model: chat.model,
        messages: [], // Empty - using previous_response_id
        apiKey: apiKey || '',
        baseUrl: modelInfo?.baseUrl,
        customHeaders,
        customBodyParams,
        modelParams,
        signal: abortController.signal,
        previousResponseId: responseId,
        input: [approvalResponse]
      });

      let assistantContent = lastMessage.content;
      const toolCalls = lastMessage.toolCalls || [];
      let reasoningSummary = lastMessage.reasoningSummary || '';

      // Process the continuation stream
      for await (const chunk of approvalStream) {
        if (abortController.signal.aborted) break;

        if (chunk.eventType === 'reasoning_delta' && chunk.reasoningDelta) {
          reasoningSummary += chunk.reasoningDelta;
          await db.messages.update(lastMessage.id, {
            content: assistantContent,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            reasoningSummary
          });
        } else if (chunk.eventType === 'reasoning_complete' && chunk.reasoningSummary) {
          reasoningSummary = chunk.reasoningSummary;
          await db.messages.update(lastMessage.id, {
            content: assistantContent,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            reasoningSummary
          });
        } else if (chunk.eventType === 'tool_call' && chunk.toolCall) {
          const existingIndex = toolCalls.findIndex(tc => tc.id === chunk.toolCall!.id);
          if (existingIndex >= 0) {
            toolCalls[existingIndex] = chunk.toolCall;
          } else {
            toolCalls.push(chunk.toolCall);
          }
          await db.messages.update(lastMessage.id, {
            content: assistantContent,
            toolCalls,
            reasoningSummary: reasoningSummary || undefined
          });
        } else if (chunk.eventType === 'tool_result' && chunk.toolCall) {
          const existingIndex = toolCalls.findIndex(tc => tc.id === chunk.toolCall!.id);
          if (existingIndex >= 0) {
            toolCalls[existingIndex] = chunk.toolCall;
            await db.messages.update(lastMessage.id, {
              content: assistantContent,
              toolCalls,
              reasoningSummary: reasoningSummary || undefined
            });
          }
        } else if (chunk.eventType === 'approval_request' && chunk.approvalRequest && chunk.responseId) {
          // Handle another approval request in the continuation stream
          // Save current assistant content before pausing for approval
          await db.messages.update(lastMessage.id, {
            content: assistantContent,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            reasoningSummary: reasoningSummary || undefined
          });
          
          // Store the new approval request and response ID
          setPendingApprovalRequests(prev => {
            const newMap = new Map(prev);
            newMap.set(chatId, chunk.approvalRequest!);
            return newMap;
          });
          setChatResponseIds(prev => {
            const newMap = new Map(prev);
            newMap.set(chatId, chunk.responseId!);
            return newMap;
          });
          
          // Clear loading state to show the approval card
          setLoadingChats(prev => {
            const newSet = new Set(prev);
            newSet.delete(chatId);
            return newSet;
          });
          
          // Clear abort controller
          abortControllersRef.current.delete(chatId);
          
          // Return to allow UI to show the next approval request
          return;
        } else if (chunk.content) {
          assistantContent += chunk.content;
          await db.messages.update(lastMessage.id, {
            content: assistantContent,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            reasoningSummary: reasoningSummary || undefined
          });
        }

        if (chunk.isComplete) {
          await db.messages.update(lastMessage.id, {
            content: assistantContent,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined
          });
          break;
        }
      }
    } catch (error) {
      console.error('Error continuing stream:', error);
      // Add error message to assistant response  
      const chatMessages = messagesByChat.get(chatId) || [];
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        await db.messages.update(lastMsg.id, {
          content: lastMsg.content + '\n\n[Error continuing after approval]'
        });
      }
    } finally {
      // Clear loading state
      setLoadingChats(prev => {
        const next = new Set(prev);
        next.delete(chatId);
        return next;
      });

      // Clear abort controller
      abortControllersRef.current.delete(chatId);
    }
  };

  /**
   * Handle MCP tool approval
   */
  const handleApproveToolCall = async (requestId: string, chatId?: string) => {
    if (!chatId) return;

    const responseId = chatResponseIds.get(chatId);
    if (!responseId) return;

    // Clear the approval request
    setPendingApprovalRequests(prev => {
      const newMap = new Map(prev);
      newMap.delete(chatId);
      return newMap;
    });

    // Continue the stream with approval
    await continueStreamWithApproval(chatId, responseId, requestId, true);
  };

  /**
   * Handle MCP tool denial
   */
  const handleDenyToolCall = async (requestId: string, chatId?: string) => {
    if (!chatId) return;

    const responseId = chatResponseIds.get(chatId);
    if (!responseId) return;

    // Clear the approval request
    setPendingApprovalRequests(prev => {
      const newMap = new Map(prev);
      newMap.delete(chatId);
      return newMap;
    });

    // Continue the stream with denial
    await continueStreamWithApproval(chatId, responseId, requestId, false);
  };

  /**
   * Add a new sub-chat to the current chat group
   * Limited to 8 sub-chats per group, requires premium for multiple
   */
  const handleAddChat = async () => {
    if (!currentChatGroupId || chats.length >= 8) return;

    // Check if user can create subchats (premium feature)
    if (!canCreateSubchat) {
      setShowUpgradeModal(true);
      toast.error('Upgrade to add multiple subchats!');
      return;
    }

    // Auto-switch from vertical to horizontal when adding second chat
    if (chats.length === 1 && currentChatGroup?.layout === 'vertical') {
      await db.chatGroups.update(currentChatGroupId, {
        layout: 'horizontal',
        updatedAt: new Date()
      });
    }

    const maxPosition = Math.max(0, ...chats.map(c => c.position));
    const newChat: Chat = {
      id: uuidv4(),
      chatGroupId: currentChatGroupId,
      model: 'gpt-4o-mini',
      position: maxPosition + 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.chats.add(newChat);
  };

  /**
   * Change the AI model for a specific sub-chat
   */
  const handleModelChange = async (chatId: string, model: string) => {
    await db.chats.update(chatId, { model });

    // Update lastActivityAt for incognito chat tracking
    await db.chatGroups.update(currentChatGroupId!, { lastActivityAt: new Date() });
  };

  /**
   * Toggle whether a sub-chat is active (receives messages)
   */
  const handleActiveToggle = async (chatId: string, isActive: boolean) => {
    await db.chats.update(chatId, { isActive });

    // Update lastActivityAt for incognito chat tracking
    await db.chatGroups.update(currentChatGroupId!, { lastActivityAt: new Date() });
  };

  /**
   * Close/delete a sub-chat and reorder remaining ones
   */
  const handleCloseChat = async (chatId: string) => {
    // Use centralized delete function that handles attachments
    await deleteChat(chatId);

    // Reorder remaining chats to maintain continuous positions
    const remainingChats = await db.chats.where('chatGroupId').equals(currentChatGroupId as string).toArray();
    for (let i = 0; i < remainingChats.length; i++) {
      const chatId = remainingChats[i]?.id;
      if (chatId) {
        await db.chats.update(chatId, { position: i });
      }
    }
  };

  /**
   * Update chat positions after drag-and-drop reordering
   */
  const handleReorderChats = async (reorderedChats: Chat[]) => {
    for (const chat of reorderedChats) {
      await db.chats.update(chat.id!, { position: chat.position });
    }
  };

  /**
   * Change the layout arrangement of sub-chats (grid, horizontal, vertical, etc.)
   */
  const handleLayoutChange = async (layout: ChatGroup['layout']) => {
    if (!currentChatGroupId) return;
    await db.chatGroups.update(currentChatGroupId, { layout });
    setShowLayoutSelector(false);
  };

  /**
   * Increase the width of chat windows in horizontal layout
   */
  const increaseChatWidth = () => {
    setChatWidth(prev => Math.min(prev + 100, 800));
  };

  /**
   * Decrease the width of chat windows in horizontal layout
   */
  const decreaseChatWidth = () => {
    setChatWidth(prev => Math.max(prev - 100, 300));
  };

  /**
   * Save chat-specific settings (primarily system prompt)
   */
  const handleSaveChatSettings = async (systemPrompt: string) => {
    if (!currentChatGroupId) return;
    await db.chatGroups.update(currentChatGroupId, {
      systemPrompt: systemPrompt || undefined,
      updatedAt: new Date()
    });
  };

  /**
   * Update position and size of a chat window in freeform layout
   * Brings moved window to front via z-index
   */
  const handlePositionChange = async (chatId: string, x: number, y: number, width: number, height: number, _zIndex: number) => {
    // When a window is moved, update its position and bring it to front
    // by setting its zIndex higher than all others in the group
    const chatGroupChats = await db.chats.where('chatGroupId').equals(currentChatGroupId as string).toArray();
    const maxZIndex = Math.max(0, ...chatGroupChats.map(c => c.zIndex || 0));

    await db.chats.update(chatId, {
      x,
      y,
      width,
      height,
      zIndex: maxZIndex + 1 // Ensure this window appears on top
    });
  };

  /**
   * Abort all active streaming responses for the current chat group
   */
  const handleAbortAll = () => {
    // Only abort streams for the current chat group's chats
    const currentChatIds = new Set(chats.filter(chat => chat.id).map(chat => chat.id!));

    abortControllersRef.current.forEach((controller, chatId) => {
      // Only abort if this chat belongs to the current chat group
      if (currentChatIds.has(chatId)) {
        controller.abort();
        // Remove from loading state
        setLoadingChats(prev => {
          const newSet = new Set(prev);
          newSet.delete(chatId);
          return newSet;
        });
        // Remove this specific controller
        abortControllersRef.current.delete(chatId);
      }
    });
  };

  /**
   * Abort streaming response for a specific sub-chat
   */
  const handleAbortChat = (chatId: string) => {
    // Abort specific chat stream
    const controller = abortControllersRef.current.get(chatId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(chatId);
      // Remove from loading state
      setLoadingChats(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });
    }
  };

  /**
   * Retry a message (regenerate assistant response)
   */
  const handleRetryMessage = async (chatId: string, messageId: string) => {
    if (!currentChatGroupId) return;

    // Find the message to retry
    const messageToRetry = await db.messages.where('id').equals(messageId).first();
    if (!messageToRetry || messageToRetry.role !== 'assistant') return;

    // Get all messages for context
    const allMessages = await db.messages.where('chatId').equals(chatId).toArray();
    allMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Find the last user message before any version of this assistant message
    // We need to find messages that come before this one chronologically
    let lastUserMessage: Message | undefined;
    for (let i = allMessages.length - 1; i >= 0; i--) {
      const msg = allMessages[i];
      if (!msg) continue;
      // Skip any assistant messages that are siblings (retries) of the current message
      if (msg.role === 'assistant' &&
        (msg.id === messageId ||
          msg.siblingMessageIds?.includes(messageId) ||
          messageToRetry.siblingMessageIds?.includes(msg.id!))) {
        continue;
      }
      // Found a user message
      if (msg.role === 'user') {
        lastUserMessage = msg;
        break;
      }
    }

    if (!lastUserMessage) return; // No user message found

    // Get the chat
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    // Abort any ongoing stream for this chat
    handleAbortChat(chatId);

    // Mark chat as loading
    setLoadingChats(new Set([...loadingChats, chatId]));

    // Create new assistant message with retry metadata
    const newAssistantMessageId = uuidv4();
    const retryAttempt = (messageToRetry.retryAttempt || 0) + 1;

    // Get all sibling messages (all retries of the same message)
    // If this message already has siblings, use that list; otherwise start a new list with the original
    let siblingIds: string[] = messageToRetry.siblingMessageIds || [];

    // If siblingIds is empty, this is the first retry, so include the original message
    if (siblingIds.length === 0) {
      siblingIds = [messageToRetry.id!];
    }

    // Add the new message ID to siblings if not already there
    if (!siblingIds.includes(newAssistantMessageId)) {
      siblingIds = [...siblingIds, newAssistantMessageId];
    }

    // Update all siblings to be inactive and update their sibling lists
    for (const siblingId of siblingIds) {
      if (siblingId !== newAssistantMessageId) {
        const updateData: any = {
          isActiveVersion: false,
          siblingMessageIds: siblingIds
        };

        // For the original message (first in siblings), ensure retryAttempt is set
        if (siblingId === messageToRetry.id && messageToRetry.retryAttempt === undefined) {
          updateData.retryAttempt = 0; // Mark original as attempt 0
        }

        await db.messages.update(siblingId, updateData);
      }
    }

    // Create new assistant message
    const newAssistantMessage: Message = {
      id: newAssistantMessageId,
      chatId: chatId,
      chatGroupId: currentChatGroupId,
      role: 'assistant',
      content: '',
      model: chat.model,
      starred: false,
      parentMessageId: messageToRetry.parentMessageId || messageToRetry.id,
      retryAttempt: retryAttempt,
      isActiveVersion: true,
      siblingMessageIds: siblingIds,
      createdAt: new Date(),
    };

    await db.messages.add(newAssistantMessage);
    await updateLastActivity(currentChatGroupId);

    // Create abort controller for this chat
    const abortController = new AbortController();
    abortControllersRef.current.set(chatId, abortController);

    try {
      // Get all messages up to and including the last user message for context
      // Filter out any retry siblings to avoid duplicate context
      const userMessageIndex = allMessages.findIndex(m => m.id === lastUserMessage.id);
      const contextMessages = allMessages.slice(0, userMessageIndex + 1).filter(msg => {
        // Include all user messages
        if (msg.role === 'user') return true;
        // For assistant messages, only include if it's the active version or doesn't have siblings
        if (msg.role === 'assistant') {
          // If it has no siblings, include it
          if (!msg.siblingMessageIds || msg.siblingMessageIds.length === 0) return true;
          // If it has siblings, only include if it's the active version
          return msg.isActiveVersion === true || msg.isActiveVersion === undefined;
        }
        return true;
      });

      // Get model parameters
      const modelParams = await db.modelParameters.where('modelId').equals(chat.model).first();

      // Add system prompt if exists
      const messagesWithSystem = effectiveSystemPrompt ? [
        { role: 'system' as const, content: effectiveSystemPrompt },
        ...contextMessages
      ] : contextMessages;

      // Get model info
      const allModels = getAllModels(activeCustomModels);
      const modelInfo = allModels.find(m => m.id === chat.model);
      const provider = modelInfo?.provider || 'openai';

      // Determine API key
      let apiKey: string | undefined;
      if (provider === 'xai') {
        apiKey = xaiKey;
      } else if (provider === 'deepseek') {
        apiKey = deepseekKey;
      } else if (provider === 'openrouter') {
        apiKey = openRouterKey;
      } else if (provider === 'moonshot') {
        apiKey = moonshotKey;
      } else if (provider === 'groq') {
        apiKey = groqKey;
      } else if (provider === 'openai') {
        apiKey = openAIKey;
      } else if (provider === 'anthropic') {
        apiKey = anthropicKey;
      } else if (provider === 'gemini') {
        apiKey = geminiKey;
      }

      if (!apiKey && provider !== 'custom') {
        const errorMessage = `No API key configured for ${provider}. Please add it in Settings.`;
        await db.messages.update(newAssistantMessageId, { content: errorMessage });
        setLoadingChats(prev => {
          const newSet = new Set(prev);
          newSet.delete(chatId);
          return newSet;
        });
        return;
      }

      // Get custom model if applicable
      const customModel = activeCustomModels.find(m => m.modelId === chat.model);
      const customHeaders = customModel?.customHeaders;
      const customBodyParams = customModel?.customBodyParams;

      // Build AI messages format
      const aiMessages = messagesWithSystem.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Stream response
      const stream = aiService.streamWithRetry({
        model: chat.model,
        messages: aiMessages,
        apiKey: apiKey || '',
        baseUrl: modelInfo?.baseUrl,
        customHeaders,
        customBodyParams,
        modelParams,
        signal: abortController.signal,
        systemPrompt: effectiveSystemPrompt
      });

      let assistantContent = '';
      const toolCalls: MCPToolCall[] = [];
      let reasoningSummary = '';

      for await (const chunk of stream) {
        if (abortController.signal.aborted) break;

        if (chunk.eventType === 'reasoning_delta' && chunk.reasoningDelta) {
          reasoningSummary += chunk.reasoningDelta;
          await db.messages.update(newAssistantMessageId, {
            content: assistantContent,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            reasoningSummary
          });
        } else if (chunk.eventType === 'reasoning_complete' && chunk.reasoningSummary) {
          reasoningSummary = chunk.reasoningSummary;
          await db.messages.update(newAssistantMessageId, {
            content: assistantContent,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            reasoningSummary
          });
        } else if (chunk.eventType === 'tool_call' && chunk.toolCall) {
          toolCalls.push(chunk.toolCall);
          await db.messages.update(newAssistantMessageId, {
            content: assistantContent,
            toolCalls: toolCalls,
            reasoningSummary: reasoningSummary || undefined
          });
        } else if (chunk.eventType === 'approval_request' && chunk.approvalRequest && chunk.responseId) {
          // Save current assistant content before pausing for approval
          await db.messages.update(newAssistantMessageId, {
            content: assistantContent,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            reasoningSummary: reasoningSummary || undefined
          });
          
          // Handle approval request
          setPendingApprovalRequests(prev => {
            const newMap = new Map(prev);
            newMap.set(chatId, chunk.approvalRequest!);
            return newMap;
          });
          setChatResponseIds(prev => {
            const newMap = new Map(prev);
            newMap.set(chatId, chunk.responseId!);
            return newMap;
          });
          setLoadingChats(prev => {
            const newSet = new Set(prev);
            newSet.delete(chatId);
            return newSet;
          });
          return;
        } else if (chunk.content) {
          assistantContent += chunk.content;
          await db.messages.update(newAssistantMessageId, {
            content: assistantContent,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            reasoningSummary: reasoningSummary || undefined
          });
        }
      }

      await updateLastActivity(currentChatGroupId);

    } catch (error: any) {
      if (!abortController.signal.aborted) {
        console.error('Error retrying message:', error);
        const errorContent = `Error: ${error.message || 'Failed to get response'}`;
        await db.messages.update(newAssistantMessageId, { content: errorContent });
      }
    } finally {
      setLoadingChats(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });
      abortControllersRef.current.delete(chatId);
    }
  };

  /**
   * Main handler for submitting messages to all active sub-chats
   * Manages parallel streaming, API key validation, and message persistence
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && uploadedImages.length === 0) return;

    if (!currentChatGroupId) return;

    // Check message limit for free users (daily limit)
    if (!checkMessageLimit()) {
      setShowUpgradeModal(true);
      return;
    }

    // Store input and clear form immediately for better UX
    const userMessageContent = input.trim();
    const attachedImages = [...uploadedImages];
    setInput('');
    setUploadedImages([]);
    
    // Clear draft from database since message is being sent
    if (currentChatGroupId) {
      clearDraft(currentChatGroupId);
    }

    // Ensure at least one chat is active to receive messages
    const activeChats = chats.filter(chat => chat.isActive);
    if (activeChats.length === 0) {
      toast.error('Please select at least one chat to send messages to');
      setInput(userMessageContent); // Restore input
      return;
    }

    // Validate API keys for all models being used
    const allModels = getAllModels(activeCustomModels);
    const requiredProviders = new Set<string>();
    activeChats.forEach(chat => {
      const model = allModels.find(m => m.id === chat.model);
      if (model) {
        requiredProviders.add(model.provider);
      }
    });

    // Check if we have all required API keys configured
    let missingProvider: string | null = null;
    if (requiredProviders.has('openai') && !openAIKey) {
      missingProvider = 'openai';
    } else if (requiredProviders.has('anthropic') && !anthropicKey) {
      missingProvider = 'anthropic';
    } else if (requiredProviders.has('gemini') && !geminiKey) {
      missingProvider = 'gemini';
    } else if (requiredProviders.has('xai') && !xaiKey) {
      missingProvider = 'xai';
    } else if (requiredProviders.has('deepseek') && !deepseekKey) {
      missingProvider = 'deepseek';
    } else if (requiredProviders.has('openrouter') && !openRouterKey) {
      missingProvider = 'openrouter';
    }

    if (missingProvider) {
      toast.error(`Please configure your ${missingProvider.toUpperCase()} API key in Settings to use this model.`);
      setInput(userMessageContent); // Restore input
      return;
    }

    // Create chat group if needed (shouldn't happen in normal flow)
    if (!currentChatGroupId) {
      await handleNewChatGroup();
      return;
    }

    // Mark all active chats as loading
    setLoadingChats(new Set(activeChats.map(c => c.id!)));

    // Process each active chat in parallel for better performance
    const promises = activeChats.map(async (chat) => {
      // Create AbortController for this chat
      const abortController = new AbortController();
      abortControllersRef.current.set(chat.id!, abortController);

      try {
        // Add user message
        const userMessageId = uuidv4();
        const userMessage: Message = {
          id: userMessageId,
          chatId: chat.id!,
          chatGroupId: currentChatGroupId,
          role: 'user',
          content: userMessageContent,
          model: chat.model,
          starred: false,
          createdAt: new Date(),
        };
        console.log('Adding user message:', userMessage);
        try {
          await db.messages.add(userMessage);
          // Update last activity for the chat group
          await updateLastActivity(currentChatGroupId);
        } catch (dbError) {
          console.error('Failed to add user message:', dbError, 'Message object:', userMessage);
          throw dbError;
        }

        // Save image attachments if any
        let attachmentIds: string[] = [];
        if (attachedImages.length > 0) {
          const imageData = await Promise.all(
            attachedImages.map(async (img) => ({
              filename: img.file.name,
              mimeType: img.file.type,
              data: await fileToBlob(img.file),
              width: undefined,
              height: undefined,
            }))
          );
          attachmentIds = await saveImageAttachments(userMessageId, currentChatGroupId, imageData);
        }

        // Get all messages for this chat and sort by creation time
        const chatMessages = await db.messages.where('chatId').equals(chat.id!).toArray();
        // Sort messages by createdAt to maintain chronological order
        chatMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        // Get model parameters for this model
        const modelParams = await db.modelParameters.where('modelId').equals(chat.model).first();

        // Add system prompt if exists
        const messagesWithSystem = effectiveSystemPrompt ? [
          { role: 'system' as const, content: effectiveSystemPrompt },
          ...chatMessages
        ] : chatMessages;

        // Determine which API to use based on the model
        const allModels = getAllModels(activeCustomModels);
        const model = allModels.find(m => m.id === chat.model);
        const provider = model?.provider || 'openai';

        // Build assistant response
        let assistantContent = '';
        const assistantMessageId = uuidv4();
        const assistantMessage: Message = {
          id: assistantMessageId,
          chatId: chat.id!,
          chatGroupId: currentChatGroupId,
          role: 'assistant',
          content: '',
          model: chat.model, // Save the model used for this message
          starred: false,
          createdAt: new Date(),
        };
        console.log('Adding assistant message:', assistantMessage);
        try {
          await db.messages.add(assistantMessage);
          // Update last activity for the chat group
          await updateLastActivity(currentChatGroupId);
        } catch (dbError) {
          console.error('Failed to add assistant message:', dbError, 'Message object:', assistantMessage);
          throw dbError;
        }

        // Get API type and determine which API to use
        const modelInfo = allModels.find(m => m.id === chat.model);
        const apiType = modelInfo?.apiType || 'openai-chat-completions';

        // Use the new AI service for all API types
        {
          // Determine API key based on provider
          let apiKey: string | undefined;
          if (provider === 'xai') {
            apiKey = xaiKey;
          } else if (provider === 'deepseek') {
            apiKey = deepseekKey;
          } else if (provider === 'openrouter') {
            apiKey = openRouterKey;
          } else if (provider === 'moonshot') {
            apiKey = moonshotKey;
          } else if (provider === 'groq') {
            apiKey = groqKey;
          } else if (provider === 'openai') {
            apiKey = openAIKey;
          } else if (provider === 'anthropic') {
            apiKey = anthropicKey;
          } else if (provider === 'gemini') {
            apiKey = geminiKey;
          }

          if (!apiKey && provider !== 'custom') {
            const errorMessage = `No API key configured for ${provider}. Please add it in Settings.`;
            assistantContent = errorMessage;
            await db.messages.update(assistantMessageId, { content: assistantContent });
            return;
          }

          // Get custom headers if this is a custom model
          let customHeaders: Record<string, string> = {};
          let customBodyParams: Record<string, any> = {};

          if (modelInfo?.customModelData) {
            const customModel = modelInfo.customModelData;
            if (customModel.customHeaders) {
              customHeaders = { ...customModel.customHeaders };
            }
            if (customModel.customBodyParams) {
              customBodyParams = { ...customModel.customBodyParams };
            }
            // Add OpenRouter specific headers if needed
            if (provider === 'openrouter') {
              const referrerUrl = process.env.NEXT_PUBLIC_REFERRER_URL;
              customHeaders['HTTP-Referer'] = referrerUrl || 'https://chatterhub.site';
              customHeaders['X-Title'] = 'ChatterHub';
            }
          } else if (provider === 'openrouter' && modelInfo?.baseUrl) {
            const referrerUrl = process.env.NEXT_PUBLIC_REFERRER_URL;
            customHeaders = { 'HTTP-Referer': referrerUrl || 'https://chatterhub.site', 'X-Title': 'ChatterHub' };
          }

          // Convert messages to AI service format
          const aiMessages: AIMessage[] = messagesWithSystem.map(m => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.content,
            id: 'id' in m ? m.id : undefined
          }));

          // Stream using the new AI service
          const stream = aiService.streamWithRetry({
            model: chat.model,
            messages: aiMessages,
            apiKey: apiKey || '', // No API key is needed for custom models, stored in the headers
            baseUrl: modelInfo?.baseUrl,
            customHeaders,
            customBodyParams,
            modelParams,
            signal: abortController.signal,
            attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
            systemPrompt: effectiveSystemPrompt
          });

          // Track tool calls for this message
          const toolCalls: MCPToolCall[] = [];
          let reasoningSummary = '';

          for await (const chunk of stream) {
            // Check if we've been aborted
            if (abortController.signal.aborted) {
              // Save whatever content we have so far including tool calls
              if (assistantContent || toolCalls.length > 0 || reasoningSummary) {
                await db.messages.update(assistantMessageId, {
                  content: assistantContent,
                  toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                  reasoningSummary: reasoningSummary || undefined
                });
              }
              break;
            }

            // Handle different event types
            if (chunk.eventType === 'reasoning_delta' && chunk.reasoningDelta) {
              reasoningSummary += chunk.reasoningDelta;
              await db.messages.update(assistantMessageId, {
                content: assistantContent,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                reasoningSummary
              });
            } else if (chunk.eventType === 'reasoning_complete' && chunk.reasoningSummary) {
              reasoningSummary = chunk.reasoningSummary;
              await db.messages.update(assistantMessageId, {
                content: assistantContent,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                reasoningSummary
              });
            } else if (chunk.eventType === 'tool_call' && chunk.toolCall) {
              // Add or update tool call
              const existingIndex = toolCalls.findIndex(tc => tc.id === chunk.toolCall!.id);
              if (existingIndex >= 0) {
                toolCalls[existingIndex] = chunk.toolCall;
              } else {
                toolCalls.push(chunk.toolCall);
              }
              // Update message with tool calls
              await db.messages.update(assistantMessageId, {
                content: assistantContent,
                toolCalls,
                reasoningSummary: reasoningSummary || undefined
              });
            } else if (chunk.eventType === 'tool_result' && chunk.toolCall) {
              // Update tool call with result
              const existingIndex = toolCalls.findIndex(tc => tc.id === chunk.toolCall!.id);
              if (existingIndex >= 0) {
                toolCalls[existingIndex] = chunk.toolCall;
                await db.messages.update(assistantMessageId, {
                  content: assistantContent,
                  toolCalls,
                  reasoningSummary: reasoningSummary || undefined
                });
              }
            } else if (chunk.eventType === 'approval_request' && chunk.approvalRequest && chunk.responseId) {
              // Save current assistant content before pausing for approval
              await db.messages.update(assistantMessageId, {
                content: assistantContent,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                reasoningSummary: reasoningSummary || undefined
              });
              
              // Handle approval request - store for inline display
              const currentResponseId = chunk.responseId;

              // Store the approval request and response ID for this chat
              setPendingApprovalRequests(prev => {
                const newMap = new Map(prev);
                newMap.set(chat.id!, chunk.approvalRequest!);
                return newMap;
              });
              setChatResponseIds(prev => {
                const newMap = new Map(prev);
                newMap.set(chat.id!, currentResponseId);
                return newMap;
              });

              // Mark as not loading to hide the dots and show the approval card
              setLoadingChats(prev => {
                const next = new Set(prev);
                next.delete(chat.id!);
                return next;
              });

              // Break out of the stream to allow UI to update
              // The approval will be handled via the approval callbacks
              break;
            } else if (chunk.error) {
              // Error is already formatted as a chat message
              assistantContent = chunk.content;
              await db.messages.update(assistantMessageId, {
                content: assistantContent,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                reasoningSummary: reasoningSummary || undefined
              });
              break;
            } else if (chunk.content) {
              assistantContent += chunk.content;
              await db.messages.update(assistantMessageId, {
                content: assistantContent,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                reasoningSummary: reasoningSummary || undefined
              });
            }

            if (chunk.isComplete) {
              // Final update with all tool calls
              await db.messages.update(assistantMessageId, {
                content: assistantContent,
                toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
                reasoningSummary: reasoningSummary || undefined
              });
              break;
            }
          }
        }

        // Clean up abort controller for this chat
        abortControllersRef.current.delete(chat.id!);

        // Remove loading state for this chat
        setLoadingChats(prev => {
          const newSet = new Set(prev);
          newSet.delete(chat.id!);
          return newSet;
        });
      } catch (error: any) {
        // Check if this was an abort error
        if (error.name === 'AbortError' || error.message?.includes('aborted')) {
          // User aborted - clean up silently
          abortControllersRef.current.delete(chat.id!);
          setLoadingChats(prev => {
            const newSet = new Set(prev);
            newSet.delete(chat.id!);
            return newSet;
          });
          return; // Exit without showing error message
        }

        // The AI service should have already handled the error and added it as a message
        // Just log it for debugging
        const model = allModels.find(m => m.id === chat.model);
        const provider = model?.provider || 'openai';
        console.error(`Error calling ${provider} API for chat ${chat.id}:`, error);

        // Clean up abort controller even on error
        abortControllersRef.current.delete(chat.id!);

        // Remove loading state even on error
        setLoadingChats(prev => {
          const newSet = new Set(prev);
          newSet.delete(chat.id!);
          return newSet;
        });
      }
    });

    // Wait for all responses
    await Promise.all(promises);

    // Update chat group's updatedAt and lastActivityAt for temporary chats
    const updateData: any = { updatedAt: new Date() };
    if (currentChatGroup?.isTemporary) {
      updateData.lastActivityAt = new Date();
    }
    await db.chatGroups.update(currentChatGroupId, updateData);

    // Update title if it's still "New Chat" or "Incognito Chat"
    if (currentChatGroup?.title === 'New Chat' || currentChatGroup?.title === 'Incognito Chat') {
      const updateData: any = {
        title: userMessageContent.slice(0, 50),
        updatedAt: new Date()
      };
      if (currentChatGroup?.isTemporary) {
        updateData.lastActivityAt = new Date();
      }
      await db.chatGroups.update(currentChatGroupId, updateData);
    }
  };

  /**
   * Layout options for the chat group
   */
  const layoutOptions = [
    { value: 'vertical' as const, label: 'Vertical', icon: Rows },
    { value: 'horizontal' as const, label: 'Horizontal', icon: Columns },
    ...(chats.length <= 4 ? [{ value: '2x2' as const, label: '2x2 Grid', icon: Grid2x2 }] : []),
    ...(chats.length <= 6 ? [{ value: '2x3' as const, label: '2x3 Grid', icon: Grid }] : []),
    { value: '3x3' as const, label: '3x3 Grid', icon: Grid3x3 },
    { value: 'freeform' as const, label: 'Freeform', icon: Move },
  ];

  // Check if we're within the first 24 hours of use
  const isWithinFirstDay = useMemo(() => {
    const dayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const timeSinceFirstUse = Date.now() - firstUseTimestamp;
    return timeSinceFirstUse < dayInMs;
  }, [firstUseTimestamp]);


  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden -m-4">
        {/* Chat Settings Modal */}
        {currentChatGroup && (
          <ChatSettingsModal
            isOpen={showChatSettings}
            onClose={() => setShowChatSettings(false)}
            chatGroup={currentChatGroup}
            onSave={handleSaveChatSettings}
          />
        )}

        {/* Navigation Sidebar */}
        <NavigationSidebar
          onWelcomeClick={isWithinFirstDay ? () => setShowWelcomeModal(true) : undefined}
        />

        {/* Chat Sidebar */}
        <ChatSidebar
          currentChatGroupId={currentChatGroupId}
          setCurrentChatGroupId={setCurrentChatGroupId}
          currentFolderId={currentFolderId}
          setCurrentFolderId={setCurrentFolderId}
          onNewChatGroup={handleNewChatGroup}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          onShowStarredMessages={() => setShowStarredMessages(true)}
        />

        {/* Main chat area */}
        <div className="flex-1 flex min-h-0 min-w-0 flex-col bg-white dark:bg-gray-900">
          {/* Chat header */}
          <div className="border-b border-gray-200 dark:border-gray-800 px-3 sm:px-6 py-2 sm:py-3 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                      setTitleInput(currentChatGroup?.title || 'New Chat');
                    }
                  }}
                  className="text-lg font-medium bg-transparent border-b border-gray-400 dark:border-gray-600 outline-none dark:text-white"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-lg font-medium dark:text-white truncate max-w-[300px]" title={currentChatGroup?.title || 'New Chat'}>
                    {currentChatGroup?.title || 'New Chat'}
                  </h1>
                  {currentChatGroup?.isTemporary && (
                    <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400" title="This chat will be deleted 5 minutes after last activity">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setIsEditingTitle(true);
                      setTitleInput(currentChatGroup?.title || 'New Chat');
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all"
                    title="Edit chat name"
                  >
                    <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-nowrap">
              {/* Upgrade Now Button - only show if not licensed */}
              {!isLicensed && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-yellow-400 to-amber-600 text-white rounded-lg hover:from-yellow-500 hover:to-amber-700 transition-all shadow-md"
                  title="Upgrade Now"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium hidden sm:inline">Upgrade Now</span>
                </button>
              )}

              {/* Subchat Button */}
              {currentChatGroupId && chats.length < 8 && (
                <button
                  onClick={handleAddChat}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Subchat"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">Subchat</span>
                </button>
              )}

              {/* Layout Selector */}
              {currentChatGroupId && (
                <div className="relative" ref={layoutSelectorRef}>
                  <button
                    onClick={() => setShowLayoutSelector(!showLayoutSelector)}
                    className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Layout"
                  >
                    <Grid className="h-4 w-4 dark:text-gray-300" />
                    <span className="dark:text-white hidden md:inline">Layout</span>
                  </button>

                  {showLayoutSelector && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                      {layoutOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleLayoutChange(option.value)}
                            className={`w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${currentChatGroup?.layout === option.value ? 'bg-gray-100 dark:bg-gray-700' : ''
                              }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                      {currentChatGroup?.layout === 'horizontal' && chats.length >= 2 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                          <div className="px-4 py-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Width: {chatWidth}px</span>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  decreaseChatWidth();
                                }}
                                disabled={chatWidth <= 300}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Decrease width"
                              >
                                <Minus className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  increaseChatWidth();
                                }}
                                disabled={chatWidth >= 800}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Increase width"
                              >
                                <Plus className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Button */}
              {currentChatGroupId && (
                <button
                  onClick={() => setShowChatSettings(true)}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Chat Settings"
                >
                  <Settings className="h-4 w-4 dark:text-gray-300" />
                  <span className="dark:text-white hidden md:inline">Settings</span>
                </button>
              )}

            </div>
          </div>

          {/* Chat Windows */}
          <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
            <div className="p-4 h-full w-full">
              {currentChatGroupId && chats.length > 0 ? (
                currentChatGroup?.layout === 'freeform' ? (
                  <FreeformLayout
                    chats={chats}
                    messagesByChat={messagesByChat}
                    loadingChats={loadingChats}
                    onModelChange={handleModelChange}
                    onActiveToggle={handleActiveToggle}
                    onClose={handleCloseChat}
                    onAbort={handleAbortChat}
                    onRetry={handleRetryMessage}
                    onPositionChange={handlePositionChange}
                    pendingApprovalRequests={pendingApprovalRequests}
                    onApproveToolCall={handleApproveToolCall}
                    onDenyToolCall={handleDenyToolCall}
                  />
                ) : (
                  <LayoutGrid
                    chats={chats}
                    messagesByChat={messagesByChat}
                    loadingChats={loadingChats}
                    layout={currentChatGroup?.layout || 'vertical'}
                    chatWidth={chatWidth}
                    onModelChange={handleModelChange}
                    onActiveToggle={handleActiveToggle}
                    onClose={handleCloseChat}
                    onAbort={handleAbortChat}
                    onRetry={handleRetryMessage}
                    onReorder={handleReorderChats}
                    pendingApprovalRequests={pendingApprovalRequests}
                    onApproveToolCall={handleApproveToolCall}
                    onDenyToolCall={handleDenyToolCall}
                  />
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    {/* New Chat Button */}
                    <button
                      onClick={() => handleNewChatGroup(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="text-base font-medium">New Chat</span>
                    </button>

                    {/* New Incognito Chat Button */}
                    <button
                      onClick={() => handleNewChatGroup(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>New Incognito Chat</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input area */}
          {currentChatGroupId && (
            <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto shrink-0">
              {/* Incognito Mode Indicator */}
              {currentChatGroup?.isTemporary && (
                <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3" />
                      <span className="font-medium">Incognito Mode:</span>
                      <span>This chat will be automatically deleted 5 minutes after your last message</span>
                    </div>
                  </div>
                </div>
              )}
              {/* System Prompt Display - Only show for premium users */}
              {effectiveSystemPrompt && canUseSystemPrompts && (
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Settings className="h-3 w-3" />
                      <span className="font-medium">System Prompt Active:</span>
                      <span className="truncate flex-1">{effectiveSystemPrompt.slice(0, 100)}...</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="p-3">
                <form
                  onSubmit={handleSubmit}
                  className="mx-auto max-w-4xl"
                >
                  <ChatInputArea
                    onImagesChange={setUploadedImages}
                    uploadedImages={uploadedImages}
                  >
                    {(isRecording || isTranscribing) ? (
                      <div className="flex-1">
                        <AudioVisualizer
                          audioLevel={audioLevel}
                          isRecording={isRecording}
                          recordingDuration={recordingDuration}
                          fullWidth={true}
                          isTranscribing={isTranscribing}
                          onStop={toggleRecording}
                          onCancel={cancelRecording}
                        />
                      </div>
                    ) : (
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          // Auto-resize textarea
                          const textarea = e.target;
                          textarea.style.height = 'auto';
                          textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
                        }}
                        onPaste={async (e) => {
                          // Check for images in clipboard
                          const items = e.clipboardData?.items;
                          if (!items) return;

                          const imageFiles: File[] = [];

                          for (let i = 0; i < items.length; i++) {
                            const item = items[i];

                            // Check if the item is an image
                            if (item && item.type.indexOf('image') !== -1) {
                              const file = item.getAsFile();
                              if (file) {
                                imageFiles.push(file);
                              }
                            }
                          }

                          // If we found images, process them
                          if (imageFiles.length > 0) {
                            e.preventDefault(); // Prevent default paste behavior for images

                            // Validate files before processing
                            const maxSizeMB = 10;
                            const validImageFiles: File[] = [];

                            for (const file of imageFiles) {
                              const sizeMB = file.size / (1024 * 1024);
                              if (sizeMB > maxSizeMB) {
                                toast.error(`Image too large (${sizeMB.toFixed(2)}MB). Maximum size: ${maxSizeMB}MB`);
                                continue;
                              }
                              validImageFiles.push(file);
                            }

                            if (validImageFiles.length === 0) return;

                            // Process valid image files
                            const newImages: UploadedImage[] = await Promise.all(
                              validImageFiles.map(async (file) => {
                                const preview = URL.createObjectURL(file);

                                // Convert to base64
                                const base64 = await new Promise<string>((resolve, reject) => {
                                  const reader = new FileReader();
                                  reader.readAsDataURL(file);
                                  reader.onload = () => resolve(reader.result as string);
                                  reader.onerror = reject;
                                });

                                return {
                                  id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                                  file,
                                  preview,
                                  base64,
                                };
                              })
                            );

                            // Check if adding these images would exceed the limit
                            const maxImages = 10;
                            if (uploadedImages.length + newImages.length > maxImages) {
                              toast.error(`Maximum ${maxImages} images allowed`);
                              return;
                            }

                            // Add the new images to the existing ones
                            setUploadedImages([...uploadedImages, ...newImages]);
                            toast.success(`${newImages.length} image${newImages.length !== 1 ? 's' : ''} pasted`);
                          }
                          // If no images, let the default paste behavior handle text
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                          }
                        }}
                        placeholder={
                          (!openAIKey && !anthropicKey && !geminiKey && !xaiKey && !deepseekKey && !openRouterKey && !moonshotKey && !groqKey)
                            ? "Enter API key to send messages..."
                            : !isLicensed
                              ? `Enter your message (${5 - todayMessageCount} messages remaining today)`
                              : isTranscribing
                                ? "Transcribing your speech..."
                                : "Enter your message"
                        }
                        className="flex-1 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-2.5 text-sm focus:border-gray-500 dark:focus:border-gray-500 focus:outline-none disabled:opacity-50 resize-none overflow-y-auto"
                        style={{ minHeight: '42px', maxHeight: '200px', lineHeight: '1.5' }}
                        disabled={currentChatsLoading || isTranscribing}
                        rows={1}
                      />
                    )}
                    {speechSettings.enabled && !isRecording && !isTranscribing && (
                      <button
                        type="button"
                        onClick={toggleRecording}
                        disabled={!openAIKey || currentChatsLoading}
                        className={`rounded-full p-2.5 transition-colors bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed`}
                        title={
                          !openAIKey
                            ? "OpenAI API key required for speech-to-text"
                            : "Start voice recording"
                        }
                      >
                        <Mic className="h-5 w-5" />
                      </button>
                    )}
                    {!isRecording && !isTranscribing && (
                      currentChatsLoading ? (
                        <button
                          type="button"
                          onClick={handleAbortAll}
                          className="rounded-full bg-red-500 p-2.5 text-white hover:bg-red-600 transition-colors"
                          title="Stop current streams"
                        >
                          <Square className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={!input.trim() && uploadedImages.length === 0}
                          className="rounded-full bg-blue-500 p-2.5 text-white hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      )
                    )}
                  </ChatInputArea>
                </form>
                {speechError && (
                  <div className="mx-auto max-w-4xl mt-2">
                    <p className="text-xs text-red-500 dark:text-red-400">{speechError}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Starred Messages Modal */}
      <StarredMessagesModal
        isOpen={showStarredMessages}
        onClose={() => setShowStarredMessages(false)}
        onNavigateToChat={(chatGroupId) => {
          setCurrentChatGroupId(chatGroupId);
          router.push(`/?id=${chatGroupId}`);
        }}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setShowPurchaseSuccess(false);
        }}
        showPurchaseSuccess={showPurchaseSuccess}
      />

      {/* Welcome Modal for first-time users */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => {
          setShowWelcomeModal(false);
          setHasSeenWelcome(true);
        }}
      />
    </DashboardLayout>
  );
}

export default function ChatPage() {
  return (
    <LicenseProvider>
      <ApiKeysProvider>
        <SettingsProvider>
          <ChatPageContent />
        </SettingsProvider>
      </ApiKeysProvider>
    </LicenseProvider>
  );
}