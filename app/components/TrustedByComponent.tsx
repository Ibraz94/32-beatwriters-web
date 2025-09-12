import Image from "next/image";

const TrustedByPartners = () => {
  return (
    <section className="container mx-auto mt-4 p-2">
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-4 pt-3 sm:pt-5 font-oswald">Trusted By</h2>
        <div className="grid grid-cols-2 gap-4 justify-center max-w-xs mx-auto min-[435px]:flex min-[435px]:max-w-none">
          {/* Logo 1 */}
          <div className="w-24 h-20 sm:w-32 sm:h-20 px-2 bg-gray-200 flex justify-center items-center rounded-lg max-[435px]:w-full">
            <Image
              src="/ESPN_logo.png"
              alt="ESPN Logo"
              width={120}
              height={120}
              className="object-contain max-w-full"
            />
          </div>
          {/* Logo 2 */}
          <div className="w-24 h-20 sm:w-32 sm:h-20 px-2 bg-gray-200 flex justify-center items-center rounded-lg max-[435px]:w-full">
            <Image
              src="/CBS_logo.png"
              alt="CBS Logo"
              width={120}
              height={120}
              className="object-contain max-w-full"
            />
          </div>
          {/* Logo 3 */}
          <div className="w-24 h-20 sm:w-32 sm:h-20 px-2 bg-gray-200 flex justify-center items-center rounded-lg max-[435px]:w-full">
            <Image
              src="/NBC_logo.png"
              alt="NBC Logo"
              width={120}
              height={120}
              className="object-contain max-w-full"
            />
          </div>
          {/* Logo 4 */}
          <div className="w-24 h-20 sm:w-32 sm:h-20 px-2 bg-gray-200 flex justify-center items-center rounded-lg max-[435px]:w-full">
            <Image
              src="/sleeper_logo-min.png"
              alt="Sleeper Logo"
              width={150}
              height={150}
              className="object-contain max-w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedByPartners;
