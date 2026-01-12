'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { RookiePlayer } from '@/lib/services/rookieBoardApi'

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  player: RookiePlayer
  existingNote?: string
  onSave: (playerId: number, content: string) => Promise<void>
  onDelete?: (playerId: number) => Promise<void>
}

export default function NoteModal({
  isOpen,
  onClose,
  player,
  existingNote = '',
  onSave,
  onDelete,
}: NoteModalProps) {
  const [noteContent, setNoteContent] = useState(existingNote)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update note content when existingNote changes
  useEffect(() => {
    setNoteContent(existingNote)
  }, [existingNote])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setIsSaving(false)
      setIsDeleting(false)
    }
  }, [isOpen])

  const handleSave = async () => {
    if (!noteContent.trim()) {
      setError('Note cannot be empty')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await onSave(player.id, noteContent)
      // Success - close modal
      onClose()
    } catch (err) {
      console.error('Failed to save note:', err)
      // Error already shown by parent via toast, just reset loading state
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || !existingNote) return
    
    setIsDeleting(true)
    setError(null)

    try {
      await onDelete(player.id)
      // Success - close modal
      onClose()
    } catch (err) {
      console.error('Failed to delete note:', err)
      // Error already shown by parent via toast, just reset loading state
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    setNoteContent(existingNote)
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
      <div className="relative bg-white dark:bg-[#262829] rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-[#1D212D] dark:text-white">
              {existingNote ? 'Edit Note' : 'Add Note'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {player.name} - {player.position}, {player.team}
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
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Add your thoughts, analysis, or reminders about this player..."
            className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1F2128] text-[#1D212D] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E64A30] focus:border-transparent resize-none"
            disabled={isSaving}
          />

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Delete button (only show if note exists) */}
          {existingNote && onDelete && (
            <button
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete Note'}
            </button>
          )}
          
          {/* Spacer if no delete button */}
          {(!existingNote || !onDelete) && <div />}
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              disabled={isSaving || isDeleting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className="px-6 py-2 bg-[#E64A30] text-white rounded-lg hover:bg-[#D43A20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
