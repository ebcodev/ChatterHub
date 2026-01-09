'use client';

import { useState, useRef, useEffect } from 'react';
import { Chat, Message } from '@/lib/db';
import ChatWindow from './ChatWindow';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { MCPApprovalRequest } from '@/lib/ai/types';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';

interface FreeformChatProps {
  chat: Chat;
  messages: Message[];
  isLoading: boolean;
  onModelChange: (chatId: string, model: string) => void;
  onActiveToggle: (chatId: string, isActive: boolean) => void;
  onClose: (chatId: string) => void;
  onAbort?: (chatId: string) => void;
  onRetry?: (chatId: string, messageId: string) => void;
  onPositionChange: (chatId: string, x: number, y: number, width: number, height: number, zIndex: number) => void;
  totalChats: number;
  pendingApproval?: MCPApprovalRequest | null;
  onApproveToolCall?: (requestId: string) => void;
  onDenyToolCall?: (requestId: string) => void;
}

/**
 * Individual chat window component for freeform layout
 * Handles dragging, resizing, and z-index management for individual chat windows
 */
function FreeformChat({
  chat,
  messages,
  isLoading,
  onModelChange,
  onActiveToggle,
  onClose,
  onAbort,
  onRetry,
  onPositionChange,
  totalChats,
  pendingApproval,
  onApproveToolCall,
  onDenyToolCall
}: FreeformChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Initialize position from chat data or use default staggered position
  const [position, setPosition] = useState({
    x: chat.x || 50 + (chat.position * 30),
    y: chat.y || 50 + (chat.position * 30),
    width: chat.width || 400,
    height: chat.height || 300,
    zIndex: chat.zIndex || chat.position
  });

  // Sync position with chat data when it changes (e.g., from database updates)
  useEffect(() => {
    if (chat.x !== undefined && chat.y !== undefined) {
      setPosition({
        x: chat.x,
        y: chat.y,
        width: chat.width || 400,
        height: chat.height || 300,
        zIndex: chat.zIndex || chat.position
      });
    }
  }, [chat.x, chat.y, chat.width, chat.height, chat.zIndex]);

  /**
   * Handle mouse down events to initiate dragging or resizing
   * Also brings the window to front by updating z-index
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    // Bring window to front when interacting with it
    const newZIndex = totalChats + 1000;
    setPosition(prev => ({ ...prev, zIndex: newZIndex }));

    // Check if we're clicking on resize handle or drag handle
    if ((e.target as HTMLElement).closest('.resize-handle')) {
      e.stopPropagation(); // Prevent pan when resizing
      setIsResizing(true);
    } else if ((e.target as HTMLElement).closest('.drag-handle')) {
      e.stopPropagation(); // Prevent pan when dragging
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // Handle dragging and resizing mouse movements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Update position while dragging, ensuring window stays within viewport
        const newX = Math.max(0, e.clientX - dragStart.x);
        const newY = Math.max(0, e.clientY - dragStart.y);
        setPosition(prev => ({ ...prev, x: newX, y: newY }));
      } else if (isResizing) {
        // Update size while resizing with minimum constraints
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const newWidth = Math.max(250, e.clientX - rect.left);
          const newHeight = Math.max(200, e.clientY - rect.top);
          setPosition(prev => ({ ...prev, width: newWidth, height: newHeight }));
        }
      }
    };

    const handleMouseUp = () => {
      // Save position/size changes to database when interaction ends
      if (isDragging || isResizing) {
        onPositionChange(chat.id!, position.x, position.y, position.width, position.height, position.zIndex);
      }
      setIsDragging(false);
      setIsResizing(false);
    };

    // Only attach listeners when actively dragging or resizing
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, position, chat.id, onPositionChange]);

  return (
    <div
      ref={containerRef}
      className="chat-window absolute border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg bg-white dark:bg-gray-900 overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: isDragging || isResizing ? 1000 : position.zIndex
      }}
      onMouseDown={handleMouseDown}
      onPointerDown={(e) => {
        // Prevent pan unless clicking on empty space
        if (!(e.target as HTMLElement).closest('.drag-handle') && 
            !(e.target as HTMLElement).closest('.resize-handle')) {
          e.stopPropagation();
        }
      }}
    >
      {/* Chat Window content */}
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
        layout="freeform"
        pendingApproval={pendingApproval}
        onApproveToolCall={onApproveToolCall}
        onDenyToolCall={onDenyToolCall}
      />

      {/* Resize Handle - appears in bottom right corner */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        style={{
          background: 'linear-gradient(135deg, transparent 50%, #9CA3AF 50%)'
        }}
      />
    </div>
  );
}

interface FreeformLayoutProps {
  chats: Chat[];
  messagesByChat: Map<string, Message[]>;
  loadingChats: Set<string>;
  onModelChange: (chatId: string, model: string) => void;
  onActiveToggle: (chatId: string, isActive: boolean) => void;
  onClose: (chatId: string) => void;
  onAbort?: (chatId: string) => void;
  onRetry?: (chatId: string, messageId: string) => void;
  onPositionChange: (chatId: string, x: number, y: number, width: number, height: number, zIndex: number) => void;
  pendingApprovalRequests?: Map<string, MCPApprovalRequest>;
  onApproveToolCall?: (requestId: string, chatId?: string) => void;
  onDenyToolCall?: (requestId: string, chatId?: string) => void;
}

/**
 * Main freeform layout component
 * Provides a zoomable, pannable canvas for arranging chat windows freely
 * Uses react-zoom-pan-pinch for gesture handling
 */
