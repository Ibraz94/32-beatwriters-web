import { useCallback } from 'react';
import { trackUserEngagement } from '../analytics/gtag';

/**
 * Custom hook for Google Analytics event tracking
 * Provides easy-to-use functions for tracking user interactions
 */
export const useAnalytics = () => {
  // Article tracking
  const trackArticleView = useCallback((articleId: string, title: string) => {
    trackUserEngagement.articleView(articleId, title);
  }, []);

  const trackArticleLike = useCallback((articleId: string, title: string) => {
    trackUserEngagement.articleLike(articleId, title);
  }, []);

  // Player tracking
  const trackPlayerView = useCallback((playerId: string, playerName: string) => {
    trackUserEngagement.playerView(playerId, playerName);
  }, []);

  const trackPlayerFollow = useCallback((playerId: string, playerName: string) => {
    trackUserEngagement.playerFollow(playerId, playerName);
  }, []);

  // Nugget tracking
  const trackNuggetView = useCallback((nuggetId: string) => {
    trackUserEngagement.nuggetView(nuggetId);
  }, []);

  const trackNuggetSave = useCallback((nuggetId: string) => {
    trackUserEngagement.nuggetSave(nuggetId);
  }, []);

  // Podcast tracking
  const trackPodcastPlay = useCallback((podcastId: string, title: string) => {
    trackUserEngagement.podcastPlay(podcastId, title);
  }, []);

  // Subscription tracking
  const trackSubscriptionStart = useCallback((plan: string) => {
    trackUserEngagement.subscriptionStart(plan);
  }, []);

  const trackSubscriptionComplete = useCallback((plan: string, value: number) => {
    trackUserEngagement.subscriptionComplete(plan, value);
  }, []);

  // Newsletter tracking
  const trackNewsletterSignup = useCallback((location: string) => {
    trackUserEngagement.newsletterSignup(location);
  }, []);

  // Search tracking
  const trackSearch = useCallback((searchTerm: string, resultCount: number) => {
    trackUserEngagement.search(searchTerm, resultCount);
  }, []);

  // Contact tracking
  const trackContactSubmit = useCallback(() => {
    trackUserEngagement.contactSubmit();
  }, []);

  // Discord tracking
  const trackDiscordConnect = useCallback(() => {
    trackUserEngagement.discordConnect();
  }, []);

  // Authentication tracking
  const trackUserLogin = useCallback((method: string) => {
    trackUserEngagement.userLogin(method);
  }, []);

  const trackUserRegister = useCallback((method: string) => {
    trackUserEngagement.userRegister(method);
  }, []);

  return {
    // Article events
    trackArticleView,
    trackArticleLike,
    
    // Player events
    trackPlayerView,
    trackPlayerFollow,
    
    // Nugget events
    trackNuggetView,
    trackNuggetSave,
    
    // Podcast events
    trackPodcastPlay,
    
    // Subscription events
    trackSubscriptionStart,
    trackSubscriptionComplete,
    
    // Newsletter events
    trackNewsletterSignup,
    
    // Search events
    trackSearch,
    
    // Contact events
    trackContactSubmit,
    
    // Discord events
    trackDiscordConnect,
    
    // Authentication events
    trackUserLogin,
    trackUserRegister,
  };
};
