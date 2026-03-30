'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Bars3Icon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'
import { UserCircleIcon } from '@heroicons/react/20/solid'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Navbar() {
  const t = useTranslations('nav')
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    setShowProfileMenu(false)
    setIsOpen(false)
    await fetch('/api/proxy/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  // Re-check auth on every page navigation so login/logout is always reflected
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/proxy/auth/profile', { cache: 'no-store' })
        if (!mounted) return
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        } else {
          setUser(null)
        }
      } catch {
        if (mounted) setUser(null)
      }
    })()
    return () => {
      mounted = false
    }
  }, [pathname])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileMenu])

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 shrink-0 group">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300 transform group-hover:scale-105">
                <span className="text-white font-extrabold text-xl tracking-tighter">PA</span>
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tighter">PairAgain</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <div className="flex items-center space-x-1 lg:space-x-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
              <Link href="/marketplace" className="text-gray-600 hover:text-blue-600 hover:bg-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-all tracking-tight">
                {t('allListings')}
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-blue-600 hover:bg-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-all tracking-tight">
                {t('blog')}
              </Link>
              <Link href="/brands" className="text-gray-600 hover:text-blue-600 hover:bg-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-all tracking-tight">
                {t('brands')}
              </Link>
              <Link href="/maps" className="text-gray-600 hover:text-blue-600 hover:bg-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-all tracking-tight">
                {t('maps')}
              </Link>
            </div>

            <div className="h-8 w-px bg-gray-200 mx-2"></div>

            <div className="flex items-center space-x-3">
              <Link href="/lost-stolen" className="btn-secondary h-10 px-5 flex items-center shadow-sm hover:shadow-md transition-all active:scale-95 text-sm font-bold border-gray-200 bg-white">
                {t('lostFound')}
              </Link>
              <Link href="/sell" className="flex items-center px-5 h-10 bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg hover:bg-blue-700 hover:shadow-blue-500/25 transition-all duration-300 active:scale-95">
                <PlusIcon className="w-4 h-4 mr-2" /> {t('createListing')}
              </Link>
            </div>

            <LanguageSwitcher />

            <div className="h-8 w-px bg-gray-200 mx-1"></div>

            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <UserCircleIcon className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700 hidden sm:inline">{user.firstName || user.email}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-semibold text-sm border-b border-gray-100"
                    >
                      {t('profile')}
                    </Link>
                    <Link
                      href="/my-listings"
                      onClick={() => setShowProfileMenu(false)}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-semibold text-sm border-b border-gray-100"
                    >
                      {t('myListings') || 'My Listings'}
                    </Link>
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 font-semibold text-sm"
                      onClick={handleLogout}
                    >
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin" className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
                  {t('signIn')}
                </Link>
                <Link href="/auth/signup" className="px-4 py-2 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all shadow-sm">
                  {t('signUp')}
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              {isOpen ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 pt-2 pb-6 space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Link href="/marketplace" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 font-bold rounded-xl hover:bg-blue-50">
                {t('allListings')}
              </Link>
              <Link href="/lost-stolen" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 font-bold rounded-xl hover:bg-blue-50">
                {t('lostFound')}
              </Link>
              <Link href="/blog" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 font-bold rounded-xl hover:bg-blue-50">
                {t('blog')}
              </Link>
              <Link href="/brands" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 font-bold rounded-xl hover:bg-blue-50">
                {t('brands')}
              </Link>
              <Link href="/maps" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-gray-700 hover:text-blue-600 font-bold rounded-xl hover:bg-blue-50">
                {t('maps')}
              </Link>
            </div>

            <Link href="/sell" onClick={() => setIsOpen(false)} className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white font-black rounded-xl shadow-lg active:scale-95 transition-all">
              <PlusIcon className="w-5 h-5 mr-2" /> {t('createListing').toUpperCase()}
            </Link>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 text-gray-700 font-bold rounded-xl hover:bg-gray-50">
                    {t('profile')}
                  </Link>
                  <Link href="/my-listings" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 text-gray-700 font-bold rounded-xl hover:bg-gray-50">
                    {t('myListings') || 'My Listings'}
                  </Link>
                  <button
                    type="button"
                    className="block w-full text-center px-4 py-3 text-red-500 font-bold rounded-xl hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/auth/signin" className="block w-full text-center px-4 py-3 text-gray-700 font-bold border border-gray-200 rounded-xl" onClick={() => setIsOpen(false)}>
                    {t('signIn')}
                  </Link>
                  <Link href="/auth/signup" className="block w-full text-center px-4 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-md" onClick={() => setIsOpen(false)}>
                    {t('signUp')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
