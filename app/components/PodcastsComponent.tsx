import Link from "next/link";
import Image from "next/image";

// Mock data for podcasts - in a real app, this would come from an API or database
const latestPodcasts = [
    {
        id: 1,
        title: "Week 17 NFL Predictions with Courtney Cronin",
        description: "ESPN reporter Courtney Cronin joins us to break down week 17 matchups and playoff implications for NFC teams.",
        publishDate: "December 28, 2024",
        duration: "45:32",
        thumbnail: "/podcast-thumb-1.jpg",
        youtubeId: "YAWg2Hb0TjM"
    },
    {
        id: 2,
        title: "Fantasy Football Championship Week Strategy",
        description: "Our beat writers discuss must-start players and sleeper picks for your fantasy championship games.",
        publishDate: "December 26, 2024",
        duration: "38:15",
        thumbnail: "/podcast-thumb-2.jpg",
        youtubeId: "YAWg2Hb0TjM"
    },
    {
        id: 3,
        title: "Trade Deadline Recap with John Shipley",
        description: "John Shipley breaks down the biggest moves and their impact on playoff races across the league.",
        publishDate: "December 24, 2024",
        duration: "52:18",
        thumbnail: "/podcast-thumb-3.jpg",
        youtubeId: "YAWg2Hb0TjM"
    },
    {
        id: 4,
        title: "Rookie Report: Standout Performances",
        description: "Analyzing the best rookie performances this season and their impact on their respective teams.",
        publishDate: "December 22, 2024",
        duration: "41:27",
        thumbnail: "/podcast-thumb-4.jpg",
        youtubeId: "YAWg2Hb0TjM"
    }
];

export default function PodcastsComponent() {
    return (
        <section className="container mx-auto mt-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Latest <span className="text-red-800">Podcasts</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {latestPodcasts.map((podcast) => (
                    <div 
                        key={podcast.id}
                        className="rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                        {/* Podcast Thumbnail */}
                        <div className="relative h-48 w-full">
                            <Image 
                                src="/bw-logo.webp" 
                                alt={podcast.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-red-800 rounded-full p-3 hover:bg-red-900 transition-colors">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8.5 5.5a.5.5 0 00-.5.5v8a.5.5 0 00.8.4l6-4a.5.5 0 000-.8l-6-4a.5.5 0 00-.3-.1z"/>
                                    </svg>
                                </div>
                            </div>
                            {/* Duration Badge */}
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                {podcast.duration}
                            </div>
                        </div>

                        {/* Podcast Info */}
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-red-800 transition-colors">
                                {podcast.title}
                            </h3>
                            <p className="text-sm mb-3 line-clamp-2">
                                {podcast.description}
                            </p>
                            <p className="text-xs">
                                {podcast.publishDate}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Featured Podcast Section */}
            <div className="rounded-lg border p-6 mb-8">
                <h3 className="text-xl font-bold mb-4">Featured Episode</h3>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                        <h4 className="text-lg font-semibold mb-2">32BeatWriters Introduction</h4>
                        <p className="mb-4">
                            Our podcast host, Zach Hiduk, gathers beat writers, analysts and others to join him each week to give you the inside look of what to expect from NFL teams and their players.
                        </p>
                        <p className="text-sm font-medium text-red-800 mb-4">
                            Listen to insight from Courtney Cronin, John Shipley, Jourdan Rodrigue and more.
                        </p>
                        <Link href="/podcast">
                            <button className="bg-red-800 text-white px-6 py-2 rounded-lg font-semibold hover:cursor-pointer hover:scale-102 transition-all duration-300">
                                Watch Full Episode
                            </button>
                        </Link>
                    </div>
                    <div className="relative">
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
            </div>

            {/* Call to Action */}
            <div className="text-center">
                <Link href="/podcast">
                    <button className="bg-red-800 text-white px-8 py-3 rounded-lg font-semibold hover:cursor-pointer hover:scale-102 transition-all duration-300">
                        See More Podcasts
                    </button>
                </Link>
            </div>
        </section>
    );
}
