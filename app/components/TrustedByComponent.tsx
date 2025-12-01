'use client'

import Image from "next/image";
import Link from "next/link";

const TrustedByPartners = () => {
  return (
    <section className="container mx-auto mt-4 p-4 bg-[var(--gray-background-color)] dark:bg-[#1A1A1A] rounded-2xl">
      <div className="text-center flex flex-col mb-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl text-foreground mb-8 pt-3 sm:pt-5 font-oswald">
          Trusted By
        </h2>

        {/* ✅ Mobile-first grid — expands responsively */}
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
        <div className="flex lg:gap-4 gap-2">
            {/* Logo 1 */}
            <div className="w-full bg-white flex justify-center items-center rounded-2xl h-24 md:h-36 lg:h-42 px-6 md:px-10 lg:px-12 transition-all duration-300 dark:bg-[#262829]">
              <Image
                src="/ESPN_logo.png"
                alt="ESPN Logo"
                width={300}
                height={200}
                className="h-auto object-contain" 
                loader={({ src }) => src}
                />
                
            </div>

            {/* Logo 2 */}
            <div className="w-full bg-white flex justify-center items-center rounded-2xl h-24 md:h-36 lg:h-42 px-6 md:px-10 lg:px-12 transition-all duration-300 dark:bg-[#262829]">
              <Image
                src="/CBS_logo.png"
                alt="CBS Logo"
                width={300}
                height={200}
                className="h-auto object-contain" 
                loader={({ src }) => src}
                />
            </div>
          </div>

          <div className="flex lg:gap-4 gap-2">
            {/* Logo 3 */}
            <div className="w-full bg-white flex justify-center items-center rounded-2xl h-24 md:h-36 lg:h-42 px-6 md:px-10 lg:px-12 transition-all duration-300 dark:bg-[#262829]">
              <Image
                src="/NBC_logo.png"
                alt="NBC Logo"
                width={300}
                height={200}
                className="h-auto object-contain" 
                loader={({ src }) => src}
                />
            </div>

            {/* Logo 4 */}
            <div className="w-full bg-white flex justify-center items-center rounded-2xl h-24 md:h-36 lg:h-42 px-6 md:px-10 lg:px-12 transition-all duration-300 dark:bg-[#262829]">
              <Image
                src="/sleeper_logo-min.png"
                alt="Sleeper Logo"
                width={300}
                height={200}
                className="h-auto object-contain" 
                loader={({ src }) => src}
                />
            </div>
          </div>

          <div className="flex justify-center items-center lg:gap-4 gap-2">
            {/* Logo 5 */}
            <div className="w-[195px] lg:w-full bg-white flex justify-center items-center rounded-2xl h-24 md:h-36 lg:h-42 px-6 md:px-10 lg:px-12 transition-all duration-300 dark:bg-[#262829]">
              <Image
                src="/the-athletic.png"
                alt="Athletic Logo"
                width={300}
                height={200}
                className=" h-auto object-contain" 
                loader={({ src }) => src}
                />
          </div>
          </div>
          </div>
      </div>

      {/* <Link href="/trusted-by">
        <h2 className="font-semibold text-foreground mb-4 pt-3 sm:pt-5 font-oswald text-center hover:underline underline-offset-4">
          Learn About Why They Trust Us
        </h2>
      </Link> */}
    </section>


  );
};

export default TrustedByPartners;
