"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </button>
    )
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const getCurrentIcon = () => {
    if (theme === "dark") {
      return <Sun className="h-[1.2rem] w-[1.2rem]" />
    } else {
      return <Moon className="h-[1.2rem] w-[1.2rem]" />
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white/80 dark:bg-[#2C204B] text-gray-800 dark:text-yellow-300 shadow hover:bg-gray-100 dark:hover:bg-[#3a2d5c] transition-colors h-10 w-10 focus:outline-none focus:ring-2 focus:ring-red-600"
    >
      {getCurrentIcon()}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
} 