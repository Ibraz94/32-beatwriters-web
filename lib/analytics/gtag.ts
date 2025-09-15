// Google Analytics configuration and tracking functions
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-502637809';

// Check if GA is enabled
export const isGAEnabled = !!GA_TRACKING_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (!isGAEnabled) return;
  
  window.gtag('config', GA_TRACKING_ID, {
    page_location: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = (
  action: string,
  {
    event_category,
    event_label,
    value,
    ...parameters
  }: {
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: any;
  } = {}
) => {
  if (!isGAEnabled) return;

  window.gtag('event', action, {
    event_category,
    event_label,
    value,
    ...parameters,
  });
};

// Custom events for 32BeatWriters
export const trackUserEngagement = {
  // Article interactions
  articleView: (articleId: string, title: string) => {
    event('view_article', {
      event_category: 'engagement',
      event_label: title,
      article_id: articleId,
    });
  },
  
  articleLike: (articleId: string, title: string) => {
    event('like_article', {
      event_category: 'engagement',
      event_label: title,
      article_id: articleId,
    });
  },

  // Player interactions
  playerView: (playerId: string, playerName: string) => {
    event('view_player', {
      event_category: 'engagement',
      event_label: playerName,
      player_id: playerId,
    });
  },

  playerFollow: (playerId: string, playerName: string) => {
    event('follow_player', {
      event_category: 'engagement',
      event_label: playerName,
      player_id: playerId,
    });
  },

  // Nugget interactions
  nuggetView: (nuggetId: string) => {
    event('view_nugget', {
      event_category: 'engagement',
      nugget_id: nuggetId,
    });
  },

  nuggetSave: (nuggetId: string) => {
    event('save_nugget', {
      event_category: 'engagement',
      nugget_id: nuggetId,
    });
  },

  // Podcast interactions
  podcastPlay: (podcastId: string, title: string) => {
    event('play_podcast', {
      event_category: 'engagement',
      event_label: title,
      podcast_id: podcastId,
    });
  },

  // Subscription events
  subscriptionStart: (plan: string) => {
    event('begin_checkout', {
      event_category: 'ecommerce',
      event_label: plan,
      currency: 'USD',
    });
  },

  subscriptionComplete: (plan: string, value: number) => {
    event('purchase', {
      event_category: 'ecommerce',
      event_label: plan,
      currency: 'USD',
      value: value,
    });
  },

  // Newsletter signup
  newsletterSignup: (location: string) => {
    event('newsletter_signup', {
      event_category: 'engagement',
      event_label: location, // 'footer', 'header', etc.
    });
  },

  // Search interactions
  search: (searchTerm: string, resultCount: number) => {
    event('search', {
      event_category: 'engagement',
      search_term: searchTerm,
      result_count: resultCount,
    });
  },

  // Contact form
  contactSubmit: () => {
    event('contact_submit', {
      event_category: 'engagement',
    });
  },

  // Discord integration
  discordConnect: () => {
    event('discord_connect', {
      event_category: 'engagement',
    });
  },

  // Authentication
  userLogin: (method: string) => {
    event('login', {
      event_category: 'authentication',
      method: method, // 'email', 'google', etc.
    });
  },

  userRegister: (method: string) => {
    event('sign_up', {
      event_category: 'authentication',
      method: method,
    });
  },
};

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: any
    ) => void;
  }
}
