import Link from 'next/link'

const ArticleCTA = () => {
  return (
    <div className="header-secondary border-2 rounded-xl p-5 text-center bg-white bg-opacity-10 backdrop-blur-lg shadow-lg mb-5">
      <h2 className="text-white text-2xl font-semibold mb-4">
        You're Reading the Free Article! Unlock Premium Articles with 32BeatWriters.com 
      </h2>
      <div className="space-y-4">
        {/* Subscribe Button */}
        <Link
          href="/subscribe"
          className="bg-red-800 hover:scale-102 text-white px-6 mr-2 py-1 rounded text-md transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Subscribe
        </Link>

        {/* Login Button */}
        <Link
          href="/login"
          className="desktop-login-link hover:scale-102 transition-colors text-md"
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
