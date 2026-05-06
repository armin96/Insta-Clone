import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { getMediaUrl } from '../utils/media';
import './FollowersModal.css';

function FollowersModal({ userId, initialTab = 'followers', onClose }) {
    const { user: currentUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [followingStates, setFollowingStates] = useState({});

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/users/${userId}/follow-lists`);
            setFollowers(response.data.followers);
            setFollowing(response.data.following);

            // Initialize following states
            const states = {};
            [...response.data.followers, ...response.data.following].forEach(user => {
                states[user._id] = currentUser?.following?.includes(user._id) || false;
            });
            setFollowingStates(states);
        } catch (error) {
            console.error('Error fetching follow lists:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollow = async (targetUserId) => {
        try {
            await axios.post(`/api/users/${targetUserId}/follow`);
            setFollowingStates(prev => ({
                ...prev,
                [targetUserId]: !prev[targetUserId]
            }));
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const displayList = activeTab === 'followers' ? followers : following;

    return (
        <div className="followers-modal-overlay" onClick={onClose}>
            <div className="followers-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="followers-modal-header">
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'followers' ? 'active' : ''}`}
                            onClick={() => setActiveTab('followers')}
                        >
                            Followers
                        </button>
                        <button
                            className={`tab ${activeTab === 'following' ? 'active' : ''}`}
                            onClick={() => setActiveTab('following')}
                        >
                            Following
                        </button>
                    </div>
                    <button onClick={onClose} className="close-btn">
                        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
                        </svg>
                    </button>
                </div>

                <div className="followers-modal-body">
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : displayList.length === 0 ? (
                        <div className="empty-state">
                            <p>No {activeTab} yet</p>
                        </div>
                    ) : (
                        <div className="followers-list">
                            {displayList.map((user) => (
                                <div key={user._id} className="follower-item">
                                    <Link
                                        to={`/profile/${user.username}`}
                                        className="user-link"
                                        onClick={onClose}
                                    >
                                        <div className="avatar-small">
                                            {user.profilePic ? (
                                                <img src={getMediaUrl(user.profilePic)} alt={user.username} />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="user-info">
                                            <span className="username">{user.username}</span>
                                            {user.bio && <span className="bio">{user.bio}</span>}
                                        </div>
                                    </Link>
                                    {user._id !== currentUser?._id && (
                                        <button
                                            onClick={() => handleFollow(user._id)}
                                            className={followingStates[user._id] ? 'btn-secondary' : 'btn-primary'}
                                        >
                                            {followingStates[user._id] ? 'Unfollow' : 'Follow'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FollowersModal;
