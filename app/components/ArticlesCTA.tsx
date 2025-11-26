import Link from 'next/link'
import { usePathname } from 'next/navigation'


const ArticleCTA = () => {
  const pathname = usePathname();
  return (
    <div className="border-2 rounded-xl p-5 text-center bg- bg-opacity-10 backdrop-blur-lg shadow-xl mb-5">
      <h2 className="text-2xl font-semibold mb-4">
        You're Reading the Free Article! Unlock Premium Articles with 32BeatWriters.com 
      </h2>
      <div className="space-y-4">
        {/* Subscribe Button */}
        <Link
          href="/subscribe"
          className="bg-[#E64A30] hover:scale-102 text-white px-6 mr-2 py-1 rounded-full text-md transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Subscribe
        </Link>

        {/* Login Button */}
        <Link
          href={{
        pathname: '/login',
        query: { redirect: pathname }  // Pass the current path as a query parameter
      }}
          className="text-md hover:text-[#E64A30]"
        >
          Login
        </Link>
      </div>
      <p className="text-xs mt-4 text-white">
        Starting at $9.99/month
      </p>
    </div>
  )
}

export default ArticleCTA
