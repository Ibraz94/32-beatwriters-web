'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BetsFilterProps {
  showBestBets: boolean
  onBestBetsChange: (value: boolean) => void
  resultFilter: string
  onResultFilterChange: (value: string) => void
  showFastDraft: boolean
  onFastDraftChange: (value: boolean) => void
}

export default function BetsFilter({
  showBestBets,
  onBestBetsChange,
  resultFilter,
  onResultFilterChange,
  showFastDraft,
  onFastDraftChange,
}: BetsFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-4">
      <Button
        variant={showBestBets ? 'orange' : 'outline'}
        onClick={() => onBestBetsChange(!showBestBets)}
        size="sm"
      >
        🔥 Best Bets Only
      </Button>

      <Button
        variant={showFastDraft ? 'orange' : 'outline'}
        onClick={() => onFastDraftChange(!showFastDraft)}
        size="sm"
      >
        ⚡ FastDraft Only
      </Button>

      <Select value={resultFilter} onValueChange={onResultFilterChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Filter by result" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Results</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="WIN">Won</SelectItem>
          <SelectItem value="LOSS">Lost</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
