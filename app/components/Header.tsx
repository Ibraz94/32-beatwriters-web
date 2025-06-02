"use client"
import Link from "next/link";
import Form from "next/form";
import Image from "next/image";
import { Search, ChevronDown, CircleUserRound, ShoppingCart, PackageOpen, ChevronsDown } from "lucide-react";

function Header() {
    return (
        <header className="h-28 flex flex-wrap justify-center items-center px-24 sticky top-0 z-10 borde bg-white opacity-90">
            <div className="flex w-full flex-wrap justify-between items-center">
                <div className="flex items-center gap-24">
                    <Link href="/"
                        className="text-3xl text-black font-extrabold hover:opacity-90 cursor-pointer mx-auto sm:mx-0">
                        <Image src="/logo-small.webp" alt="logo" width={60} height={60} />
                    </Link>
                    <div className="hidden md:flex gap-10">
                        <Link
                            href="/"
                            className="flex gap-1 text-sm md:text-base hover:underline">Home</Link>
                        <Link
                            href="/subscribe"
                            className="flex gap-1 text-sm md:text-base hover:underline">Subscribe</Link>
                        <Link
                            href="/articles"
                            className="flex gap-1 text-sm md:text-base hover:underline">Articles</Link>
                        <Link
                            href="/podcast"
                            className="flex gap-1 text-sm md:text-base hover:underline">Podcast</Link>
                        <Link
                            href="/premium"
                            className="text-sm md:text-base hover:underline">Premium</Link>
                        <Link
                            href="/tools"
                            className="text-sm md:text-base hover:underline">Tools</Link>
                    </div>

                </div>


                <div className="flex items-center gap-6 mt-4 sm:mt-0 flex-1 sm:flex-none ">
                    <Link href="/beat-writers"
                        className="flex items-center space-x-2 text-sm md:text-base hover:underline">
                        Beat Writers
                    </Link>

                    <Form action='/search'
                        className="w-full flex items-center bg-gray-100 rounded-full focus:ring-2 sm:w-auto sm:flex-1 sm:mx-4 mt-2 sm:mt-0">
                        <search className="ml-2" />
                        <input type="text"
                            name="news-search"
                            placeholder="News Search"
                            className="bg-gray-100 text-gray-800 px-2 py-2 rounded-full focus:outline-black focus:ring-black w-[300px] max-w-2xl"
                        />
                    </Form>
                    <Link href="/login"
                        className="flex items-center space-x-2">
                        <CircleUserRound />
                        <span>Login</span>
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default Header;
