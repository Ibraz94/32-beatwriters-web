"use client"

import Link from "next/link"
import Image from "next/image"


const nfcTeams = [
    {
        name: "Arizona Cardinals",
        region: "NFC West",
        logo: "/ARI.webp",
        link: "/teams/arizona-cardinals"
    },
    {
        name: "Atlanta Falcons",
        region: "NFC South",
        logo: "/ATL.webp",
        link: "/teams/atlanta-falcons"
    },
    {
        name: "Carolina Panthers",
        region: "NFC South",
        logo: "/ARI.webp"
    },
    {
        name: "Chicago Bears",
        region: "NFC North",
        logo: "/ATL.webp"
    },
    {
        name: "Dallas Cowboys",
        region: "NFC East",
        logo: "/teams/dallas-cowboys.png"
    },
    {
        name: "Detroit Lions",
        region: "NFC North",
        logo: "/teams/detroit-lions.png"
    },
    {
        name: "Green Bay Packers",
        region: "NFC North",
        logo: "/teams/green-bay-packers.png"
    },
    {
        name: "Los Angeles Rams",
        region: "NFC West",
        logo: "/teams/los-angeles-rams.png"
    },
    {
        name: "Minnesota Vikings",
        region: "NFC North",
        logo: "/teams/minnesota-vikings.png"
    },
    {
        name: "New Orleans Saints",
        region: "NFC South",
        logo: "/teams/new-orleans-saints.png"
    },
    {
        name: "Philadelphia Eagles",
        region: "NFC East",
        logo: "/teams/philadelphia-eagles.png"
    },
    {
        name: "San Francisco 49ers",
        region: "NFC West",
        logo: "/teams/san-francisco-49ers.png"
    },
    {
        name: "Seattle Seahawks",
        region: "NFC West",
        logo: "/teams/seattle-seahawks.png"
    },
    {
        name: "Tampa Bay Buccaneers",
        region: "NFC South",
        logo: "/teams/tampa-bay-buccaneers.png"
    },
    {
        name: "Washington Commanders",
        region: "NFC East",
        logo: "/teams/washington-commanders.png"
    }   
]

const afcTeams = [
    {
        name: "Baltimore Ravens",
        region: "AFC North",
        logo: "/BAL.webp"
    },
    {
        name: "Buffalo Bills",
        region: "AFC East",
        logo: "/BUF.webp"
    },
    {
        name: "Cincinnati Bengals",
        region: "AFC North",
        logo: "/BAL.webp"
    },
    {
        name: "Cleveland Browns",
        region: "AFC North",
        logo: "/BUF.webp"
    },
    {
        name: "Denver Broncos",
        region: "AFC West",
        logo: "/teams/denver-broncos.png"
    },
    {
        name: "Houston Texans",
        region: "AFC South",
        logo: "/teams/houston-texans.png"
    },
    {
        name: "Indianapolis Colts",
        region: "AFC South",
        logo: "/teams/indianapolis-colts.png"
    },
    {
        name: "Jacksonville Jaguars",
        region: "AFC South",
        logo: "/teams/jacksonville-jaguars.png"
    },
    {
        name: "Kansas City Chiefs",
        region: "AFC West",
        logo: "/teams/kansas-city-chiefs.png"
    },
    {
        name: "Las Vegas Raiders",
        region: "AFC West",
        logo: "/teams/las-vegas-raiders.png"
    },
    {
        name: "Los Angeles Chargers",
        region: "AFC West",
        logo: "/teams/los-angeles-chargers.png"
    },
    {
        name: "Miami Dolphins",
        region: "AFC East",
        logo: "/teams/miami-dolphins.png"
    },
    {
        name: "New England Patriots",
        region: "AFC East",
        logo: "/teams/new-england-patriots.png"
    },
    {
        name: "New York Jets",
        region: "AFC East",
        logo: "/teams/new-york-jets.png"
    },
    {
        name: "Pittsburgh Steelers",
        region: "AFC North",
        logo: "/teams/pittsburgh-steelers.png"
    },
    {
        name: "Tennessee Titans",
        region: "AFC South",
        logo: "/teams/tennessee-titans.png"
    },
]


export default function Teams() {
    return (
        <section className="container mx-auto max-w-7xl mt-12 mb-12">
            <h1 className="text-4xl font-bold">All <span className="text-red-800">Teams</span></h1>
            <p className="text-muted-foreground text-lg mt-4">In this section you’ll find all the teams in the NFL.  You can click on each to get the full news report for each team as well as for individual players.  Additonally you can use the search bar below for any player or team.</p>


            <div className="flex justify-around mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4">
            <h1 className="text-3xl font-extrabold">National Football Conference <span className="text-red-800">(NFC)</span></h1>
            
                {nfcTeams.map((team) => (
                     
                    <Link href={`/teams/${team.name}`} key={team.name} className="flex items-center gap-4 hover:scale-105 transition-all duration-300">
                       
                        <Image src={team.logo} alt={team.name} width={140} height={120} />
                    
                        <div className="flex flex-col gap-1 mt-6">
                            <h2 className="text-3xl font-bold">{team.name}</h2>
                            <p className="text-muted-foreground">{team.region}</p>
                        </div>
                        </Link>
                    ))}
                </div>

                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4">
                <h1 className="text-3xl font-extrabold">American Football Conference <span className="text-red-800">(AFC)</span></h1>
                {afcTeams.map((team) => (
                    <Link href={`/teams/${team.name}`} key={team.name} className="flex items-center gap-4 hover:scale-105 transition-all duration-300">
                        <Image src={team.logo} alt={team.name} width={140} height={120} />
                        <div className="flex flex-col gap-1 mt-6">
                            <h2 className="text-3xl font-bold">{team.name}</h2>
                            <p className="text-muted-foreground">{team.region}</p>
                        </div>
                    </Link>
                ))}
            </div>
            </div>
        </section>
    )
}