export default function FreeformLayout({
  chats,
  messagesByChat,
  loadingChats,
  onModelChange,
  onActiveToggle,
  onClose,
  onAbort,
  onRetry,
  onPositionChange,
  pendingApprovalRequests,
  onApproveToolCall,
  onDenyToolCall
}: FreeformLayoutProps) {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  
  // State to track current zoom level for display
  const [currentScale, setCurrentScale] = useState(1);
  
  /**
   * Reset view to show all chat windows
   * Calculates the bounding box of all windows and adjusts zoom/pan to fit
   */
  const resetToFitAllChats = () => {
    if (!transformRef.current || chats.length === 0) return;
    
    // Calculate bounding box of all chat windows
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    chats.forEach(chat => {
      const x = chat.x || 50 + (chat.position * 30);
      const y = chat.y || 50 + (chat.position * 30);
      const width = chat.width || 400;
      const height = chat.height || 300;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    
    // Add padding around the bounding box
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    // Calculate the size of the bounding box
    const boundingWidth = maxX - minX;
    const boundingHeight = maxY - minY;
    
    // Get the actual viewport dimensions from the wrapper component
    // Wait a tick to ensure the wrapper is properly mounted
    setTimeout(() => {
      const container = transformRef.current?.instance.wrapperComponent;
      if (!container) return;
      
      const viewportWidth = container.offsetWidth;
      const viewportHeight = container.offsetHeight;
      
      // Calculate scale to fit all windows
      const scaleX = viewportWidth / boundingWidth;
      const scaleY = viewportHeight / boundingHeight;
      let scale = Math.min(scaleX, scaleY);
      
      // Limit scale between min and max
      scale = Math.max(0.5, Math.min(scale, 2));
      
      // Calculate center position of all windows (in content coordinates)
      const contentCenterX = minX + boundingWidth / 2;
      const contentCenterY = minY + boundingHeight / 2;
      
      // Calculate the translation needed to center the content
      // We want the content center to appear at viewport center
      const translateX = viewportWidth / 2 - contentCenterX * scale;
      const translateY = viewportHeight / 2 - contentCenterY * scale;
      
      // Apply the transformation with animation
      transformRef.current?.setTransform(translateX, translateY, scale, 300);
    }, 0);
  };
  
  // Auto-center view on initial load
  useEffect(() => {
    // Small delay to ensure the transform wrapper is fully initialized
    const timer = setTimeout(() => {
      if (transformRef.current && chats.length > 0) {
        resetToFitAllChats();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={2}
        centerOnInit={false}
        limitToBounds={false}
        disablePadding={true}
        // Panning configuration
        panning={{
          disabled: false,
          velocityDisabled: false,
          lockAxisX: false,
          lockAxisY: false,
          // Allow panning with simple drag (no modifier keys needed)
          activationKeys: [],
          // Exclude form elements from triggering pan to allow normal interaction
          excluded: ['input', 'textarea', 'button', 'select']
        }}
        // Mouse wheel zoom configuration
        wheel={{
          disabled: false,
          step: 0.15, // Zoom step for each wheel event
          touchPadDisabled: false, // Allow trackpad gestures
          smoothStep: 0.002, // Smooth zoom animation step
          activationKeys: [] // No modifier keys needed for zoom
        }}
        // Trackpad pinch zoom configuration
        pinch={{
          disabled: false,
          step: 1 // Pinch zoom sensitivity
        }}
        // Disable double-click zoom to prevent accidental zooming
        doubleClick={{
          disabled: true
        }}
        // Listen to transform changes to update zoom percentage display
        onTransformed={(ref) => {
          setCurrentScale(ref.state.scale);
        }}
      >
      {({ zoomIn, zoomOut, resetTransform, centerView, instance }) => (
        <div className="relative w-full h-full" style={{ touchAction: 'none' }}>
          {/* Zoom Controls - positioned at bottom right */}
          <div className="absolute bottom-2 right-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex items-center gap-2">
            {/* Zoom Out Button */}
            <button
              onClick={() => zoomOut()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            {/* Zoom Percentage Display */}
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[50px] text-center">
              {Math.round(currentScale * 100)}%
            </span>
            
            {/* Zoom In Button */}
            <button
              onClick={() => zoomIn()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            
            {/* Reset View Button - centers and fits all chat windows */}
            <button
              onClick={() => resetToFitAllChats()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Fit all windows in view"
            >
              <RotateCcw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Zoomable/Pannable Canvas Container */}
          <TransformComponent
            wrapperStyle={{
              width: '100%',
              height: '100%',
              touchAction: 'none' // Prevent browser touch gestures
            }}
            contentStyle={{
              width: '100%',
              height: '100%'
            }}
            wrapperProps={{
              'data-testid': 'transform-component-wrapper'
            } as any}
          >
            {/* Large canvas area for positioning chat windows */}
            <div className="relative w-full h-full" style={{ minWidth: '3000px', minHeight: '3000px' }}>
              {/* Render all chat windows */}
              {chats.map((chat) => (
                <FreeformChat
                  key={chat.id}
                  chat={chat}
                  messages={messagesByChat.get(chat.id!) || []}
                  isLoading={loadingChats.has(chat.id!)}
                  onModelChange={onModelChange}
                  onActiveToggle={onActiveToggle}
                  onClose={onClose}
                  onAbort={onAbort}
                  onRetry={onRetry}
                  onPositionChange={onPositionChange}
                  totalChats={chats.length}
                  pendingApproval={pendingApprovalRequests?.get(chat.id!)}
                  onApproveToolCall={onApproveToolCall ? (requestId) => onApproveToolCall(requestId, chat.id) : undefined}
                  onDenyToolCall={onDenyToolCall ? (requestId) => onDenyToolCall(requestId, chat.id) : undefined}
                />
              ))}
            </div>
          </TransformComponent>
        </div>
      )}
    </TransformWrapper>
    </div>
  );
}