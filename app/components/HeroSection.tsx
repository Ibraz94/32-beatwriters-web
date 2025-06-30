import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            {/* Desktop Layout */}
            <div className="hidden lg:block">
                {/* Main Content Container */}
                <div className="px-4 py-12 lg:py-2 relative z-10">
                    <div className="grid lg:grid-cols-2 items-center min-h-[600px]">
                        {/* Left Content Section */}
                        <div className="space-y-8 lg:pr-8">


                            {/* Latest NFL News */}
                            <div className="ml-12 w-48 px-4 py-4 rounded-full border-2 border-white bg-background/40">
                                <h1 className="text-center text-white">Latest NFL News</h1>
                            </div>
                            {/* Date */}
                            <div className="ml-12">
                                <h1 className="text-2xl text-gray-300">CRAIG BATOR - 27 DEC 2025</h1>
                            </div>

                            {/* Main Heading */}
                            <div className="space-y-4 ml-12">
                                <div className="font-black ">
                                    <h1 className="text-4xl sm:text-5xl lg:text-8xl leading-tight">
                                        League Winning
                                    </h1>
                                    <h2 className="text-xl sm:text-3xl lg:text-6xl font-light mt-2">
                                        Intel From Beat Writer
                                    </h2>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="ml-12">
                                <Link href="/subscribe">
                                    <button className="px-12 py-4 bg-red-800 text-white rounded-sm text-lg font-semibold hover:scale-102 hover:cursor-pointer transition-colors duration-300 shadow-lg hover:shadow-xl">
                                        Get Started Today
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Image Section - Hidden on mobile, visible on lg+ */}
                        <div className="hidden lg:block relative">
                            {/* This div is just for spacing */}
                        </div>
                    </div>
                </div>

                {/* Diagonal Red Section with Clip Path */}
                <div
                    className="absolute bottom-0 left-0 w-full h-full"
                >
                    <Image src="/background-image.png" alt="NFL Player" fill className="relative inset-0 object-cover flex items-center justify-center" />

                </div>
                {/* NFL Player Image */}
                {/* <div className="absolute inset-0  flex items-center justify-center">
                    <div className="relative w-full h-full -right-96 max-w-4xl">
                        <Image
                            src="/hero-main.png"
                            alt="NFL Player"
                            fill
                            className="object-contain object-center"
                            priority
                        />
                    </div>
                </div> */}
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden relative min-h-screen">
                {/* Mobile Content */}
                <div className="relative z-10 px-6 pt-8 pb-2">
                    {/* Main Heading */}
                    <div className="text-center space-y-3 mb-4">
                        <div className="font-black">
                            <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                                League <span className="text-red-700">Winning</span>
                            </h1>
                            <h2 className="text-3xl sm:text-3xl font-light mt-2">
                                Intel From <span className="text-red-700">Beat</span> Writer
                            </h2>
                        </div>

                        <p className="text-xs leading-relaxed px-4">
                            Get exclusive insider access to all 32 NFL teams with real-time reports, injury updates, and fantasy insights—straight from the beat writers who know the game best. Stay ahead of the competition with authentic intel from the source.
                        </p>
                    </div>

                    {/* Features List - 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6 px-4">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium">Player Feed</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium ">Offseason Reports</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium ">Insider Access</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-red-700 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium">Premium Articles & Insight</span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div>
                        <Link href="/subscribe">
                            <button className="w-full px-8 py-2 bg-red-800 text-white rounded-lg font-semibold hover:scale-102 transition-colors duration-300 shadow-lg">
                                Get Started Today
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Mobile Diagonal Red Section with Clip Path */}
                <div
                    className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-br from-red-700 to-red-900"
                    style={{
                        clipPath: 'polygon(0% 30%, 100% 70%, 100% 100%, 0% 100%)'
                    }}
                >
                    <Image src="/back-image.png" alt="NFL Player" fill className="absolute inset-0 opacity-20 object-cover flex items-center justify-center" />

                </div>
                {/* NFL Player Image */}
                <div className="absolute inset-0 flex items-end justify-center pb-8">
                    <div className="relative w-full h-full max-w-md top-4">
                        <Image
                            src="/hero-main.png"
                            alt="NFL Player"
                            fill
                            className="object-contain object-bottom"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}   