'use client'

import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { RookiePlayer, TierHeading } from '@/lib/services/rookieBoardApi'

interface TierSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  player: RookiePlayer
  tiers: TierHeading[]
  onCreateTier: (name: string, position: number) => Promise<void>
  onAssignToTier: (tierId: string) => void
}

export default function TierSelectionModal({
  isOpen,
  onClose,
  player,
  tiers,
  onCreateTier,
  onAssignToTier,
}: TierSelectionModalProps) {
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newTierName, setNewTierName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateTier = async () => {
    if (!newTierName.trim()) {
      setError('Please enter a tier name')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      // Create tier at the player's current position
      await onCreateTier(newTierName.trim(), player.rank)
      setNewTierName('')
      setIsCreatingNew(false)
      onClose()
    } catch (err) {
      console.error('Failed to create tier:', err)
      setError('Failed to create tier. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectTier = (tierId: string) => {
    onAssignToTier(tierId)
    onClose()
  }

  const handleCancel = () => {
    setNewTierName('')
    setIsCreatingNew(false)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#262829] rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-[#1D212D] dark:text-white">
              Add to Tier
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {player.name}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isCreatingNew ? (
            <div className="space-y-2">
              {/* Existing tiers */}
              {tiers.length > 0 ? (
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Select an existing tier:
                  </p>
                  {tiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => handleSelectTier(tier.id)}
                      className="w-full p-3 text-left bg-gray-50 dark:bg-[#1F2128] hover:bg-gray-100 dark:hover:bg-[#2F3235] rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-[#1D212D] dark:text-white font-medium">
                        {tier.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  No tiers available. Create a new one below.
                </p>
              )}

              {/* Create new tier button */}
              <button
                onClick={() => setIsCreatingNew(true)}
                className="w-full p-3 flex items-center justify-center gap-2 bg-[#E64A30] text-white rounded-lg hover:bg-[#D43A20] transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Tier</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tier Name
                </label>
                <input
                  type="text"
                  value={newTierName}
                  onChange={(e) => setNewTierName(e.target.value)}
                  placeholder="e.g., Elite Prospects, Tier 1"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1F2128] text-[#1D212D] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E64A30] focus:border-transparent"
                  disabled={isCreating}
                  autoFocus
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setIsCreatingNew(false)
                    setNewTierName('')
                    setError(null)
                  }}
                  disabled={isCreating}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateTier}
                  disabled={isCreating || !newTierName.trim()}
                  className="px-6 py-2 bg-[#E64A30] text-white rounded-lg hover:bg-[#D43A20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Tier'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
