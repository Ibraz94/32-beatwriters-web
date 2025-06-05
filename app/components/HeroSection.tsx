import Image from "next/image";



export default function HeroSection() {
    return (
        <div className="px-4 relative" style={{
            backgroundImage: "url('/hero-image.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "top",
            backgroundBlendMode: "multiply",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            }}>
            <div className="flex flex-col justify-center items-center min-h-[600px] sm:min-h-[700px] lg:min-h-[900px] py-12 sm:py-16 lg:py-20">
                <div className="text-center text-white mb-8 sm:mb-10 lg:mb-12 max-w-4xl">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-3 leading-tight">
                        League-Winning Intel
                    </h1>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                        Built for Fantasy Players
                    </h2>
                    <p className="mt-4 text-base sm:text-lg md:text-xl lg:text-2xl text-white leading-relaxed px-2">
                        The industry's most trusted source for complete NFL offseason coverage,<br className="hidden sm:block" /> now with premium insights & tools.
                    </p>
                </div>
                <button className="bg-red-800 text-white px-6 sm:px-6 py-3 sm:py-3 text-base sm:text-lg rounded-md hover:scale-102 hover:cursor-pointer transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
                    Get Insider Access
                </button>
            </div>
        </div>
    );
}   