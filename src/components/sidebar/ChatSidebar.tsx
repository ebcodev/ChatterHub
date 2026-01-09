'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db, ChatGroup, Folder as FolderType } from '@/lib/db';
import { deleteChatGroup, deleteFolder } from '@/lib/data/operations';
import { useLiveQuery } from 'dexie-react-hooks';
import { useLocalStorage } from 'usehooks-ts';
import { useChats } from '@/hooks/data/useChats';
import { Modal } from '../ui/modal';
import { DuplicateProgressModal } from '../modals/DuplicateProgressModal';
import { DuplicateProgress } from '@/lib/data/operations/chats';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Search,
  Filter,
  Folder,
  FolderOpen,
  ChevronRight,
  MessageCirclePlus,
  FolderPlus,
  Trash2,
  MoreVertical,
  Palette,
  Edit2,
  Check,
  X,
  MessageSquare,
  Star,
  ShieldCheck,
  Settings,
  Copy,
  Pin,
  PinOff,
  ArrowUpDown,
  FolderTree
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  pointerWithin,
  rectIntersection,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ColorPickerModal from '../modals/ColorPickerModal';
import DeleteFolderModal from '../modals/DeleteFolderModal';
import FolderSettingsModal from '../modals/FolderSettingsModal';
import MoveChatModal from '../modals/MoveChatModal';
import toast from 'react-hot-toast';

type SortOption = 'custom' | 'created' | 'activity' | 'alphabetical';

// Sortable Item Component
// This wrapper makes any element draggable and droppable within the DnD context
// When dragged, the original item becomes semi-transparent (opacity: 0.5)
function SortableItem({ id, children, isDraggable = true }: { id: string; children: React.ReactNode; isDraggable?: boolean }) {
  const {
    attributes,     // Accessibility attributes for screen readers
    listeners,      // Mouse and touch event listeners for drag initiation
    setNodeRef,     // Ref to attach to the DOM element
    transform,      // CSS transform for smooth dragging animation
    transition,     // CSS transition for smooth movement
    isDragging,     // Boolean indicating if this item is currently being dragged
  } = useSortable({ id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,  // Make the original item semi-transparent when dragging
    cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
  };

  return (
    <div ref={setNodeRef} style={style} {...(isDraggable ? { ...attributes, ...listeners } : {})}>
      {children}
    </div>
  );
}

// Root Drop Zone Component
// Uses useDroppable instead of useSortable to ensure it's always droppable
// This zone allows items to be moved to the root level (no parent folder)
function RootDropZone({ isOver, activeId }: { isOver: boolean; activeId: string | null }) {
  const { setNodeRef } = useDroppable({
    id: 'root-drop-zone'
  });

  return (
    <div ref={setNodeRef}>
      <div className={`mb-1 p-1 rounded-lg transition-all ${isOver && activeId ?
        'border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
        'border-2 border-transparent'
        }`}>
        {isOver && activeId && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Drop here to move to root
          </div>
        )}
      </div>
    </div>
  );
}

// Custom collision detection for better folder nesting
// This determines what elements can be drop targets when dragging
const customCollisionDetection = (args: any) => {
  const { active } = args;

  // First check for pointer collisions (where the mouse pointer is)
  const pointerCollisions = pointerWithin(args);

  // Then check rect intersections as fallback (overlapping bounding boxes)
  const rectCollisions = rectIntersection(args);

  // Combine collision results and properly deduplicate by ID
  // Using Map to ensure each collision ID appears only once
  const collisionMap = new Map();
  [...pointerCollisions, ...rectCollisions].forEach(collision => {
    if (collision.id && !collisionMap.has(collision.id)) {
      collisionMap.set(collision.id, collision);
    }
  });
  const collisions = Array.from(collisionMap.values());

  if (collisions.length > 0) {
    // Check if we're dragging a folder (ID format: "folder__<uuid>")
    const isDraggingFolder = active.id?.toString().startsWith('folder__');

    // If dragging a folder, prefer folder targets over chat groups
    // This prevents folders from being dropped into chat groups
    if (isDraggingFolder) {
      const folderCollisions = collisions.filter(collision =>
        collision.id?.toString().startsWith('folder__') ||
        collision.id === 'root-drop-zone'
      );

      if (folderCollisions.length > 0) {
        return folderCollisions;
      }
    }

    // For chat groups, accept any collision (folders or other groups)
    return collisions;
  }

  // Fall back to closest center if no collisions
  return closestCenter(args);
};

interface ChatSidebarProps {
  currentChatGroupId: string | null;
  setCurrentChatGroupId: (id: string | null) => void;
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  onNewChatGroup: (isPrivacyMode?: boolean, folderId?: string | null) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  onShowStarredMessages: () => void;
}

