import { useState } from 'react'

interface ReadMoreProps {
  id: string
  text: string
  amountOfCharacters?: number
  amountOfWords?: number
  target?: string
  rel?: string
}

export const ReadMore = ({ id, text, amountOfCharacters = 2000, amountOfWords }: ReadMoreProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Replace player mention spans with clickable links while preserving all HTML
  const processedContent = text.replace(
    /<span\s+[^>]*?data-player-id="(\d+)"[^>]*?>(.*?)<\/span>/gi,
    (match, playerId, playerName) => {
      const cleanName = playerName.replace(/@/g, '').replace(/<[^>]*>/g, '').trim();
      return `<a href="/players/${playerId}" target="_blank" rel="noopener noreferrer" class="text-[#E64A30] hover:underline font-bold">${cleanName}</a>`;
    }
  );
  
  // Get text content length (without HTML tags) to determine if we need "Read more"
  const tempDiv = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (tempDiv) tempDiv.innerHTML = processedContent;
  const textContent = tempDiv?.textContent || processedContent;
  const textLength = textContent.length;
  
  // Count words if amountOfWords is specified
  const wordCount = amountOfWords ? textContent.trim().split(/\s+/).length : 0;
  const itCanOverflow = amountOfWords 
    ? wordCount > amountOfWords 
    : textLength > amountOfCharacters;

  // Truncate HTML while preserving structure (by words or characters)
  const truncateHtml = (html: string, maxChars: number, maxWords?: number): string => {
    if (typeof document === 'undefined') return html;
    
    const div = document.createElement('div');
    div.innerHTML = html;
    
    let charCount = 0;
    let wordCount = 0;
    let shouldTruncate = false;
    
    const processNode = (node: Node): Node | null => {
      if (shouldTruncate) return null;
      
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        
        if (maxWords) {
          // Word-based truncation
          const words = text.split(/(\s+)/); // Split but keep whitespace
          let result = '';
          
          for (const word of words) {
            if (/\s/.test(word)) {
              // It's whitespace, add it
              result += word;
            } else {
              // It's a word
              if (wordCount >= maxWords) {
                shouldTruncate = true;
                break;
              }
              result += word;
              wordCount++;
            }
          }
          
          return document.createTextNode(result);
        } else {
          // Character-based truncation
          if (charCount + text.length > maxChars) {
            const remaining = maxChars - charCount;
            const truncatedText = text.substring(0, remaining);
            shouldTruncate = true;
            return document.createTextNode(truncatedText);
          }
          charCount += text.length;
          return node.cloneNode(false);
        }
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const clone = element.cloneNode(false) as Element;
        
        for (let i = 0; i < element.childNodes.length; i++) {
          const processed = processNode(element.childNodes[i]);
          if (processed) {
            clone.appendChild(processed);
          }
          if (shouldTruncate) break;
        }
        
        return clone;
      }
      
      return node.cloneNode(false);
    };
    
    const result = document.createElement('div');
    for (let i = 0; i < div.childNodes.length; i++) {
      const processed = processNode(div.childNodes[i]);
      if (processed) {
        result.appendChild(processed);
      }
      if (shouldTruncate) break;
    }
    
    return result.innerHTML;
  };

  const displayContent = isExpanded || !itCanOverflow 
    ? processedContent 
    : truncateHtml(processedContent, amountOfCharacters, amountOfWords);

  // Add "Read more" button inside the HTML at the end
  const addReadMoreButton = (html: string, buttonHtml: string): string => {
    if (typeof document === 'undefined') return html + buttonHtml;
    
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Find the last text node or element to append the button
    const findLastTextContainer = (node: Node): Node | null => {
      if (node.childNodes.length === 0) {
        return node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
      }
      
      // Traverse to the last child recursively
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.ELEMENT_NODE || child.nodeType === Node.TEXT_NODE) {
          const result = findLastTextContainer(child);
          if (result) return result;
        }
      }
      
      return node;
    };
    
    const lastContainer = findLastTextContainer(div);
    if (lastContainer) {
      const buttonSpan = document.createElement('span');
      buttonSpan.innerHTML = buttonHtml;
      lastContainer.appendChild(buttonSpan.firstChild!);
    }
    
    return div.innerHTML;
  };

  const buttonHtml = itCanOverflow 
    ? `<span class="text-[#E64A30] underline ml-2 cursor-pointer hover:text-[#E64A30]/80 whitespace-nowrap" role="button" tabindex="0" data-read-more="true">${isExpanded ? 'Read less' : 'Read more'}</span>`
    : '';

  const finalContent = itCanOverflow 
    ? addReadMoreButton(displayContent, buttonHtml)
    : displayContent;

  const handleKeyboard = (e: any) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      setIsExpanded(!isExpanded)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.getAttribute('data-read-more') === 'true') {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <span id={id} onClick={handleClick} onKeyDown={handleKeyboard}>
      <span dangerouslySetInnerHTML={{ __html: finalContent }} />
    </span>
  )
}
