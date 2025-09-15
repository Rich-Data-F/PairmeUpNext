'use client'

import { SWRConfig } from 'swr'
import { SessionProvider } from 'next-auth/react'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.')
  }
  return res.json()
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          fetcher,
          errorRetryCount: 3,
          errorRetryInterval: 5000,
          revalidateOnFocus: false,
          dedupingInterval: 2000,
        }}
      >
        {children}
      </SWRConfig>
    </SessionProvider>
  )
}
