'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function Logo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a skeleton or default state while loading
    return (
      <div className="relative w-10 h-10">
        <Image 
          src="/images/logos/kwill-black-no-bg.png"
          alt="Kwill Logo" 
          fill
          style={{ objectFit: 'contain' }}
        /> 
      </div>
    )
  }

  // Use resolvedTheme instead of theme for more reliable detection
  const logoSrc = (resolvedTheme === 'dark') 
    ? '/images/logos/kwill-white-no-bg.png'
    : '/images/logos/kwill-black-no-bg.png'

  return (
    <div className="relative w-10 h-10">
      <Image 
        src={logoSrc}
        alt="Kwill Logo" 
        fill
        style={{ objectFit: 'contain' }}
      /> 
    </div>
  )
}