export default function ChatSidebar({
  currentChatGroupId,
  setCurrentChatGroupId,
  currentFolderId,
  setCurrentFolderId,
  onNewChatGroup,
  showSidebar,
  setShowSidebar,
  onShowStarredMessages,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useLocalStorage<SortOption>('CH_sidebarSortBy', 'custom');
  const [reverseOrder, setReverseOrder] = useLocalStorage('CH_sidebarReverseOrder', false);
  const [showFoldersFirst, setShowFoldersFirst] = useLocalStorage('CH_sidebarShowFoldersFirst', false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderForCreate, setSelectedFolderForCreate] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const dragOverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Infinite scrolling state
  const [displayCount, setDisplayCount] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const BATCH_SIZE = 50;

  // Duplicate progress modal state
  const [showDuplicateProgress, setShowDuplicateProgress] = useState(false);
  const [duplicateProgress, setDuplicateProgress] = useState<DuplicateProgress>({
    step: 'starting',
    currentItem: 0,
    totalItems: 0,
    messagesCopied: 0,
    totalMessages: 0,
    attachmentsCopied: 0,
    totalAttachments: 0,
    chatGroupTitle: ''
  });

  // useChats hook for duplicate functionality
  const { duplicateChatGroup } = useChats();

  // Sidebar resizing state
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState<string | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: string } | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [showFolderSettings, setShowFolderSettings] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatTitle, setEditingChatTitle] = useState('');
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [chatToMove, setChatToMove] = useState<string | null>(null);

  const sortModalRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Configure drag sensors for mouse/touch and keyboard interactions
  // PointerSensor: Handles mouse and touch drag operations
  // - distance: 5 means user must drag 5 pixels before drag starts
  //   This prevents accidental drags when clicking
  // KeyboardSensor: Enables keyboard navigation (arrow keys + space/enter)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance to prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use Dexie (IndexedDB wrapper) for data persistence
  // useLiveQuery creates reactive queries that auto-update when data changes
  // Optimized: Only fetch once and filter/sort in memory
  const folders = useLiveQuery(() => db.folders.toArray()) || [];
  const allChatGroups = useLiveQuery(() => db.chatGroups.toArray()) || [];

  // Filter and sort chat groups in memory to avoid unnecessary database queries
  const chatGroups = useMemo(() => {
    let filtered = allChatGroups;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(group =>
        group.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort - first separate pinned and unpinned
    const pinned = filtered.filter(g => g.isPinned);
    const unpinned = filtered.filter(g => !g.isPinned);

    // Sort each group separately
    const sortFunction = (a: ChatGroup, b: ChatGroup) => {
      let comparison = 0;

      if (sortBy === 'custom') {
        // Sort by order field for custom ordering
        comparison = (a.order || 0) - (b.order || 0);
      } else if (sortBy === 'created') {
        // Sort by creation date
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'activity') {
        // Sort by last activity, fallback to updatedAt if no lastActivityAt
        const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : new Date(a.updatedAt).getTime();
        const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : new Date(b.updatedAt).getTime();
        comparison = bTime - aTime; // Most recent first by default
      } else if (sortBy === 'alphabetical') {
        // Sort alphabetically by title
        comparison = a.title.localeCompare(b.title);
      }

      // Apply reverse order if enabled
      return reverseOrder ? -comparison : comparison;
    };

    pinned.sort(sortFunction);
    unpinned.sort(sortFunction);

    // Pinned items always come first
    return [...pinned, ...unpinned];
  }, [allChatGroups, searchQuery, sortBy, reverseOrder]);


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortModalRef.current && !sortModalRef.current.contains(event.target as Node)) {
        setShowSortModal(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleFolder = useCallback((folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    // Get max order for positioning
    const itemsInParent = [...folders.filter(f => f.parentId === selectedFolderForCreate),
    ...chatGroups.filter(c => c.folderId === selectedFolderForCreate)];
    const maxOrder = Math.max(0, ...itemsInParent.map(item => item.order || 0));

    const folderId = uuidv4();
    const newFolder: FolderType = {
      id: folderId,
      name: newFolderName.trim(),
      parentId: selectedFolderForCreate,
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.folders.add(newFolder);

    // Auto-expand parent folder to show the new subfolder
    if (selectedFolderForCreate !== null) {
      setExpandedFolders(prev => new Set([...prev, selectedFolderForCreate]));
    }

    setNewFolderName('');
    setShowCreateFolder(false);
    setSelectedFolderForCreate(null);
  };

  const handleDeleteChatGroup = async (groupId: string) => {
    // Use centralized delete function that handles image attachments
    await deleteChatGroup(groupId);

    if (currentChatGroupId === groupId) {
      setCurrentChatGroupId(null);
    }
    setChatToDelete(null);
  };

  const handleDuplicateChatGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Show progress modal
    setShowDuplicateProgress(true);

    try {
      const newGroupId = await duplicateChatGroup(groupId, (progress) => {
        setDuplicateProgress(progress);
      });

      // Auto-close progress modal after completion
      setTimeout(() => {
        setShowDuplicateProgress(false);
        // Switch to the new duplicated chat group
        setCurrentChatGroupId(newGroupId);
      }, 1500);

    } catch (error) {
      console.error('Failed to duplicate chat group:', error);
      setShowDuplicateProgress(false);
    }
  };

  const handleTogglePin = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Get the chat group
    const chatGroup = await db.chatGroups.get(groupId);
    if (!chatGroup) return;

    // Toggle the pinned state
    await db.chatGroups.update(groupId, {
      isPinned: !chatGroup.isPinned,
      updatedAt: new Date(),
    });
  };

  const handleToggleFolderPin = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Get the folder
    const folder = await db.folders.get(folderId);
    if (!folder) return;

    // Toggle the pinned state
    await db.folders.update(folderId, {
      isPinned: !folder.isPinned,
      updatedAt: new Date(),
    });
  };

  const handleDeleteFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolderToDelete(folderId);
    setShowDeleteFolderModal(folderId);
  };

  const handleConfirmDeleteFolder = async (deleteOption: 'cancel' | 'delete-all' | 'folder-only') => {
    if (!folderToDelete || deleteOption === 'cancel') {
      setShowDeleteFolderModal(null);
      setFolderToDelete(null);
      setIsDeleting(false);
      setDeleteProgress('');
      return;
    }

    setIsDeleting(true);
    setDeleteProgress('Preparing deletion...');

    try {
      // Use centralized delete function that handles image attachments
      await deleteFolder(
        folderToDelete,
        deleteOption === 'delete-all', // deleteContents flag
        setDeleteProgress // progress callback
      );

      setShowDeleteFolderModal(null);
      setFolderToDelete(null);
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteProgress('');
    }
  };

  const handleCreateChatGroup = async (folderId: string | null, e: React.MouseEvent) => {
    e.stopPropagation();

    // Get min order for positioning at the top
    const itemsInFolder = chatGroups.filter(c => c.folderId === folderId);
    const minOrder = Math.min(0, ...itemsInFolder.map(c => c.order || 0));

    const id = uuidv4();
    const newChatGroup: ChatGroup = {
      id: id,
      title: 'New Chat',
      layout: 'vertical',
      folderId: folderId,
      order: minOrder - 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.chatGroups.add(newChatGroup);

    // Create initial chat
    await db.chats.add({
      id: uuidv4(),
      chatGroupId: id,
      model: 'gpt-4o-mini',
      position: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Auto-expand the folder if it's not already expanded
    if (folderId && !expandedFolders.has(folderId)) {
      setExpandedFolders(prev => new Set([...prev, folderId]));
    }

    setCurrentChatGroupId(id);
    setCurrentFolderId(folderId);
  };

  const handleCreateSubfolder = (parentId: string | null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedFolderForCreate(parentId);
    setShowCreateFolder(true);
    setContextMenu(null);
  };

  const handleSetFolderColor = async (folderId: string, color: string) => {
    await db.folders.update(folderId, { color });
    setShowColorPicker(null);
  };

  const handleSaveFolderSettings = async (systemPrompt: string) => {
    if (showFolderSettings) {
      await db.folders.update(showFolderSettings, {
        systemPrompt: systemPrompt || undefined,
        updatedAt: new Date()
      });
      setShowFolderSettings(null);
    }
  };

  const handleStartEditFolder = (folder: FolderType) => {
    setEditingFolderId(folder.id!);
    setEditingFolderName(folder.name);
  };

  const handleSaveFolder = async () => {
    if (editingFolderId && editingFolderName.trim()) {
      await db.folders.update(editingFolderId, {
        name: editingFolderName.trim(),
        updatedAt: new Date()
      });
      setEditingFolderId(null);
      setEditingFolderName('');
    }
  };

  const handleCancelEditFolder = () => {
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const handleContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, folderId });
  };

  const handleKebabClick = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setContextMenu({ x: rect.left, y: rect.bottom + 4, folderId });
  };


  const getFolderColorClasses = (color?: string) => {
    if (!color) return {
      icon: 'text-gray-600 dark:text-gray-400',
      bg: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      selectedBg: 'bg-gray-100 dark:bg-gray-800'
    };

    const colorMap: Record<string, { icon: string; bg: string; text: string; selectedBg: string }> = {
      red: {
        icon: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30',
        text: 'text-red-700 dark:text-red-300',
        selectedBg: 'bg-red-100 dark:bg-red-900/30'
      },
      orange: {
        icon: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30',
        text: 'text-orange-700 dark:text-orange-300',
        selectedBg: 'bg-orange-100 dark:bg-orange-900/30'
      },
      yellow: {
        icon: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-300',
        selectedBg: 'bg-yellow-100 dark:bg-yellow-900/30'
      },
      green: {
        icon: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30',
        text: 'text-green-700 dark:text-green-300',
        selectedBg: 'bg-green-100 dark:bg-green-900/30'
      },
      blue: {
        icon: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-300',
        selectedBg: 'bg-blue-100 dark:bg-blue-900/30'
      },
      indigo: {
        icon: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        selectedBg: 'bg-indigo-100 dark:bg-indigo-900/30'
      },
      purple: {
        icon: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-300',
        selectedBg: 'bg-purple-100 dark:bg-purple-900/30'
      },
      pink: {
        icon: 'text-pink-600 dark:text-pink-400',
        bg: 'bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20 dark:hover:bg-pink-900/30',
        text: 'text-pink-700 dark:text-pink-300',
        selectedBg: 'bg-pink-100 dark:bg-pink-900/30'
      },
      gray: {
        icon: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/30',
        text: 'text-gray-700 dark:text-gray-300',
        selectedBg: 'bg-gray-100 dark:bg-gray-900/30'
      },
    };

    return colorMap[color] || {
      icon: 'text-gray-600 dark:text-gray-400',
      bg: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      selectedBg: 'bg-gray-100 dark:bg-gray-800'
    };
  };

  const handleStartEditChat = (chatGroup: ChatGroup) => {
    setEditingChatId(chatGroup.id!);
    setEditingChatTitle(chatGroup.title);
  };

  const handleSaveChat = async () => {
    if (editingChatId && editingChatTitle.trim()) {
      await db.chatGroups.update(editingChatId, {
        title: editingChatTitle.trim(),
        updatedAt: new Date()
      });
      setEditingChatId(null);
      setEditingChatTitle('');
    }
  };

  const handleCancelEditChat = () => {
    setEditingChatId(null);
    setEditingChatTitle('');
  };


  // Sidebar resizing handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    if (!showSidebar && !isCollapsed) {
      setIsCollapsed(true);
    } else if (showSidebar && isCollapsed) {
      setIsCollapsed(false);
      setSidebarWidth(320);
    }
  }, [showSidebar, isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Called once when user starts dragging an item (mousedown + move or touch + move)
  // Stores the ID of the item being dragged so we can show appropriate visual feedback
  // The activeId is used throughout the drag operation to identify what's being moved
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // activeId format examples:
    // - "folder__123e4567-e89b-12d3-a456-426614174000" for folders
    // - "group__987f6543-a21c-34d5-b678-123456789abc" for chat groups
    // - "root-drop-zone" for the root drop area (though this isn't draggable)
  };

  // Called continuously while dragging over droppable areas
  // Handles visual feedback (highlighting drop targets) and auto-expand functionality
  // This is called many times per second as the user moves the mouse
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    const newOverId = over ? over.id as string : null;
    setOverId(newOverId); // Track what we're hovering over for visual feedback

    // Auto-expand folders when hovering during drag
    // This allows users to drag items into collapsed folders by hovering over them
    if (newOverId && newOverId.startsWith('folder__')) {
      // Extract the folder UUID from ID format "folder__<uuid>"
      // We use __ as separator because UUIDs contain hyphens
      const folderIdStr = newOverId.split('__')[1];
      if (!folderIdStr) return;
      const folderId = folderIdStr;

      // Clear any previous auto-expand timeout to prevent multiple folders expanding
      if (dragOverTimeoutRef.current) {
        clearTimeout(dragOverTimeoutRef.current);
      }

      // Set new timeout to auto-expand after 300ms of continuous hover
      // 300ms is a good balance: fast enough to be responsive but slow enough
      // to prevent accidental expansion when moving past folders
      dragOverTimeoutRef.current = setTimeout(() => {
        // Only expand if the folder is currently collapsed
        if (!expandedFolders.has(folderId)) {
          setExpandedFolders(prev => new Set([...prev, folderId]));
        }
      }, 300);

      setDragOverFolderId(folderId);
    } else {
      // Clear timeout if not hovering over a folder anymore
      // This prevents delayed expansion if user moves away
      if (dragOverTimeoutRef.current) {
        clearTimeout(dragOverTimeoutRef.current);
        dragOverTimeoutRef.current = null;
      }
      setDragOverFolderId(null);
    }
  };

  // Called when dropping an item - performs the actual move in the database
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    setDragOverFolderId(null);

    // Clear any pending auto-expand timeout
    if (dragOverTimeoutRef.current) {
      clearTimeout(dragOverTimeoutRef.current);
      dragOverTimeoutRef.current = null;
    }

    // Don't do anything if dropped nowhere or on itself
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Parse IDs to determine types - format is "type__uuid"
    // e.g., "folder__123-456" splits to ["folder", "123-456"]
    const [activeType, activeDbId] = activeId.split('__');
    const [overType, overDbId] = overId.split('__');

    // Handle chat group drag
    if (activeType === 'group' && activeDbId) {
      const chatGroupId = activeDbId;

      // Scenario 1: Dropping chat group INTO a folder
      if (overType === 'folder' && overDbId) {
        const folderId = overDbId;
        // Calculate new order to place at end of folder contents
        const itemsInFolder = [...folders.filter(f => f.parentId === folderId),
        ...chatGroups.filter(c => c.folderId === folderId)];
        const maxOrder = Math.max(0, ...itemsInFolder.map(item => item.order || 0));
        await db.chatGroups.update(chatGroupId, { folderId, order: maxOrder + 1 });
      }
      // Scenario 2: Dropping on another chat group (reordering within same folder)
      // When dropping one chat onto another, we want to place it right after the target
      // without changing the visual order until the drag is complete
      else if (overType === 'group' && overDbId) {
        const overGroup = chatGroups.find(c => c.id === overDbId);
        if (overGroup) {
          // First, move the chat to the same folder as the target
          const targetFolderId = overGroup.folderId;

          // Get all items in the target folder/location for reordering
          // Exclude the item being dragged from the list
          const itemsInLocation = [
            ...folders.filter(f => f.parentId === targetFolderId),
            ...chatGroups.filter(c => c.folderId === targetFolderId && c.id !== chatGroupId)
          ].sort((a, b) => (a.order || 0) - (b.order || 0));

          // Find where the target item is in the sorted list
          const targetIndex = itemsInLocation.findIndex(item => item.id === overDbId);

          // Calculate new order: place BEFORE the target item (line appears above)
          let newOrder: number;
          if (targetIndex === 0 || itemsInLocation.length === 0) {
            // Target is first item or no items - place at the beginning
            const firstOrder = itemsInLocation[0]?.order || 0;
            newOrder = firstOrder - 1;
          } else if (targetIndex > 0) {
            // Place between the previous item and the target item
            const prevItem = itemsInLocation[targetIndex - 1];
            const targetItem = itemsInLocation[targetIndex];
            newOrder = ((prevItem?.order || 0) + (targetItem?.order || 0)) / 2;
          } else {
            // Target not found (shouldn't happen) - place at end
            const maxOrder = Math.max(0, ...itemsInLocation.map(item => item.order || 0));
            newOrder = maxOrder + 1;
          }

          await db.chatGroups.update(chatGroupId, {
            folderId: targetFolderId,
            order: newOrder
          });
        }
      }
      // Scenario 3: Dropping at root level (outside all folders)
      else if (overType === 'root' || overId === 'root-drop-zone') {
        const rootItems = [...folders.filter(f => f.parentId === null),
        ...chatGroups.filter(c => c.folderId === null)];
        const maxOrder = Math.max(0, ...rootItems.map(item => item.order || 0));
        await db.chatGroups.update(chatGroupId, { folderId: null, order: maxOrder + 1 });
      }
    }
    // Handle folder drag
    else if (activeType === 'folder' && activeDbId) {
      const folderId = activeDbId;
      const draggedFolder = folders.find(f => f.id === folderId);
      if (!draggedFolder) return;

      // Scenario 1: Dropping on another folder - check if it's reordering or nesting
      if (overType === 'folder' && overDbId) {
        const targetFolder = folders.find(f => f.id === overDbId);
        if (!targetFolder) return;

        // Check if both folders are at the same level (siblings)
        const areSiblings = draggedFolder.parentId === targetFolder.parentId;

        if (areSiblings) {
          // REORDERING: Both folders are siblings, so reorder them
          // Get all items at this level for proper ordering
          // Exclude the folder being dragged
          const parentId = draggedFolder.parentId;
          const itemsAtLevel = [
            ...folders.filter(f => f.parentId === parentId && f.id !== folderId),
            ...chatGroups.filter(c => c.folderId === parentId)
          ].sort((a, b) => (a.order || 0) - (b.order || 0));

          // Find where the target is in the sorted list
          const targetIndex = itemsAtLevel.findIndex(item => item.id === overDbId);
          let newOrder: number;

          if (targetIndex === 0 || itemsAtLevel.length === 0) {
            // Target is first item or no items - place at the beginning
            const firstOrder = itemsAtLevel[0]?.order || 0;
            newOrder = firstOrder - 1;
          } else if (targetIndex > 0) {
            // Place between the previous item and the target item
            const prevItem = itemsAtLevel[targetIndex - 1];
            const targetItem = itemsAtLevel[targetIndex];
            newOrder = ((prevItem?.order || 0) + (targetItem?.order || 0)) / 2;
          } else {
            // Target not found (shouldn't happen) - place at end
            const maxOrder = Math.max(0, ...itemsAtLevel.map(item => item.order || 0));
            newOrder = maxOrder + 1;
          }

          await db.folders.update(folderId, { order: newOrder });
        } else {
          // NESTING: Moving folder into another folder (different levels)
          // Prevent moving folder into itself or its descendants
          if (!isChildFolder(folderId, overDbId, folders)) {
            // Calculate new order to place at end of target folder
            const itemsInFolder = [
              ...folders.filter(f => f.parentId === overDbId),
              ...chatGroups.filter(c => c.folderId === overDbId)
            ];
            const maxOrder = Math.max(0, ...itemsInFolder.map(item => item.order || 0));
            await db.folders.update(folderId, {
              parentId: overDbId,
              order: maxOrder + 1
            });
          }
        }
      }
      // Scenario 2: Moving folder to root level
      else if (overType === 'root' || overId === 'root-drop-zone') {
        const rootItems = [...folders.filter(f => f.parentId === null),
        ...chatGroups.filter(c => c.folderId === null)];
        const maxOrder = Math.max(0, ...rootItems.map(item => item.order || 0));
        await db.folders.update(folderId, {
          parentId: null,
          order: maxOrder + 1
        });
      }
    }
  };

  // Helper function to check if target folder is a descendant of source folder
  // This prevents creating circular references (e.g., moving a parent into its own child)
  const isChildFolder = (sourceId: string, targetId: string, allFolders: FolderType[]): boolean => {
    const children = allFolders.filter(f => f.parentId === sourceId);
    for (const child of children) {
      if (child.id === targetId) return true; // Direct child
      if (child.id && isChildFolder(child.id, targetId, allFolders)) return true; // Recursive check
    }
    return false;
  };

  // Extended types for tree rendering
  type FolderWithDepth = FolderType & { _depth: number };
  type ChatGroupWithDepth = ChatGroup & { _depth: number };
  type TreeItem = FolderWithDepth | ChatGroupWithDepth;

  // Build folder tree structure for rendering
  // This creates a flat array from the hierarchical folder/chat structure
  // Each item includes a _depth property used for visual indentation
  // The flat array makes it easier to render with React while maintaining hierarchy visually
  const buildFolderTree = useCallback((parentId: string | null = null, depth: number = 0): TreeItem[] => {
    const items: TreeItem[] = [];

    // Get all items at this level
    // parentId = null means root level items
    // parentId = "some-uuid" means items inside that folder
    const foldersAtLevel = folders.filter(f => f.parentId === parentId);
    const chatGroupsAtLevel = chatGroups.filter(c => c.folderId === parentId);

    // Apply sorting based on current sort mode
    const sortItems = <T extends { order?: number; createdAt: Date; updatedAt: Date; title?: string; name?: string; lastActivityAt?: Date }>(items: T[]) => {
      const sorted = [...items];
      sorted.sort((a, b) => {
        let comparison = 0;

        if (sortBy === 'custom') {
          comparison = (a.order || 0) - (b.order || 0);
        } else if (sortBy === 'created') {
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === 'activity') {
          // For folders and groups, use updatedAt as activity indicator
          const aTime = a.lastActivityAt ?
            new Date(a.lastActivityAt).getTime() : new Date(a.updatedAt).getTime();
          const bTime = b.lastActivityAt ?
            new Date(b.lastActivityAt).getTime() : new Date(b.updatedAt).getTime();
          comparison = bTime - aTime;
        } else if (sortBy === 'alphabetical') {
          const aName = (a as any).title || (a as any).name || '';
          const bName = (b as any).title || (b as any).name || '';
          comparison = aName.localeCompare(bName);
        }

        return reverseOrder ? -comparison : comparison;
      });
      return sorted;
    };

    // Separate pinned and unpinned folders
    const pinnedFolders = foldersAtLevel.filter(f => f.isPinned);
    const unpinnedFolders = foldersAtLevel.filter(f => !f.isPinned);
    
    // Sort each group separately
    const sortedPinnedFolders = sortItems(pinnedFolders);
    const sortedUnpinnedFolders = sortItems(unpinnedFolders);
    
    // Pinned folders always come first
    const sortedFolders = [...sortedPinnedFolders, ...sortedUnpinnedFolders];
    const sortedChatGroups = sortItems(chatGroupsAtLevel);

    // Combine based on showFoldersFirst setting
    let allItems: (FolderType | ChatGroup)[];
    if (showFoldersFirst) {
      // Show all folders first (pinned folders at the very top), then all chat groups
      allItems = [...sortedFolders, ...sortedChatGroups];
    } else if (sortBy === 'custom') {
      // For custom order, separate by pinned status but maintain order within groups
      const pinnedItems = [...sortedPinnedFolders, ...chatGroups.filter(c => c.isPinned && c.folderId === parentId)];
      const unpinnedItems = [...sortedUnpinnedFolders, ...chatGroups.filter(c => !c.isPinned && c.folderId === parentId)];
      
      // Sort each group by order
      pinnedItems.sort((a, b) => {
        const comparison = (a.order || 0) - (b.order || 0);
        return reverseOrder ? -comparison : comparison;
      });
      unpinnedItems.sort((a, b) => {
        const comparison = (a.order || 0) - (b.order || 0);
        return reverseOrder ? -comparison : comparison;
      });
      
      allItems = [...pinnedItems, ...unpinnedItems];
    } else {
      // For other sort modes, keep pinned folders first, then other items
      allItems = [...sortedFolders, ...sortedChatGroups];
    }

    // Process each item sequentially to maintain order
    allItems.forEach(item => {
      // Check if this is a folder (has parentId) or chat group (has folderId)
      const isFolder = 'parentId' in item;

      // Add the item with its depth level for indentation
      // depth 0 = root level, depth 1 = inside one folder, etc.
      items.push({ ...item, _depth: depth } as TreeItem);

      // If it's an expanded folder, recursively add all its children
      // This creates the tree structure in the flat array
      if (isFolder && item.id && expandedFolders.has(item.id)) {
        items.push(...buildFolderTree(item.id, depth + 1));
      }
    });

    return items;
  }, [folders, chatGroups, expandedFolders, sortBy, reverseOrder, showFoldersFirst]);

  const folderTree = useMemo(() => buildFolderTree(), [buildFolderTree]);

  // Get only the items to display (for infinite scrolling)
  const visibleFolderTree = useMemo(() => {
    return folderTree.slice(0, displayCount);
  }, [folderTree, displayCount]);

  // Handle infinite scrolling - must be after folderTree definition
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || isLoadingMore) return;

      const container = scrollContainerRef.current;
      const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

      // Load more when user is within 200px of the bottom
      if (scrollBottom < 200 && displayCount < folderTree.length) {
        setIsLoadingMore(true);
        // Simulate loading delay for smooth UX
        setTimeout(() => {
          setDisplayCount(prev => Math.min(prev + BATCH_SIZE, folderTree.length));
          setIsLoadingMore(false);
        }, 100);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [displayCount, folderTree.length, isLoadingMore]);

  // Reset display count when search query or sort changes
  useEffect(() => {
    setDisplayCount(BATCH_SIZE);
  }, [searchQuery, sortBy, reverseOrder, showFoldersFirst]);

  // Create sortable items list for DnD
  // Only include visible items for better performance
  const sortableItems = useMemo(() => {
    const visibleIds = new Set<string>();
    visibleFolderTree.forEach(item => {
      const isFolder = 'parentId' in item;
      if (isFolder) {
        visibleIds.add(`folder__${item.id}`);
      } else {
        visibleIds.add(`group__${item.id}`);
      }
    });

    // Also include all folders (even if not visible) to allow dropping into them
    folders.forEach(f => {
      visibleIds.add(`folder__${f.id}`);
    });

    return ['root-drop-zone', ...Array.from(visibleIds)];
  }, [visibleFolderTree, folders]);

  // Check if mobile (window width < 768px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
          <div
            ref={sidebarRef}
            className={`${isMobile
              ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'
              } w-[85vw] max-w-sm`
              : `relative h-full overflow-hidden ${!showSidebar || isCollapsed ? 'transition-all duration-300' : ''}`
              } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col`}
            style={{ width: isMobile ? undefined : (!showSidebar || isCollapsed ? 0 : `${sidebarWidth}px`) }}
          >
            {/* Resize handle - hide on mobile */}
            {!isMobile && (
              <div
                className={`absolute top-0 right-0 w-2 h-full cursor-col-resize group hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors z-30 flex items-center justify-center ${isResizing ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}
                onMouseDown={handleMouseDown}
              >
                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors rounded-full" />
              </div>
            )}

            {/* Search and Controls */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 focus:border-gray-500 dark:focus:border-gray-500 focus:outline-none placeholder-gray-500"
                />
              </div>

              <button
                onClick={() => onNewChatGroup(false, null)}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-3"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm font-medium">New Chat</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="New Folder"
                >
                  <FolderPlus className="h-5 w-5" />
                </button>

                <div className="relative ml-auto" ref={sortModalRef}>
                  <button
                    onClick={() => setShowSortModal(!showSortModal)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Sort"
                  >
                    <Filter className="h-5 w-5" />
                  </button>

                  {showSortModal && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10">
                      <div className="px-4 py-2 text-gray-900 dark:text-white font-medium border-b border-gray-200 dark:border-gray-700">Sort by</div>
                      {[
                        { value: 'custom', label: 'Custom Order' },
                        { value: 'created', label: 'Created' },
                        { value: 'activity', label: 'Last Activity' },
                        { value: 'alphabetical', label: 'Alphabetical' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value as SortOption);
                            setShowSortModal(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${sortBy === option.value ? 'bg-gray-100 dark:bg-gray-700' : ''
                            }`}
                        >
                          <span>{option.label}</span>
                          {sortBy === option.value && (
                            <Check className="h-4 w-4 text-blue-500" />
                          )}
                        </button>
                      ))}

                      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                        <button
                          onClick={() => setReverseOrder(!reverseOrder)}
                          className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowUpDown className="h-4 w-4" />
                            <span>Reverse order</span>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 ${reverseOrder ? 'bg-blue-500 border-blue-500' : 'border-gray-400 dark:border-gray-500'} flex items-center justify-center`}>
                            {reverseOrder && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </button>

                        <button
                          onClick={() => setShowFoldersFirst(!showFoldersFirst)}
                          className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FolderTree className="h-4 w-4" />
                            <span>Show folders first</span>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 ${showFoldersFirst ? 'bg-blue-500 border-blue-500' : 'border-gray-400 dark:border-gray-500'} flex items-center justify-center`}>
                            {showFoldersFirst && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Groups List */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-2">
              {/* Root Drop Zone - Special area for moving items out of folders to root level
                This is always at the top of the sidebar and provides a clear target
                for users to move items back to the root level (no parent folder)
                Uses useDroppable to ensure it's always droppable (not affected by disabled flag)
            */}
              <RootDropZone isOver={overId === 'root-drop-zone'} activeId={activeId} />

              <div className="space-y-1">
                {visibleFolderTree.map((item) => {
                  const isFolder = 'parentId' in item;
                  const depth = ('_depth' in item ? item._depth : 0) as number;

                  if (isFolder) {
                    const folder = item as FolderType;
                    const isExpanded = expandedFolders.has(folder.id!);
                    const dragId = `folder__${folder.id}`;
                    const isOver = overId === dragId;
                    const isAboutToExpand = dragOverFolderId === folder.id && !isExpanded;
                    const colorClasses = getFolderColorClasses(folder.color);

                    // Determine if we're showing reorder vs nest feedback
                    // Show reorder line if dragging a sibling folder
                    let showReorderLine = false;
                    let showNestFeedback = false;

                    if (isOver && activeId && activeId !== dragId) {
                      const [activeType, activeDbId] = activeId.split('__');
                      if (activeType === 'folder' && activeDbId) {
                        const draggedFolder = folders.find(f => f.id === activeDbId);
                        // Show reorder line if both folders have the same parent (siblings)
                        if (draggedFolder && draggedFolder.parentId === folder.parentId) {
                          showReorderLine = true;
                        } else {
                          showNestFeedback = true;
                        }
                      } else if (activeType === 'group') {
                        // Always show nest feedback when dragging chats over folders
                        showNestFeedback = true;
                      }
                    }

                    return (
                      <SortableItem key={dragId} id={dragId} isDraggable={sortBy === 'custom'}>
                        <div className="relative" style={{ marginLeft: `${depth * 1}rem` }}>
                          {/* Visual feedback for REORDERING folders (shows line between) */}
                          {showReorderLine && (
                            <div className="absolute left-0 right-0 -top-0.5 h-0.5 bg-blue-500 pointer-events-none z-10">
                              <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
                            </div>
                          )}

                          {/* Visual feedback for NESTING into folder (shows dashed border) */}
                          {showNestFeedback && (
                            <div className="absolute -inset-x-2 inset-y-0 border-2 border-dashed border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg pointer-events-none z-10">
                              <div className="absolute top-1 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded pointer-events-none whitespace-nowrap">
                                Drop into folder
                              </div>
                            </div>
                          )}
                          <div
                            className={`flex items-center justify-between px-3 py-2 rounded-lg ${colorClasses.bg} group ${isOver && activeId !== dragId ? 'opacity-80' : ''}`}
                            onContextMenu={(e) => handleContextMenu(e, folder.id!)}
                          >
                            {editingFolderId === folder.id ? (
                              // Inline editing mode for folder
                              <>
                                <div className="flex items-center gap-2 flex-1">
                                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : 'text-gray-500'}`} />
                                  {folder.isPinned && (
                                    <span title="Pinned">
                                      <Pin className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                    </span>
                                  )}
                                  {isExpanded ? (
                                    <FolderOpen className={`h-4 w-4 ${colorClasses.icon}`} />
                                  ) : (
                                    <Folder className={`h-4 w-4 ${colorClasses.icon}`} />
                                  )}
                                  <input
                                    type="text"
                                    value={editingFolderName}
                                    onChange={(e) => setEditingFolderName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveFolder();
                                      } else if (e.key === 'Escape') {
                                        handleCancelEditFolder();
                                      }
                                    }}
                                    onBlur={handleCancelEditFolder}
                                    className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onMouseDown={(e) => {
                                      e.preventDefault(); // Prevent blur event
                                      handleSaveFolder();
                                    }}
                                    className="p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded text-green-600 dark:text-green-400"
                                    title="Save"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onMouseDown={(e) => {
                                      e.preventDefault(); // Prevent blur event
                                      handleCancelEditFolder();
                                    }}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
                                    title="Cancel"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              // Normal display mode for folder
                              <>
                                <div
                                  className="flex items-center gap-2 flex-1 cursor-pointer"
                                  onClick={(e) => toggleFolder(folder.id!, e)}
                                >
                                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : isAboutToExpand ? 'rotate-45 text-blue-500' : 'text-gray-500'
                                    }`} />
                                  {folder.isPinned && (
                                    <span title="Pinned">
                                      <Pin className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                    </span>
                                  )}
                                  {isExpanded ? (
                                    <FolderOpen className={`h-4 w-4 ${colorClasses.icon}`} />
                                  ) : (
                                    <Folder className={`h-4 w-4 ${colorClasses.icon}`} />
                                  )}
                                  <span className={`text-sm font-medium ${colorClasses.text}`}>{folder.name}</span>
                                </div>
                                <button
                                  onClick={(e) => handleKebabClick(e, folder.id!)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded"
                                  title="More options"
                                >
                                  <MoreVertical className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </SortableItem>
                    );
                  } else {
                    const group = item as ChatGroup & { _depth?: number };
                    const dragId = `group__${group.id}`;
                    const isOver = overId === dragId;

                    return (
                      <SortableItem key={dragId} id={dragId} isDraggable={sortBy === 'custom'}>
                        <div className="relative" style={{ marginLeft: `${depth * 1}rem` }}>
                          {/* Visual feedback when hovering between items (reordering)
                            Shows a thin blue line to indicate insertion point
                            The line appears above the item being hovered
                            The dot on the left makes the insertion point more visible
                        */}
                          {isOver && activeId && activeId !== dragId && (
                            <div className="absolute left-0 right-0 -top-0.5 h-0.5 bg-blue-500 pointer-events-none z-10">
                              <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
                            </div>
                          )}
                          <div
                            onClick={() => !editingChatId && setCurrentChatGroupId(group.id!)}
                            className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${currentChatGroupId === group.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                              } ${isOver && activeId !== dragId ? 'relative z-20' : ''}`}
                          >
                            {editingChatId === group.id ? (
                              // Inline editing mode for chat
                              <>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {group.isPinned && (
                                    <span title="Pinned">
                                      <Pin className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                    </span>
                                  )}
                                  {group.isTemporary ? (
                                    <span title="Incognito Mode - Auto-deletes after 5 min">
                                      <ShieldCheck className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                    </span>
                                  ) : (
                                    <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  )}
                                  <input
                                    type="text"
                                    value={editingChatTitle}
                                    onChange={(e) => setEditingChatTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveChat();
                                      } else if (e.key === 'Escape') {
                                        handleCancelEditChat();
                                      }
                                    }}
                                    onBlur={handleCancelEditChat}
                                    className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onMouseDown={(e) => {
                                      e.preventDefault(); // Prevent blur event
                                      handleSaveChat();
                                    }}
                                    className="p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded text-green-600 dark:text-green-400"
                                    title="Save"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onMouseDown={(e) => {
                                      e.preventDefault(); // Prevent blur event
                                      handleCancelEditChat();
                                    }}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
                                    title="Cancel"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              // Normal display mode for chat
                              <>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {group.isPinned && (
                                    <span title="Pinned">
                                      <Pin className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                    </span>
                                  )}
                                  {group.isTemporary ? (
                                    <span title="Incognito Mode - Auto-deletes after 5 min">
                                      <ShieldCheck className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                    </span>
                                  ) : (
                                    <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate block">
                                      {group.title || 'Untitled'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          onClick={(e) => e.stopPropagation()}
                                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                          title="More options"
                                        >
                                          <MoreVertical className="h-3 w-3 text-gray-500" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleTogglePin(group.id!, e);
                                          }}
                                        >
                                          {group.isPinned ? (
                                            <>
                                              <PinOff className="mr-2 h-4 w-4" />
                                              Unpin
                                            </>
                                          ) : (
                                            <>
                                              <Pin className="mr-2 h-4 w-4" />
                                              Pin
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartEditChat(group);
                                          }}
                                        >
                                          <Edit2 className="mr-2 h-4 w-4" />
                                          Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDuplicateChatGroup(group.id!, e);
                                          }}
                                        >
                                          <Copy className="mr-2 h-4 w-4" />
                                          Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setChatToMove(group.id!);
                                          }}
                                        >
                                          <FolderTree className="mr-2 h-4 w-4" />
                                          Move
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setChatToDelete(group.id!);
                                          }}
                                          className="text-red-600 dark:text-red-400"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </SortableItem>
                    );
                  }
                })}
                {folderTree.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No chat groups yet
                  </p>
                )}
                {/* Loading indicator for infinite scroll */}
                {displayCount < folderTree.length && (
                  <div className="py-4 text-center">
                    {isLoadingMore ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Showing {displayCount} of {folderTree.length} items
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
              <button
                onClick={onShowStarredMessages}
                className="w-full px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                <span className="text-sm">Starred</span>
              </button>
            </div>

            {/* Expand button when collapsed */}
            {isCollapsed && (
              <button
                onClick={() => {
                  setIsCollapsed(false);
                  setSidebarWidth(320);
                  setShowSidebar(true);
                }}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-r-lg shadow-lg hover:bg-blue-700 transition-colors z-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </SortableContext>


        {/* Create Folder Modal */}
        <Modal
          isOpen={showCreateFolder}
          onClose={() => {
            setShowCreateFolder(false);
            setNewFolderName('');
            setSelectedFolderForCreate(null);
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                  setSelectedFolderForCreate(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700"
              >
                Create
              </button>
            </div>
          </div>
        </Modal>

        {/* Context Menu */}
        {contextMenu && (
          <div
            ref={contextMenuRef}
            className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                handleCreateChatGroup(contextMenu.folderId, { stopPropagation: () => { } } as React.MouseEvent);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <MessageCirclePlus className="h-4 w-4" />
              New Chat
            </button>
            <button
              onClick={() => {
                handleCreateSubfolder(contextMenu.folderId);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              New Folder
            </button>
            <button
              onClick={async () => {
                const folder = folders.find(f => f.id === contextMenu.folderId);
                if (folder) {
                  await handleToggleFolderPin(contextMenu.folderId, { stopPropagation: () => { } } as React.MouseEvent);
                  setContextMenu(null);
                }
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              {folders.find(f => f.id === contextMenu.folderId)?.isPinned ? (
                <>
                  <PinOff className="h-4 w-4" />
                  Unpin
                </>
              ) : (
                <>
                  <Pin className="h-4 w-4" />
                  Pin
                </>
              )}
            </button>
            <button
              onClick={() => {
                const folder = folders.find(f => f.id === contextMenu.folderId);
                if (folder) {
                  handleStartEditFolder(folder);
                  setContextMenu(null);
                }
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Rename
            </button>
            <button
              onClick={() => {
                setShowColorPicker(contextMenu.folderId);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              Set Color
            </button>
            <button
              onClick={() => {
                setShowFolderSettings(contextMenu.folderId);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <button
              onClick={() => {
                handleDeleteFolder(contextMenu.folderId, { stopPropagation: () => { } } as React.MouseEvent);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}


        {/* Folder Settings Modal */}
        {showFolderSettings && folders.find(f => f.id === showFolderSettings) && (
          <FolderSettingsModal
            isOpen={true}
            onClose={() => setShowFolderSettings(null)}
            folder={folders.find(f => f.id === showFolderSettings)!}
            onSave={handleSaveFolderSettings}
          />
        )}

        {/* Color Picker Modal */}
        <ColorPickerModal
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPicker}
          handleSetFolderColor={handleSetFolderColor}
          getFolderColorClasses={getFolderColorClasses}
        />

        {/* Delete Folder Modal */}
        <DeleteFolderModal
          showDeleteFolderModal={showDeleteFolderModal}
          setShowDeleteFolderModal={setShowDeleteFolderModal}
          folderToDelete={folderToDelete}
          folders={folders}
          handleConfirmDeleteFolder={handleConfirmDeleteFolder}
          isDeleting={isDeleting}
          deleteProgress={deleteProgress}
        />


        {/* Move Chat Modal */}
        <MoveChatModal
          isOpen={!!chatToMove}
          onClose={() => setChatToMove(null)}
          chatGroup={chatGroups.find(g => g.id === chatToMove) || null}
          folders={folders}
          onMove={() => {
            // Optional: Show a success message
            toast.success('Chat moved successfully');
          }}
        />

        {/* Delete Chat Confirmation Dialog */}
        <AlertDialog open={!!chatToDelete} onOpenChange={(open) => !open && setChatToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this chat and all its messages. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => chatToDelete && handleDeleteChatGroup(chatToDelete)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Duplicate Progress Modal */}
        <DuplicateProgressModal
          isOpen={showDuplicateProgress}
          progress={duplicateProgress}
        />
      </DndContext>
    </>
  );
}