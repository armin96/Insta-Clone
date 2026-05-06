import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getMediaUrl } from '../utils/media';
import './LikesModal.css';

function LikesModal({ postId, onClose }) {
    const [likes, setLikes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLikes();
    }, [postId]);

    const fetchLikes = async () => {
        try {
            const response = await axios.get(`/api/posts/${postId}/likes`);
            setLikes(response.data);
        } catch (error) {
            console.error('Error fetching likes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="likes-modal-overlay" onClick={onClose}>
            <div className="likes-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="likes-modal-header">
                    <h2>Likes</h2>
                    <button onClick={onClose} className="close-btn">
                        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
                        </svg>
                    </button>
                </div>

                <div className="likes-modal-body">
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : likes.length === 0 ? (
                        <div className="empty-state">
                            <p>No likes yet</p>
                        </div>
                    ) : (
                        <div className="likes-list">
                            {likes.map((user) => (
                                <Link
                                    key={user._id}
                                    to={`/profile/${user.username}`}
                                    className="like-item"
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LikesModal;
