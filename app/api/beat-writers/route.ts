import { NextResponse } from 'next/server';

// Mock data for beat writers - in production, this would come from a database
const beatWriters = [
  {
    id: '1',
    name: 'Adam Schefter',
    team: 'NFL Network',
    twitter: '@AdamSchefter',
    specialty: 'Breaking News',
    bio: 'Senior NFL Insider for ESPN. Known for breaking major NFL news and transactions.',
    image: '/writers/schefter.jpg',
    followers: '9.2M',
    location: 'New York, NY'
  },
  {
    id: '2',
    name: 'Ian Rapoport',
    team: 'NFL Network',
    twitter: '@RapSheet',
    specialty: 'Insider Reports',
    bio: 'NFL Network Insider providing the latest news, rumors, and analysis from around the NFL.',
    image: '/writers/rapoport.jpg',
    followers: '2.1M',
    location: 'Boston, MA'
  },
  {
    id: '3',
    name: 'Josina Anderson',
    team: 'CBS Sports',
    twitter: '@JosinaAnderson',
    specialty: 'Player Interviews',
    bio: 'CBS Sports NFL Reporter covering breaking news and exclusive player interviews.',
    image: '/writers/anderson.jpg',
    followers: '785K',
    location: 'Los Angeles, CA'
  },
  {
    id: '4',
    name: 'Tom Pelissero',
    team: 'NFL Network',
    twitter: '@TomPelissero',
    specialty: 'Contract News',
    bio: 'NFL Network Insider focusing on contract negotiations and roster moves.',
    image: '/writers/pelissero.jpg',
    followers: '1.3M',
    location: 'Minneapolis, MN'
  },
  {
    id: '5',
    name: 'Dianna Russini',
    team: 'The Athletic',
    twitter: '@diannaESPN',
    specialty: 'Team Analysis',
    bio: 'Senior NFL Reporter for The Athletic covering team dynamics and front office moves.',
    image: '/writers/russini.jpg',
    followers: '643K',
    location: 'Washington, DC'
  },
  {
    id: '6',
    name: 'Mike Garafolo',
    team: 'NFL Network',
    twitter: '@MikeGarafolo',
    specialty: 'Free Agency',
    bio: 'NFL Network Insider specializing in free agency and trade deadline coverage.',
    image: '/writers/garafolo.jpg',
    followers: '892K',
    location: 'New Jersey'
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: beatWriters,
      count: beatWriters.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch beat writers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, team, twitter, specialty, bio } = body;
    if (!name || !team || !twitter || !specialty || !bio) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new beat writer (in production, save to database)
    const newWriter = {
      id: String(beatWriters.length + 1),
      name,
      team,
      twitter,
      specialty,
      bio,
      image: body.image || '/writers/default.jpg',
      followers: body.followers || '0',
      location: body.location || 'Unknown'
    };

    beatWriters.push(newWriter);

    return NextResponse.json({
      success: true,
      data: newWriter
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create beat writer' },
      { status: 500 }
    );
  }
} 