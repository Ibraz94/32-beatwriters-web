


export default function About() {
    return (
        <div className="container mx-auto max-w-4xl flex flex-col items-start justify-center mt-6 mb-28">

            <div className="flex flex-col items-start">
            <h1 className="text-4xl font-bold mb-6">Who is <span className="text-red-800">32BeatWriters</span>?</h1>

            <p className="text-lg mb-4">32BeatWriters' goal is to give high quality, informative content to those who love the NFL, and particularly those who love fantasy football.</p>
            <p className="text-lg mb-8">32BeatWriters relies on and seeks to promote those who are on the daily beat for local NFL teams and utilize their content and opinions (and sometimes ours) to give you the edge and unique information that is not readily available.</p>
            </div>


            <div className="w-full mt-4">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>

                    <iframe 
                        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                        src="https://www.youtube.com/embed/tpj_nbg5DtE"
                        title="32BeatWriters Introduction"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>

            <div className="mt-6 text-xl flex items-center justify-center gap-1">
                Listen our podcast on our official youtube channel <a href="https://www.youtube.com/@32BeatWriters" className="text-red-800">here</a>
            </div>
        </div>
    );
}
