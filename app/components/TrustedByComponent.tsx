import Image from "next/image";

const TrustedByPartners = () => {
  return (
    <section className="container mx-auto mt-4 p-2">
      <div className="text-center bg-gray-50">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-800 mb-4 pt-3 sm:pt-5 font-oswald">Trusted By</h2>
        <div className="grid grid-cols-4 sm:flex sm:flex-wrap justify-center gap-0 sm:gap-6">
          {/* Logo 1 */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 flex justify-center items-center">
            <Image
              src="/ESPN_logo.png"
              alt="ESPN Logo"
              width={120}
              height={120}
              className="w-20 h-20 sm:w-32 sm:h-32 object-contain"
            />
          </div>
          {/* Logo 2 */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 flex justify-center items-center">
            <Image
              src="/CBS_logo.png"
              alt="CBS Logo"
              width={120}
              height={120}
              className="w-20 h-20 sm:w-32 sm:h-32 object-contain"
            />
          </div>
          {/* Logo 3 */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 flex justify-center items-center">
            <Image
              src="/NBC_logo.png"
              alt="NBC Logo"
              width={120}
              height={120}
              className="w-20 h-20 sm:w-32 sm:h-32 object-contain"
            />
          </div>
          {/* Logo 4 */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 flex justify-center items-center">
            <Image
              src="/sleeper_logo.png"
              alt="Sleeper Logo"
              width={150}
              height={150}
              className="w-20 h-20 sm:w-32 sm:h-32 object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedByPartners;
