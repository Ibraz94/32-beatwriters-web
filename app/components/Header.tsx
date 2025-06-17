"use client"
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Youtube, ChevronDown, User, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import { useState, useRef, useEffect } from "react";
import { useAuth } from '@/lib/hooks/useAuth';

function Header() {
    const { theme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Prevent hydration mismatch by only applying theme after mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    const handleLogout = async () => {
        try {
            await logout();
            setIsUserDropdownOpen(false);
        } catch (error) {
            console.error('Logout error:', error);
            // Close dropdown even if logout fails
            setIsUserDropdownOpen(false);
        }
    };

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/articles", label: "Articles" },
        { href: "/podcasts", label: "Podcasts" },
        { href: "/players", label: "Players" },
        { href: "/nuggets", label: "Feed" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 shadow-sm bg-background/90">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo and Social Links */}
                    <div className="flex items-center space-x-3">
                        <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
                            <div className="relative">
                                <Image 
                                    src={mounted && theme === "dark" ? "/32bw_logo_white.png" : "/logo-small.webp"} 
                                    alt="32 Beat Writers" 
                                    width={40} 
                                    height={40}
                                    className="w-10 h-10"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-2xl bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                                    32BeatWriters
                                </span>
                                <span className="text-xs text-gray-500 -mt-1 hidden sm:block">
                                    NFL Insider Network
                                </span>
                            </div>
                        </Link>

                        <div className="w-px h-7 bg-gray-300 sm:block hidden"></div>

                        <div className="hidden justify-center items-center md:justify-start space-x-2 lg:flex">
                            <Link href="https://x.com/32beatwriters" className="w-8 h-8 hover:scale-90  bg-gradient-to-r from-red-600 to-red-800 rounded-md flex items-center justify-center transition-colors">
                                <Image src={"/x-white-logo.svg"} alt="Twitter" width={20} height={20} className="h-4 w-4" />
                            </Link>
                            <Link href="https://youtube.com/@32beatwriters" className="w-8 h-8  bg-gradient-to-r from-red-600 to-red-800 hover:scale-90 rounded-md flex items-center justify-center transition-colors">
                                <Youtube className="h-5 w-5 text-white" />
                            </Link>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="relative hover:text-red-800 font-medium text-lg transition-colors duration-200 py-2 group"
                            >
                                {link.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-800 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <ThemeToggle />
                        
                        <div className="w-px h-6 bg-gray-300"></div>
                        
                        {isAuthenticated ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="flex items-center space-x-3 px-4 py-2 hover:cursor-pointer"
                                >
                                    <div className="flex items-center space-x-2">
                                        {user?.profilePicture ? (
                                            <Image
                                                src={user.profilePicture}
                                                alt="Profile"
                                                width={32}
                                                height={32}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                                                <span className="text-white font-medium text-sm">
                                                    {getUserInitials()}
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-sm font-medium">
                                            {getUserDisplayName()}
                                        </span>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* User Dropdown Menu */}
                                {isUserDropdownOpen && (
                                    <div className="absolute right-0 mt-4 w-46 rounded-sm shadow-lg border bg-background/90 py-2 z-50">                                        
                                        <div className="py-1">
                                            <Link
                                                href="/account"
                                                className="flex items-center px-4 py-2 text-sm transition-colors"
                                                onClick={() => setIsUserDropdownOpen(false)}
                                            >
                                                <User className="h-4 w-4 mr-2" />
                                                My Account
                                            </Link>
                                            
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-800 hover:cursor-pointer"
                                            >
                                                <LogOut className="h-4 w-4 mr-2" />
                                                Log out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link 
                                    href="/login"
                                    className=" hover:text-red-800 hover:scale-102 font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link 
                                    href="/subscribe"
                                    className="bg-red-800 hover:scale-102 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Subscribe
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden items-center space-x-3">
                        <ThemeToggle />
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
                </div>

                {/* Mobile Menu */}
                <div className={`lg:hidden border-t border-gray-100 bg-background/90 transition-all duration-300 ease-in-out overflow-hidden ${
                    isMobileMenuOpen 
                        ? 'max-h-screen opacity-100 translate-y-0' 
                        : 'max-h-0 opacity-0 -translate-y-2'
                }`}>
                    <div className="py-6 space-y-4">
                        {/* Navigation Links */}
                        <div className="space-y-1">
                            {navLinks.map((link, index) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block px-4 py-3 hover:text-red-800 rounded-lg font-medium transition-all duration-200 text-center transform hover:scale-105"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    style={{
                                        animationDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms'
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-4"></div>

                        {/* User Actions */}
                        <div className="px-4 space-y-3">
                            {isAuthenticated ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-center space-x-3 p-3 rounded-lg">
                                        {user?.profilePicture ? (
                                            <Image
                                                src={user.profilePicture}
                                                alt="Profile"
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center">
                                                <span className="text-white font-medium">
                                                    {getUserInitials()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium">
                                                {getUserDisplayName()}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {user?.memberships?.type || 'Subscriber'}
                                            </div>
                                        </div>
                                    </div>
                                    <Link 
                                        href="/account"
                                        className="flex items-center justify-center space-x-2 w-full py-3 px-4 font-medium rounded-lg transition-all duration-200 text-center hover:text-red-800 transform hover:scale-105"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        <span>My Account</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="flex items-center justify-center space-x-2 w-full py-3 px-4 font-medium rounded-lg transition-all duration-200 text-center text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transform hover:scale-105"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Link 
                                        href="/login"
                                        className="block w-full py-3 px-4 hover:bg-gray-200 text-gray-700 font-medium text-lg rounded-lg transition-all duration-200 text-center transform hover:scale-105"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        href="/subscribe"
                                        className="block w-full py-3 px-4 bg-red-800 text-white font-semibold rounded-lg transition-all duration-200 text-center transform hover:scale-102"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Subscribe Now
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Footer Info */}
                        <div className="px-4 pt-4 border-t border-gray-200">
                             <h1 className="text-center text-sm text-gray-500 mb-2">Join Us On Social Media</h1>
                        <div className="flex justify-center items-center space-x-4">
                            <Link href="https://x.com/32beatwriters" className="w-8 h-8 hover:scale-90  bg-gradient-to-r from-red-600 to-red-800 rounded-md flex items-center justify-center transition-colors">
                                <Image src={"/x-white-logo.svg"} alt="Twitter" width={20} height={20} className="h-4 w-4" />
                            </Link>
                            <Link href="https://youtube.com/@32beatwriters" className="w-8 h-8  bg-gradient-to-r from-red-600 to-red-800 hover:scale-90 rounded-md flex items-center justify-center transition-colors">
                                <Youtube className="h-5 w-5 text-white" />
                            </Link>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
