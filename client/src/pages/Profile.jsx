import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import FollowersModal from '../components/FollowersModal';
import ReelsViewer from '../components/ReelsViewer';
import PostModal from '../components/PostModal';
import EditProfileModal from '../components/EditProfileModal';
import { getMediaUrl } from '../utils/media';
import './Profile.css';

function Profile() {
    const { username } = useParams();
    const { user: currentUser } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [followersModalTab, setFollowersModalTab] = useState('followers');
    const [selectedPost, setSelectedPost] = useState(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [postsPage, setPostsPage] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [loadingMorePosts, setLoadingMorePosts] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/users/${username}?postsPage=1&postsLimit=12`);
            setProfile(response.data.user);
            setPosts(response.data.posts);
            setTotalPosts(response.data.totalPosts);
            setFollowersCount(response.data.user.followers?.length || 0);
            setFollowingCount(response.data.user.following?.length || 0);
            setIsFollowing(response.data.user.followers?.some(f => f._id === currentUser?._id) || false);
            setHasMorePosts(response.data.posts.length === 12);
            setPostsPage(1);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMorePosts = async () => {
        if (loadingMorePosts || !hasMorePosts) return;

        setLoadingMorePosts(true);
        try {
            const nextPage = postsPage + 1;
            const response = await axios.get(`/api/users/${username}?postsPage=${nextPage}&postsLimit=12`);

            if (response.data.posts.length > 0) {
                setPosts(prev => [...prev, ...response.data.posts]);
                setPostsPage(nextPage);
                setHasMorePosts(response.data.posts.length === 12);
            } else {
                setHasMorePosts(false);
            }
        } catch (error) {
            console.error('Error fetching more posts:', error);
        } finally {
            setLoadingMorePosts(false);
        }
    };

    // Infinite Scroll for Profile
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMorePosts && !loadingMorePosts && !isLoading) {
                fetchMorePosts();
            }
        }, { threshold: 0.1 });

        const target = document.getElementById('profile-load-more');
        if (target) observer.observe(target);

        return () => observer.disconnect();
    }, [postsPage, hasMorePosts, loadingMorePosts, isLoading, username]);

    const handleFollow = async () => {
        try {
            const response = await axios.post(`/api/users/${profile._id}/follow`);
            setIsFollowing(response.data.isFollowing);
            setFollowersCount(response.data.followersCount);
            setFollowingCount(response.data.followingCount);
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    // Memoize video posts for ReelsViewer
    const videoPosts = useMemo(() => posts.filter(p => p.mediaType === 'video'), [posts]);
    const initialReelIndex = useMemo(() =>
        selectedPost ? videoPosts.findIndex(p => String(p._id) === String(selectedPost._id)) : -1
        , [selectedPost, videoPosts]);

    const handlePostDelete = (postId) => {
        setPosts(prev => prev.filter(p => p._id !== postId));
        setTotalPosts(prev => Math.max(0, prev - 1));
        setSelectedPost(null);
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="empty-state">
                <h2>User not found</h2>
            </div>
        );
    }

    const isOwnProfile = currentUser?.username === profile.username;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar-large">
                    {profile.profilePic ? (
                        <img src={getMediaUrl(profile.profilePic)} alt={profile.username} />
                    ) : (
                        <div className="avatar-placeholder-large">
                            {profile.username[0].toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="profile-info">
                    <div className="profile-username-row">
                        <h1>{profile.username}</h1>
                        {isOwnProfile ? (
                            <button className="btn-secondary" onClick={() => setShowEditProfile(true)}>Edit Profile</button>
                        ) : (
                            <button
                                onClick={handleFollow}
                                className={isFollowing ? "btn-secondary" : "btn-primary"}
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                        )}
                    </div>

                    <div className="profile-stats">
                        <div className="stat">
                            <span className="stat-value">{totalPosts}</span>
                            <span className="stat-label">posts</span>
                        </div>
                        <button
                            className="stat clickable-stat"
                            onClick={() => {
                                setFollowersModalTab('followers');
                                setShowFollowersModal(true);
                            }}
                        >
                            <span className="stat-value">{followersCount}</span>
                            <span className="stat-label">followers</span>
                        </button>
                        <button
                            className="stat clickable-stat"
                            onClick={() => {
                                setFollowersModalTab('following');
                                setShowFollowersModal(true);
                            }}
                        >
                            <span className="stat-value">{followingCount}</span>
                            <span className="stat-label">following</span>
                        </button>
                    </div>

                    {profile.bio && (
                        <div className="profile-bio">
                            <p>{profile.bio}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-posts-grid">
                {posts.length === 0 ? (
                    <div className="empty-state">
                        <p>No posts yet</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post._id} className="grid-post" onClick={() => {
                            console.log("PROFILE GRID CLICK - Post:", post._id, "Type:", post.mediaType);
                            setSelectedPost({ ...post });
                        }}>
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
                                    <svg fill="currentColor" height="16" viewBox="0 0 48 48" width="16">
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
            <div id="profile-load-more" style={{ height: '20px', margin: '20px 0' }}>
                {loadingMorePosts && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="spinner-small" style={{ width: '20px', height: '20px', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                    </div>
                )}
            </div>

            {showFollowersModal && (
                <FollowersModal
                    userId={profile._id}
                    initialTab={followersModalTab}
                    onClose={() => setShowFollowersModal(false)}
                />
            )}

            {selectedPost && (
                (() => {
                    const isVideo = selectedPost.mediaType === 'video';
                    console.log("PROFILE MODAL RENDER - PostID:", selectedPost._id, "isVideo:", isVideo, "Index:", initialReelIndex);
                    return isVideo ? (
                        <ReelsViewer
                            posts={videoPosts}
                            initialIndex={initialReelIndex !== -1 ? initialReelIndex : 0}
                            onClose={() => setSelectedPost(null)}
                            onLoadMore={hasMorePosts ? fetchMorePosts : null}
                            isLoadingMore={loadingMorePosts}
                            onDelete={handlePostDelete}
                        />
                    ) : (
                        <PostModal
                            post={selectedPost}
                            onClose={() => setSelectedPost(null)}
                            onDelete={handlePostDelete}
                        />
                    );
                })()
            )}

            {showEditProfile && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setShowEditProfile(false)}
                    onProfileUpdated={(updatedProfile) => {
                        setProfile(updatedProfile);
                        fetchProfile();
                    }}
                />
            )}
        </div>
    );
}

export default Profile;
