import Image from "next/image";
import Link from "next/link";

const TrustedByPartners = () => {
  return (
    <section className="container mx-auto mt-4 p-4 bg-[var(--gray-background-color)] dark:bg-[#1A1A1A]">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4 pt-3 sm:pt-5 font-oswald">
          Our Valuable Allies
        </h2>
        <p className="text-[var(--color-gray)] text-base sm:text-lg md:text-xl mb-10 leading-relaxed max-w-[700px] mx-auto dark:text-white">
          Working as a team for positive outcomes, we make your brand known.
          So, expect only success from us.
        </p>


        {/* ✅ Mobile-first grid — expands responsively */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4 justify-items-center">
          {/* Logo 1 */}
          <div className="w-full bg-white flex justify-center items-center rounded-2xl h-24 md:h-42 lg:h-48 px-6 md:px-10 lg:px-12 transition-all duration-300 dark:bg-[#262829]">
            <Image
              src="/ESPN_logo.png"
              alt="ESPN Logo"
              width={300}
              height={180}
              className="w-full h-auto object-contain" />
          </div>

          {/* Logo 2 */}
          <div className="w-full bg-white flex justify-center items-center rounded-2xl h-24 md:h-42 lg:h-48 px-6 md:px-10 lg:px-12 transition-all duration-300 dark:bg-[#262829]">
            <Image
              src="/CBS_logo.png"
              alt="CBS Logo"
              width={300}
              height={180}
              className="w-full h-auto object-contain" />
          </div>

          {/* Logo 3 */}
          <div className="w-full bg-white flex justify-center items-center rounded-2xl h-24 md:h-42 lg:h-48 px-6 md:px-10 lg:px-12 transition-all duration-300 dark:bg-[#262829]">
            <Image
              src="/NBC_logo.png"
              alt="NBC Logo"
              width={300}
              height={180}
              className="w-full h-auto object-contain" />
          </div>

          {/* Logo 4 */}
          <div className="w-full bg-white flex justify-center items-center rounded-2xl h-24 md:h-42 lg:h-48 px-6 md:px-10 lg:px-12 transition-all duration-300 dark:bg-[#262829]">
            <Image
              src="/sleeper_logo-min.png"
              alt="Sleeper Logo"
              width={300}
              height={180}
              className="w-full h-auto object-contain" />
          </div>
        </div>
      </div>

      <Link href="/about">
        <h2 className="font-semibold text-foreground mb-4 pt-3 sm:pt-5 font-oswald text-center hover:underline underline-offset-4">
          Learn About Why They Trust Us
        </h2>
      </Link>
    </section>


  );
};

export default TrustedByPartners;
