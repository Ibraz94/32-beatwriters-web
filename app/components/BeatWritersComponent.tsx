import Image from "next/image";
import Link from "next/link";
import { Users, Award, TrendingUp, ArrowRight } from "lucide-react";

// Mock data for featured beat writers
const featuredWriters = [
    {
        id: 1,
        name: "Courtney Cronin",
        team: "Vikings",
        outlet: "ESPN",
        image: "/bw-logo.webp",
        specialties: ["Injury Reports", "Practice Updates"],
        followers: "45K",
        verified: true
    },
    {
        id: 2,
        name: "John Shipley",
        team: "Eagles", 
        outlet: "The Athletic",
        image: "/bw-logo.webp",
        specialties: ["Trade Analysis", "Front Office"],
        followers: "32K",
        verified: true
    },
    {
        id: 3,
        name: "Jourdan Rodrigue",
        team: "Rams",
        outlet: "The Athletic",
        image: "/bw-logo.webp",
        specialties: ["Player Interviews", "Game Analysis"],
        followers: "28K",
        verified: true
    }
];

export default function BeatWritersComponent() {
    return (
        <section className="container mx-auto px-4 py-16">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Meet Our <span className="text-red-800">Beat Writers</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    32 dedicated professionals bringing you insider access to every NFL team, 
                    every practice, every move that matters.
                </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 p-6 bg-muted/30 rounded-2xl">
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-red-800">32</div>
                    <div className="text-sm text-muted-foreground">NFL Teams</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-red-800">100+</div>
                    <div className="text-sm text-muted-foreground">Writers</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-red-800">24/7</div>
                    <div className="text-sm text-muted-foreground">Coverage</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-red-800">1M+</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
                {/* What We Do */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-red-600 to-red-900 text-white p-8 rounded-2xl">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                            <Users className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Who Are Beat Writers?</h3>
                        <p className="text-red-100 leading-relaxed">
                            Beat writers are journalists assigned to cover specific NFL teams year-round. 
                            They attend every practice, press conference, and game, providing insider access 
                            you can't get anywhere else.
                        </p>
                    </div>

                    <div className="border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                            <Award className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Why Trust Our Network?</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                Direct team access and relationships
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                Years of experience and credibility
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                Real-time reporting from the source
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Featured Writers */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold">Featured Writers</h3>
                        <Link href="/beat-writers" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                        {featuredWriters.map((writer) => (
                            <div key={writer.id} className="group border border-border rounded-xl p-6 hover:shadow-lg hover:border-red-200 transition-all duration-300">
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <Image
                                            src={writer.image}
                                            alt={writer.name}
                                            width={60}
                                            height={60}
                                            className="w-15 h-15 rounded-xl object-cover"
                                        />
                                        {writer.verified && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <Award className="h-3 w-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-foreground group-hover:text-red-600 transition-colors">
                                                {writer.name}
                                            </h4>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                            <span className="font-medium text-red-600">{writer.team}</span>
                                            <span>•</span>
                                            <span>{writer.outlet}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {writer.specialties.map((specialty) => (
                                                <span key={specialty} className="text-xs px-2 py-1 bg-muted rounded-full">
                                                    {specialty}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <TrendingUp className="h-4 w-4" />
                                                <span>{writer.followers} followers</span>
                                            </div>
                                            <Link href={`/beat-writers/${writer.id}`} className="text-sm font-medium text-red-600 hover:text-red-700">
                                                Follow
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Call to Action Card */}
                    <div className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 rounded-2xl">
                        <h3 className="text-xl font-bold mb-2">Join the Inner Circle</h3>
                        <p className="text-gray-300 mb-4">
                            Get exclusive access to all 32 beat writers, real-time updates, and insider analysis.
                        </p>
                        <Link href="/beat-writers">
                            <button className="bg-red-800 hover:scale-102 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
                                See All Beat Writers
                                <ArrowRight className="h-4 w-4" />
                        </button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}