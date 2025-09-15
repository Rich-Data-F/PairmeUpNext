'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EH</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EarbudHub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/marketplace" className="text-gray-700 hover:text-blue-600 font-medium">
              Marketplace
            </Link>
            <Link href="/lost-stolen" className="text-gray-700 hover:text-blue-600 font-medium">
              Lost & Found
            </Link>
            <Link href="/found-items" className="text-gray-700 hover:text-blue-600 font-medium">
              Found Items
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 font-medium">
              Blog
            </Link>
            <Link href="/brands" className="text-gray-700 hover:text-blue-600 font-medium">
              Brands
            </Link>
            
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search earbuds..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin" className="btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
            <Link href="/marketplace" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
              Marketplace
            </Link>
            <Link href="/lost-stolen" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
              Lost & Found
            </Link>
            <Link href="/found-items" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
              Found Items
            </Link>
            <Link href="/blog" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
              Blog
            </Link>
            <Link href="/brands" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
              Brands
            </Link>
            <div className="px-3 py-2">
              <input
                type="text"
                placeholder="Search earbuds..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="px-3 py-2 space-y-2">
              <Link href="/auth/signin" className="block w-full text-center btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/auth/signup" className="block w-full text-center btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
