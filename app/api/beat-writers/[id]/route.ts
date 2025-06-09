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
    location: 'New York, NY',
    joinDate: '2009-08-01',
    articles: 1247,
    verified: true,
    contact: 'adam.schefter@espn.com'
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
    location: 'Boston, MA',
    joinDate: '2012-03-15',
    articles: 892,
    verified: true,
    contact: 'ian.rapoport@nfl.com'
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
    location: 'Los Angeles, CA',
    joinDate: '2015-06-10',
    articles: 634,
    verified: true,
    contact: 'josina.anderson@cbs.com'
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
    location: 'Minneapolis, MN',
    joinDate: '2017-04-20',
    articles: 456,
    verified: true,
    contact: 'tom.pelissero@nfl.com'
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
    location: 'Washington, DC',
    joinDate: '2013-09-12',
    articles: 723,
    verified: true,
    contact: 'dianna.russini@theathletic.com'
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
    location: 'New Jersey',
    joinDate: '2014-07-30',
    articles: 568,
    verified: true,
    contact: 'mike.garafolo@nfl.com'
  }
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const writer = beatWriters.find(w => w.id === id);
    
    if (!writer) {
      return NextResponse.json(
        { success: false, error: 'Beat writer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: writer
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch beat writer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const writerIndex = beatWriters.findIndex(w => w.id === id);
    
    if (writerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Beat writer not found' },
        { status: 404 }
      );
    }

    // Update the writer (in production, update in database)
    beatWriters[writerIndex] = { ...beatWriters[writerIndex], ...body };

    return NextResponse.json({
      success: true,
      data: beatWriters[writerIndex]
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update beat writer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const writerIndex = beatWriters.findIndex(w => w.id === id);
    
    if (writerIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Beat writer not found' },
        { status: 404 }
      );
    }

    // Remove the writer (in production, delete from database)
    const deletedWriter = beatWriters.splice(writerIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedWriter,
      message: 'Beat writer deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete beat writer' },
      { status: 500 }
    );
  }
} 