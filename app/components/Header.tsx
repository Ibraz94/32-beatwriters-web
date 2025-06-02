"use client"
import Link from "next/link";
import Form from "next/form";
import Image from "next/image";
import { CircleUserRound } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "next-themes";

function Header() {

    const { theme } = useTheme();

    return (
        <header className="container mx-auto h-20 flex flex-wrap justify-center items-center sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border transition-colors">
            <div className="flex w-full flex-wrap justify-between items-center">
                <div className="flex items-center gap-24">
                    <Link href="/"
                        className="hover:opacity-90 cursor-pointer mx-auto sm:mx-0 flex items-center gap-2">
                        <Image src={theme === "dark" ? "/32bw_logo_white.png" : "/logo-small.webp"} alt="logo" width={35} height={35} />
                        <h1 className="text-xl font-extralight">32 Beat Writers</h1>
                    </Link>
                    <div className="hidden md:flex gap-10">
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
                            href="/premium"
                            className="text-sm md:text-base text-foreground hover:text-red-900 hover:scale-105 transition-colors">Premium</Link>
                        <Link
                            href="/tools"
                            className="text-sm md:text-base text-foreground hover:text-red-900 hover:scale-105 transition-colors">Tools</Link>
                    </div>

                </div>


                <div className="flex items-center gap-6 mt-4 sm:mt-0 flex-1 sm:flex-none ">
                    <Link href="/beat-writers"
                        className="flex items-center space-x-2 text-sm md:text-base text-foreground hover:text-red-900 hover:scale-105 transition-colors">
                        Beat Writers
                    </Link>

                    <Form action='/search'
                        className="w-full flex items-center bg-muted rounded-full focus:ring-0 sm:w-auto sm:flex-1 sm:mx-4 mt-2 sm:mt-0">
                        <search className="ml-2" />
                        <input type="text"
                            name="news-search"
                            placeholder="News Search"
                            className="text-foreground placeholder:text-muted-foreground px-2 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-ring w-[300px] max-w-2xl transition-colors"
                        />
                    </Form>
                    
                    <ThemeToggle />
                    
                    <Link href="/login"
                        className="flex items-center space-x-2 text-foreground hover:text-red-900 hover:scale-105 transition-colors">
                        <CircleUserRound />
                        <span>Login</span>
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default Header;
