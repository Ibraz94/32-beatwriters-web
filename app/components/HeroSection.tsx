import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden container mx-auto">
            {/* Desktop Layout */}
            <div className="hidden lg:block">
                {/* Main Content Container */}
                <div className="px-4 py-12 lg:py-2 relative z-10">
                    <div className="grid lg:grid-cols-2 items-center min-h-[400px]">
                        {/* Left Content Section */}
                        <div className="space-y-8 ">
                            {/* Latest NFL News */}
                            <div className="ml-24 w-36 px-3 py-3 rounded-full border border-white/20 bg-background/90">
                                <h1 className="text-center text-md text-white">Latest NFL News</h1>
                            </div>

                            {/* Main Heading */}
                            <div className="space-y-4 ml-24">
                                <div className="font-black ">
                                    <h1 className="text-4xl sm:text-xl lg:text-7xl leading-tight font-oswald">
                                        League Winning
                                    </h1>
                                    <h2 className="text-xl sm:text-xl lg:text-5xl font-light mt-2 font-oswald">
                                        Intel From Beat Writers
                                    </h2>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="ml-24">
                                <Link href="/subscribe">
                                    <button className="px-5 py-3 bg-red-800 text-white text-lg rounded font-semibold hover:scale-102 hover:cursor-pointer transition-colors duration-300 shadow-lg hover:shadow-xl">
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

                <div
                    className="absolute bottom-0 left-0 w-full h-full"
                >
                    <Image src="/background-image.png" alt="NFL Player" fill className="relative inset-0 object-cover flex items-center justify-center" />

                </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden relative min-h-[500px] sm:min-h-[600px] md:min-h-[650px]">
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full">
                    <Image 
                        src="/background-image.png" 
                        alt="NFL Player" 
                        fill 
                        className="object-cover object-center sm:object-top" 
                        priority
                    />
                </div>

                {/* Mobile Content */}
                <div className="relative z-10 px-6 pt-6 pb-8 flex flex-col justify-center h-full">
                    {/* Latest NFL News Badge */}
                    <div className="flex justify-center mb-6">
                        <div className="px-6 py-3 rounded-full border-2 border-white bg-background/40 backdrop-blur-sm">
                            <h1 className="text-center text-white text-sm font-medium">Latest NFL News</h1>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="text-center mb-6">
                        <h2 className="text-lg text-gray-300">CRAIG BATOR - 27 DEC 2025</h2>
                    </div>

                    {/* Main Heading */}
                    <div className="text-center space-y-4 mb-8">
                        <div className="font-black">
                            <h1 className="text-4xl sm:text-5xl leading-tight text-white">
                                League Winning
                            </h1>
                            <h2 className="text-2xl sm:text-3xl font-light mt-2 text-white">
                                Intel From Beat Writer
                            </h2>
                        </div>
                    </div>

                    {/* Optional: Keep some feature highlights for mobile UX */}
                    <div className="text-center mb-8 px-4">
                        <p className="text-sm text-gray-200 leading-relaxed">
                            Get exclusive insider access to all 32 NFL teams with real-time reports, injury updates, and fantasy insights—straight from the beat writers who know the game best.
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="flex justify-center">
                        <Link href="/subscribe">
                            <button className="px-12 py-4 bg-red-800 text-white rounded-sm text-lg font-semibold hover:scale-102 transition-colors duration-300 shadow-lg">
                                Get Started Today
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}   