import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NavLinks } from "./navigation/nav-links";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Logo - with fixed width */}
          <div className="w-[150px] shrink-0 text-gray-900">
            <Link href="/" className="flex items-center">
              <span className="text-base font-bold">Vibe Marketing</span>
            </Link>
          </div>

          {/* Desktop Navigation - right-aligned with flex-1 */}
          <div className="hidden flex-1 items-center justify-end gap-8 lg:flex">
            <NavLinks />
            <Link href="http://localhost:3000/sign-in">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="ml-auto flex items-center gap-4 lg:hidden">
            <Link href="http://localhost:3000/sign-in">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Sign In
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-900"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu - updated animation and added border */}
      <div
        className={`${isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          } absolute inset-x-0 top-16 z-50 transform border-b border-gray-200 bg-white p-4 transition-all duration-300 ease-in-out lg:hidden shadow-lg`}
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <NavLinks onItemClick={() => setIsOpen(false)} />
          </div>
        </div>
      </div>
    </nav>
  );
}
