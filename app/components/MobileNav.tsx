"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useAuth } from '@/lib/hooks/useAuth';

const MobileNav = () => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  const links = [
    {
      name: isAuthenticated ? "Account" : "Login",
      path: isAuthenticated ? "/auth/account" : "/login"
    },
    {
      name: 'Home',
      path: "/"
    },
    {
      name: 'Subscribe',
      path: "/subscribe"
    },
    {
      name: 'Articles',
      path: "/articles"
    },
    {
      name: 'Podcast',
      path: "/podcast"
    },
    {
      name: 'Players',
      path: "/players"
    },
    {
      name: 'Feed',
      path: "/feed"
    }
  ];

  return (
    <Sheet>
      <SheetTrigger asChild className="flex justify-center items-center transition-transform duration-300">
        <Menu className="text-[28px] sm:text-[32px]" />
      </SheetTrigger>
      <SheetContent className="flex flex-col w-[280px] sm:w-[350px] px-2 sm:px-6">
        {/* Logo and Title Section */}
        <div className="mt-16 sm:mt-20 text-center">
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12">
              <Image 
                src={theme === "dark" ? "/32bw_logo_white.png" : "/logo-small.webp"} 
                alt="logo" 
                width={48} 
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-semibold text-center leading-tight">
              32 Beat Writers
            </h1>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex flex-col justify-center items-center gap-4 sm:gap-6 lg:gap-8 mt-12">
          {links.map((link, index) => {
            return (
              <Link 
                href={link.path} 
                key={index}
                className={`${link.path === pathname && "text-red-900 hover:scale-105"}
                      text-base sm:text-lg lg:text-xl capitalize transition-all duration-300 
                      py-2 px-4 rounded-md w-full text-center`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Space */}
        <div className="pt-8 sm:pb-12">
          <div className="text-center text-xs sm:text-sm text-muted-foreground">
            © 32 Beat Writers
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav