import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ReelsViewer from '../components/ReelsViewer';
import PostModal from '../components/PostModal';
import { getMediaUrl } from '../utils/media';
import './Explore.css';

function Explore() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async (pageNum = 1) => {
        try {
            if (pageNum === 1) {
                setIsLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await axios.get(`/api/posts?page=${pageNum}&limit=12`);

            if (pageNum === 1) {
                setPosts(response.data);
            } else {
                setPosts(prev => [...prev, ...response.data]);
            }

            setHasMore(response.data.length === 12);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching explore posts:', error);
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    };

    // Infinite Scroll Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loadingMore && !isLoading) {
                fetchPosts(page + 1);
            }
        }, { threshold: 0.1 });

        const target = document.getElementById('explore-load-more');
        if (target) observer.observe(target);

        return () => observer.disconnect();
    }, [page, hasMore, loadingMore, isLoading]);

    // Memoize video posts for ReelsViewer
    const videoPosts = useMemo(() => posts.filter(p => p.mediaType === 'video'), [posts]);
    const initialReelIndex = useMemo(() =>
        selectedPost ? videoPosts.findIndex(p => String(p._id) === String(selectedPost._id)) : -1
        , [selectedPost, videoPosts]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="explore-container">
            <div className="explore-grid">
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <p>No posts to explore yet</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post._id}
                            className="grid-post"
                            onClick={() => {
                                console.log("GRID CLICK - Post:", post._id, "Type:", post.mediaType);
                                setSelectedPost({ ...post }); // Force new object to trigger effect
                            }}
                        >
                            {post.mediaType === 'video' ? (
                                <>
                                    <video
                                        src={`${getMediaUrl(post.image)}#t=0.001`}
                                        preload="metadata"
                                        playsInline
                                        muted
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div className="video-indicator">
                                        <svg fill="white" height="24" viewBox="0 0 24 24" width="24">
                                            <path d="M5.888 22.5a3.46 3.46 0 0 1-1.721-.46l-.003-.002a3.451 3.451 0 0 1-1.72-2.982V4.943a3.445 3.445 0 0 1 5.163-2.987l12.226 7.059a3.444 3.444 0 0 1-.001 5.967l-12.22 7.056a3.462 3.462 0 0 1-1.724.462Z"></path>
                                        </svg>
                                    </div>
                                </>
                            ) : (
                                <img src={getMediaUrl(post.image)} alt={post.caption} loading="lazy" />
                            )}
                            <div className="grid-post-overlay">
                                <div className="overlay-stat">
                                    <svg fill="currentColor" height="18" viewBox="0 0 48 48" width="18">
                                        <path d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                                    </svg>
                                    <span>{post.likes?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Infinite Scroll Trigger */}
            <div id="explore-load-more" style={{ height: '20px', margin: '20px 0' }}>
                {loadingMore && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="spinner-small" style={{ width: '20px', height: '20px', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                    </div>
                )}
            </div>

            {selectedPost && (
                (() => {
                    const isVideo = selectedPost.mediaType === 'video';
                    console.log("MODAL RENDER - PostID:", selectedPost._id, "isVideo:", isVideo, "Index:", initialReelIndex);
                    return isVideo ? (
                        <ReelsViewer
                            posts={videoPosts}
                            initialIndex={initialReelIndex !== -1 ? initialReelIndex : 0}
                            onClose={() => setSelectedPost(null)}
                            onLoadMore={hasMore ? () => fetchPosts(page + 1) : null}
                            isLoadingMore={loadingMore}
                        />
                    ) : (
                        <PostModal
                            post={selectedPost}
                            onClose={() => setSelectedPost(null)}
                        />
                    );
                })()
            )}
        </div>
    );
}

export default Explore;
