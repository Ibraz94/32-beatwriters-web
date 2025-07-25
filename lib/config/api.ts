export const API_CONFIG = {
  BASE_URL:  'http://localhost:4004', // 'https://api.32beatwriters.staging.pegasync.com', //process.env.NEXT_PUBLIC_API_BASE_URL ||
  ENDPOINTS: {
    ARTICLES: '/api/articles',
    AUTH: '/api/users',
    BEAT_WRITERS: '/api/beat-writers',
    CONTACT: '/api/contact',
    NUGGETS: '/api/nuggets',
    SAVED_NUGGETS: '/api/nuggets/saved/list',
    PLAYERS: '/api/players',
    PODCASTS: '/api/podcasts',
    SUBSCRIPTION: '/api/subscription',
    TEAMS: '/api/teams',
    TOOLS: '/api/tools',
    STRIPE: {
      SUBSCRIPTION_OPTIONS: '/api/stripe/subscription-options',
      CREATE_CHECKOUT_SESSION: '/api/stripe/create-checkout-session',
      MY_SUBSCRIPTION: '/api/stripe/my-subscription',
      CANCEL_SUBSCRIPTION: '/api/stripe/my-subscription/cancel'
    }
  }
}

// Helper function to build full URLs
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// External APIs
export const EXTERNAL_APIS = {
  PLAYER_PROFILER: 'https://api.playerprofiler.com/v1/player'
} 