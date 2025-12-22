'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeekSelectorProps {
  selectedWeek: string
  onChange: (week: string) => void
}

const WEEKS = [
  'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5',
  'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10',
  'Week 11', 'Week 12', 'Week 13', 'Week 14', 'Week 15',
  'Week 16', 'Week 17', 'Week 18',
  'Playoffs - Wild Card',
  'Playoffs - Divisional',
  'Playoffs - Conference',
  'Super Bowl'
]

export default function WeekSelector({ selectedWeek, onChange }: WeekSelectorProps) {
  const currentIndex = WEEKS.indexOf(selectedWeek)

  const goToPrevious = () => {
    if (currentIndex > 0) {
      onChange(WEEKS[currentIndex - 1])
    }
  }

  const goToNext = () => {
    if (currentIndex < WEEKS.length - 1) {
      onChange(WEEKS[currentIndex + 1])
    }
  }

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <Button
        variant="outline"
        size="icon"
        onClick={goToPrevious}
        disabled={currentIndex === 0}
        aria-label="Previous week"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select value={selectedWeek} onValueChange={onChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select week" />
        </SelectTrigger>
        <SelectContent>
          {WEEKS.map((week) => (
            <SelectItem key={week} value={week}>
              {week}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={goToNext}
        disabled={currentIndex === WEEKS.length - 1}
        aria-label="Next week"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
