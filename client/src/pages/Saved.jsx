import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import Post from '../components/Post';
import './Saved.css';

function Saved() {
    const { user } = useAuthStore();
    const [savedPosts, setSavedPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSavedPosts();
    }, []);

    const fetchSavedPosts = async () => {
        try {
            // Fetch all posts and filter saved ones
            const response = await axios.get('/api/posts');
            const allPosts = response.data;

            // Filter posts that are in user's savedPosts array
            const saved = allPosts.filter(post =>
                user?.savedPosts?.includes(post._id)
            );

            setSavedPosts(saved);
        } catch (error) {
            console.error('Error fetching saved posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="saved-container">
            <div className="saved-header">
                <h1>Saved Posts</h1>
                <p>{savedPosts.length} saved {savedPosts.length === 1 ? 'post' : 'posts'}</p>
            </div>

            {savedPosts.length === 0 ? (
                <div className="empty-state">
                    <svg aria-label="Save" fill="currentColor" height="96" viewBox="0 0 24 24" width="96">
                        <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                    </svg>
                    <h2>Save posts you want to see again</h2>
                    <p>Tap the bookmark icon on any post to save it here.</p>
                </div>
            ) : (
                <div className="saved-posts">
                    {savedPosts.map(post => (
                        <Post key={post._id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Saved;
