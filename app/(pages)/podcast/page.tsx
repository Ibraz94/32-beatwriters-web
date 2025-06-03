



export default function Podcast() {
    return (
        <div className="container mx-auto max-w-4xl flex flex-col items-start justify-center mt-6 mb-28">
            <h1 className="text-4xl font-extrabold">Have you listened to our <span className="text-red-800">podcast</span>?</h1>
            <p className="text-lg mt-4">Have you listened to our podcast?
            Our podcast host, Zach Hiduk, gathers beat writers, analysts and others to join him each week to give you the inside look of what to expect from NFL teams and their players. This pod dives deeper than any article and gives you first hand information directly from the people who are with the team daily.</p>
            <h1 className="text-xl font-extrabold mt-4">Listen to insight from Courtney Cronin, John Shipley, Jourdan Rodrigue and etc.</h1>

            <div className="w-full mt-6">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>

                    <iframe 
                        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                        src="https://www.youtube.com/embed/YAWg2Hb0TjM"
                        title="32BeatWriters Introduction"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>

        </div>
    )
}