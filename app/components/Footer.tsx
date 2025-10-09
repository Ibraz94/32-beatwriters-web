"use client"

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

export default function Footer() {
    const { theme } = useTheme();
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only applying theme after mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle newsletter signup
        setIsSubscribed(true);
        setEmail("");
        setTimeout(() => setIsSubscribed(false), 3000);
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section)
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };
    const footerLinks = {
        "Main Links": [
            { label: "Home", href: "/" },
            { label: "Articles", href: "/articles" },
            { label: "Feed", href: "/nuggets" },
            { label: "Contact Us", href: "/contact-us" },
        ],
        Resources: [
            { label: "Players", href: "/players" },
            { label: "Podcast", href: "/podcasts" },
            /* { label: "About Us", href: "/about" }, */
        ],
        "Contact Info": [
        ],
    };

    const currentLogoSrc = mounted && theme === "dark" ? "/32bw_logo_white.png" : "/32bw_logo_black.svg";

    const mailIcon =
        theme === "dark" ? "/footer-mail-dark.svg" : "/footer-mail.svg";
    const callIcon =
        theme === "dark" ? "/footer-call-dark.svg" : "/footer-call.svg";

    if (!mounted) return null;


    return (
        <footer className="bg-[var(--gray-background-color)] dark:bg-[#1A1A1A] w-full overflow-x-hidden">
            {/* Newsletter Section */}
            {/* <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">
                            Stay Ahead of the Game
                        </h3>
                        <p className="text-muted-foreground mb-8 text-lg">
                            Get breaking news, insider reports, and fantasy insights delivered straight to your inbox.
                        </p> */}

            {/* <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <div className="flex-1">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full bg-card px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-red-800 text-white font-semibold rounded-lg hover:scale-102 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubscribed ? "Subscribed!" : "Subscribe"}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </form> */}

            {/* <p className="text-sm text-muted-foreground mt-4">
                            Join 10,000+ fantasy players getting weekly insights. Unsubscribe anytime.
                        </p>
                    </div>
                </div>
            </div> */}

            {/* Main Footer Content */}
            <div className="px-4 py-12 bg-[var(--gray-background-color)] dark:bg-[#1A1A1A] shadow-lg rounded-3xl mx-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1 container mx-auto pb-8 pl-4 md:pl-14 text-left">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 text-left">
                        <div className="flex items-center gap-2">
                            <Link href="/" className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                                <Image
                                    src={currentLogoSrc}
                                    alt="32 Beat Writers"
                                    width={60}
                                    height={60}
                                    className="w-14 h-14"
                                />
                            </Link>
                        </div>
                        <p className="text-[var(--color-gray)] mb-6 leading-relaxed w-96 text-md dark:text-[#C7C8CB]">
                            Unrivaled NFL Insights. Follow the Beat.
                        </p>

                        {/* Social Icons Row */}
                        <div className="flex justify-center md:justify-start gap-1 mt-4">
                            <Link
                                href="https://instagram.com"
                                target="_blank"
                                className="bg-[var(--color-orange)] rounded-full p-2 flex items-center justify-center hover:opacity-90 transition w-10 h-10"
                            >
                                <Image
                                    src="/footer-instagram.svg"
                                    alt="Instagram"
                                    width={22}
                                    height={22}
                                    className="invert brightness-0"
                                />
                            </Link>

                            <Link
                                href="https://facebook.com"
                                target="_blank"
                                className="bg-[var(--color-orange)] rounded-full p-2 flex items-center justify-center hover:opacity-90 transition w-10 h-10"
                            >
                                <Image
                                    src="/footer-facebook.svg"
                                    alt="Facebook"
                                    width={22}
                                    height={22}
                                    className="invert brightness-0"
                                />
                            </Link>

                            <Link
                                href="https://youtube.com"
                                target="_blank"
                                className="bg-[var(--color-orange)] rounded-full p-2 flex items-center justify-center hover:opacity-90 transition w-10 h-10"
                            >
                                <Image
                                    src="/footer-linkedin.svg"
                                    alt="LinkedIn"
                                    width={22}
                                    height={22}
                                    className="invert brightness-0"
                                />
                            </Link>

                            <Link
                                href="https://twitter.com"
                                target="_blank"
                                className="bg-[var(--color-orange)] rounded-full p-2 flex items-center justify-center hover:opacity-90 transition w-10 h-10"
                            >
                                <Image
                                    src="/footer-twitter.svg"
                                    alt="Twitter"
                                    width={22}
                                    height={22}
                                    className="invert brightness-0"
                                />
                            </Link>
                        </div>
                    </div>

                    {/* Footer Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="text-left">
                            {/* Mobile: Collapsible Header */}
                            <button
                                onClick={() => toggleSection(category)}
                                className="md:hidden w-full flex items-center justify-between text-xl font-semibold text-foreground mb-4 py-2 border-b border-muted-foreground/20"
                            >
                                <span className="text-[#1D212D] dark:text-[#C7C8CB]">{category}</span>
                                {expandedSections.includes(category) ? (
                                    <ChevronUp className="h-5 w-5 text-[#1D212D] dark:text-[#C7C8CB]" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-[#1D212D] dark:text-[#C7C8CB]" />
                                )}
                            </button>

                            {/* Desktop Header */}
                            <h4 className="hidden md:block text-2xl text-[#1D212D] mb-4 dark:text-[#C7C8CB]">
                                {category}
                            </h4>

                            {/* Links */}
                            <ul
                                className={`space-y-3 transition-all duration-200 ${expandedSections.includes(category) ? "block" : "hidden"
                                    } md:block`}
                            >
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            {...("target" in link && { target: (link as any).target })}
                                            className="text-[var(--color-gray hover:text-orange-600 transition-colors text-md dark:text-[#C7C8CB]"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            {/* Extra contact info below "Contact Info" */}
                            {category === "Contact Info" && (
                                <div
                                    className={`mt-5 space-y-3 transition-all duration-200 ${expandedSections.includes(category) ? "block" : "hidden"
                                        } md:block`}
                                >
                                    {/* Email Row */}
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={mailIcon}
                                            alt="Email Icon"
                                            width={40}
                                            height={40}
                                            className="shrink-0 rounded-full p-2 bg-[#1D212D] dark:bg-white"
                                        />
                                        <a
                                            href="mailto:info@32beats.it"
                                            className="text-[var(--color-gray)] text-md hover:text-orange-600 transition dark:text-[#C7C8CB]"
                                        >
                                            Info@32beats.it
                                        </a>
                                    </div>

                                    {/* Phone Row */}
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={callIcon}
                                            alt="Phone Icon"
                                            width={40}
                                            height={40}
                                            className="shrink-0 rounded-full p-2 bg-[#1D212D] dark:bg-white"
                                        />
                                        <a
                                            href="tel:+1234567890"
                                            className="text-[var(--color-gray)] text-md hover:text-orange-600 transition dark:text-[#C7C8CB]"
                                        >
                                            06 2180 2375
                                        </a>
                                    </div>
                                </div>
                            )}

                        </div>
                    ))}

                </div>
                {/* Bottom Section */}
                <div className="">
                    <div className="container mx-auto px-4 py-6 border-t-1 border-[#CFD1D4]">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                            <div className="text-lg text-[var(--color-gray)] dark:text-[#C7C8CB] text-nowrap">
                                <span className="hidden md:inline-block lg:inline-block">Copyright </span> © 2025 32BeatWriters. All rights reserved.
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center justify-center gap-4 text-lg">
                                    <Link href="/privacy-policy" className="hover:text-red-600 transition-colors text-md text-[var(--color-gray)] dark:text-[#C7C8CB]">Privacy Policy</Link>
                                    <Link href="/terms-and-conditions" className="hover:text-red-600 transition-colors text-md text-[var(--color-gray)] dark:text-[#C7C8CB]">Terms & Conditions</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
