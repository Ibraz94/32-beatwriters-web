import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './services/authApi'
import { playersApi } from './services/playersApi'
import { teamsApi } from './services/teamsApi'
import { articlesApi } from './services/articlesApi'
import { podcastApi } from './services/podcastApi'
import { faqsApi } from './services/faqsApi'
import { toolsApi } from './services/toolsApi'
import { subscriptionApi } from './services/subscriptionApi'
import { contactApi } from './services/contactApi'
import { beatWritersApi } from './services/beatWritersApi'
import authSlice from './features/authSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [authApi.reducerPath]: authApi.reducer,
    [playersApi.reducerPath]: playersApi.reducer,
    [teamsApi.reducerPath]: teamsApi.reducer,
    [articlesApi.reducerPath]: articlesApi.reducer,
    [podcastApi.reducerPath]: podcastApi.reducer,
    [faqsApi.reducerPath]: faqsApi.reducer,
    [toolsApi.reducerPath]: toolsApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [beatWritersApi.reducerPath]: beatWritersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      authApi.middleware,
      playersApi.middleware,
      teamsApi.middleware,
      articlesApi.middleware,
      podcastApi.middleware,
      faqsApi.middleware,
      toolsApi.middleware,
      subscriptionApi.middleware,
      contactApi.middleware,
      beatWritersApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 