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
    if (!content) return '';
    
    try {
        // Check if content starts with '{' and try to parse it as JSON
        if (content.trim().startsWith('{')) {
            const contentObj = JSON.parse(content);
            
            // Handle different rich text editor formats
            if (contentObj.content) {
                return contentObj.content;
            } else if (contentObj.html) {
                return contentObj.html;
            } else if (contentObj.text) {
                return contentObj.text;
            } else if (contentObj.blocks) {
                // Handle block-based editors (like Draft.js)
                return contentObj.blocks.map((block: any) => block.text).join('\n');
            } else if (contentObj.delta) {
                // Handle Quill.js delta format
                return contentObj.delta.ops?.map((op: any) => op.insert || '').join('') || content;
            }
            
            // If none of the above, return the original content
            return content;
        }
        
        // If not JSON, return as is
        return content;
    } catch (error) {
        console.error('Error parsing rich text content:', error);
        return content;
    }
};

/**
 * Sanitize and style HTML content for full display
 * @param htmlContent - The HTML content to style
 * @returns Styled HTML content string
 */
export const sanitizeAndStyleContent = (htmlContent: string): string => {
    if (!htmlContent) return '';
    
    // Add CSS classes for better styling
    const styledContent = htmlContent
        // Style headings
        .replace(/<h1>/g, '<h1 class="text-3xl font-bold mb-4 mt-6 text-gray-900">')
        .replace(/<h2>/g, '<h2 class="text-2xl font-bold mb-3 mt-5 text-gray-900">')
        .replace(/<h3>/g, '<h3 class="text-xl font-bold mb-2 mt-4 text-gray-900">')
        .replace(/<h4>/g, '<h4 class="text-lg font-bold mb-2 mt-3 text-gray-900">')
        .replace(/<h5>/g, '<h5 class="text-base font-bold mb-1 mt-2 text-gray-900">')
        .replace(/<h6>/g, '<h6 class="text-sm font-bold mb-1 mt-2 text-gray-900">')
        
        // Style paragraphs
        .replace(/<p>/g, '<p class="mb-4 leading-relaxed text-gray-700">')
        
        // Style lists
        .replace(/<ul>/g, '<ul class="mb-4 ml-6 list-disc text-gray-700">')
        .replace(/<ol>/g, '<ol class="mb-4 ml-6 list-decimal text-gray-700">')
        .replace(/<li>/g, '<li class="mb-1">')
        
        // Style links
        .replace(/<a /g, '<a class="text-red-600 hover:text-red-800 underline" ')
        
        // Style bold and italic
        .replace(/<strong>/g, '<strong class="font-bold">')
        .replace(/<em>/g, '<em class="italic">')
        
        // Style blockquotes
        .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-red-600 pl-4 my-4 italic text-gray-600">')
        
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
};

/**
 * Sanitize and style HTML content for preview display
 * @param htmlContent - The HTML content to process for preview
 * @returns Plain text content suitable for preview
 */
export const sanitizeAndStyleContentForPreview = (htmlContent: string): string => {
    if (!htmlContent) return '';
    
    // Remove HTML tags for preview text
    const textContent = htmlContent.replace(/<[^>]*>/g, '');
    
    // Limit to reasonable preview length
    return textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent;
};

/**
 * Render rich text content with proper styling
 * @param content - The raw content from the backend
 * @param isPreview - Whether this is for preview display
 * @returns JSX element with styled content
 */
export const renderRichTextContent = (content: string, isPreview: boolean = false): React.JSX.Element => {
    const parsedContent = parseRichTextContent(content);
    
    if (isPreview) {
        const previewContent = sanitizeAndStyleContentForPreview(parsedContent);
        return React.createElement('div', { className: '' }, previewContent);
    }
    
    const styledContent = sanitizeAndStyleContent(parsedContent);
    
    return React.createElement('div', {
        className: 'prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-red-600 prose-a:hover:text-red-800 prose-blockquote:border-red-600 prose-code:bg-gray-100 prose-pre:bg-gray-100',
        dangerouslySetInnerHTML: { __html: styledContent }
    });
}; 