"use client"

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

export default function Footer() {
    const { theme } = useTheme();
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

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
        Navigation: [
            { label: "Home", href: "/" },
            { label: "Articles", href: "/articles" },
            { label: "Feed", href: "/nuggets" },


        ],
        Information: [
            { label: "Players", href: "/players" },
            { label: "Podcast", href: "/podcasts" },
            /* { label: "About Us", href: "/about" }, */

        ],
        Socials: [
            { label: "Youtube", target: "_blank", href: "https://www.youtube.com/@32beatwriters" },
            { label: "Apple", target: "_blank", href: "https://podcasts.apple.com/us/podcast/32beatwriters-podcast-network/id1694023292" },
            { label: "Twitter", target: "_blank", href: "https://x.com/32beatwriters" },
            { label: "Spotify", target: "_blank", href: "https://open.spotify.com/show/1b1yaE1OxyTuNDsWNIZr20?si=76f0d6a2fbf1430c" }
        ]
    };

    return (
        <footer className="bg-background ">
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
            <div className="px-4 py-12 bg-[#2C204B]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 container mx-auto">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 text-center md:text-left">
                        <div className="flex items-center gap-2">
                            <Link href="/" className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                                <Image
                                    src={"/32bw_logo_white.png"}
                                    alt="32 Beat Writers"
                                    width={60}
                                    height={60}
                                    className="w-14 h-14"
                                />
                            </Link>
                            <div className="flex flex-col mb-4">
                                <h1 className="text-white text-3xl font-bold">
                                    32BeatWriters
                                </h1>
                                <p className="text-red-800 text-lg mr-6">NFL Insider Network</p>
                            </div>
                        </div>
                        <p className="text-muted-foreground mb-6 leading-relaxed w-96 text-lg">
                        Unrivaled NFL Insights. Follow the Beat.
                        </p>
                    </div>

                    {/* Footer Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="text-left">
                            {/* Mobile: Collapsible Header */}
                            <button
                                onClick={() => toggleSection(category)}
                                className="md:hidden w-full flex items-center justify-between text-xl font-semibold text-foreground mb-4 py-2 border-b border-muted-foreground/20"
                            >
                                <span>{category}</span>
                                {expandedSections.includes(category) ? (
                                    <ChevronUp className="h-5 w-5" />
                                ) : (
                                    <ChevronDown className="h-5 w-5" />
                                )}
                            </button>

                            {/* Desktop: Regular Header */}
                            <h4 className="hidden md:block text-3xl font-semibold text-[#DDDDDD] mb-4">{category}</h4>

                            {/* Links - Always visible on desktop, collapsible on mobile */}
                            <ul className={`space-y-3 transition-all duration-200 ${expandedSections.includes(category) ? 'block' : 'hidden'
                                } md:block`}>
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            {...('target' in link && { target: (link as any).target })}
                                            className="text-muted-foreground hover:text-red-600 transition-colors text-md"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-white/20 bg-[#2C204B]">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                        <div className="text-lg text-muted-foreground">
                            Copyright © 2025 32BeatWriters. All rights reserved.
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center justify-center gap-4 text-lg">
                                <Link href="/privacy-policy" className="hover:text-red-600 transition-colors text-md">Privacy Policy</Link>
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <Link href="/terms-and-conditions" className="hover:text-red-600 transition-colors text-md">Terms & Conditions</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
