'use client'

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Upload, X } from 'lucide-react'


export default function Tools() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPosition, setSelectedPosition] = useState("QB");
    const searchParams = useSearchParams();
    const router = useRouter();
    const [page, setPage] = useState(() => {
        const pageFromUrl = searchParams?.get("page");
        return pageFromUrl ? parseInt(pageFromUrl, 10) : 1;
    });
    const [scoringFormat, setScoringFormat] = useState("Standard");

    const [rankingsData, setRankingsData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRankings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/rankings');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setRankingsData(data);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRankings();
    }, []);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        updateURL(newPage, searchTerm, selectedPosition);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const updateURL = (newPage?: number, newSearch?: string, newPosition?: string, newConference?: string) => {
        const params = new URLSearchParams();

        const currentPage = newPage ?? page;
        const currentSearch = newSearch ?? searchTerm;
        const currentPosition = newPosition ?? selectedPosition;

        if (currentPage > 1) params.set('page', currentPage.toString());
        if (currentSearch) params.set('search', currentSearch);
        if (currentPosition !== "all") params.set('position', currentPosition);

        const newURL = params.toString() ? `?${params.toString()}` : '/tools';
        router.replace(newURL, { scroll: false });
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (searchParams?.get('search') || '')) {
                setPage(1);
                updateURL(1, searchTerm, selectedPosition);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const filteredRankings = rankingsData.filter(player => {
        const matchesSearch = searchTerm === "" || player.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = selectedPosition === "FLEX" ?
            ["RB", "WR", "TE"].includes(player.position) :
            player.position === selectedPosition;
        return matchesSearch && matchesPosition;
    }).sort((a, b) => {
        if (scoringFormat === "Standard") {
            return b.standard - a.standard;
        } else if (scoringFormat === "Half PPR") {
            return b.halfppr - a.halfppr;
        } else if (scoringFormat === "PPR") {
            return b.ppr - a.ppr;
        }
        return 0;
    });

    const paginatedRankings = filteredRankings.slice((page - 1) * 140, page * 140);
    const totalPages = Math.ceil(filteredRankings.length / 140);

    if (isLoading) {
        return <div className="min-h-screen p-4 text-center text-xl">Loading rankings...</div>;
    }

    if (error) {
        return <div className="min-h-screen p-4 text-center text-xl text-red-500">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen p-4">
            <h1 className="text-center text-4xl font-bold mb-8">
                Player Ranking Tool
            </h1>
            <div className="max-w-4xl mx-auto rounded-lg shadow-lg p-6">
                <div className='flex justify-between items-center mb-6'>
                    <h2 className="text-2xl font-semibold"></h2>
                </div>
                {/* Controls Section */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between gap-4 mt-4">
                        {/* Position Filters */}
                        <div className="flex w-60 py-1 px-1 rounded-lg position-card">
                            {['QB', 'RB', 'WR', 'TE', 'FLEX'].map(pos => (
                                <button
                                    key={pos}
                                    onClick={() => setSelectedPosition(pos)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${selectedPosition === pos ? 'position-select shadow hover:cursor-pointer' : 'hover:cursor-pointer text-gray-500'}`}
                                >
                                    {pos}
                                </button>
                            ))}
                        </div>
                        {/* Half PPR Dropdown */}
                        <select
                            className=" px-3 py-2 rounded shadow-sm text-sm select bg-card"
                            value={scoringFormat}
                            onChange={(e) => setScoringFormat(e.target.value)}
                        >
                            <option>Standard</option>
                            <option>Half PPR</option>
                            <option>PPR</option>
                        </select>
                    </div>

                    {/* Search Bar */}
                    <div className="relative flex mt-4 w-72">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search players..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 filter-input rounded-lg"
                        />
                    </div>
                </div>


                {/* Player Table */}
                <div className="overflow-x-auto rounded">
                    <table className="min-w-full">
                        <thead>
                            <tr className='player-card'>
                                <th scope="col" className="px-2 py-2 text-left text-xs font-medium uppercase"># (vs. ecr)</th>
                                <th scope="col" className="px-2 py-2 text-left text-xs font-medium uppercase">Player</th>
                                <th scope="col" className="px-2 py-2 text-right text-xs font-medium uppercase">Proj. Pts</th>
                                <th scope="col" className="px-2 py-2 text-right text-xs font-medium uppercase">Pass Yds</th>
                                <th scope="col" className="px-2 py-2 text-right text-xs font-medium uppercase">Pass TDs</th>
                                <th scope="col" className="px-2 py-2 text-right text-xs font-medium uppercase">INTs</th>
                                <th scope="col" className="px-2 py-2 text-right text-xs font-medium uppercase">Rush Yds</th>
                                <th scope="col" className="px-2 py-2 text-right text-xs font-medium uppercase">TDs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRankings.map((player: any, index: number) => (
                                <tr key={player.name} className='ranking-table'>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-left font-bold">{((page - 1) * 30) + index + 1} <span className="font-normal text-gray-500">({player.standard_erc})</span></td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm text-left font-bold">{player.name} <span className="font-normal text-gray-500">({player.game_details})</span></td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm text-center font-bold">{player.standard.toFixed(1)}</td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm text-center">{player.passing_yards?.toFixed(1) || '-'}</td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm text-center">{player.passing_touchdowns?.toFixed(1) || '-'}</td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm text-center">{player.interceptions?.toFixed(1) || '-'}</td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm text-center">{player.rushing_yards?.toFixed(1) || '-'}</td>
                                    <td className="px-2 py-2 whitespace-nowrap text-sm text-center">{player.expected_touchdowns?.toFixed(1) || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

