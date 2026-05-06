import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import Post from '../components/Post';
import CreateStory from '../components/CreateStory';
import StoryViewer from '../components/StoryViewer';
import { getMediaUrl } from '../utils/media';
import './Home.css';

function Home() {
    const { user } = useAuthStore();
    const [posts, setPosts] = useState([]);
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateStory, setShowCreateStory] = useState(false);
    const [showStoryViewer, setShowStoryViewer] = useState(false);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchPosts();
        fetchStories();
    }, []);

    const fetchPosts = async (pageNum = 1) => {
        try {
            if (pageNum === 1) {
                setIsLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await axios.get(`/api/posts?page=${pageNum}&limit=10`);

            if (pageNum === 1) {
                setPosts(response.data);
            } else {
                setPosts(prev => [...prev, ...response.data]);
            }

            setHasMore(response.data.length === 10);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    };

    const fetchStories = async () => {
        try {
            const response = await axios.get('/api/stories');
            setStories(response.data);
        } catch (error) {
            console.error('Error fetching stories:', error);
        }
    };

    const handleStoryClick = (index) => {
        setSelectedStoryIndex(index);
        setShowStoryViewer(true);
    };

    const handleStoryCreated = () => {
        fetchStories();
    };

    const handlePostDelete = (postId) => {
        setPosts(prev => prev.filter(p => p._id !== postId));
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="home-container">
            {/* Stories Section */}
            <div className="stories-container">
                <div className="stories-scroll">
                    {/* Create Story Button */}
                    <div className="story-item create-story" onClick={() => setShowCreateStory(true)}>
                        <div className="story-avatar">
                            {user?.profilePic ? (
                                <img src={getMediaUrl(user.profilePic)} alt={user.username} />
                            ) : (
                                <div className="avatar-placeholder">
                                    {user?.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <div className="add-story-icon">
                                <svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path>
                                </svg>
                            </div>
                        </div>
                        <span className="story-username">Your Story</span>
                    </div>

                    {/* User Stories */}
                    {stories.map((userStory, index) => (
                        <div
                            key={userStory.user._id}
                            className="story-item"
                            onClick={() => handleStoryClick(index)}
                        >
                            <div className={`story-avatar ${userStory.hasUnviewed ? 'has-story' : 'viewed-story'}`}>
                                {userStory.user.profilePic ? (
                                    <img src={getMediaUrl(userStory.user.profilePic)} alt={userStory.user.username} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {userStory.user.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <span className="story-username">{userStory.user.username}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Posts Feed */}
            <div className="feed">
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <h2>No posts yet</h2>
                        <p>Start following people to see their posts here!</p>
                    </div>
                ) : (
                    <>
                        {posts.map((post) => (
                            <Post key={post._id} post={post} onDelete={handlePostDelete} />
                        ))}

                        {hasMore && (
                            <div className="load-more-container">
                                <button
                                    className="load-more-btn"
                                    onClick={() => fetchPosts(page + 1)}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? 'Loading...' : 'Load More Posts'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {showCreateStory && (
                <CreateStory
                    onClose={() => setShowCreateStory(false)}
                    onStoryCreated={handleStoryCreated}
                />
            )}

            {showStoryViewer && (
                <StoryViewer
                    stories={stories}
                    initialIndex={selectedStoryIndex}
                    onClose={() => setShowStoryViewer(false)}
                />
            )}
        </div>
    );
}

export default Home;
