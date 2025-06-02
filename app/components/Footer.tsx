"use client"

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";


export default function Footer() {
    const { theme } = useTheme();
    return (
        <footer className="">
            <div className="container mx-auto grid grid-cols-12 py-10 border-t border-gray-200">

                <div className="col-span-3 flex flex-col gap-4 mr-8">
                <div className="flex flex-row gap-2 items-center">
                <Image src={theme === "dark" ? "/32bw_logo_white.png" : "/logo-small.webp"} alt="logo" width={45} height={45} />
                <h1 className="text-[32px] text-foreground">32BeatWriters</h1>
                </div>
                <p className="flex flex-initial text-muted-foreground">32BeatWriters is your source for all the news you need to win your fantasy football league.  We source all our info directly from the beat writers.</p>
                    <div className="flex flex-row gap-6">
                    <a 
                    href="https://x.com/32beatwriters"
                    className="w-6 h-6 opacity-70 hover:scale-108 transition-all"><img src="/twitter.svg" alt="Twitter"/></a>
                    <a 
                    href="https://tiktok.com/@32beatwriters"
                    className="w-6 h-6 opacity-70 hover:scale-108 transition-all"><img src="/tiktok.svg"  alt="Tiktok"/></a>
                    <a 
                    href="https://reddit.com/r/32beatwriters"
                    className="w-6 h-6 opacity-70 hover:scale-108 transition-all"><img src="/reddit.svg" alt="Reddit"/></a>
                    <a 
                    href="https://youtube.com/@32beatwriters"
                    className="w-6 h-6 opacity-70 hover:scale-108 transition-all"><img src="/youtube.svg" alt="Youtube"/></a> 
                    </div>
                </div>

                <div className="col-span-3 flex flex-col gap-3 ml-8">
                    <h1 className="text-2xl font-bold text-foreground">T E A M U S</h1>
                    <Link href="/" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">Home</Link>
                    <Link href="/about" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">About Us</Link>
                    <Link href="/contact-us" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">Contact Us</Link>
                    <Link href="/privacy-policy" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">Privacy Policy</Link>
                    <Link href="/terms-and-conditions" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">Terms & Conditions</Link>
                </div>
                <div className="col-span-3 flex flex-col gap-3 ml-8">
                    <h1 className="text-2xl font-bold text-foreground">Q U I C K L I N K S</h1>
                    <Link href="/faqs" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">FAQ's</Link>
                    <Link href="/about" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">About Us</Link>
                    <Link href="/contact-us" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">Contact Us</Link>
                    <Link href="/privacy-policy" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">Privacy Policy</Link>
                    <Link href="/terms-and-conditions" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">Terms & Conditions</Link>
                </div>
                <div className="col-span-3 flex flex-col gap-3 ml-8">
                    <h1 className="text-2xl font-bold text-foreground">N E W S L E T T E R</h1>
                    <Link href="/" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">Home</Link>
                    <Link href="/about" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">About Us</Link>
                    <Link href="/contact-us" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">Contact Us</Link>
                    <Link href="/privacy-policy" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">Privacy Policy</Link>
                    <Link href="/terms-and-conditions" className="text-muted-foreground hover:text-red-900 hover:scale-101 transition-all">Terms & Conditions</Link>
                </div>

            </div>
            <h1 className="text-center text-muted-foreground pb-4 ">Copyright © 2025 32BeatWriters. All rights reserved.</h1>
        </footer>
    );
}
