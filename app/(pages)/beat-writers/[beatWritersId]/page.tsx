'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
  joinDate: string;
  articles: number;
  verified: boolean;
  contact: string;
}

interface BeatWriterDetailPageProps {
  params: {
    beatWritersId: string;
  };
}

export default function BeatWriterDetailPage({ params }: BeatWriterDetailPageProps) {
  const [writer, setWriter] = useState<BeatWriter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchBeatWriter();
  }, [params.beatWritersId]);

  const fetchBeatWriter = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/beat-writers/${params.beatWritersId}`);
      const result = await response.json();
      
      if (result.success) {
        setWriter(result.data);
      } else {
        setError(result.error || 'Beat writer not found');
      }
    } catch (err) {
      setError('Network error while fetching beat writer');
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

  if (error || !writer) {
    return (
      <section className="container mx-auto mt-16 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-600">Beat Writer Not Found</h1>
          <p className="text-lg text-gray-600 mb-6">{error}</p>
          <Link 
            href="/beat-writers"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Back to Beat Writers
          </Link>
        </div>
      </section>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="container mx-auto mt-16 px-4">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/beat-writers" className="hover:text-blue-600 transition-colors">
            Beat Writers
          </Link>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-900">{writer.name}</span>
        </div>
      </nav>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl overflow-hidden mb-8">
        <div className="px-8 py-12 text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold">{writer.name.charAt(0)}</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl lg:text-5xl font-bold">{writer.name}</h1>
                {writer.verified && (
                  <svg className="w-8 h-8 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <p className="text-xl text-blue-100 mb-4">{writer.team} • {writer.specialty}</p>
              
              <div className="flex flex-wrap gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{writer.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span>{writer.twitter}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  <span>{writer.followers} followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{writer.bio}</p>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Career Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{writer.articles}</div>
                <div className="text-sm text-gray-500">Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{writer.followers}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {new Date().getFullYear() - new Date(writer.joinDate).getFullYear()}
                </div>
                <div className="text-sm text-gray-500">Years Active</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {writer.verified ? '✓' : '—'}
                </div>
                <div className="text-sm text-gray-500">Verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-sm text-gray-600">{writer.contact}</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span className="text-sm text-gray-600">{writer.twitter}</span>
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Career Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Joined {writer.team}</p>
                  <p className="text-xs text-gray-500">{formatDate(writer.joinDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Specialty: {writer.specialty}</p>
                  <p className="text-xs text-gray-500">Current focus area</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Follow {writer.name}</h3>
            <div className="space-y-3">
              <a
                href={`https://twitter.com/${writer.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Follow on Twitter
              </a>
              <Link
                href="/beat-writers"
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to All Writers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}