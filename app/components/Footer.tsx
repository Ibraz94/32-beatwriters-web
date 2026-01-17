"use client"

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";


export default function Footer() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only applying theme after mounting
    useEffect(() => {
        setMounted(true);
    }, []);


    const contactInfo = {
        email: "info@32beatwriters.com",
        phone: "818 308 5020",
        phoneHref: "tel:+18183085020"
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
            <div className="px-6 md:px-12 py-12 bg-[var(--gray-background-color)] dark:bg-[#1A1A1A] shadow-lg rounded-3xl mx-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 pb-8">
                        {/* Brand Section */}
                        <div className="text-center md:text-left">
                            <Link href="/" className="inline-flex items-center justify-center md:justify-start mb-4">
                                <Image
                                    src={currentLogoSrc}
                                    alt="32 Beat Writers"
                                    width={60}
                                    height={60}
                                    className="w-14 h-14"
                                    loader={({ src }) => src}
                                />
                            </Link>
                            <p className="text-[var(--color-gray)] mb-6 leading-relaxed text-md dark:text-[#C7C8CB] max-w-md mx-auto md:mx-0">
                                Unrivaled NFL Insights. Follow the Beat.
                            </p>

                            {/* Social Icons Row */}
                            <div className="flex justify-center md:justify-start gap-2 mt-4">
                                <Link
                                    href="https://youtube.com/@32beatwriters"
                                    target="_blank"
                                    className="bg-[var(--color-orange)] rounded-full p-2 flex items-center justify-center hover:opacity-90 transition w-10 h-10"
                                >
                                    <Image
                                        src="/youtube-white-logo.svg"
                                        alt="youtube"
                                        width={22}
                                        height={22}
                                        className="invert brightness-0"
                                        loader={({ src }) => src}
                                    />
                                </Link>

                                <Link
                                    href="https://x.com/32beatwriters"
                                    target="_blank"
                                    className="bg-[var(--color-orange)] rounded-full p-2 flex items-center justify-center hover:opacity-90 transition w-10 h-10"
                                >
                                    <Image
                                        src="/X-white-logo2.svg"
                                        alt="Twitter (X)"
                                        width={22}
                                        height={22}
                                        className="invert brightness-0"
                                        loader={({ src }) => src}
                                    />
                                </Link>

                                <Link
                                    href="https://podcasts.apple.com/us/podcast/32beatwriters-podcast-network/id1694023292"
                                    target="_blank"
                                    className="bg-[var(--color-orange)] rounded-full p-2 flex items-center justify-center hover:opacity-90 transition w-10 h-10"
                                >
                                    <Image
                                        src="/apple-white-logo.svg"
                                        alt="Apple Podcasts"
                                        width={24}
                                        height={24}
                                        className="invert brightness-0"
                                        loader={({ src }) => src}
                                    />
                                </Link>

                                <Link
                                    href="https://open.spotify.com/show/1b1yaE1OxyTuNDsWNIZr20?si=76f0d6a2fbf1430c"
                                    target="_blank"
                                    className="bg-[var(--color-orange)] rounded-full p-2 flex items-center justify-center hover:opacity-90 transition w-10 h-10"
                                >
                                    <Image
                                        src="/spotify-white-logo.svg"
                                        alt="Spotify"
                                        width={22}
                                        height={22}
                                        className="invert brightness-0"
                                        loader={({ src }) => src}
                                    />
                                </Link>
                            </div>
                        </div>

                        {/* Contact Info Section */}
                        <div className="text-center md:text-left md:pl-8">
                            <h4 className="text-2xl font-semibold text-[#1D212D] mb-6 dark:text-[#C7C8CB]">
                                Contact Info
                            </h4>
                            <div className="space-y-4 flex flex-col items-start ml-12 lg:ml-0">
                                {/* Email Row */}
                                <div className="flex items-center gap-3 justify-center md:justify-start">
                                    <Image
                                        src={mailIcon}
                                        alt="Email Icon"
                                        width={40}
                                        height={40}
                                        className="shrink-0 rounded-full p-2 bg-[#1D212D] dark:bg-white"
                                        loader={({ src }) => src}
                                    />
                                    <a
                                        href={`mailto:${contactInfo.email}`}
                                        className="text-[var(--color-gray)] text-md hover:text-orange-600 transition dark:text-[#C7C8CB] break-all"
                                    >
                                        {contactInfo.email}
                                    </a>
                                </div>

                                {/* Phone Row */}
                                <div className="flex items-center gap-3 justify-center md:justify-start">
                                    <Image
                                        src={callIcon}
                                        alt="Phone Icon"
                                        width={40}
                                        height={40}
                                        className="shrink-0 rounded-full p-2 bg-[#1D212D] dark:bg-white"
                                        loader={({ src }) => src}
                                    />
                                    <a
                                        href={contactInfo.phoneHref}
                                        className="text-[var(--color-gray)] text-md hover:text-orange-600 transition dark:text-[#C7C8CB]"
                                    >
                                        {contactInfo.phone}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Bottom Section */}
                <div className="max-w-7xl mx-auto">
                    <div className="px-4 py-6 border-t border-[#CFD1D4]">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                            <div className="text-sm md:text-base text-[var(--color-gray)] dark:text-[#C7C8CB]">
                                <span className="hidden md:inline-block">Copyright </span>© 2026 32BeatWriters. All rights reserved.
                            </div>

                            <div className="flex items-center gap-6">
                                <Link href="/privacy-policy" className="hover:text-orange-600 transition-colors text-sm md:text-base text-[var(--color-gray)] dark:text-[#C7C8CB]">
                                    Privacy Policy
                                </Link>
                                <Link href="/terms-and-conditions" className="hover:text-orange-600 transition-colors text-sm md:text-base text-[var(--color-gray)] dark:text-[#C7C8CB]">
                                    Terms & Conditions
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
