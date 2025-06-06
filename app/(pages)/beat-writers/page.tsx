import Image from "next/image";

export default function BeatWritersPage() {
    return (
        <section className="container mx-auto mt-16">
            <h1 className="text-6xl font-bold mb-4 text-center">List of NFL Beat Writers</h1>
            <p className="text-center text-lg">Here you will find a list of all the NFL beat writers that we have worked with or feel are trusted sources.  This will be an ever growing list as we build out the network and find time to update it.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto mt-12">
                <div>
                    <Image src="/bw-logo.webp" alt="Beat Writers" width={250} height={100} />
                </div>
            </div>
        </section>
    )
}