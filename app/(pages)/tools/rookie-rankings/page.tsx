'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  setTiers,
} from '@/lib/features/tierManagementSlice'
import { Loader2 } from 'lucide-react'
import RankingTable from '@/app/components/rookie-board/RankingTable'
import { RankingTableSkeleton } from '@/app/components/rookie-board/SkeletonLoader'
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
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const dispatch = useAppDispatch()
  const { showToast } = useToast()

  // Authentication guard - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isAuthLoading, router])
  
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
    const notesMap = (data as any).notes || {}
    const rankingsWithNotes = data.rankings.slice(0, 36).map((player: RookiePlayer) => ({
      ...player,
      note: notesMap[player.id] || player.note || undefined
    }))
    
    // Sort by rank to ensure proper display order
    const sortedRankings = rankingsWithNotes.sort((a: RookiePlayer, b: RookiePlayer) => a.rank - b.rank)
    
    return {
      rankings: sortedRankings,
      tiers: data.tiers
    }
  }, [])

  // Update Redux state when data changes
  useEffect(() => {
    if (rankingsData?.data) {
      const transformed = transformAndSortResponse(rankingsData.data)
      dispatch(setRankingsData(transformed))
      dispatch(setTiers(transformed.tiers))
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

      // Optimistically swap players locally for instant feedback
      const currentRankings = [...rankings]
      const draggedPlayerIndex = currentRankings.findIndex(p => p.id === playerId)
      const targetPlayerIndex = currentRankings.findIndex(p => p.rank === newRank)
      
      if (draggedPlayerIndex !== -1 && targetPlayerIndex !== -1) {
        // Swap the two players
        const draggedPlayer = { ...currentRankings[draggedPlayerIndex] }
        const targetPlayer = { ...currentRankings[targetPlayerIndex] }
        
        const tempRank = draggedPlayer.rank
        draggedPlayer.rank = targetPlayer.rank
        targetPlayer.rank = tempRank
        
        currentRankings[draggedPlayerIndex] = draggedPlayer
        currentRankings[targetPlayerIndex] = targetPlayer
        
        // Sort by rank and update state immediately
        const sortedRankings = currentRankings.sort((a, b) => a.rank - b.rank)
        dispatch(setRankingsData({ rankings: sortedRankings, tiers }))
      }

      try {
        dispatch(setSaving(true))
        
        const result = await reorderUserRanking({
          userId: user.id,
          playerId,
          newRank,
        }).unwrap()
        
        // Update state with full response to ensure tiers are in sync
        if (result?.data) {
          const transformed = transformAndSortResponse(result.data)
          dispatch(setRankingsData(transformed))
          dispatch(setTiers(transformed.tiers))
        }
        
        dispatch(setSaving(false))
        showToast('Ranking saved successfully', 'success', 2000)
      } catch (err: any) {
        console.error('Failed to save ranking:', err)
        dispatch(setSaving(false))
        
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
          dispatch(setTiers(transformed.tiers))
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
        
        // Update local state with the full response including updated tiers
        if (result?.data) {
          const transformed = transformAndSortResponse(result.data)
          dispatch(setRankingsData(transformed))
          dispatch(setTiers(transformed.tiers))
        } else {
          // Fallback to just updating the note if no full response
          dispatch(updateNote({ playerId, content }))
        }
        
        showToast('Note saved successfully', 'success', 3000)
      } catch (err) {
        console.error('Failed to save note:', err)
        throw err // Re-throw to let the modal handle the error
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
        
        // Update local state with the full response including updated tiers
        if (result?.data) {
          const transformed = transformAndSortResponse(result.data)
          dispatch(setRankingsData(transformed))
          dispatch(setTiers(transformed.tiers))
        } else {
          // Fallback to just removing the note if no full response
          dispatch(updateNote({ playerId, content: '' }))
        }
        
        showToast('Note deleted successfully', 'success', 3000)
      } catch (err) {
        console.error('Failed to delete note:', err)
        throw err // Re-throw to let the modal handle the error
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
        
        // Update with full response from API
        if (result?.data) {
          const transformed = transformAndSortResponse(result.data)
          dispatch(setRankingsData(transformed))
          dispatch(setTiers(transformed.tiers))
          
          showToast('Tier created successfully', 'success', 2000)
        }
        
        dispatch(setSaving(false))
      } catch (err) {
        console.error('Failed to create tier:', err)
        dispatch(setSaving(false))
        showToast('Failed to create tier. Please try again.', 'error', 3000)
        throw err // Re-throw to let the modal handle the error
      }
    },
    [user?.id, createTier, dispatch, showToast, transformAndSortResponse]
  )

  // Tier assignment handler
  const handleAssignToTier = useCallback(
    async (playerId: number, tierId: string) => {
      if (!user?.id) return

      try {
        dispatch(setSaving(true))
        
        const result = await updateTier({
          userId: user.id,
          tierId,
          position: playerId,
        }).unwrap()
        
        // Update with full response from API
        if (result?.data) {
          const transformed = transformAndSortResponse(result.data)
          dispatch(setRankingsData(transformed))
          dispatch(setTiers(transformed.tiers))
        }
        
        dispatch(setSaving(false))
        showToast('Player assigned to tier successfully', 'success', 2000)
      } catch (err) {
        console.error('Failed to assign player to tier:', err)
        dispatch(setSaving(false))
        showToast('Failed to assign player to tier. Please try again.', 'error', 3000)
      }
    },
    [user?.id, updateTier, dispatch, transformAndSortResponse, showToast]
  )

  // Tier rename handler
  const handleRenameTier = useCallback(
    async (tierId: string, newName: string) => {
      if (!user?.id) return

      try {
        dispatch(setSaving(true))
        
        const result = await updateTier({
          userId: user.id,
          tierId,
          name: newName,
        }).unwrap()
        
        // Update with full response from API
        if (result?.data) {
          const transformed = transformAndSortResponse(result.data)
          dispatch(setRankingsData(transformed))
          dispatch(setTiers(transformed.tiers))
        }
        
        dispatch(setSaving(false))
        showToast('Tier renamed successfully', 'success', 2000)
      } catch (err) {
        console.error('Failed to rename tier:', err)
        dispatch(setSaving(false))
        showToast('Failed to rename tier. Please try again.', 'error', 3000)
        throw err // Re-throw to let the component handle the error
      }
    },
    [user?.id, updateTier, dispatch, showToast, transformAndSortResponse]
  )

  // Tier delete handler
  const handleDeleteTier = useCallback(
    async (tierId: string) => {
      if (!user?.id) return

      try {
        dispatch(setSaving(true))
        
        const result = await deleteTier({
          userId: user.id,
          tierId,
        }).unwrap()
        
        // Update with full response from API
        if (result?.data) {
          const transformed = transformAndSortResponse(result.data)
          dispatch(setRankingsData(transformed))
          dispatch(setTiers(transformed.tiers))
        }
        
        dispatch(setSaving(false))
        showToast('Tier deleted successfully', 'success', 2000)
      } catch (err) {
        console.error('Failed to delete tier:', err)
        dispatch(setSaving(false))
        showToast('Failed to delete tier. Please try again.', 'error', 3000)
        throw err // Re-throw to let the component handle the error
      }
    },
    [user?.id, deleteTier, dispatch, showToast, transformAndSortResponse]
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
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Create sortable IDs for all items (players and tiers)
  const allIds = [
    ...sortedRankings.map((p) => `player-${p.id}`),
    ...tiers.map((t) => `tier-${t.id}`),
  ]

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
    } else if (activeId.startsWith('tier-')) {
      const tierId = activeId.replace('tier-', '')
      const tier = tiers.find((t) => t.id === tierId)
      if (tier) {
        setDragState({
          activeId,
          activeItem: tier,
          activeType: 'tier',
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

    // Handle player reordering
    if (activeId.startsWith('player-') && overId.startsWith('player-')) {
      const activePlayerId = parseInt(activeId.replace('player-', ''))
      const overPlayerId = parseInt(overId.replace('player-', ''))

      const activePlayer = sortedRankings.find((p) => p.id === activePlayerId)
      const overPlayer = sortedRankings.find((p) => p.id === overPlayerId)

      if (activePlayer && overPlayer && activePlayer.rank !== overPlayer.rank) {
        await handlePlayerReorder(activePlayerId, overPlayer.rank)
      }
    }

    // Handle tier reordering
    if (activeId.startsWith('tier-') && overId.startsWith('tier-')) {
      const activeTierId = activeId.replace('tier-', '')
      const overTierId = overId.replace('tier-', '')

      const activeTier = tiers.find((t) => t.id === activeTierId)
      const overTier = tiers.find((t) => t.id === overTierId)

      if (activeTier && overTier && activeTier.position !== overTier.position) {
        await handleTierMove(activeTierId, overTier.position)
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

  // Don't render content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Loading state
  if (isLoadingState || isLoadingQuery) {
    return (
      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">
            Rookie Ranking Board
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-[#C7C8CB]">
            Loading rankings...
          </p>
        </div>

        <div className="bg-white dark:bg-[#262829] rounded-xl shadow-lg overflow-hidden">
          <RankingTableSkeleton />
        </div>
      </section>
    )
  }

  // Error state
  if (errorState || queryError) {
    return (
      <section className="container mx-auto max-w-2xl px-4 py-8">
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
      <section className="container mx-auto px-3 py-8">
        <div className="relative">
          <div
            className="hidden md:flex absolute left-[-12px] right-[-12px] h-[300%] bg-cover bg-center bg-no-repeat bg-[url('/background-image2.png')] opacity-10 dark:opacity-5"
            style={{
              transform: "scaleY(-1)",
              zIndex: -50,
              top: '-100px'
            }}
          ></div>
          <div className="text-center mb-8">
            <h1 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">
              Rookie Ranking Board
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-[#C7C8CB]">
              Organize rookies ranking board by dragging and dropping players.
            </p>
            
            {/* Saving indicator */}
            {isSaving && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            
            {/* Error message */}
            {saveError && (
              <div className="mt-4 text-sm text-red-600 dark:text-red-400">
                {saveError}
              </div>
            )}
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
            <div className="bg-white dark:bg-[#262829] rounded-xl shadow-lg overflow-hidden mx-auto max-w-3xl">
              <RankingTable 
                players={sortedRankings}
                tiers={tiers}
                dragState={dragState}
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
  return (
    <Suspense fallback={
      <section className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl leading-8 mb-4 md:text-5xl md:leading-14">
            Rookie Ranking Board
          </h1>
          <p className="text-xl text-gray-600 dark:text-[#C7C8CB]">
            Loading...
          </p>
        </div>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin text-[#E64A30]" />
        </div>
      </section>
    }>
      <RookieRankingBoardContent />
    </Suspense>
  )
}
