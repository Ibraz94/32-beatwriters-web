// "use client"

// import * as React from "react"
// import { Moon, Sun } from "lucide-react"
// import { useTheme } from "next-themes"

// export function ThemeToggle() {
//   const { theme, setTheme } = useTheme()
//   const [mounted, setMounted] = React.useState(false)

//   React.useEffect(() => {
//     setMounted(true)
//   }, [])

//   if (!mounted) {
//     return (
//       <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
//         <Sun className="h-[1.2rem] w-[1.2rem]" />
//         <span className="sr-only">Toggle theme</span>
//       </button>
//     )
//   }

//   const toggleTheme = () => {
//     setTheme(theme === "dark" ? "light" : "dark")
//   }

//   const getCurrentIcon = () => {
//     if (theme === "dark") {
//       return <Sun className="h-[1.2rem] w-[1.2rem]" />
//     } else {
//       return <Moon className="h-[1.2rem] w-[1.2rem]" />
//     }
//   }

//   return (
//     <button
//       onClick={toggleTheme}
//       className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white dark:bg-[#ffffff] text-gray-800 dark:text-black-300 shadow hover:bg-gray-100 dark:hover:bg-[#94919b] dark:hover:text-[#ffffff] transition-colors h-10 w-10 focus:outline-none"
//     >
//       {getCurrentIcon()}
//       <span className="sr-only">Toggle theme</span>
//     </button>
//   )
// } 

"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
