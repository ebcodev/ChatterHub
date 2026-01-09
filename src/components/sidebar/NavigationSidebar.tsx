'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import SupportModal from '@/components/modals/SupportModal';
import {
  MessageSquare,
  Brain,
  Settings,
  User,
  Sun,
  Moon,
  CreditCard,
  LogOut,
  ChevronRight,
  HelpCircle,
  Server,
  Sparkles,
  FileText
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLicense } from '@/contexts/LicenseContext';

interface NavigationSidebarProps {
  onSettingsClick?: () => void;
  onWelcomeClick?: () => void;
}

export default function NavigationSidebar({ onSettingsClick, onWelcomeClick }: NavigationSidebarProps) {
  const router = useRouter();
  const currentPath = router.pathname;
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isLicensed } = useLicense();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Get user initials - just use 'U' for user
  const getUserInitials = () => {
    return 'U';
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
      href: '/',
      active: currentPath.includes('/chat')
    },
    {
      id: 'prompts',
      label: 'Prompts',
      icon: FileText,
      href: '/prompts',
      active: currentPath === '/prompts'
    },
    {
      id: 'models',
      label: 'Models',
      icon: Brain,
      href: '/models',
      active: currentPath === '/models'
    },
    {
      id: 'mcp-servers',
      label: 'MCP Servers',
      icon: Server,
      href: '/mcp-servers',
      active: currentPath === '/mcp-servers'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      active: currentPath === '/settings'
    }
  ];


  return (
    <div className="w-16 h-full bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-4 border-r border-gray-200 dark:border-gray-800">
      {/* Top Navigation Items */}
      <div className="flex-1 flex flex-col items-center space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative group w-12 h-12 flex items-center justify-center rounded-lg transition-all ${isActive
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:shadow-sm'
                }`}
            >
              <Icon className="h-5 w-5" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </div>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center space-y-3 pb-2">
        {/* Theme Toggle */}
        <button
          onClick={() => {
            if (theme === 'system') {
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
            } else {
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }
          }}
          className="relative group w-12 h-12 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:shadow-sm transition-all"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
          </div>
        </button>

        {/* User Avatar with Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="relative group w-12 h-12 flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{getUserInitials()}</span>
            </div>
            {showUserMenu && (
              <ChevronRight className="absolute bottom-0 right-0 h-3 w-3 text-white bg-gray-700 rounded-full" />
            )}
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-0 left-full ml-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-[100]">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {isLicensed ? 'Licensed User' : 'Free User'}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    window.open(process.env.NEXT_PUBLIC_POLAR_BILLING_PORTAL!, '_blank');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Billing
                </button>
                <button
                  onClick={() => {
                    setShowSupportModal(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  Support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Support Modal */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </div>
  );
}