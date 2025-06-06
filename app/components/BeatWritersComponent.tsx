import Image from "next/image";
import Link from "next/link";


export default function BeatWritersComponent() {
    return (
        <section className="container mx-auto mt-16">
            <h1 className="text-2xl font-bold mb-4">Beat Writers <span>Corner</span></h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border rounded-lg">

                <div className="flex flex-col items-center justify-center mt-10">
                    <h1 className="text-4xl text-center" >
                        List of NFL Beat Writers
                    </h1>
                    <div className="mt-6">
                        <Image src="/bw-logo.webp" alt="Beat Writers" width={250} height={100} />
                        <Link href="/beat-writers">
                        <button  className="bg-red-800 text-white w-full py-2 rounded-md mt-4 hover:scale-102 hover:cursor-pointer transition-all duration-300 mb-12">
                            
                                See All Beat Writers
                            
                        </button>
                        </Link>
                    </div>
                </div>


                <div>
                    <h1 className="text-4xl text-center mt-10">Who are the Beat Writers</h1>
                    <p className="text-center text-lg mt-4">32BeatWriters’ goal is to give high quality, informative content to those who love the NFL, and particularly those who love fantasy football.</p>
                    <p className="text-center text-lg mt-4">32BeatWriters’ goal is to give high quality, informative content to those who love the NFL, and particularly those who love fantasy football.</p>
                </div>

                <div className="flex flex-col items-center mt-10">
                <h1 className="text-4xl text=center">Featured Beat Writer</h1>
                    <div className="mt-10">
                        <Image src="/bw-logo.webp" alt="Beat Writers" width={250} height={100} />
                    </div>
                </div>
            </div>
        </section>
    )
}