"use client"
import { ChevronDown, LogOut, Menu, User, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { useAuth } from '@/lib/hooks/useAuth';

import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';


const MainNav = () => {
    const { theme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isFeedDropdownOpen, setIsFeedDropdownOpen] = useState(false);
    const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const feedDropdownRef = useRef<HTMLDivElement>(null);
    const toolsDropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();



    const navLinks = [
        { href: "/", label: "HOME" },
        { href: "/articles", label: "ARTICLES" },
        { href: "/podcasts", label: "PODCAST" },
        { href: "/players", label: "PLAYERS" },
    ];

    const feedOptions = [
        { href: "/nuggets", label: "Latest" },
        { href: "/saved-nuggets", label: "Saved Nuggets" },
        { href: "/players-nuggets", label: "My Players" },
        { href: "/feeds/sleeper", label: "Sleeper" },
    ];

    const toolOptions = [
        { href: "/rankings", label: "Rankings" },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/'); // Redirect to login after logout
            // Close dropdown after logout
            setIsUserDropdownOpen(false);
        } catch (error) {
            console.error('Logout error:', error);
            // Close dropdown even if logout fails
            setIsUserDropdownOpen(false);
        }
    };

    const getUserInitials = () => {
        if (!user) return 'U';

        if (user.firstName && user.lastName) {
            return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
        }

        if (user.firstName) {
            return user.firstName.charAt(0).toUpperCase();
        }

        if (user.username) {
            return user.username.charAt(0).toUpperCase();
        }

        return 'U';
    };


    const getUserDisplayName = () => {
        if (!user) return null;

        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }

        if (user.firstName) {
            return user.firstName;
        }

        if (user.username) {
            return user.username;
        }

        return 'User';
    };

    return (
        <div>
            <div className="flex lg:hidden items-center space-x-3 ml-2">
                {/* <ThemeToggle /> */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            <div className="md:flex header-secondary h-[32px] lg:h-[50px] items-center justify-between px-2 lg:px-5 mb-1 mt-2">
                {/* Mobile Social Links - Only visible on mobile */}
                <div className="flex lg:hidden items-center justify-center w-full space-x-4">
                    {/* <h1 className="text-white text-xl font-bold">Social Links</h1> */}
                    <div className="flex items-center space-x-4">
                        <Link href="https://youtube.com/@32beatwriters">
                            <Image src={"/icons-youtube.svg"} alt="Youtube" width={20} height={20} />
                        </Link>
                        <Link href="https://x.com/32beatwriters">
                            <Image src={"/icons-twitter.svg"} alt="Twitter" width={20} height={20} />
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="https://open.spotify.com/show/1b1yaE1OxyTuNDsWNIZr20?si=76f0d6a2fbf1430c">
                            <Image src={"/icons-spotify.svg"} alt="Spotify" width={20} height={20} />
                        </Link>
                        <Link href="https://podcasts.apple.com/us/podcast/32beatwriters-podcast-network/id1694023292"    >
                            <Image src={"/icons-apple.svg"} alt="Apple Podcasts" width={20} height={20} />
                        </Link>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="relative hover:text-red-800 transition-colors duration-200 py-2 group text-md font-oswald text-white"
                        >
                            {link.label}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-300 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}

                    {/* Feed Dropdown */}
                    <div className="relative left-2" ref={feedDropdownRef}>
                        <button
                            onClick={() => setIsFeedDropdownOpen(!isFeedDropdownOpen)}
                            className="relative hover:text-red-800 transition-colors duration-200 py-2 group text-md font-oswald text-white flex items-center space-x-1"
                        >
                            <span>FEEDS</span>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isFeedDropdownOpen ? 'rotate-180' : ''}`} />
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-300 transition-all duration-300 group-hover:w-full"></span>
                        </button>

                        {/* Feed Dropdown Menu */}
                        {isFeedDropdownOpen && (
                            <div className="absolute top-full left-0 w-48 rounded-sm shadow-lg border border-white/20 bg-background/90 py-2 z-50">
                                <div className="py-1">
                                    {feedOptions.map((option) => (
                                        <Link
                                            key={option.href}
                                            href={option.href}
                                            className="flex items-center px-4 py-2 text-md transition-colors hover:text-red-800"
                                            onClick={() => setIsFeedDropdownOpen(false)}
                                        >
                                            {option.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tools Dropdown */}
                    <div className="relative left-2" ref={toolsDropdownRef}>
                        <button
                            onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                            className="relative hover:text-red-800 transition-colors duration-200 py-2 group text-md font-oswald text-white flex items-center space-x-1"
                        >
                            <span>TOOLS</span>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-300 transition-all duration-300 group-hover:w-full"></span>
                        </button>
                        {isToolsDropdownOpen && (
                            <div className="absolute top-full left-0 w-56 rounded-sm shadow-lg border border-white/20 bg-background/90 py-2 z-50">
                                <div className="py-1">
                                    {toolOptions.map((option) => (
                                        <Link
                                            key={option.href}
                                            href={option.href}
                                            className="flex items-center px-4 py-2 text-md transition-colors hover:text-red-800"
                                            onClick={() => setIsToolsDropdownOpen(false)}
                                        >
                                            {option.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* {toolNavLink.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="relative hover:text-red-800 transition-colors duration-200 py-2 group text-md font-oswald text-white"
                            >
                                {link.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-300 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))} */}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center space-x-4">
                    <ThemeToggle />
                    {/* <div className="w-px h-7 bg-gray-300"></div> */}
                    {isAuthenticated ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="flex items-center space-x-3 px-4 py-2 hover:cursor-pointer text-white"
                            >
                                <div className="flex items-center space-x-2">
                                    {user?.profilePicture ? (
                                        <Image
                                            src={user.profilePicture}
                                            alt="Profile"
                                            width={32}
                                            height={32}
                                            className="w-6 h-6 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                                            <span className="text-white text-md">
                                                {getUserInitials()}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-md">
                                        {getUserDisplayName()}
                                    </span>
                                </div>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Dropdown Menu */}
                            {isUserDropdownOpen && (
                                <div className="absolute right-0 w-48 rounded-sm shadow-lg border border-white/20 bg-background/90 py-2 z-50">
                                    <div className="py-1">
                                        <Link
                                            href="/account"
                                            className="flex items-center px-4 py-2 text-md transition-colors"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            <User className="h-5 w-5 mr-2" />
                                            My Account
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-md text-red-800 hover:cursor-pointer"
                                        >
                                            <LogOut className="h-5 w-5 mr-2" />
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link
                                href="/subscribe"
                                className="bg-red-800 hover:scale-102 text-white px-4 py-1 rounded text-md transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                SUBSCRIBE
                            </Link>
                            <Link
                                href="/login"
                                className="desktop-login-link hover:scale-102 transition-colors text-md"
                            >
                                LOGIN
                            </Link>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MainNav;
