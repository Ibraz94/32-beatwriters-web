import Link from "next/link";


export default function Footer() {
    return (
        <footer className="bg-muted px-24 py-1 h-full transition-colors">
            <div className="grid grid-cols-4 py-12">

                <div className="col-span-1 flex flex-col gap-4">
                <h1 className="text-[32px] text-foreground">32BeatWriters</h1>
                <p className="w-1/2 flex flex-initial text-muted-foreground">32BeatWriters is your source for all the news you need to win your fantasy football league.  We source all our info directly from the beat writers.</p>
                    <div className="flex flex-row gap-6">
                    <a 
                    href="https://x.com/32beatwriters"
                    className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"><img src="/twitter.svg" alt="Twitter" /></a>
                    <a 
                    href="https://tiktok.com/@32beatwriters"
                    className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"><img src="/tiktok.svg"  alt="Tiktok" /></a>
                    <a 
                    href="https://reddit.com/r/32beatwriters"
                    className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"><img src="/reddit.svg" alt="Reddit" /></a>
                    <a 
                    href="https://youtube.com/@32beatwriters"
                    className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"><img src="/youtube.svg" alt="Youtube" /></a> 
                    </div>
                </div>

                <div className="col-span-1 flex flex-col gap-3">
                    <h1 className="text-2xl text-foreground">Useful Links</h1>
                    <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                    <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
                    <Link href="/contact-us" className="text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
                    <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                    <Link href="/terms-and-conditions" className="text-muted-foreground hover:text-foreground transition-colors">Terms & Conditions</Link>
                </div>

            </div>
            <h1 className="text-center text-muted-foreground mb-2">Copyright © 2025 32BeatWriters. All rights reserved.</h1>
        </footer>
    );
}
