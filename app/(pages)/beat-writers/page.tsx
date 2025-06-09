'use client';
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface BeatWriter {
  id: string;
  name: string;
  team: string;
  twitter: string;
  specialty: string;
  bio: string;
  image: string;
  followers: string;
  location: string;
}

export default function BeatWritersPage() {
  const [writers, setWriters] = useState<BeatWriter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBeatWriters();
  }, []);

  const fetchBeatWriters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/beat-writers');
      const result = await response.json();
      
      if (result.success) {
        setWriters(result.data);
      } else {
        setError(result.error || 'Failed to fetch beat writers');
      }
    } catch (err) {
      setError('Network error while fetching beat writers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto mt-16 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto mt-16 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-600">Error</h1>
          <p className="text-lg text-gray-600">{error}</p>
          <button 
            onClick={fetchBeatWriters}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto mt-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-6">NFL Beat <span className="text-red-600">Writers</span></h1>
        <p className="text-xl max-w-5xl mx-auto leading-relaxed">
          Here you will find a curated list of trusted NFL beat writers that we have worked with 
          or consider reliable sources. This is an ever-growing network of professional journalists 
          covering the NFL.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">
        {writers.map((writer) => (
          <Link href={`/beat-writers/${writer.id}`} key={writer.id}>
            <div className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white text-xl font-bold mb-1">{writer.name}</h3>
                  <p className="text-blue-100 text-sm">{writer.team}</p>
                </div>
                {/* <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium">
                    {writer.specialty}
                  </span>
                </div> */}
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-1">
                    <p className="text-sm flex items-center">
                      {writer.location}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed line-clamp-3">
                  {writer.bio}
                </p>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="inline-flex items-center text-sm font-medium hover:scale-102 hover:cursor-pointer hover:text-red-800">
                    View Profile
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}





      {/* <div className="mt-16 text-center">
        <div className="rounded-lg p-8 max-w-2xl mx-auto border mb-12">
          <h3 className="text-2xl font-bold mb-4">Know a Great Beat Writer?</h3>
          <p className="mb-6">
            Help us expand our network by suggesting trusted NFL beat writers who provide reliable coverage and insights.
          </p>
          <button className="bg-red-800 hover:scale-102 hover:cursor-pointer text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            Suggest a Writer
          </button>
        </div>
      </div> */}