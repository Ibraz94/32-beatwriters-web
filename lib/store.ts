import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './services/authApi'
import { playersApi } from './services/playersApi'
import { teamsApi } from './services/teamsApi'
import { articlesApi } from './services/articlesApi'
import { podcastApi } from './services/podcastApi'
import { nuggetsApi } from './services/nuggetsApi'
import { toolsApi } from './services/toolsApi'
import { subscriptionApi } from './services/subscriptionApi'
import { contactApi } from './services/contactApi'
import { beatWritersApi } from './services/beatWritersApi'
import { discordApi } from './services/discordApi'
import { bettingApi } from './services/bettingApi'
import authSlice from './features/authSlice'
import { playerProfilerApi } from './services/playersApi'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [authApi.reducerPath]: authApi.reducer,
    [playersApi.reducerPath]: playersApi.reducer,
    [teamsApi.reducerPath]: teamsApi.reducer,
    [articlesApi.reducerPath]: articlesApi.reducer,
    [podcastApi.reducerPath]: podcastApi.reducer,
    [nuggetsApi.reducerPath]: nuggetsApi.reducer,
    [toolsApi.reducerPath]: toolsApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [beatWritersApi.reducerPath]: beatWritersApi.reducer,
    [discordApi.reducerPath]: discordApi.reducer,
    [bettingApi.reducerPath]: bettingApi.reducer,
    [playerProfilerApi.reducerPath]: playerProfilerApi.reducer,
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
      nuggetsApi.middleware,
      toolsApi.middleware,
      subscriptionApi.middleware,
      contactApi.middleware,
      beatWritersApi.middleware,
      discordApi.middleware,
      bettingApi.middleware,
      playerProfilerApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppStore = typeof store 