"use client"
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Youtube, ChevronDown, User, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";
import { useState, useRef, useEffect } from "react";
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import SearchBar from "@/components/ui/search";
import { Button } from "@/components/ui/button";

function Header() {
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

    // Prevent hydration mismatch by only applying theme after mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
            if (feedDropdownRef.current && !feedDropdownRef.current.contains(event.target as Node)) {
                setIsFeedDropdownOpen(false);
            }
            if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
                setIsToolsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // iOS scroll fix for mobile navigation
    const handleMobileNavigation = () => {
        setIsMobileMenuOpen(false);

        // Fix for iOS Safari scroll issues
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        }
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
            router.push('/'); // Redirect to login after logout
            // Close dropdown after logout
            setIsUserDropdownOpen(false);
        } catch (error) {
            console.error('Logout error:', error);
            // Close dropdown even if logout fails
            setIsUserDropdownOpen(false);
        }
    };

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
    ];

    const toolOptions = [
        { href: "/rankings", label: "Rankings" },
    ];

    // const toolNavLink = [
    //     { href: "/tools", label: "TOOLS" },
    // ];

    return (
        <header className="header-main z-50 w-full border-gray-100 shadow-sm transition-colors duration-300 container mx-auto">
            <div>
                <div className="md:flex h-[50px] lg:h-[50px] justify-center items-center px-2 lg:px-0 bg-[#1D212D]">
                    {/* Logo and Social Links */}

                    <div className="flex items-center justify-center pt-2 md:pt-0">
                        {/* Header Image Section - Hidden on mobile */}
                        <div className=" lg:flex h-[30px] items-center">
                            <div className="flex justify-center items-center">
                                <div className="flex justify-center md:flex space-x-6 gap-2 md:gap-12">
                                    <Link
                                        href="https://youtube.com/@32beatwriters"
                                        target="_blank"
                                        className="flex items-center gap-2 hover:scale-98 transition-transform"
                                    >
                                        <Image
                                            src={"/youtube-white-logo.svg"}
                                            alt="Youtube"
                                            width={20}
                                            height={20}
                                            className="w-7 h-7 md:w-5 md:h-5"
                                        />
                                        <span className="text-white text-xs hidden md:inline lg:inline">YouTube</span>
                                    </Link>

                                    <Link
                                        href="https://x.com/32beatwriters"
                                        target="_blank"
                                        className="flex items-center gap-2 hover:scale-98 transition-transform"
                                    >
                                        <Image
                                            src={"/X-white-logo2.svg"}
                                            alt="Twitter (X)"
                                            width={20}
                                            height={20}
                                            className="w-7 h-7 md:w-5 md:h-5"
                                        />
                                        <span className="text-white text-xs hidden md:inline lg:inline">Twitter</span>
                                    </Link>

                                    <Link
                                        href="https://podcasts.apple.com/us/podcast/32beatwriters-podcast-network/id1694023292"
                                        target="_blank"
                                        className="flex items-center gap-2 hover:scale-98 transition-transform"
                                    >
                                        <Image
                                            src={"/apple-white-logo.svg"}
                                            alt="Apple Podcasts"
                                            width={100}
                                            height={100}
                                            className="w-7 h-7 md:w-5 md:h-5"
                                        />
                                        <span className="text-white text-xs hidden md:inline lg:inline">Apple</span>
                                    </Link>

                                    <Link
                                        href="https://open.spotify.com/show/1b1yaE1OxyTuNDsWNIZr20?si=76f0d6a2fbf1430c"
                                        target="_blank"
                                        className="flex items-center gap-2 hover:scale-98 transition-transform"
                                    >
                                        <Image
                                            src={"/spotify-white-logo.svg"}
                                            alt="Spotify"
                                            width={30}
                                            height={30}
                                            className="w-7 h-7 md:w-5 md:h-5"
                                        />
                                        <span className="text-white text-xs hidden md:inline lg:inline">Spotify</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Button */}
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


                <div className="hidden md:flex items-center justify-between px-2 lg:px-5 mb-1 mt-2">
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
                        <Link href="/">
                            <Image src={"/32bw_logo_black.svg"} alt="Spotify" width={60} height={60} />
                        </Link>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="relative hover:text-red-800 transition-colors duration-200 py-2 group text-md font-oswald text-black"
                            >
                                {link.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-300 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}

                        {/* Feed Dropdown */}
                        <div className="relative left-2" ref={feedDropdownRef}>
                            <button
                                onClick={() => setIsFeedDropdownOpen(!isFeedDropdownOpen)}
                                className="relative transition-colors duration-200 py-2 group text-md text-black flex items-center space-x-1"
                            >
                                <span className="text-black">FEEDS</span>
                                <ChevronDown className={`h-4 w-4 text-black transition-transform duration-200 ${isFeedDropdownOpen ? 'rotate-180' : ''}`} />
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
                                                className="flex items-center px-4 py-2 text-md transition-colors hover:text-red-800 text-black"
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
                                className="relative hover:text-red-800 transition-colors duration-200 py-2 group text-md font-oswald text-black flex items-center space-x-1"
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
                                                className="flex items-center px-4 py-2 text-md transition-colors hover:text-red-800 text-black"
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
                                <Button
                                    variant="secondary"
                                    className="rounded-4xl px-6"
                                >
                                    <Link
                                        href="/login"
                                        // className="desktop-login-link hover:scale-102 transition-colors text-md"
                                    >
                                        LOGIN
                                    </Link>
                                </Button>
                                <Button variant="orange"
                                    className="rounded-4xl px-8">
                                    <Link
                                        href="/subscribe"
                                    >
                                        SUBSCRIBE
                                    </Link>
                                </Button>
                                <ThemeToggle />
                            </div>
                        )}
                    </div>
                </div>

                <div className="hero-bg h-screen max-w-7xl mx-auto" />

                <div>
                    <SearchBar
                        placeholder="Search players..."
                        size="md"
                        width="w-1/2"
                        buttonLabel="Search here"
                        onButtonClick={() => alert("Button clicked!")}
                        onSearchChange={(val) => console.log(val)}
                        className="flex justify-center items-center"
                    />
                </div>


                {/* Mobile Menu */}
                <div className={`mobile-menu-container lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen
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
                                    className="mobile-menu-nav-link block px-4 py-3 rounded-lg font-medium transition-all duration-200 text-center transform hover:scale-105"
                                    onClick={handleMobileNavigation}
                                    style={{
                                        animationDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms'
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile Feed Dropdown */}
                            <div className="space-y-1">
                                <button
                                    onClick={() => setIsFeedDropdownOpen(!isFeedDropdownOpen)}
                                    className="mobile-menu-nav-link w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 text-center transform hover:scale-105 flex items-center justify-center space-x-2"
                                    style={{
                                        animationDelay: isMobileMenuOpen ? `${(navLinks.length) * 50}ms` : '0ms'
                                    }}
                                >
                                    <span>FEEDS</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isFeedDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Mobile Feed Dropdown Options */}
                                <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isFeedDropdownOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {feedOptions.map((option, index) => (
                                        <Link
                                            key={option.href}
                                            href={option.href}
                                            className="mobile-menu-nav-link block px-8 py-2 rounded-lg font-medium transition-all duration-200 text-center transform hover:scale-105 text-sm"
                                            onClick={handleMobileNavigation}
                                            style={{
                                                animationDelay: isMobileMenuOpen && isFeedDropdownOpen ? `${(navLinks.length + index + 1) * 50}ms` : '0ms'
                                            }}
                                        >
                                            {option.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Tools Dropdown */}
                            <div className="space-y-1">
                                <button
                                    onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                                    className="mobile-menu-nav-link w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 text-center transform hover:scale-105 flex items-center justify-center space-x-2"
                                    style={{
                                        animationDelay: isMobileMenuOpen ? `${(navLinks.length + 1) * 50}ms` : '0ms'
                                    }}
                                >
                                    <span>TOOLS</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isToolsDropdownOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {toolOptions.map((option, index) => (
                                        <Link
                                            key={option.href}
                                            href={option.href}
                                            className="mobile-menu-nav-link block px-8 py-2 rounded-lg font-medium transition-all duration-200 text-center transform hover:scale-105 text-sm"
                                            onClick={handleMobileNavigation}
                                            style={{
                                                animationDelay: isMobileMenuOpen && isToolsDropdownOpen ? `${(navLinks.length + index + 2) * 50}ms` : '0ms'
                                            }}
                                        >
                                            {option.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            {/* {toolNavLink.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="mobile-menu-nav-link block px-4 py-3 rounded-lg font-medium transition-all duration-200 text-center transform hover:scale-105"
                                >
                                    {link.label}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-300 transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            ))} */}
                        </div>

                        {/* Theme Toggle - Mobile */}
                        <div className="px-4 flex justify-center">
                            <ThemeToggle />
                        </div>

                        {/* User Actions */}
                        <div className="px-4 space-y-3">
                            {isAuthenticated ? (
                                <div className="space-y-3">
                                    <div className="mobile-menu-user-info flex items-center justify-center space-x-3 p-3 rounded-lg">
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
                                            <div className="text-sm opacity-75">
                                                {user?.memberships?.type || 'Subscriber'}
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href="/account"
                                        className="mobile-menu-account-link flex items-center justify-center space-x-2 w-full py-3 px-4 font-medium rounded-lg transition-all duration-200 text-center transform hover:scale-105"
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
                                        className="mobile-menu-logout-button flex items-center justify-center space-x-2 w-full py-3 px-4 font-medium rounded-lg transition-all duration-200 text-center transform hover:scale-105"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Link
                                        href="/login"
                                        className="mobile-menu-link block w-full py-3 px-4 font-medium rounded-lg transition-all duration-200 text-center transform hover:scale-105"
                                        onClick={handleMobileNavigation}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/subscribe"
                                        className="block w-full py-3 px-4 bg-red-800 text-white font-semibold rounded-lg transition-all duration-200 text-center transform hover:scale-102 hover:bg-red-900"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Subscribe Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
}

export default Header;
