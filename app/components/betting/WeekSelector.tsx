'use client'

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
    <div className="flex items-center justify-center md:justify-center gap-2 md:gap-3 w-full md:w-auto">
      <button
        onClick={goToPrevious}
        disabled={currentIndex === 0}
        className="border border-[#C7C8CB] rounded-full p-2 hover:bg-gray-100 dark:bg-[#262829] dark:hover:bg-[#303234] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        aria-label="Previous week"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </button>

      <div className="border border-[#C7C8CB] rounded-full px-3 md:px-4 bg-white dark:bg-[#262829] flex-1 md:flex-none md:min-w-[100px]">
        <Select value={selectedWeek} onValueChange={onChange}>
          <SelectTrigger className="!border-none !border-0 shadow-none focus:!ring-0 focus:outline-none text-sm md:text-base">
            <SelectValue placeholder="Select week" />
          </SelectTrigger>
          <SelectContent className="border-none bg-white dark:bg-[#262829]">
            {WEEKS.map((week) => (
              <SelectItem key={week} value={week}>
                {week}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <button
        onClick={goToNext}
        disabled={currentIndex === WEEKS.length - 1}
        className="border border-[#C7C8CB] rounded-full p-2 hover:bg-gray-100 dark:bg-[#262829] dark:hover:bg-[#303234] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        aria-label="Next week"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </button>
    </div>
  )
}
