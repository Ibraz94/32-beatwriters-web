import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RookiePlayer, TierHeading } from '../services/rookieBoardApi'

// State interface for the rookie board
export interface RookieBoardState {
  // Current rankings data (notes are embedded in rankings)
  rankings: RookiePlayer[]
  tiers: TierHeading[]
  
  // Optimistic update tracking
  pendingRankings: RookiePlayer[] | null
  pendingTiers: TierHeading[] | null
  
  // Save state
  isSaving: boolean
  saveError: string | null
  
  // Loading state
  isLoading: boolean
  error: string | null
}

const initialState: RookieBoardState = {
  rankings: [],
  tiers: [],
  pendingRankings: null,
  pendingTiers: null,
  isSaving: false,
  saveError: null,
  isLoading: false,
  error: null,
}

const rookieBoardSlice = createSlice({
  name: 'rookieBoard',
  initialState,
  reducers: {
    // Set initial data from API (notes are now embedded in rankings)
    setRankingsData: (
      state,
      action: PayloadAction<{
        rankings: RookiePlayer[]
        tiers: TierHeading[]
      }>
    ) => {
      state.rankings = action.payload.rankings
      state.tiers = action.payload.tiers
      state.pendingRankings = null
      state.pendingTiers = null
      state.isLoading = false
      state.error = null
    },

    // Loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    // Error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },

    // Optimistic player reorder
    optimisticPlayerReorder: (
      state,
      action: PayloadAction<{ playerId: number; newRank: number }>
    ) => {
      const { playerId, newRank } = action.payload
      
      // Store current state for potential rollback
      if (!state.pendingRankings) {
        state.pendingRankings = [...state.rankings]
      }

      // Find the player being moved
      const playerIndex = state.rankings.findIndex((p) => p.id === playerId)
      if (playerIndex === -1) return

      const player = state.rankings[playerIndex]
      const oldRank = player.rank

      if (oldRank === newRank) return

      // Create a new array for reordering
      const updatedRankings = [...state.rankings]
      
      // Remove player from old position
      updatedRankings.splice(playerIndex, 1)
      
      // Insert at new position
      const newIndex = updatedRankings.findIndex((p) => p.rank >= newRank)
      if (newIndex === -1) {
        updatedRankings.push(player)
      } else {
        updatedRankings.splice(newIndex, 0, player)
      }
      
      // Update ranks for all affected players
      updatedRankings.forEach((p, index) => {
        p.rank = index + 1
      })

      state.rankings = updatedRankings
      state.isSaving = true
      state.saveError = null
    },

    // Confirm player reorder (after successful API call)
    confirmPlayerReorder: (state) => {
      state.pendingRankings = null
      state.isSaving = false
      state.saveError = null
    },

    // Rollback player reorder (on API error)
    rollbackPlayerReorder: (state, action: PayloadAction<string>) => {
      if (state.pendingRankings) {
        state.rankings = state.pendingRankings
        state.pendingRankings = null
      }
      state.isSaving = false
      state.saveError = action.payload
    },

    // Optimistic tier move
    optimisticTierMove: (
      state,
      action: PayloadAction<{ tierId: string; newPosition: number }>
    ) => {
      const { tierId, newPosition } = action.payload
      
      // Store current state for potential rollback
      if (!state.pendingTiers) {
        state.pendingTiers = [...state.tiers]
      }

      // Find the tier being moved
      const tierIndex = state.tiers.findIndex((t) => t.id === tierId)
      if (tierIndex === -1) return

      const tier = state.tiers[tierIndex]
      const oldPosition = tier.position

      if (oldPosition === newPosition) return

      // Update tier position
      const updatedTiers = [...state.tiers]
      updatedTiers[tierIndex] = { ...tier, position: newPosition }

      state.tiers = updatedTiers
      state.isSaving = true
      state.saveError = null
    },

    // Confirm tier move (after successful API call)
    confirmTierMove: (state) => {
      state.pendingTiers = null
      state.isSaving = false
      state.saveError = null
    },

    // Rollback tier move (on API error)
    rollbackTierMove: (state, action: PayloadAction<string>) => {
      if (state.pendingTiers) {
        state.tiers = state.pendingTiers
        state.pendingTiers = null
      }
      state.isSaving = false
      state.saveError = action.payload
    },

    // Update note (embedded in rankings array)
    updateNote: (
      state,
      action: PayloadAction<{ playerId: number; content: string }>
    ) => {
      const { playerId, content } = action.payload
      const playerIndex = state.rankings.findIndex((p) => p.id === playerId)
      if (playerIndex !== -1) {
        state.rankings[playerIndex].note = content
      }
    },

    // Delete note (embedded in rankings array)
    deleteNote: (state, action: PayloadAction<number>) => {
      const playerIndex = state.rankings.findIndex((p) => p.id === action.payload)
      if (playerIndex !== -1) {
        delete state.rankings[playerIndex].note
      }
    },

    // Clear save error
    clearSaveError: (state) => {
      state.saveError = null
    },

    // Set saving state
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload
    },

    // Reset state
    resetState: (state) => {
      return initialState
    },
  },
})

export const {
  setRankingsData,
  setLoading,
  setError,
  optimisticPlayerReorder,
  confirmPlayerReorder,
  rollbackPlayerReorder,
  optimisticTierMove,
  confirmTierMove,
  rollbackTierMove,
  updateNote,
  deleteNote,
  clearSaveError,
  setSaving,
  resetState,
} = rookieBoardSlice.actions

export default rookieBoardSlice.reducer

// Selectors
export const selectRankings = (state: { rookieBoard: RookieBoardState }) =>
  state.rookieBoard.rankings

export const selectTiers = (state: { rookieBoard: RookieBoardState }) =>
  state.rookieBoard.tiers

export const selectIsSaving = (state: { rookieBoard: RookieBoardState }) =>
  state.rookieBoard.isSaving

export const selectSaveError = (state: { rookieBoard: RookieBoardState }) =>
  state.rookieBoard.saveError

export const selectIsLoading = (state: { rookieBoard: RookieBoardState }) =>
  state.rookieBoard.isLoading

export const selectError = (state: { rookieBoard: RookieBoardState }) =>
  state.rookieBoard.error

export const selectHasPendingChanges = (state: { rookieBoard: RookieBoardState }) =>
  state.rookieBoard.pendingRankings !== null || state.rookieBoard.pendingTiers !== null
