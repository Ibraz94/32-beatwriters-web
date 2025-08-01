import { useState } from 'react'
import Link from 'next/link'

interface ReadMoreProps {
  id: string
  text: string
  amountOfCharacters?: number
  target?: string
  rel?: string
}

// Function to parse player mentions and convert them to links
const parsePlayerMentions = (content: string) => {
  // Regular expression to match @[Player Name](playerId) pattern
  const mentionRegex = /@\[([^\]]+)\]\((\d+)\)/g;

  // Split content into parts (text and mentions)
  const parts: (string | { name: string; id: string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    // Add the mention as an object
    parts.push({
      name: match[1],
      id: match[2]
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last mention
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
};

// Component to render content with player mentions as links
const ContentWithPlayerMentions = ({ content }: { content: string }) => {
  const parts = parsePlayerMentions(content);

  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>;
        } else {
          return (
            <a
              key={index}
              href={`/players/${part.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-800 hover:underline font-bold "
            >
              {part.name}
            </a>

          );
        }
      })}
    </>
  );
};

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
      <ContentWithPlayerMentions content={beginText} />
      {itCanOverflow && (
        <>
          {!isExpanded && <span>... </span>}
          <span
            className={`${!isExpanded && 'hidden'}`}
            aria-hidden={!isExpanded}
          >
            <ContentWithPlayerMentions content={endText} />
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
            {isExpanded ? 'Read less' : 'Read more'}
          </span>
        </>
      )}
    </p>
  )
}