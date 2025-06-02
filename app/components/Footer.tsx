import Link from "next/link";


export default function Footer() {
    return (
        <footer className="bg-gray-100 px-24 py-1 h-full">
            <div className="grid grid-cols-4 py-12">

                <div className="col-span-1 flex flex-col gap-4">
                <h1 className="text-[32px]">32BeatWriters</h1>
                <p className=" w-1/2 flex flex-initial">32BeatWriters is your source for all the news you need to win your fantasy football league.  We source all our info directly from the beat writers.</p>
                    <div className="flex flex-row gap-6">
                    <a 
                    href="https://x.com/32beatwriters"
                    className="w-5 h-5"><img src="/twitter.svg" alt="Twitter" /></a>
                    <a 
                    href="https://tiktok.com/@32beatwriters"
                    className="w-5 h-5"><img src="/tiktok.svg"  alt="Tiktok" /></a>
                    <a 
                    href="https://reddit.com/r/32beatwriters"
                    className="w-5 h-5"><img src="/reddit.svg" alt="Reddit" /></a>
                    <a 
                    href="https://youtube.com/@32beatwriters"
                    className="w-5 h-5"><img src="/youtube.svg" alt="Youtube" /></a> 
                    </div>
                </div>

                <div className="col-span-1 flex flex-col gap-3">
                    <h1 className="text-2xl">Useful Links</h1>
                    <Link href="/" className="">Home</Link>
                    <Link href="/about" className="">About Us</Link>
                    <Link href="/contact-us" className="">Contact Us</Link>
                    <Link href="/privacy-policy" className="">Privacy Policy</Link>
                    <Link href="/terms-and-conditions" className="">Terms & Conditions</Link>
                </div>

            </div>
            <h1 className="text-center">Copyright © 2025 32BeatWriters. All rights reserved.</h1>
        </footer>
    );
}
