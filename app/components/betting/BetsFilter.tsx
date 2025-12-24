'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Flame, Zap, Search } from 'lucide-react'

interface BetsFilterProps {
  showBestBets: boolean
  onBestBetsChange: (value: boolean) => void
  resultFilter: string
  onResultFilterChange: (value: string) => void
  showFastDraft: boolean
  onFastDraftChange: (value: boolean) => void
  playerSearch: string
  onPlayerSearchChange: (value: string) => void
}

export default function BetsFilter({
  showBestBets,
  onBestBetsChange,
  resultFilter,
  onResultFilterChange,
  showFastDraft,
  onFastDraftChange,
  playerSearch,
  onPlayerSearchChange,
}: BetsFilterProps) {
  const clearFilters = () => {
    onBestBetsChange(false)
    onFastDraftChange(false)
    onResultFilterChange('all')
    onPlayerSearchChange('')
  }

  const hasActiveFilters = showBestBets || showFastDraft || resultFilter !== 'all' || playerSearch

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-3 w-full">
      {/* Player Search */}
      <div className="border border-[#C7C8CB] rounded-full px-4 py-3.5 bg-white dark:bg-[#262829] w-full lg:w-auto">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search player..."
            value={playerSearch}
            onChange={(e) => onPlayerSearchChange(e.target.value)}
            className="w-full lg:min-w-[200px] bg-transparent focus:outline-none text-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Result Filter */}
      <div className="border border-[#C7C8CB] rounded-full px-4 bg-white dark:bg-[#262829] w-full lg:w-auto">
        <Select value={resultFilter} onValueChange={onResultFilterChange}>
          <SelectTrigger className="!border-none !border-0 flex items-center gap-2 w-full lg:min-w-[160px]">
            <Filter className="w-4 h-4" />
            <SelectValue placeholder="Filter by result" />
          </SelectTrigger>
          <SelectContent className="border-none bg-white dark:bg-[#262829]">
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="WIN">Won</SelectItem>
            <SelectItem value="LOSS">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Best Bets Filter */}
      <div className="border border-[#C7C8CB] rounded-full flex items-center gap-2 px-6 py-3.5 dark:bg-[#262829] w-full lg:w-auto justify-center">
        <input
          type="checkbox"
          id="best-bets-filter"
          checked={showBestBets}
          onChange={(e) => onBestBetsChange(e.target.checked)}
          className="w-4 h-4 cursor-pointer"
        />
        <label htmlFor="best-bets-filter" className="text-sm font-medium cursor-pointer flex items-center gap-1">
          <Flame className="w-4 h-4 text-[#E64A30]" />
          Best Bets Only
        </label>
      </div>

      {/* FastDraft Filter */}
      <div className="border border-[#C7C8CB] rounded-full flex items-center gap-2 px-6 py-3.5 dark:bg-[#262829] w-full lg:w-auto justify-center">
        <input
          type="checkbox"
          id="fastdraft-filter"
          checked={showFastDraft}
          onChange={(e) => onFastDraftChange(e.target.checked)}
          className="w-4 h-4 cursor-pointer"
        />
        <label htmlFor="fastdraft-filter" className="text-sm font-medium cursor-pointer flex items-center gap-1">
          <Zap className="w-4 h-4 text-[#E64A30]" />
          FastDraft Only
        </label>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="whitespace-nowrap flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-full border border-[#E64A30] text-[#E64A30] bg-white dark:!bg-[#262829] hover:bg-[#fff4f2] dark:hover:bg-[#303234] transition-colors dark:border-none hover:cursor-pointer w-full lg:w-auto"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
