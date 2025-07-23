import Image from "next/image";

const TrustedByPartners = () => {
  return (
    <section className="container mx-auto">
      <div className="min-w-7xl mx-auto text-center bg-gray-50 ">
        <h2 className="text-5xl font-semibold text-gray-800 mb-2 pt-5 font-oswald">Trusted by</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {/* Logo 1 */}
          <div className="w-32 h-32 flex justify-center items-center">
            <Image
              src="/ESPN_logo.png"
              alt="Logo 1"
              width={120}
              height={120}
              objectFit="contain"
            />
          </div>
          {/* Logo 2 */}
          <div className="w-32 h-32 flex justify-center items-center">
            <Image
              src="/CBS_logo.png"
              alt="Logo 2"
              width={120}
              height={120}
              objectFit="contain"
            />
          </div>
          {/* Logo 3 */}
          <div className="w-32 h-32 flex justify-center items-center">
            <Image
              src="/NBC_logo.png"
              alt="Logo 3"
              width={120}
              height={120}
              objectFit="contain"
            />
          </div>
          {/* Logo 4 */}
          <div className="w-32 h-32 flex justify-center items-center">
            <Image
              src="/sleeper_logo.png"
              alt="Logo 3"
              width={150}
              height={150}
              objectFit="contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedByPartners;
