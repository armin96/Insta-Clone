export const getMediaUrl = (path) => {
    if (!path) return '';

    // If it's a base64 string, return it as is
    if (path.startsWith('data:')) return path;

    // If it's already a full URL, return it
    if (path.startsWith('http')) return path;

    // Otherwise, it's a relative path from the server
    // Using relative path so it goes through Vite proxy (handles IP/localhost automatically)
    return path.startsWith('/') ? path : `/${path}`;
};
