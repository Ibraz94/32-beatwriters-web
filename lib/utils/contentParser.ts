import React from 'react';

/**
 * Utility functions for parsing and rendering rich text content from various editors
 */

/**
 * Parse rich text content from different editor formats
 * @param content - The raw content string from the backend
 * @returns Parsed HTML content string
 */
export const parseRichTextContent = (content: string): string => {
    if (!content || typeof content !== 'string') return '';
    
    try {
        // Check if content starts with '{' and try to parse it as JSON
        if (content.trim().startsWith('{')) {
            const contentObj = JSON.parse(content);
            
            // Handle different rich text editor formats
            if (contentObj?.content) {
                return contentObj.content;
            } else if (contentObj?.html) {
                return contentObj.html;
            } else if (contentObj?.text) {
                return contentObj.text;
            } else if (contentObj?.blocks && Array.isArray(contentObj.blocks)) {
                // Handle block-based editors (like Draft.js)
                return contentObj.blocks.map((block: any) => block?.text || '').join('\n');
            } else if (contentObj?.delta?.ops && Array.isArray(contentObj.delta.ops)) {
                // Handle Quill.js delta format
                return contentObj.delta.ops.map((op: any) => op?.insert || '').join('') || content;
            }
            
            // If none of the above, return the original content
            return content;
        }
        
        // If not JSON, return as is
        return content;
    } catch (error) {
        console.error('Error parsing rich text content:', error);
        // Return original content if parsing fails
        return content;
    }
};

/**
 * Sanitize and style HTML content for full display
 * @param htmlContent - The HTML content to style
 * @returns Styled HTML content string
 */
export const sanitizeAndStyleContent = (htmlContent: string): string => {
    if (!htmlContent || typeof htmlContent !== 'string') return '';
    
    try {
        // Add CSS classes for better styling
        const styledContent = htmlContent
            // Style headings
            .replace(/<h1>/g, '<h1 class="text-3xl font-bold mb-4 mt-6 ">')
            .replace(/<h2>/g, '<h2 class="text-2xl font-bold mb-3 mt-5 ">')
            .replace(/<h3>/g, '<h3 class="text-xl font-bold mb-2 mt-4 ">')
            .replace(/<h4>/g, '<h4 class="text-lg font-bold mb-2 mt-3 ">')
            .replace(/<h5>/g, '<h5 class="text-base font-bold mb-1 mt-2 ">')
            .replace(/<h6>/g, '<h6 class="text-sm font-bold mb-1 mt-2 ">')
            
            // Style paragraphs
            .replace(/<p>/g, '<p class="mb-4 leading-relaxed ">')
            
            // Style lists
            .replace(/<ul>/g, '<ul class="mb-4 ml-6 list-disc ">')
            .replace(/<ol>/g, '<ol class="mb-4 ml-6 list-decimal ">')
            .replace(/<li>/g, '<li class="mb-1">')
            
            // Style links
            .replace(/<a /g, '<a class="text-red-600 hover:text-red-800 underline" ')
            
            // Style bold and italic
            .replace(/<strong>/g, '<strong class="font-bold">')
            .replace(/<em>/g, '<em class="italic">')
            
            // Style blockquotes
            .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-[#F08F7E] pl-4 my-4 italic text-[#72757C] bg-[#F1F2F2] dark:bg-white dark:md:bg-black  dark:lg:bg-black dark:md:text-[#C7C8CB] dark:lg:text-[#C7C8CB]">')
            
            // Style code blocks
            .replace(/<code>/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">')
            .replace(/<pre>/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4">')
            
            // Style tables
            .replace(/<table>/g, '<table class="w-full border-collapse border border-gray-300 my-4">')
            .replace(/<th>/g, '<th class="border border-gray-300 px-4 py-2 bg-gray-100 font-bold text-left">')
            .replace(/<td>/g, '<td class="border border-gray-300 px-4 py-2">')
            
            // Style images
            .replace(/<img /g, '<img class="max-w-full h-auto rounded-lg shadow-md my-4" ');
        
        return styledContent;
    } catch (error) {
        console.error('Error styling HTML content:', error);
        // Return original content if styling fails
        return htmlContent;
    }
};

/**
 * Sanitize and style HTML content for preview display
 * @param htmlContent - The HTML content to process for preview
 * @returns Plain text content suitable for preview
 */
export const sanitizeAndStyleContentForPreview = (htmlContent: string): string => {
    if (!htmlContent || typeof htmlContent !== 'string') return '';
    
    try {
        // Remove HTML tags for preview text
        const textContent = htmlContent.replace(/<[^>]*>/g, '');
        
        // Limit to reasonable preview length
        return textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent;
    } catch (error) {
        console.error('Error processing preview content:', error);
        return 'Content preview not available';
    }
};

/**
 * Render rich text content with proper styling
 * @param content - The raw content from the backend
 * @param isPreview - Whether this is for preview display
 * @returns JSX element with styled content
 */
export const renderRichTextContent = (content: string, isPreview: boolean = false): React.JSX.Element => {
    try {
        if (!content || typeof content !== 'string') {
            return React.createElement('div', { className: '' }, 'Content not available');
        }
        
        const parsedContent = parseRichTextContent(content);
        
        if (isPreview) {
            const previewContent = sanitizeAndStyleContentForPreview(parsedContent);
            return React.createElement('div', { className: '' }, previewContent);
        }
        
        const styledContent = sanitizeAndStyleContent(parsedContent);
        
        return React.createElement('div', {
            dangerouslySetInnerHTML: { __html: styledContent }
        });
    } catch (error) {
        console.error('Error rendering rich text content:', error);
        return React.createElement('div', { className: '' }, 'Error loading content');
    }
}; 