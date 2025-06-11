import { useState } from 'react'

interface ReadMoreProps {
  id: string
  text: string
  amountOfCharacters?: number
}

export const ReadMore = ({ id, text, amountOfCharacters = 2000 }: ReadMoreProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const itCanOverflow = text.length > amountOfCharacters
  const beginText = itCanOverflow
    ? text.slice(0, amountOfCharacters)
    : text
  const endText = text.slice(amountOfCharacters)
  
  const handleKeyboard = (e: any) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <p id={id}>
      {beginText}
      {itCanOverflow && (
        <>
          {!isExpanded && <span>... </span>}
          <span 
            className={`${!isExpanded && 'hidden'}`} 
            aria-hidden={!isExpanded}
          >
            {endText}
          </span>
          <span
            className=' text-blue-700 ml-2 cursor-pointer hover:text-red-800'
            role="button"
            tabIndex={0}
            aria-expanded={isExpanded}
            aria-controls={id}
            onKeyDown={handleKeyboard}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'read less' : 'read more'}
          </span>
        </>
      )}
    </p>
  )
}