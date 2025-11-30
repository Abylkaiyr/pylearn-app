// Convert YouTube URL to embed format
export const convertYouTubeToEmbed = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Trim whitespace
  url = url.trim();
  
  // If already an embed URL, return as is
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  // Extract video ID from various YouTube URL formats
  let videoId = null;
  
  // Pattern 1: https://www.youtube.com/watch?v=VIDEO_ID
  // Pattern 2: https://youtu.be/VIDEO_ID
  // Pattern 3: https://www.youtube.com/embed/VIDEO_ID
  // Pattern 4: youtube.com/watch?v=VIDEO_ID (without protocol)
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?.*[&?]v=([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  return null;
};


// Check if URL is a Firebase Storage URL
export const isFirebaseStorageUrl = (url) => {
  return url && url.includes('firebasestorage.googleapis.com');
};

// Check if URL is a YouTube URL
export const isYouTubeUrl = (url) => {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
};

