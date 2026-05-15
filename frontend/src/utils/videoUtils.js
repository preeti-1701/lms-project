export const getYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  
  // Clean the URL string
  const cleanUrl = url.trim();
  
  // If already an embed URL, return it
  if (cleanUrl.includes('youtube.com/embed/')) return cleanUrl;
  
  let videoId = '';
  
  try {
    // Standard URL: https://www.youtube.com/watch?v=VIDEO_ID
    if (cleanUrl.includes('youtube.com/watch?v=')) {
      videoId = cleanUrl.split('v=')[1].split('&')[0];
    } 
    // Shortened URL: https://youtu.be/VIDEO_ID
    else if (cleanUrl.includes('youtu.be/')) {
      videoId = cleanUrl.split('youtu.be/')[1].split('?')[0];
    }
    // YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
    else if (cleanUrl.includes('youtube.com/shorts/')) {
      videoId = cleanUrl.split('shorts/')[1].split('?')[0].split('&')[0];
    }
    // Mobile/Other: search for v= anywhere
    else if (cleanUrl.includes('v=')) {
      videoId = cleanUrl.split('v=')[1].split('&')[0];
    }
  } catch (err) {
    console.error('Error parsing YouTube URL:', err);
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  return cleanUrl; // Fallback
};
