'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/proxy/auth/profile', { cache: 'no-store' })
        if (!mounted) return
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        }
      } catch {
        /* ignore */
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 shrink-0 group">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300 transform group-hover:scale-105">
                <span className="text-white font-extrabold text-xl tracking-tighter">PA</span>
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tighter">PairAgain</span>
            </Link>
          </div>

          {/* Right Side Actions & Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <div className="flex items-center space-x-1 lg:space-x-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
              <Link href="/marketplace" className="text-gray-600 hover:text-blue-600 hover:bg-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-all tracking-tight">
                All Listings
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-blue-600 hover:bg-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-all tracking-tight">
                Blog
              </Link>
              <Link href="/brands" className="text-gray-600 hover:text-blue-600 hover:bg-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-all tracking-tight">
                Brands
              </Link>
            </div>

            <div className="h-8 w-px bg-gray-200 mx-2"></div>

            <div className="flex items-center space-x-3">
              <Link href="/lost-stolen" className="btn-secondary h-10 px-5 flex items-center shadow-sm hover:shadow-md transition-all active:scale-95 text-sm font-bold border-gray-200 bg-white">
                Lost & Found
              </Link>
              <Link href="/sell" className="btn-primary h-10 px-5 flex items-center shadow-md hover:shadow-lg transition-all active:scale-95 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-700 border-none">
                <PlusIcon className="w-4 h-4 mr-1.5" /> Create Listing
              </Link>
            </div>

            <div className="h-8 w-px bg-gray-200 mx-2"></div>

            {/* User Auth */}
            {user ? (
              <div className="flex items-center space-x-3 pl-2">
                <Link href="/profile" className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
                    {user?.name?.[0].toUpperCase() || user?.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium text-sm group-hover:text-blue-600 transition-colors hidden lg:inline">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                </Link>
                <form action="/api/proxy/auth/logout" method="post">
                  <button className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider" type="submit">Logout</button>
                </form>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin" className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="px-4 py-2 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all shadow-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
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
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 pt-2 pb-6 space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Link href="/marketplace" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 font-bold rounded-xl hover:bg-blue-50">
                All Listings
              </Link>
              <Link href="/lost-stolen" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 font-bold rounded-xl hover:bg-blue-50">
                Lost & Found
              </Link>
              <Link href="/blog" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 font-bold rounded-xl hover:bg-blue-50">
                Blog
              </Link>
              <Link href="/brands" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 font-bold rounded-xl hover:bg-blue-50">
                Brands
              </Link>
            </div>
            
            <Link href="/sell" onClick={() => setIsOpen(false)} className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all">
              <PlusIcon className="w-5 h-5 mr-2" /> CREATE LISTING
            </Link>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              {user ? (
                <form action="/api/proxy/auth/logout" method="post">
                  <button className="block w-full text-center px-4 py-3 text-red-500 font-bold rounded-xl hover:bg-red-50" type="submit">Logout</button>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/auth/signin" className="block w-full text-center px-4 py-3 text-gray-700 font-bold border border-gray-200 rounded-xl" onClick={() => setIsOpen(false)}>Sign In</Link>
                  <Link href="/auth/signup" className="block w-full text-center px-4 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-md" onClick={() => setIsOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
