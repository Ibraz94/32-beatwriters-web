import { useState } from 'react'

interface ReadMoreProps {
  id: string
  text: string
  amountOfCharacters?: number
  target?: string
  rel?: string
}

// Function to split HTML content at a safe position (not inside a tag)
const splitHtmlSafely = (html: string, maxLength: number): [string, string] => {
  if (html.length <= maxLength) {
    return [html, ''];
  }

  // Parse through the string to find open/close tags with their full attributes
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^>]*)?)>/g;
  let match;
  const tags: { pos: number; tag: string; isClosing: boolean; fullTag: string; attributes: string }[] = [];

  while ((match = tagRegex.exec(html)) !== null) {
    tags.push({
      pos: match.index,
      tag: match[1].toLowerCase(),
      isClosing: match[0].startsWith('</'),
      fullTag: match[0],
      attributes: match[2] || ''
    });
  }

  // Find a good break point (space or punctuation) near maxLength
  let breakPoint = maxLength;
  for (let i = maxLength; i > maxLength - 100 && i > 0; i--) {
    if (html[i] === ' ' || html[i] === '.' || html[i] === ',' || html[i] === ';') {
      breakPoint = i;
      break;
    }
  }

  // Build tag stack up to split position - store full opening tags with attributes
  const openTagsStack: { tag: string; fullOpenTag: string }[] = [];
  const selfClosingTags = ['br', 'img', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
  
  for (const tagInfo of tags) {
    if (tagInfo.pos >= breakPoint) break;
    
    if (!tagInfo.isClosing && !tagInfo.fullTag.endsWith('/>')) {
      // Not a self-closing tag
      if (!selfClosingTags.includes(tagInfo.tag)) {
        openTagsStack.push({
          tag: tagInfo.tag,
          fullOpenTag: tagInfo.fullTag
        });
      }
    } else if (tagInfo.isClosing) {
      // Remove the last occurrence of this tag from stack
      for (let i = openTagsStack.length - 1; i >= 0; i--) {
        if (openTagsStack[i].tag === tagInfo.tag) {
          openTagsStack.splice(i, 1);
          break;
        }
      }
    }
  }

  let firstPart = html.slice(0, breakPoint);
  let secondPart = html.slice(breakPoint);

  // Close any open tags in the first part (in reverse order)
  for (let i = openTagsStack.length - 1; i >= 0; i--) {
    firstPart += `</${openTagsStack[i].tag}>`;
  }

  // Reopen those tags in the second part with their original attributes
  for (const tagObj of openTagsStack) {
    secondPart = tagObj.fullOpenTag + secondPart;
  }

  return [firstPart, secondPart];
};

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

// Component to render content with player mentions as links and handle truncation
const ContentWithPlayerMentionsAndTruncation = ({ 
  content, 
  isExpanded, 
  maxChars 
}: { 
  content: string; 
  isExpanded: boolean; 
  maxChars: number;
}) => {
  // First, render the full HTML content
  const parts = parsePlayerMentions(content);
  
  // If expanded or content is short, render everything
  if (isExpanded || content.length <= maxChars) {
    return (
      <>
        {parts.map((part, index) => {
          if (typeof part === 'string') {
            return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
          } else {
            return (
              <a
                key={index}
                href={`/players/${part.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E64A30] hover:underline font-bold "
              >
                {part.name}
              </a>
            );
          }
        })}
      </>
    );
  }
  
  // If not expanded, we need to truncate but preserve HTML
  // Create a temporary div to parse HTML and truncate by visible text length
  const truncateHtml = (html: string, maxLength: number): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    let charCount = 0;
    let truncated = false;
    
    const truncateNode = (node: Node): Node | null => {
      if (truncated) return null;
      
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (charCount + text.length > maxLength) {
          const remainingChars = maxLength - charCount;
          node.textContent = text.substring(0, remainingChars);
          truncated = true;
        }
        charCount += text.length;
        return node;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const newElement = element.cloneNode(false) as Element;
        
        Array.from(element.childNodes).forEach(child => {
          const truncatedChild = truncateNode(child);
          if (truncatedChild) {
            newElement.appendChild(truncatedChild);
          }
        });
        
        return newElement;
      }
      
      return node.cloneNode(true);
    };
    
    const result = document.createElement('div');
    Array.from(div.childNodes).forEach(child => {
      const truncatedChild = truncateNode(child);
      if (truncatedChild) {
        result.appendChild(truncatedChild);
      }
    });
    
    return result.innerHTML;
  };
  
  // Truncate each text part while preserving HTML
  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          const truncatedHtml = truncateHtml(part, maxChars);
          return <span key={index} dangerouslySetInnerHTML={{ __html: truncatedHtml }} />;
        } else {
          return (
            <a
              key={index}
              href={`/players/${part.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E64A30] hover:underline font-bold"
            >
              {part.name}
            </a>
          );
        }
      })}
    </>
  );
};

// Component to render content with player mentions as links
const ContentWithPlayerMentions = ({ content }: { content: string }) => {
  const parts = parsePlayerMentions(content);

  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
        } else {
          return (
            <a
              key={index}
              href={`/players/${part.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E64A30] hover:underline font-bold"
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

  const handleKeyboard = (e: any) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <span id={id}>
      <ContentWithPlayerMentionsAndTruncation 
        content={text} 
        isExpanded={isExpanded} 
        maxChars={amountOfCharacters}
      />
      {!isExpanded && itCanOverflow && <span></span>}
      {itCanOverflow && (
        <span
          className=' text-(--color-orange) underline ml-2 cursor-pointer hover:text-[#E64A30]'
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-controls={id}
          onKeyDown={handleKeyboard}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </span>
      )}
    </span>
  )
}