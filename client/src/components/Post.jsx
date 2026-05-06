import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import PostModal from './PostModal';
import { getMediaUrl } from '../utils/media';
import { useAudioStore } from '../store/audioStore';
import './Post.css';

function Post({ post, onDelete }) {
    const { user } = useAuthStore();
    const [likes, setLikes] = useState(post.likes || []);
    const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
    const [isSaved, setIsSaved] = useState(user?.savedPosts?.includes(post._id) || false);
    const [showModal, setShowModal] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const { isMuted, toggleMute } = useAudioStore();
    const videoRef = useRef(null);
    const optionsRef = useRef(null);

    // Close options when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (videoRef.current) {
                    if (entry.isIntersecting) {
                        videoRef.current.play().catch(err => console.log("Video play failed:", err));
                    } else {
                        videoRef.current.pause();
                    }
                }
            });
        }, options);

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    // Handle mute toggle
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const handleLike = async () => {
        try {
            await axios.post(`/api/posts/${post._id}/like`);
            if (isLiked) {
                setLikes(likes.filter(id => id !== user._id));
            } else {
                setLikes([...likes, user._id]);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleSave = async () => {
        try {
            const response = await axios.post(`/api/posts/${post._id}/save`);
            setIsSaved(response.data.isSaved);
        } catch (error) {
            console.error('Error saving post:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await axios.delete(`/api/posts/${post._id}`);
                if (onDelete) onDelete(post._id);
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post');
            }
        }
    };

    const handleToggleMute = () => {
        toggleMute();
    };

    const isOwner = user?._id === post.user?._id || user?._id === post.user;

    return (
        <article className="post fade-in">
            <div className="post-header">
                <Link to={`/profile/${post.user?.username}`} className="post-author">
                    <div className="avatar-small">
                        {post.user?.profilePic ? (
                            <img src={getMediaUrl(post.user.profilePic)} alt={post.user.username} />
                        ) : (
                            <div className="avatar-placeholder">
                                {post.user?.username?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <span className="author-name">{post.user?.username}</span>
                </Link>

                <div className="post-options" ref={optionsRef}>
                    <button className="options-btn" onClick={() => setShowOptions(!showOptions)}>
                        <svg aria-label="More options" color="currentColor" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <circle cx="12" cy="12" r="1.5"></circle>
                            <circle cx="6" cy="12" r="1.5"></circle>
                            <circle cx="18" cy="12" r="1.5"></circle>
                        </svg>
                    </button>
                    {showOptions && (
                        <div className="options-dropdown fade-in">
                            {isOwner && (
                                <button className="dropdown-item delete" onClick={handleDelete}>
                                    Delete
                                </button>
                            )}
                            <button className="dropdown-item" onClick={() => { setShowOptions(false); setShowModal(true); }}>
                                Go to post
                            </button>
                            <button className="dropdown-item" onClick={() => setShowOptions(false)}>
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="post-image" style={{ position: 'relative' }}>
                {post.mediaType === 'video' ? (
                    <>
                        <video
                            ref={videoRef}
                            src={`${getMediaUrl(post.image)}#t=0.001`}
                            muted
                            loop
                            playsInline
                            webkit-playsinline="true"
                            preload="metadata"
                            poster={post.thumbnail ? getMediaUrl(post.thumbnail) : undefined}
                            disableRemotePlayback
                            className="post-video"
                            onClick={handleToggleMute}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000', cursor: 'pointer' }}
                        />
                        <button
                            className="post-video-mute-toggle"
                            onClick={handleToggleMute}
                            aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? (
                                <svg fill="white" height="16" viewBox="0 0 24 24" width="16">
                                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path>
                                </svg>
                            ) : (
                                <svg fill="white" height="16" viewBox="0 0 24 24" width="16">
                                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                                </svg>
                            )}
                        </button>
                    </>
                ) : (
                    <img src={getMediaUrl(post.image)} alt={post.caption} />
                )}
            </div>

            <div className="post-actions">
                <div className="actions-left">
                    <button onClick={handleLike} className="action-btn">
                        {isLiked ? (
                            <svg aria-label="Unlike" fill="#ed4956" height="24" viewBox="0 0 48 48" width="24">
                                <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                            </svg>
                        ) : (
                            <svg aria-label="Like" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                            </svg>
                        )}
                    </button>
                    <button className="action-btn" onClick={() => setShowModal(true)}>
                        <svg aria-label="Comment" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                    </button>
                </div>
                <button className="action-btn" onClick={handleSave}>
                    {isSaved ? (
                        <svg aria-label="Remove" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M20 22a.999.999 0 0 1-.687-.273L12 14.815l-7.313 6.912A1 1 0 0 1 3 21V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1Z"></path>
                        </svg>
                    ) : (
                        <svg aria-label="Save" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                        </svg>
                    )}
                </button>
            </div>

            <div className="post-info">
                <div className="likes-count">
                    <strong>{likes.length} likes</strong>
                </div>
                {post.caption && (
                    <div className="post-caption">
                        <Link to={`/profile/${post.user?.username}`} className="caption-author">
                            {post.user?.username}
                        </Link>
                        <span className="caption-text">{post.caption}</span>
                    </div>
                )}
            </div>

            {showModal && (
                <PostModal
                    post={post}
                    onClose={() => setShowModal(false)}
                    onDelete={onDelete}
                />
            )}
        </article>
    );
}

export default Post;
