"use client"
import Link from "next/link";
import Form from "next/form";
import Image from "next/image";
import { CircleUserRound, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import MobileNav from "./MobileNav";
import { useState } from "react";
import { useAuth } from '../(pages)/articles/hooks/useAuth';

function Header() {

    const { theme } = useTheme();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { user, isAuthenticated } = useAuth();

    return (
        <header className="h-20 flex flex-wrap items-center sticky top-0 z-10 bg-background/100 backdrop-blur-md border-b border-border transition-colors px-4">
            <div className="flex w-full flex-wrap justify-between items-center container mx-auto">

                {/* Mobile Layout: Menu and Search on Left */}
                <div className="flex items-center gap-4 sm:hidden">

                    {/* Mobile Layout: Logo on Right */}
                    <div className="sm:hidden">
                        <Link href="/"
                            className="hover:opacity-90 cursor-pointer flex items-center gap-2">
                            <Image src={theme === "dark" ? "/32bw_logo_white.png" : "/logo-small.webp"} alt="logo" width={35} height={35} />
                            <h1 className="text-xl font-extralight">32 Beat Writers</h1>
                        </Link>
                    </div>
                </div>

                {/* Desktop Layout: Logo and Navigation on Left */}
                <div className="hidden sm:flex items-center gap-24">
                    <Link href="/"
                        className="hover:opacity-90 cursor-pointer flex items-center gap-2">
                        <Image src={theme === "dark" ? "/32bw_logo_white.png" : "/logo-small.webp"} alt="logo" width={35} height={35} />
                        <h1 className="text-xl font-extralight">32 Beat Writers</h1>
                    </Link>
                    <div className="hidden lg:flex gap-10">
                        <Link
                            href="/"
                            className="flex gap-1 text-sm md:text-base text-foreground hover:text-red-900 hover:scale-105 transition-colors">Home</Link>
                        <Link
                            href="/subscribe"
                            className="flex gap-1 text-sm md:text-base text-foreground hover:text-red-900 hover:scale-105 transition-colors">Subscribe</Link>
                        <Link
                            href="/articles"
                            className="flex gap-1 text-sm md:text-base text-foreground hover:text-red-900 hover:scale-105 transition-colors">Articles</Link>
                        <Link
                            href="/podcast"
                            className="flex gap-1 text-sm md:text-base text-foreground hover:text-red-900 hover:scale-105 transition-colors">Podcast</Link>
                        <Link
                            href="/teams"
                            className="text-sm md:text-base text-foreground hover:text-red-900 hover:scale-105 transition-colors">Teams</Link>
                        <Link
                            href="/tools"
                            className="text-sm md:text-base text-foreground hover:text-red-900 hover:scale-105 transition-colors">Tools</Link>
                    </div>
                </div>


                {/* Desktop Layout: Right Side Items */}
                <div className="hidden sm:flex items-center gap-6 flex-1 sm:flex-none">
                    <Link href="/beat-writers"
                        className="lg:flex hidden items-center space-x-2 text-sm md:text-base text-foreground hover:text-red-900 hover:scale-105 transition-colors">
                        Beat Writers
                    </Link>

                    {/* Regular search bar for medium and larger devices */}
                    <Form action='/search'
                        className="flex w-[250px] sm:w-auto items-center border rounded-full focus:ring-0 sm:flex-1 sm:mx-4">
                        <Search className="ml-2" size={16} />
                        <input type="text"
                            name="search"
                            placeholder="Search"
                            className="text-foreground placeholder:text-muted-foreground px-2 py-2 rounded-full focus:outline-none w-[300px] max-w-2xl transition-colors"
                        />
                    </Form>

                    <ThemeToggle />

                    {isAuthenticated ? (
                        <Link href="/auth/account"
                            className="lg:flex hidden items-center space-x-2 text-foreground hover:text-red-900 hover:scale-105 transition-colors">
                            <CircleUserRound />
                            <span>Account</span>
                        </Link>
                    ) : (
                        <Link href="/login"
                            className="lg:flex hidden items-center space-x-2 text-foreground hover:text-red-900 hover:scale-105 transition-colors">
                            <CircleUserRound />
                            <span>Login</span>
                        </Link>
                    )}
                </div>

                {/* Mobile Layout: Theme Toggle on Right */}
                <div className="sm:hidden flex">
                    {/* Search dropdown for small devices */}
                    <div className="relative">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="p-2 text-foreground hover:text-red-900 hover:scale-105 hover:cursor-pointer transition-colors"
                        >
                            <Search size={20} />
                        </button>
                        {isSearchOpen && (
                            <div className="absolute -right-2 top-16 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg p-4 z-50">
                                <Form action='/search' className="w-full">
                                    <input
                                        type="text"
                                        name="news-search"
                                        placeholder="Search news..."
                                        className="w-full text-foreground placeholder:text-muted-foreground px-3 py-2 rounded-full border border-border focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        className="w-full mt-2 px-2 py-2 bg-red-900 text-white rounded-full transition-colors"
                                    >
                                        Search
                                    </button>
                                </Form>
                            </div>
                        )}
                    </div>
                    <ThemeToggle />
                    <MobileNav />
                </div>
            </div>
        </header>
    )
}

export default Header;
