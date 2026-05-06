import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getMediaUrl } from '../utils/media';
import { useAuthStore } from '../store/authStore';
import { useAudioStore } from '../store/audioStore';
import './ReelsViewer.css';

// Platform detection
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

function ReelsViewer({ posts, initialIndex, onClose, onLoadMore, isLoadingMore, onDelete }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const { user } = useAuthStore();
    const { isMuted, toggleMute } = useAudioStore();

    // Centralized Video Management
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [activeVideoSrc, setActiveVideoSrc] = useState('');
    const lastLoadedSrc = useRef('');

    const lastScrollTop = useRef(0);
    const scrollTimeoutRef = useRef(null);

    // Initial Scroll
    useEffect(() => {
        if (containerRef.current) {
            const height = containerRef.current.getBoundingClientRect().height || window.innerHeight;
            containerRef.current.scrollTop = initialIndex * height;
            lastScrollTop.current = initialIndex * height;
        }

        const timer = setTimeout(() => {
            if (containerRef.current) {
                const height = containerRef.current.getBoundingClientRect().height || window.innerHeight;
                containerRef.current.scrollTop = initialIndex * height;
                containerRef.current.scrollTo({
                    top: initialIndex * height,
                    behavior: 'instant'
                });
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [initialIndex]);

    // Auto Load More detection - only if we have a reasonable buffer
    useEffect(() => {
        if (onLoadMore && !isLoadingMore && posts.length > 5 && currentIndex >= posts.length - 3) {
            onLoadMore();
        }
    }, [currentIndex, posts.length, onLoadMore, isLoadingMore]);

    // Central Lifecycle for the Single Video Player
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const currentPost = posts[currentIndex];
        if (!currentPost || currentPost.mediaType !== 'video') {
            video.pause();
            setActiveVideoSrc('');
            lastLoadedSrc.current = '';
            setIsVideoReady(false);
            return;
        }

        const newSrc = getMediaUrl(currentPost.image);
        const videoSrc = isSafari ? `${newSrc}#t=0.001` : newSrc;

        // ONLY reload if the source has actually changed
        if (videoSrc !== lastLoadedSrc.current) {
            lastLoadedSrc.current = videoSrc;
            setIsVideoReady(false);
            setActiveVideoSrc(videoSrc);

            let isMounted = true;
            const loadAndPlay = async () => {
                try {
                    // Mute before load to satisfy autoplay policies
                    video.muted = true;
                    video.load();

                    // Small delay to let the browser process the load
                    await new Promise(resolve => setTimeout(resolve, 50));

                    if (!isMounted) return;

                    await video.play();

                    if (isMounted && !isMuted) {
                        video.muted = false;
                    }
                } catch (err) {
                    if (isMounted && err.name !== 'AbortError') {
                        console.warn("Video auto-play failed:", err);
                    }
                }
            };
            loadAndPlay();
            return () => { isMounted = false; };
        } else {
            // Source is same, just ensure it's playing and respect mute
            video.muted = isMuted;
            if (video.paused && !isLoadingMore) {
                video.play().catch(() => { });
            }
        }
    }, [currentIndex, posts, isMuted, isLoadingMore]);

    const handleScroll = () => {
        if (scrollTimeoutRef.current) {
            cancelAnimationFrame(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = requestAnimationFrame(() => {
            if (containerRef.current) {
                const scrollTop = containerRef.current.scrollTop;
                const height = containerRef.current.getBoundingClientRect().height || window.innerHeight;

                if (Math.abs(scrollTop - lastScrollTop.current) > height / 3) {
                    const newIndex = Math.round(scrollTop / height);
                    if (newIndex >= 0 && newIndex < posts.length) {
                        if (newIndex !== currentIndex) {
                            setCurrentIndex(newIndex);
                        }
                        lastScrollTop.current = scrollTop;
                    }
                }
            }
        });
    };

    const handleVideoTimeUpdate = () => {
        const video = videoRef.current;
        if (video && video.currentTime > 0.1 && !isVideoReady) {
            setIsVideoReady(true);
        }
    };

    // Failsafe visibility timer
    useEffect(() => {
        if (activeVideoSrc) {
            const timer = setTimeout(() => {
                if (!isVideoReady) {
                    console.log("Failsafe visibility triggered after 2s");
                    setIsVideoReady(true);
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [activeVideoSrc, isVideoReady]);

    const handleToggleMute = useCallback(() => {
        toggleMute();
    }, [toggleMute]);

    return createPortal(
        <div className="reels-viewer">
            <button className="reels-close" onClick={onClose} style={{ zIndex: 100 }}>
                <svg fill="white" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
                </svg>
            </button>

            {/* Global Mute Toggle Button */}
            <button className="reels-mute-toggle" onClick={handleToggleMute} style={{ zIndex: 101 }}>
                {isMuted ? (
                    <svg fill="white" height="24" viewBox="0 0 24 24" width="24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path>
                    </svg>
                ) : (
                    <svg fill="white" height="24" viewBox="0 0 24 24" width="24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
                    </svg>
                )}
            </button>

            <div
                className="reels-container"
                ref={containerRef}
                onScroll={handleScroll}
            >
                {/* Single Player Layer - Fixed position but calculated transform */}
                <div
                    className="reels-video-layer"
                    style={{
                        transform: `translateY(${currentIndex * 100}%)`,
                        opacity: isVideoReady ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out'
                    }}
                    onClick={handleToggleMute}
                >
                    <video
                        ref={videoRef}
                        src={activeVideoSrc}
                        onTimeUpdate={handleVideoTimeUpdate}
                        onPlaying={() => setIsVideoReady(true)}
                        onWaiting={() => setIsVideoReady(false)}
                        onEnded={() => videoRef.current?.play().catch(() => { })}
                        loop
                        playsInline
                        webkit-playsinline="true"
                        muted={isMuted}
                        preload="auto"
                        disableRemotePlayback
                        className="reel-video"
                    />
                </div>

                {posts.map((post, index) => (
                    <ReelItem
                        key={`${post._id}-${index}-${post.createdAt}`}
                        post={post}
                        index={index}
                        isActive={index === currentIndex}
                        isMuted={isMuted}
                        onToggleMute={handleToggleMute}
                        isVideoReady={isVideoReady && index === currentIndex}
                        user={user}
                        onDelete={onDelete}
                    />
                ))}
                {isLoadingMore && (
                    <div className="reel-item loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="spinner-small" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

function ReelItem({ post, index, isActive, isMuted, onToggleMute, isVideoReady, user, onDelete }) {
    const [isLiked, setIsLiked] = useState(post?.likes?.includes(user?._id));
    const [likesCount, setLikesCount] = useState(post?.likes?.length || 0);
    const [showOptions, setShowOptions] = useState(false);
    const optionsRef = useRef(null);
    const mediaUrl = useMemo(() => getMediaUrl(post.image), [post.image]);

    // Close options when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showOptions]);

    const handleLike = async () => {
        try {
            await axios.post(`/api/posts/${post._id}/like`);
            setIsLiked(!isLiked);
            setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this reel?')) {
            try {
                await axios.delete(`/api/posts/${post._id}`);
                if (onDelete) onDelete(post._id);
                setShowOptions(false);
            } catch (error) {
                console.error('Error deleting reel:', error);
                alert('Failed to delete reel');
            }
        }
    };

    const isOwner = user?._id === post.user?._id || user?._id === post.user;

    return (
        <div className={`reel-item ${isVideoReady ? 'video-active' : ''}`} data-index={index}>
            <div className="reel-media" onClick={onToggleMute}>
                {/* Visual Placeholder - Using generated thumbnail if available */}
                {post.mediaType === 'video' ? (
                    <div
                        className="reel-image placeholder video-placeholder"
                        style={{
                            opacity: isVideoReady ? 0 : 1,
                            transition: 'opacity 0.2s ease-in-out',
                            background: post.thumbnail ? `url(${getMediaUrl(post.thumbnail)})` : 'linear-gradient(45deg, #1a1a1a, #000)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {!post.thumbnail && (
                            <div className="video-icon" style={{ opacity: 0.3 }}>
                                <svg fill="white" height="48" viewBox="0 0 24 24" width="48">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                                </svg>
                            </div>
                        )}
                    </div>
                ) : (
                    <img
                        src={mediaUrl}
                        alt=""
                        className="reel-image placeholder"
                        style={{
                            opacity: isVideoReady ? 0 : 1,
                            transition: 'opacity 0.2s ease-in-out'
                        }}
                    />
                )}
            </div>

            <div className="reel-overlay">
                <div className="reel-content-bottom">
                    <div className="reel-info">
                        <Link to={`/profile/${post.user?.username}`} className="reel-user-info">
                            <div className="avatar-small">
                                {post.user?.profilePic ? (
                                    <img src={getMediaUrl(post.user.profilePic)} alt={post.user.username} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {post.user?.username?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <span className="reel-username">{post.user?.username}</span>
                            <span className="dot-separator">•</span>
                            <button className="follow-btn-mini">Follow</button>
                        </Link>

                        {post.caption && (
                            <div className="reel-caption">
                                <span className="caption-text">{post.caption}</span>
                            </div>
                        )}

                        <div className="reel-music">
                            <svg fill="currentColor" height="12" viewBox="0 0 24 24" width="12">
                                <path d="M21 15v3.93a4.002 4.002 0 0 1-3 3.822c-1.602.431-3.222-.092-4.134-1.291a3.998 3.998 0 0 1-.866-2.461 4 4 0 0 1 4-4c.728 0 1.4.197 1.97.539l.03-.039V7.1l-10 2.5v10.33a4 4 0 0 1-3 3.822c-1.602.431-3.222-.091-4.134-1.291A3.998 3.998 0 0 1 1 19a4 4 0 0 1 4-4c.728 0 1.4.197 1.97.539l.03-.039V3.535a1 1 0 0 1 .758-.97l11-2.75A1 1 0 0 1 21 1V15z"></path>
                            </svg>
                            <div className="music-scroll">
                                <span>Original Audio • {post.user?.username}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="reel-sidebar">
                    <div className="reel-owner-avatar">
                        <Link to={`/profile/${post.user?.username}`}>
                            <div className="avatar-medium-border">
                                {post.user?.profilePic ? (
                                    <img src={getMediaUrl(post.user.profilePic)} alt={post.user.username} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {post.user?.username?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                <div className="plus-icon">
                                    <svg fill="white" height="12" viewBox="0 0 24 24" width="12">
                                        <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <button className="reel-action" onClick={handleLike}>
                        <div className="icon-wrapper">
                            {isLiked ? (
                                <svg aria-label="Unlike" fill="#ed4956" height="28" viewBox="0 0 48 48" width="28">
                                    <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                                </svg>
                            ) : (
                                <svg aria-label="Like" fill="white" height="28" viewBox="0 0 24 24" width="28">
                                    <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                                </svg>
                            )}
                        </div>
                        <span className="reel-count">{likesCount}</span>
                    </button>

                    <button className="reel-action">
                        <div className="icon-wrapper">
                            <svg aria-label="Comment" fill="white" height="28" viewBox="0 0 24 24" width="28">
                                <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5"></path>
                            </svg>
                        </div>
                        <span className="reel-count">{post.comments?.length || 0}</span>
                    </button>

                    <button className="reel-action">
                        <div className="icon-wrapper">
                            <svg aria-label="Share" fill="white" height="28" viewBox="0 0 24 24" width="28">
                                <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                                <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5"></polygon>
                            </svg>
                        </div>
                    </button>

                    <div className="reel-options-container" ref={optionsRef}>
                        <button className="reel-action" onClick={() => setShowOptions(!showOptions)}>
                            <div className="icon-wrapper">
                                <svg aria-label="More options" color="white" fill="white" height="28" viewBox="0 0 24 24" width="28">
                                    <circle cx="12" cy="12" r="1.5"></circle>
                                    <circle cx="6" cy="12" r="1.5"></circle>
                                    <circle cx="18" cy="12" r="1.5"></circle>
                                </svg>
                            </div>
                        </button>
                        {showOptions && (
                            <div className="reel-options-dropdown fade-in">
                                {isOwner && (
                                    <button className="dropdown-item delete" onClick={handleDelete}>
                                        Delete
                                    </button>
                                )}
                                <button className="dropdown-item" onClick={() => setShowOptions(false)}>
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="reel-music-icon-sidebar">
                        <div className="music-disc-animation">
                            {post.user?.profilePic ? (
                                <img src={getMediaUrl(post.user.profilePic)} alt="music" />
                            ) : (
                                <div className="music-placeholder"></div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReelsViewer;
