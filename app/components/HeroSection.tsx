import Image from "next/image";

export default function HeroSection() {
    return (
        <section className="relative bg-background">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 "></div>
                
                {/* Geometric shapes for visual interest */}
                <div className="absolute top-20 right-10 w-32 h-32 bg-red-100 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute bottom-20 left-10 w-24 h-24 bg-blue-100 rounded-full opacity-20 blur-2xl"></div>
            </div>

            <div className="container mx-auto px-4 py-12 lg:py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content Section */}
                    <div className="space-y-8 lg:pr-8">
                        {/* Badge */}
                        <div className="inline-flex items-center px-4 py-2 rounded-full text-red-700 text-sm font-medium border-2 ">
                            <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                            Latest NFL News
                        </div>

                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-foreground">
                                <span className="block">League-Winning</span>
                                <span className="block">
                                    <span className="text-red-800">Intel</span> From
                                </span>
                                <span className="block text-foreground">Beat Writers</span>
                            </h1>
                            
                            <p className="text-xl lg:text-2xl text-foreground leading-relaxed max-w-xl">
                                Get insider access to all 32 NFL teams with real-time reports, 
                                injury updates, and fantasy insights directly from the source.
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-red-800 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">32 Dedicated Writers</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-red-800 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Real-Time Updates</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-red-800 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Fantasy Insights</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-red-800 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Insider Access</span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button className="group relative px-8 py-4 bg-red-800 text-white font-bold rounded-xl text-lg hover:scale-102 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                <span className="relative z-10">Get Started Today</span>
                            </button>
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white"></div>
                                    <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                                    <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                                    <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                                </div>
                                <span>Joined by 10,000+ fantasy players</span>
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    {/* <div className="relative lg:order-2"> */}
                        {/* Main player image container */}
                        {/* <div className="relative"> */}
                            {/* Background decoration */}
                            {/* <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-blue-600/10 rounded-3xl rotate-3 scale-105"></div> */}
                            
                            {/* Player image */}
                            {/* <div className="relative bg-w rounded-3xl shadow-2xl overflow-hidden border border-gray-100"> */}
                                {/* <div className="aspect-[4/5] relative"> */}
                                    {/* Placeholder for NFL player image - you'll replace with actual image */}
                                    {/* <Image src="/hero.png" alt="NFL Player" fill className="absolute inset-0 opacity-70 flex items-center justify-center"/> */}
                                {/* </div> */}
                            {/* </div> */}

                            {/* Floating stats cards */}
                            {/* <div className="absolute -top-4 -right-4  rounded-xl shadow-lg p-4 border border-gray-100">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">95%</div>
                                    <div className="text-xs text-gray-600">Accuracy</div>
                                </div>
                            </div> */}

                            {/* <div className="absolute -bottom-4 -left-4 rounded-xl shadow-lg p-4 border border-gray-100">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">24/7</div>
                                    <div className="text-xs text-gray-600">Updates</div>
                                </div>
                            </div> */}
                        {/* </div> */}
                    {/* </div> */}
                </div>

                {/* Bottom stats section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 mt-16 border-t border-gray-200">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">32</div>
                        <div className="text-sm text-muted-foreground mt-1">NFL Teams Covered</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">50K+</div>
                        <div className="text-sm text-muted-foreground mt-1">Daily Updates</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">1M+</div>
                        <div className="text-sm text-muted-foreground mt-1">Fantasy Users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-foreground">99.9%</div>
                        <div className="text-sm text-muted-foreground mt-1">Uptime</div>
                    </div>
                </div>
            </div>
        </section>
    );
}   