export default function HeroSection() {
    return (
        <div className="container mx-auto">
            <div className="grid grid-cols-12 h-[900px]">
                <div className="col-span-6 md:col-span-12 flex flex-col justify-center items-center">
                    <div className="text-center mb-10">
                        <h1 className="text-6xl font-bold mb-3">League-Winning Intel</h1>
                        <h2 className="text-6xl font-bold">Built for Fantasy Players</h2>
                        <p className="mt-4 text-2xl text-muted-foreground">The industry's most trusted source for complete NFL offseason coverage,<br/> now with premium insights & tools.</p>
                    </div>
                    <div className="col-span-6 md:col-span-12"></div>
                    <button className="bg-red-800 text-white px-4 py-2 rounded-md hover:scale-105 hover:cursor-pointer transition-all">Get Insider Access</button>
                </div>
            </div>
        </div>
    );
}   