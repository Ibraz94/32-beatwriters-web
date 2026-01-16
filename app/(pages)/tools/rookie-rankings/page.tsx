'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { useToast } from '@/app/components/Toast'
import { RookiePlayer, TierHeading } from '@/lib/services/rookieBoardApi'
import { 
  useGetUserRankingsQuery, 
  useReorderUserRankingMutation,
  useMoveTierMutation,
  useSaveNoteMutation,
  useDeleteNoteMutation,
  useCreateTierMutation,
  useUpdateTierMutation,
  useDeleteTierMutation,
} from '@/lib/services/rookieBoardApi'
import {
  setRankingsData,
  setLoading,
  setError,
  updateNote,
  selectRankings,
  selectTiers,
  selectIsSaving,
  selectSaveError,
  selectIsLoading,
  selectError,
  setSaving,
} from '@/lib/features/rookieBoardSlice'
import { Loader2 } from 'lucide-react'
import RankingTable from '@/app/components/rookie-board/RankingTable'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent
} from '@dnd-kit/core'
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable'

function RookieRankingBoardContent() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const dispatch = useAppDispatch()
  const { showToast } = useToast()

  // Track which player IDs are currently saving
  const [savingPlayerIds, setSavingPlayerIds] = useState<Set<number>>(new Set())
  
  // Redux state selectors
  const rankings = useAppSelector(selectRankings)
  const tiers = useAppSelector(selectTiers)
  const isSaving = useAppSelector(selectIsSaving)
  const saveError = useAppSelector(selectSaveError)
  const isLoadingState = useAppSelector(selectIsLoading)
  const errorState = useAppSelector(selectError)
  
  // Fetch user rankings or official rankings
  const { 
    data: rankingsData, 
    isLoading: isLoadingQuery, 
    error: queryError 
  } = useGetUserRankingsQuery(user?.id || '', {
    skip: !isAuthenticated || !user?.id,
  })

  // Mutations
  const [reorderUserRanking] = useReorderUserRankingMutation()
  const [moveTier] = useMoveTierMutation()
  const [saveNote] = useSaveNoteMutation()
  const [deleteNote] = useDeleteNoteMutation()
  const [createTier] = useCreateTierMutation()
  const [updateTier] = useUpdateTierMutation()
  const [deleteTier] = useDeleteTierMutation()

  // Helper function to transform and sort API response
  const transformAndSortResponse = useCallback((data: any) => {
    // Safety check for data structure
    if (!data || !data.rankings || !Array.isArray(data.rankings)) {
      console.error('Invalid data structure:', data)
      return {
        rankings: [],
        tiers: data?.tiers || []
      }
    }
    
    const notesMap = (data as any).notes || {}
    const rankingsWithNotes = data.rankings.slice(0, 36).map((player: RookiePlayer) => ({
      ...player,
      note: notesMap[player.id] || player.note || undefined
    }))
    
    // Sort by rank to ensure proper display order
    const sortedRankings = rankingsWithNotes.sort((a: RookiePlayer, b: RookiePlayer) => a.rank - b.rank)
    
    return {
      rankings: sortedRankings,
      tiers: data.tiers || []
    }
  }, [])

  // Update Redux state when data changes
  useEffect(() => {
    if (rankingsData?.data) {
      const transformed = transformAndSortResponse(rankingsData.data)
      dispatch(setRankingsData(transformed))
    }
  }, [rankingsData, dispatch, transformAndSortResponse])

  // Set loading state
  useEffect(() => {
    dispatch(setLoading(isLoadingQuery))
  }, [isLoadingQuery, dispatch])

  // Set error state
  useEffect(() => {
    if (queryError) {
      dispatch(setError('Failed to load rankings'))
    }
  }, [queryError, dispatch])

  // Player reorder handler - instant swap with optimistic update
  const handlePlayerReorder = useCallback(
    async (playerId: number, newRank: number) => {
      if (!user?.id) return

      // Store the IDs of both affected players before any operations
      let targetPlayerId: number | null = null
      
      // Optimistically swap players locally for instant feedback
      const currentRankings = [...rankings]
      const draggedPlayerIndex = currentRankings.findIndex(p => p.id === playerId)
      const targetPlayerIndex = currentRankings.findIndex(p => p.rank === newRank)
      
      if (draggedPlayerIndex !== -1 && targetPlayerIndex !== -1) {
        // Swap the two players
        const draggedPlayer = { ...currentRankings[draggedPlayerIndex] }
        const targetPlayer = { ...currentRankings[targetPlayerIndex] }
        
        // Store target player ID for cleanup
        targetPlayerId = targetPlayer.id
        
        const tempRank = draggedPlayer.rank
        draggedPlayer.rank = targetPlayer.rank
        targetPlayer.rank = tempRank
        
        currentRankings[draggedPlayerIndex] = draggedPlayer
        currentRankings[targetPlayerIndex] = targetPlayer
        
        // Sort by rank and update state immediately
        const sortedRankings = currentRankings.sort((a, b) => a.rank - b.rank)
        dispatch(setRankingsData({ rankings: sortedRankings, tiers }))
        
        // Mark both players as saving
        setSavingPlayerIds(prev => new Set(prev).add(draggedPlayer.id).add(targetPlayer.id))
      }

      try {
        const result = await reorderUserRanking({
          userId: user.id,
          playerId,
          newRank,
        }).unwrap()
        
        // Update state with full response to ensure tiers are in sync
        if (result?.data) {
          const transformed = transformAndSortResponse(result.data)
          dispatch(setRankingsData(transformed))
        }
        
        showToast('Ranking saved successfully', 'success', 2000)
      } catch (err: any) {
        console.error('Failed to save ranking:', err)
        
        // Revert to original state on error
        const transformed = transformAndSortResponse(rankingsData?.data || { rankings: [], tiers: [] })
        dispatch(setRankingsData(transformed))
        
        // Handle errors
        if (err?.status === 429) {
          showToast('Too many requests. Please wait a moment.', 'error', 3000)
        } else if (err?.status === 400) {
          showToast('Invalid ranking update. Please refresh the page.', 'error', 3000)
        } else if (err?.status === 403) {
          showToast('You do not have permission to update rankings.', 'error', 3000)
        } else {
          showToast('Failed to save ranking. Please try again.', 'error', 3000)
        }
      } finally {
        // Clear saving state for both players
        setSavingPlayerIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(playerId)
          if (targetPlayerId) {
            newSet.delete(targetPlayerId)
          }
          return newSet
        })
      }
    },
    [user?.id, dispatch, reorderUserRanking, transformAndSortResponse, showToast, rankings, tiers, rankingsData]
  )

  // Tier move handler - instant update
  const handleTierMove = useCallback(
    async (tierId: string, newPosition: number) => {
      if (!user?.id) return

      try {
        dispatch(setSaving(true))
        
        const result = await moveTier({
          userId: user.id,
          tierId,
          newPosition,
        }).unwrap()
        
        // Update state with full response to ensure everything is in sync
        if (result?.data) {
          const transformed = transformAndSortResponse(result.data)
          dispatch(setRankingsData(transformed))
        }
        
        dispatch(setSaving(false))
        showToast('Tier moved successfully', 'success', 2000)
      } catch (err: any) {
        console.error('Failed to move tier:', err)
        dispatch(setSaving(false))
        
        // Handle errors
        if (err?.status === 429) {
          showToast('Too many requests. Please wait a moment.', 'error', 3000)
        } else if (err?.status === 400) {
          showToast('Invalid tier position. Please refresh the page.', 'error', 3000)
        } else if (err?.status === 403) {
          showToast('You do not have permission to move tiers.', 'error', 3000)
        } else {
          showToast('Failed to move tier. Please try again.', 'error', 3000)
        }
      }
    },
    [user?.id, dispatch, moveTier, transformAndSortResponse, showToast]
  )

  // Note save handler
  const handleSaveNote = useCallback(
    async (playerId: number, content: string) => {
      if (!user?.id) return

      try {
        const result = await saveNote({
          userId: user.id,
          playerId,
          content,
        }).unwrap()
        
        showToast('Note saved successfully', 'success', 3000)
        
        // Update local state with the full response including updated tiers
        try {
          if (result?.data && result.data.rankings && Array.isArray(result.data.rankings) && result.data.rankings.length > 0) {
            // Only update if we have valid rankings data
            const transformed = transformAndSortResponse(result.data)
            dispatch(setRankingsData(transformed))
          } else {
            // Fallback to just updating the note locally if no full response
            dispatch(updateNote({ playerId, content }))
          }
        } catch (updateErr) {
          console.error('Failed to update local state:', updateErr)
          // Fallback to just updating the note locally
          dispatch(updateNote({ playerId, content }))
        }
      } catch (err) {
        console.error('Failed to save note:', err)
        showToast('Failed to save note. Please try again.', 'error', 3000)
      }
    },
    [user?.id, saveNote, dispatch, showToast, transformAndSortResponse]
  )

  // Note delete handler
  const handleDeleteNote = useCallback(
    async (playerId: number) => {
      if (!user?.id) return

      try {
        const result = await deleteNote({
          userId: user.id,
          playerId,
        }).unwrap()
        
        showToast('Note deleted successfully', 'success', 3000)
        
        // Update local state with the full response including updated tiers
        try {
          if (result?.data && result.data.rankings && Array.isArray(result.data.rankings) && result.data.rankings.length > 0) {
            // Only update if we have valid rankings data
            const transformed = transformAndSortResponse(result.data)
            dispatch(setRankingsData(transformed))
          } else {
            // Fallback to just removing the note locally if no full response
            dispatch(updateNote({ playerId, content: '' }))
          }
        } catch (updateErr) {
          console.error('Failed to update local state:', updateErr)
          // Fallback to just removing the note locally
          dispatch(updateNote({ playerId, content: '' }))
        }
      } catch (err) {
        console.error('Failed to delete note:', err)
        showToast('Failed to delete note. Please try again.', 'error', 3000)
      }
    },
    [user?.id, deleteNote, dispatch, showToast, transformAndSortResponse]
  )

  // Tier creation handler
  const handleCreateTier = useCallback(
    async (name: string, position: number) => {
      if (!user?.id) return

      try {
        dispatch(setSaving(true))
        
        const result = await createTier({
          userId: user.id,
          name,
          position,
        }).unwrap()
        
        console.log('Create tier result:', result)
        
        showToast('Tier created successfully', 'success', 2000)
        
        // Optimistically add the new tier to local state
        // The API returns {success, message, data: {tier object}}
        const tierData = (result as any)?.data || result
        
        if (tierData && typeof tierData === 'object' && 'id' in tierData && 'name' in tierData && 'position' in tierData) {
          const newTier = tierData as TierHeading
          
          dispatch(setRankingsData({
            rankings: rankings,
            tiers: [...tiers, newTier].sort((a, b) => a.position - b.position)
          }))
        } else {
          console.error('API did not return tier with ID:', result)
          showToast('Tier created but may not appear correctly. Please refresh.', 'warning', 3000)
        }
        
        dispatch(setSaving(false))
      } catch (err) {
        console.error('Failed to create tier:', err)
        dispatch(setSaving(false))
        showToast('Failed to create tier. Please try again.', 'error', 3000)
      }
    },
    [user?.id, createTier, dispatch, showToast, transformAndSortResponse]
  )

  // Tier assignment handler - creates a copy of the tier at the player's position
  const handleAssignToTier = useCallback(
    async (playerId: number, tierId: string) => {
      if (!user?.id) return

      try {
        dispatch(setSaving(true))
        
        // Find the player and tier
        const player = rankings.find(p => p.id === playerId)
        const tier = tiers.find(t => t.id === tierId)
        
        if (!player) {
          throw new Error('Player not found')
        }
        if (!tier) {
          throw new Error('Tier not found')
        }
        
        // Create a new tier with the same name at the player's position
        // Use player.rank - 0.5 to position the tier between the previous player and this one
        const newTierPosition = player.rank > 1 ? player.rank - 0.5 : player.rank
        
        console.log('Creating tier copy', tier.name, 'at position', newTierPosition, 'for player', playerId, 'at rank', player.rank)
        
        const result = await createTier({
          userId: user.id,
          name: tier.name,
          position: newTierPosition,
        }).unwrap()
        
        showToast('Tier added successfully', 'success', 2000)
        
        // Optimistically add the new tier to local state
        // The API returns {success, message, data: {tier object}}
        const tierData = (result as any)?.data || result
        
        if (tierData && typeof tierData === 'object' && 'id' in tierData && 'name' in tierData && 'position' in tierData) {
          const newTier = tierData as TierHeading
          
          dispatch(setRankingsData({
            rankings: rankings,
            tiers: [...tiers, newTier].sort((a, b) => a.position - b.position)
          }))
        } else {
          console.error('API did not return tier with ID:', result)
          showToast('Tier added but may not appear correctly. Please refresh.', 'warning', 3000)
        }
        
        dispatch(setSaving(false))
      } catch (err: any) {
        console.error('Failed to add tier to player:', err)
        console.error('Error details:', JSON.stringify(err, null, 2))
        dispatch(setSaving(false))
        showToast('Failed to add tier. Please try again.', 'error', 3000)
      }
    },
    [user?.id, createTier, dispatch, transformAndSortResponse, showToast, tiers, rankings]
  )

  // Tier rename handler
  const handleRenameTier = useCallback(
    async (tierId: string, newName: string) => {
      if (!user?.id) return

      try {
        dispatch(setSaving(true))
        
        await updateTier({
          userId: user.id,
          tierId,
          name: newName,
        }).unwrap()
        
        // Optimistically update the tier name in local state
        const updatedTiers = tiers.map(t => 
          t.id === tierId ? { ...t, name: newName } : t
        )
        
        dispatch(setRankingsData({
          rankings: rankings,
          tiers: updatedTiers
        }))
        
        dispatch(setSaving(false))
        showToast('Tier renamed successfully', 'success', 2000)
      } catch (err) {
        console.error('Failed to rename tier:', err)
        dispatch(setSaving(false))
        showToast('Failed to rename tier. Please try again.', 'error', 3000)
        throw err
      }
    },
    [user?.id, updateTier, dispatch, showToast, tiers, rankings]
  )

  // Tier delete handler
  const handleDeleteTier = useCallback(
    async (tierId: string) => {
      if (!user?.id) return

      try {
        await deleteTier({
          userId: user.id,
          tierId,
        }).unwrap()
        
        showToast('Tier deleted successfully', 'success', 2000)
        
        // Optimistically remove the tier from local state
        const updatedTiers = tiers.filter(t => t.id !== tierId)
        
        dispatch(setRankingsData({
          rankings: rankings,
          tiers: updatedTiers
        }))
        
        dispatch(setSaving(false))
      } catch (err) {
        console.error('Failed to delete tier:', err)
        dispatch(setSaving(false))
        showToast('Failed to delete tier. Please try again.', 'error', 3000)
      }
    },
    [user?.id, deleteTier, dispatch, showToast, tiers, rankings]
  )

  // Initialize drag-and-drop with dnd-kit
  const [dragState, setDragState] = useState<{
    activeId: string | null
    activeItem: RookiePlayer | TierHeading | null
    activeType: 'player' | 'tier' | null
  }>({
    activeId: null,
    activeItem: null,
    activeType: null,
  })

  // Sort players by rank for display
  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Create sortable IDs for players only (tiers are not draggable)
  const allIds = sortedRankings.map((p) => `player-${p.id}`)

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeId = active.id as string

    if (activeId.startsWith('player-')) {
      const playerId = parseInt(activeId.replace('player-', ''))
      const player = sortedRankings.find((p) => p.id === playerId)
      if (player) {
        setDragState({
          activeId,
          activeItem: player,
          activeType: 'player',
        })
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setDragState({
      activeId: null,
      activeItem: null,
      activeType: null,
    })

    if (!over || active.id === over.id) {
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Handle player reordering only
    if (activeId.startsWith('player-') && overId.startsWith('player-')) {
      const activePlayerId = parseInt(activeId.replace('player-', ''))
      const overPlayerId = parseInt(overId.replace('player-', ''))

      const activePlayer = sortedRankings.find((p) => p.id === activePlayerId)
      const overPlayer = sortedRankings.find((p) => p.id === overPlayerId)

      if (activePlayer && overPlayer && activePlayer.rank !== overPlayer.rank) {
        await handlePlayerReorder(activePlayerId, overPlayer.rank)
      }
    }
  }

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">
            Rookie Ranking Board
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-[#C7C8CB]">
            Checking authentication...
          </p>
        </div>

        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin text-[#E64A30]" />
        </div>
      </section>
    )
  }

  // Show paywall if not authenticated or has insufficient membership
  if (!isAuthenticated || (user?.memberships && user.memberships.id !== undefined && user.memberships.id < 2)) {
    return (
      <div className="container mx-auto h-screen px-4 py-8 flex flex-col items-center justify-center">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Premium Access Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {!isAuthenticated
              ? "Please login to your account to access the Rookie Ranking Board. Don't have a subscription? Please subscribe to access premium content."
              : "Please upgrade to a premium subscription to access the Rookie Ranking Board."
            }
          </p>

          {!isAuthenticated && (
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              <Link href={{
                pathname: '/login',
                query: { redirect: pathname }
              }} className="text-[#E64A30] hover:text-[#E64A30]/90 font-semibold">Login</Link>
            </p>
          )}
          <Link
            href="/subscribe"
            className="bg-[#E64A30] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#E64A30]/90 transition-colors"
          >
            Subscribe
          </Link>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoadingState || isLoadingQuery) {
    return (
      <section className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">
            Rookie Ranking Board
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-[#C7C8CB]">
            Loading rankings...
          </p>
        </div>

        <div className="bg-white dark:bg-[#262829] rounded-xl shadow-lg overflow-hidden min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#E64A30]" />
        </div>
      </section>
    )
  }

  // Error state
  if (errorState || queryError) {
    return (
      <section className="container mx-auto max-w-sm px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">
            Rookie Ranking Board
          </h1>
          <div className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-xl text-red-600 dark:text-red-400 mb-2 font-semibold">
              Failed to load rankings
            </p>
            <p className="text-gray-600 dark:text-[#C7C8CB] mb-6">
              {errorState || 'An error occurred while loading the ranking board. Please try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#E64A30] text-white px-6 py-2 rounded-full hover:scale-105 transition-transform font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div>
      {/* Header Section */}
      <section className="container mx-auto max-w-xl px-2 sm:px-3 py-4 sm:py-8">
        <div className="relative">
          <div className="text-center mb-4 sm:mb-8">
            <h1 className="text-2xl leading-7 mb-2 sm:text-2xl sm:leading-8 sm:mb-4 md:text-5xl md:leading-14">
              Rookie Ranking Board
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 dark:text-[#C7C8CB] px-2">
              Organize rookies ranking board by dragging and dropping players.
            </p>
          </div>
        </div>

        {/* Ranking Table */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={allIds} strategy={verticalListSortingStrategy}>
            <div className="bg-white dark:bg-[#262829] rounded-lg sm:rounded-xl shadow-lg overflow-hidden mx-auto max-w-3xl">
              <RankingTable 
                players={sortedRankings}
                tiers={tiers}
                dragState={dragState}
                savingPlayerIds={savingPlayerIds}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
                onCreateTier={handleCreateTier}
                onAssignToTier={handleAssignToTier}
                onRenameTier={handleRenameTier}
                onDeleteTier={handleDeleteTier}
              />
            </div>
          </SortableContext>
        </DndContext>
      </section>
    </div>
  )
}

export default function RookieRankingBoard() {
  return <RookieRankingBoardContent />
}

