import Image from "next/image";
import Link from "next/link";
// import AppStoreButton from "../common/AppStoreButton";
// import PlayStoreButton from "../common/PlayStoreButton";

export default function Footer({
  showAppStore = true,
  showPlayStore = true,
}: {
  showAppStore?: boolean;
  showPlayStore?: boolean;
}) {
  return (
    <footer className="border-t border-gray-200 bg-white text-gray-700">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* Logo and Tagline */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">V</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Vibe Marketing</span>
            </div>
            <p className="hidden text-sm text-gray-500 lg:block">
              AI-powered marketing that amplifies your brand's vibe.
            </p>
          </div>

          {/* Social Links */}
          <div className="mt-6 flex items-center space-x-6 lg:mt-0">
            <Link
              href="https://twitter.com/vibemarketing"
              className="text-gray-500 transition-colors hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
            <Link
              href="https://linkedin.com/company/vibemarketing"
              className="text-gray-500 transition-colors hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </Link>
            <Link
              href="https://instagram.com/vibemarketing"
              className="text-gray-500 transition-colors hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">Instagram</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-8 flex flex-col items-center justify-between space-y-4 border-t border-gray-200 pt-8 text-sm text-gray-500 sm:flex-row sm:space-y-0">
          <div className="flex space-x-6">
            <Link href="/terms" className="hover:text-blue-600">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-blue-600">
              Privacy Policy
            </Link>
            <Link href="/support" className="hover:text-blue-600">
              Support
            </Link>
          </div>
          <span>© Vibe Marketing {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
