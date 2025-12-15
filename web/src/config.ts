// CDN configuration
export const CDN_URL = import.meta.env.VITE_CDN_URL || '';

// Helper to get asset URL (local or CDN)
export const getAssetUrl = (path: string): string => {
  if (!path) return '';
  
  // If path is already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If CDN URL is configured, prepend it
  if (CDN_URL) {
    // Remove leading slash from path if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    // Remove trailing slash from CDN URL if present
    const cleanCDN = CDN_URL.endsWith('/') ? CDN_URL.slice(0, -1) : CDN_URL;
    return `${cleanCDN}/${cleanPath}`;
  }
  
  // Otherwise use local path
  return path;
};

