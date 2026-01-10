import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TierHeading } from '../services/rookieBoardApi'

// State interface for tier management
export interface TierManagementState {
  // Current tiers
  tiers: TierHeading[]
  
  // Tier CRUD operation states
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // Error tracking for operations
  createError: string | null
  updateError: string | null
  deleteError: string | null
  
  // Pending tier for optimistic updates
  pendingTier: TierHeading | null
  
  // Track which tier is being edited
  editingTierId: string | null
}

const initialState: TierManagementState = {
  tiers: [],
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  createError: null,
  updateError: null,
  deleteError: null,
  pendingTier: null,
  editingTierId: null,
}

const tierManagementSlice = createSlice({
  name: 'tierManagement',
  initialState,
  reducers: {
    // Set tiers from API
    setTiers: (state, action: PayloadAction<TierHeading[]>) => {
      state.tiers = action.payload
      state.pendingTier = null
    },

    // Start creating tier
    startCreatingTier: (state) => {
      state.isCreating = true
      state.createError = null
    },

    // Optimistic tier creation
    optimisticCreateTier: (state, action: PayloadAction<TierHeading>) => {
      state.tiers.push(action.payload)
      state.pendingTier = action.payload
      state.isCreating = true
      state.createError = null
    },

    // Confirm tier creation (after successful API call)
    confirmCreateTier: (state, action: PayloadAction<TierHeading>) => {
      // Replace the optimistic tier with the actual tier from API
      if (state.pendingTier) {
        const index = state.tiers.findIndex((t) => t.id === state.pendingTier!.id)
        if (index !== -1) {
          state.tiers[index] = action.payload
        }
      }
      state.pendingTier = null
      state.isCreating = false
      state.createError = null
    },

    // Rollback tier creation (on API error)
    rollbackCreateTier: (state, action: PayloadAction<string>) => {
      if (state.pendingTier) {
        state.tiers = state.tiers.filter((t) => t.id !== state.pendingTier!.id)
        state.pendingTier = null
      }
      state.isCreating = false
      state.createError = action.payload
    },

    // Start updating tier
    startUpdatingTier: (state, action: PayloadAction<string>) => {
      state.isUpdating = true
      state.updateError = null
      state.editingTierId = action.payload
    },

    // Optimistic tier update
    optimisticUpdateTier: (
      state,
      action: PayloadAction<{ tierId: string; updates: Partial<TierHeading> }>
    ) => {
      const { tierId, updates } = action.payload
      const tierIndex = state.tiers.findIndex((t) => t.id === tierId)
      
      if (tierIndex !== -1) {
        // Store the original tier for potential rollback
        state.pendingTier = { ...state.tiers[tierIndex] }
        
        // Apply updates
        state.tiers[tierIndex] = {
          ...state.tiers[tierIndex],
          ...updates,
        }
      }
      
      state.isUpdating = true
      state.updateError = null
    },

    // Confirm tier update (after successful API call)
    confirmUpdateTier: (state) => {
      state.pendingTier = null
      state.isUpdating = false
      state.updateError = null
      state.editingTierId = null
    },

    // Rollback tier update (on API error)
    rollbackUpdateTier: (state, action: PayloadAction<string>) => {
      if (state.pendingTier) {
        const tierIndex = state.tiers.findIndex((t) => t.id === state.pendingTier!.id)
        if (tierIndex !== -1) {
          state.tiers[tierIndex] = state.pendingTier
        }
        state.pendingTier = null
      }
      state.isUpdating = false
      state.updateError = action.payload
      state.editingTierId = null
    },

    // Start deleting tier
    startDeletingTier: (state) => {
      state.isDeleting = true
      state.deleteError = null
    },

    // Optimistic tier deletion
    optimisticDeleteTier: (state, action: PayloadAction<string>) => {
      const tierId = action.payload
      const tier = state.tiers.find((t) => t.id === tierId)
      
      if (tier) {
        // Store the tier for potential rollback
        state.pendingTier = tier
        
        // Remove tier from list
        state.tiers = state.tiers.filter((t) => t.id !== tierId)
      }
      
      state.isDeleting = true
      state.deleteError = null
    },

    // Confirm tier deletion (after successful API call)
    confirmDeleteTier: (state) => {
      state.pendingTier = null
      state.isDeleting = false
      state.deleteError = null
    },

    // Rollback tier deletion (on API error)
    rollbackDeleteTier: (state, action: PayloadAction<string>) => {
      if (state.pendingTier) {
        // Restore the deleted tier
        state.tiers.push(state.pendingTier)
        // Sort by position to maintain order
        state.tiers.sort((a, b) => a.position - b.position)
        state.pendingTier = null
      }
      state.isDeleting = false
      state.deleteError = action.payload
    },

    // Update tier position (for drag-and-drop)
    updateTierPosition: (
      state,
      action: PayloadAction<{ tierId: string; newPosition: number }>
    ) => {
      const { tierId, newPosition } = action.payload
      const tierIndex = state.tiers.findIndex((t) => t.id === tierId)
      
      if (tierIndex !== -1) {
        state.tiers[tierIndex].position = newPosition
        // Re-sort tiers by position
        state.tiers.sort((a, b) => a.position - b.position)
      }
    },

    // Clear errors
    clearCreateError: (state) => {
      state.createError = null
    },

    clearUpdateError: (state) => {
      state.updateError = null
    },

    clearDeleteError: (state) => {
      state.deleteError = null
    },

    // Set editing tier
    setEditingTier: (state, action: PayloadAction<string | null>) => {
      state.editingTierId = action.payload
    },

    // Reset state
    resetTierManagement: (state) => {
      return initialState
    },
  },
})

export const {
  setTiers,
  startCreatingTier,
  optimisticCreateTier,
  confirmCreateTier,
  rollbackCreateTier,
  startUpdatingTier,
  optimisticUpdateTier,
  confirmUpdateTier,
  rollbackUpdateTier,
  startDeletingTier,
  optimisticDeleteTier,
  confirmDeleteTier,
  rollbackDeleteTier,
  updateTierPosition,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  setEditingTier,
  resetTierManagement,
} = tierManagementSlice.actions

export default tierManagementSlice.reducer

// Selectors
export const selectTiers = (state: { tierManagement: TierManagementState }) =>
  state.tierManagement.tiers

export const selectIsCreating = (state: { tierManagement: TierManagementState }) =>
  state.tierManagement.isCreating

export const selectIsUpdating = (state: { tierManagement: TierManagementState }) =>
  state.tierManagement.isUpdating

export const selectIsDeleting = (state: { tierManagement: TierManagementState }) =>
  state.tierManagement.isDeleting

export const selectCreateError = (state: { tierManagement: TierManagementState }) =>
  state.tierManagement.createError

export const selectUpdateError = (state: { tierManagement: TierManagementState }) =>
  state.tierManagement.updateError

export const selectDeleteError = (state: { tierManagement: TierManagementState }) =>
  state.tierManagement.deleteError

export const selectEditingTierId = (state: { tierManagement: TierManagementState }) =>
  state.tierManagement.editingTierId

export const selectHasPendingTierOperation = (state: { tierManagement: TierManagementState }) =>
  state.tierManagement.pendingTier !== null

export const selectTierById = (tierId: string) => (state: { tierManagement: TierManagementState }) =>
  state.tierManagement.tiers.find((t) => t.id === tierId)

export const selectTiersByPosition = (state: { tierManagement: TierManagementState }) =>
  [...state.tierManagement.tiers].sort((a, b) => a.position - b.position)
