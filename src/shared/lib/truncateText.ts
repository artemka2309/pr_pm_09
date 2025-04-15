/**
 * Truncates a string to a specified maximum length and adds an ellipsis if truncated.
 * @param text - The string to truncate.
 * @param maxLength - The maximum allowed length of the string.
 * @returns The truncated string with an ellipsis, or the original string if it's within the length limit.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}; 