"use client"

import Link from "next/link"
import Image from "next/image"
import { Shield, Trophy, MapPin, Users } from "lucide-react"
import { nflTeams, getTeamsByConference } from './data/teams'

export default function Teams() {
    const nfcTeams = getTeamsByConference('NFC')
    const afcTeams = getTeamsByConference('AFC')

    return (
        <section className="container mx-auto max-w-7xl px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                   All <span className="text-red-800">Teams</span>
                </h1>
                <p className="text-xl max-w-4xl mx-auto">
                    Comprehensive coverage of all teams with in-depth analysis, roster breakdowns, and exclusive insights. 
                    Premium teams feature advanced analytics and insider reports.
                </p>
            </div>

            {/* Conferences */}
            <div className="grid lg:grid-cols-2 gap-12">
                {/* NFC Conference */}
                <div>
                    <div className="flex items-center mb-6 ml-16">
                        <h2 className="text-3xl font-bold">
                            National Football Conference <span className="text-red-800">(NFC)</span>
                        </h2>
                    </div>
                    
                    <div className="space-y-4">
                        {nfcTeams.map((team) => (
                            <Link 
                                href={`/teams/${team.id}`} 
                                key={team.id} 
                                className="flex items-center gap-6 p-4 rounded-xl shadow-md transition-all duration-100 hover:scale-101 border border-gray-200"
                            >
                                <div className="relative">
                                    <Image 
                                        src={team.logo} 
                                        alt={team.name} 
                                        width={80} 
                                        height={80} 
                                        className="rounded-lg"
                                        loader={({ src }) => src}
                                    />
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold hover:text-red-800 transition-colors">
                                            {team.name}
                                        </h3>
                                        {team.isPremium && (
                                            <span className="bg-red-800 text-white px-2 py-1 rounded text-xs font-semibold">
                                                Premium
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center text-sm mb-2">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span>{team.division}</span>
                                        <span className="mx-2">•</span>
                                        <span>{team.record2023}</span>
                                        <span className="mx-2">•</span>
                                        <span>{team.stadium}</span>
                                    </div>
                                    
                                    <p className="text-sm line-clamp-2">
                                        {team.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* AFC Conference */}
                <div>
                    <div className="flex items-center mb-6 ml-16">
                        <h2 className="text-3xl font-bold">
                            American Football Conference <span className="text-red-800">(AFC)</span>
                        </h2>
                    </div>
                    
                    <div className="space-y-4">
                        {afcTeams.map((team) => (
                            <Link 
                                href={`/teams/${team.id}`} 
                                key={team.id} 
                                className="flex items-center gap-6 p-4 rounded-xl shadow-md transition-all duration-100 hover:scale-101 border border-gray-200"
                            >
                                <div className="relative">
                                    <Image 
                                        src={team.logo} 
                                        alt={team.name} 
                                        width={80} 
                                        height={80} 
                                        className="rounded-lg"
                                        loader={({ src }) => src}
                                    />
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold hover:text-red-800 transition-colors">
                                            {team.name}
                                        </h3>
                                        {team.isPremium && (
                                            <span className="bg-red-800 text-white px-2 py-1 rounded text-xs font-semibold">
                                                Premium
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center text-sm mb-2">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span>{team.division}</span>
                                        <span className="mx-2">•</span>
                                        <span>{team.record2023}</span>
                                        <span className="mx-2">•</span>
                                        <span>{team.stadium}</span>
                                    </div>
                                    
                                    <p className="text-sm line-clamp-2">
                                        {team.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}



                    {/* Statistics Section */}
            {/* <div className="mt-16 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-center mb-8">League Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-red-800">32</div>
                        <div className="text-gray-600">Total Teams</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-red-800">{nflTeams.filter(t => t.isPremium).length}</div>
                        <div className="text-gray-600">Premium Teams</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-red-800">16</div>
                        <div className="text-gray-600">NFC Teams</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-red-800">16</div>
                        <div className="text-gray-600">AFC Teams</div>
                    </div>
                </div>
            </div> */}



            {/* Premium Notice */}
            {/* <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Shield className="w-5 h-5 text-red-800 mr-2" />
                        <span className="text-red-800 font-semibold">Premium Team Analysis Available</span>
                    </div>
                    <Link 
                        href="/premium" 
                        className="bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-900 transition-colors"
                    >
                        Upgrade Now
                    </Link>
                </div>
                <p className="text-red-700 text-sm mt-2">
                    Access exclusive salary cap analysis, trade rumors, injury reports, and advanced team metrics
                </p>
            </div> */}
