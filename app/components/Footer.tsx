"use client"

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Mail, Twitter, Instagram, Youtube, ArrowRight, MapPin, Phone } from "lucide-react";

export default function Footer() {
    const { theme } = useTheme();
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle newsletter signup
        setIsSubscribed(true);
        setEmail("");
        setTimeout(() => setIsSubscribed(false), 3000);
    };

    const footerLinks = {
        Company: [
            { label: "About Us", href: "/about" },
            { label: "Our Writers", href: "/beat-writers" },
            { label: "Careers", href: "/" },
            { label: "Contact", href: "/contact-us" }
        ],
        Content: [
            { label: "Articles", href: "/articles" },
            { label: "Podcasts", href: "/podcasts" },
            { label: "Live Feed", href: "/nuggets" },
            { label: "Player Analysis", href: "/players" }
        ],
        Support: [
            { label: "Help Center", href: "/" },
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms of Service", href: "/terms-and-conditions" },
            { label: "Cookie Policy", href: "/" }
        ]
    };

    const socialLinks = [
        { icon: Twitter, href: "https://twitter.com/32beatwriters", label: "Twitter" },
        { icon: Instagram, href: "https://instagram.com/32beatwriters", label: "Instagram" },
        { icon: Youtube, href: "https://youtube.com/32beatwriters", label: "YouTube" }
    ];

    return (
        <footer className="bg-background border-t">
            {/* Newsletter Section */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">
                            Stay Ahead of the Game
                        </h3>
                        <p className="text-muted-foreground mb-8 text-lg">
                            Get breaking news, insider reports, and fantasy insights delivered straight to your inbox.
                        </p>
                        
                        <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
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
                        </form>

                        <p className="text-sm text-muted-foreground mt-4">
                            Join 10,000+ fantasy players getting weekly insights. Unsubscribe anytime.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 text-center md:text-left">
                        <Link href="/" className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                            <Image 
                                src={theme === "dark" ? "/32bw_logo_white.png" : "/logo-small.webp"} 
                                alt="32 Beat Writers" 
                                width={40} 
                                height={40}
                                className="w-10 h-10"
                            />
                            <span className="font-bold text-2xl bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                                32 Beat Writers
                            </span>
                        </Link>
                        
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            The most comprehensive NFL coverage network, bringing you insider access 
                            to all 32 teams through our dedicated beat writers.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="font-bold text-lg text-red-600">32</div>
                                <div className="text-xs text-muted-foreground">Writers</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="font-bold text-lg text-red-600">24/7</div>
                                <div className="text-xs text-muted-foreground">Coverage</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="font-bold text-lg text-red-600">10K+</div>
                                <div className="text-xs text-muted-foreground">Subscribers</div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex justify-center md:justify-start space-x-4">
                            {socialLinks.map((social) => (
                                <Link
                                    key={social.label}
                                    href={social.href}
                                    className="w-10 h-10 bg-muted hover:bg-red-800 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-5 w-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Footer Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="text-center md:text-left">
                            <h4 className=" text-2xl font-semibold text-foreground mb-4">{category}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-muted-foreground hover:text-red-600 transition-colors text-lg"
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
            <div className="border-t bg-muted/10">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                        <div className="text-sm text-muted-foreground">
                            © 2025 32 Beat Writers. All rights reserved.
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center justify-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>All systems operational</span>
                            </div>
                            <Link href="" className="hover:text-red-600 transition-colors">
                                Status
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
