'use client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Chat, Message } from '@/lib/db';
import ChatWindow from './ChatWindow';
import { GripVertical } from 'lucide-react';
import { MCPApprovalRequest } from '@/lib/ai/types';

interface SortableChatProps {
  chat: Chat;
  messages: Message[];
  isLoading: boolean;
  onModelChange: (chatId: string, model: string) => void;
  onActiveToggle: (chatId: string, isActive: boolean) => void;
  onClose: (chatId: string) => void;
  onAbort?: (chatId: string) => void;
  onRetry?: (chatId: string, messageId: string) => void;
  totalChats: number;
  layout: 'vertical' | 'horizontal' | '2x2' | '2x3' | '3x3';
  chatWidth?: number;
  pendingApproval?: MCPApprovalRequest | null;
  onApproveToolCall?: (requestId: string) => void;
  onDenyToolCall?: (requestId: string) => void;
}

function SortableChat({
  chat,
  messages,
  isLoading,
  onModelChange,
  onActiveToggle,
  onClose,
  onAbort,
  onRetry,
  totalChats,
  layout,
  chatWidth,
  pendingApproval,
  onApproveToolCall,
  onDenyToolCall
}: SortableChatProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chat.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // Only apply fixed width when there are 2+ chats in horizontal layout
    ...(layout === 'horizontal' && chatWidth && totalChats >= 2 ? {
      minWidth: `${chatWidth}px`,
      width: `${chatWidth}px`,
      flexShrink: 0
    } : {})
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group h-full min-h-0">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 p-1.5 bg-gray-200 dark:bg-gray-700 rounded cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </div>
      <ChatWindow
        chat={chat}
        messages={messages}
        isLoading={isLoading}
        onModelChange={onModelChange}
        onActiveToggle={onActiveToggle}
        onClose={onClose}
        onAbort={onAbort}
        onRetry={onRetry}
        position={chat.position}
        totalChats={totalChats}
        layout={layout}
        pendingApproval={pendingApproval}
        onApproveToolCall={onApproveToolCall}
        onDenyToolCall={onDenyToolCall}
      />
    </div>
  );
}

interface LayoutGridProps {
  chats: Chat[];
  messagesByChat: Map<string, Message[]>;
  loadingChats: Set<string>;
  layout: 'vertical' | 'horizontal' | '2x2' | '2x3' | '3x3';
  chatWidth?: number;
  onModelChange: (chatId: string, model: string) => void;
  onActiveToggle: (chatId: string, isActive: boolean) => void;
  onClose: (chatId: string) => void;
  onAbort?: (chatId: string) => void;
  onRetry?: (chatId: string, messageId: string) => void;
  onReorder: (chats: Chat[]) => void;
  pendingApprovalRequests?: Map<string, MCPApprovalRequest>;
  onApproveToolCall?: (requestId: string, chatId?: string) => void;
  onDenyToolCall?: (requestId: string, chatId?: string) => void;
}

export default function LayoutGrid({
  chats,
  messagesByChat,
  loadingChats,
  layout,
  chatWidth,
  onModelChange,
  onActiveToggle,
  onClose,
  onAbort,
  onRetry,
  onReorder,
  pendingApprovalRequests,
  onApproveToolCall,
  onDenyToolCall,
}: LayoutGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = chats.findIndex((chat) => chat.id === active.id);
      const newIndex = chats.findIndex((chat) => chat.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newChats = arrayMove(chats, oldIndex, newIndex);
        // Update positions
        const updatedChats = newChats.map((chat, index) => ({
          ...chat,
          position: index
        }));
        onReorder(updatedChats);
      }
    }
  };

  // Get grid classes based on layout
  const getGridClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'grid grid-cols-1 gap-3 overflow-y-auto';
      case 'horizontal':
        // Only use fixed width with scrolling when there are 2+ chats
        if (chatWidth && chats.length >= 2) {
          return 'flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-thin pb-2';
        }
        return 'grid grid-flow-col auto-cols-fr gap-3';
      case '2x2':
        return 'grid grid-cols-2 grid-rows-2 gap-3 overflow-y-auto';
      case '2x3':
        return 'grid grid-cols-2 grid-rows-3 gap-3 overflow-y-auto';
      case '3x3':
        return 'grid grid-cols-3 grid-rows-3 gap-3 overflow-y-auto';
      default:
        return 'grid grid-cols-1 gap-3 overflow-y-auto';
    }
  };

  // Get container style based on layout
  const getContainerStyle = () => {
    const baseStyle = {
      height: '100%'
    };
    
    // Only apply scrollbar styles when there are 2+ chats
    if (layout === 'horizontal' && chatWidth && chats.length >= 2) {
      return {
        ...baseStyle,
        scrollbarWidth: 'thin' as const,
        scrollbarColor: 'rgb(156 163 175) transparent'
      };
    }
    
    if (layout === 'vertical') {
      return { minHeight: '100%' };
    }
    
    return baseStyle;
  };

  // Sort chats by position
  const sortedChats = [...chats].sort((a, b) => a.position - b.position);

  // Wrap in a container div for horizontal scroll layout
  const content = (
    <div className={`${getGridClasses()} ${layout === 'horizontal' && chats.length >= 2 ? 'max-w-full' : 'w-full'} h-full`} style={getContainerStyle()}>
      {sortedChats.map((chat) => (
        <SortableChat
          key={chat.id}
          chat={chat}
          messages={messagesByChat.get(chat.id!) || []}
          isLoading={loadingChats.has(chat.id!)}
          onModelChange={onModelChange}
          onActiveToggle={onActiveToggle}
          onClose={onClose}
          onAbort={onAbort}
          onRetry={onRetry}
          totalChats={chats.length}
          layout={layout}
          chatWidth={chatWidth}
          pendingApproval={pendingApprovalRequests?.get(chat.id!)}
          onApproveToolCall={onApproveToolCall ? (requestId) => onApproveToolCall(requestId, chat.id) : undefined}
          onDenyToolCall={onDenyToolCall ? (requestId) => onDenyToolCall(requestId, chat.id) : undefined}
        />
      ))}
    </div>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedChats.map(chat => chat.id!)}
        strategy={rectSortingStrategy}
      >
        {layout === 'horizontal' && chats.length >= 2 ? (
          <div className="w-full h-full overflow-hidden">
            {content}
          </div>
        ) : (
          content
        )}
      </SortableContext>
    </DndContext>
  );
}