import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import LikesModal from './LikesModal';
import { getMediaUrl } from '../utils/media';
import './PostModal.css';

function PostModal({ post, onClose, onDelete }) {
    const { user } = useAuthStore();
    const [likes, setLikes] = useState(post.likes || []);
    const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
    const [comments, setComments] = useState(post.comments || []);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';

        // Fetch comments
        fetchComments();

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/posts/${post._id}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

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

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await axios.delete(`/api/posts/${post._id}`);
                if (onDelete) onDelete(post._id);
                onClose();
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post');
            }
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (!commentText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await axios.post(`/api/posts/${post._id}/comment`, {
                text: commentText
            });
            setComments([...comments, response.data]);
            setCommentText('');
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!post) return null;

    const isOwner = user?._id === post.user?._id || user?._id === post.user;

    return (
        <>
            <div className="post-modal-overlay" onClick={onClose}>
                <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="post-modal-close" onClick={onClose}>
                        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
                        </svg>
                    </button>

                    <div className="post-modal-image">
                        {post.mediaType === 'video' ? (
                            <video
                                src={`${getMediaUrl(post.image)}#t=0.001`}
                                autoPlay
                                muted
                                loop
                                playsInline
                                webkit-playsinline="true"
                                className="modal-video"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <img src={getMediaUrl(post.image)} alt={post.caption} />
                        )}
                    </div>

                    <div className="post-modal-sidebar">
                        <div className="post-modal-header">
                            <Link to={`/profile/${post.user?.username}`} className="post-modal-user">
                                <div className="avatar-small">
                                    {post.user?.profilePic ? (
                                        <img src={getMediaUrl(post.user.profilePic)} alt={post.user.username} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {post.user?.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <span className="username">{post.user?.username}</span>
                            </Link>

                            <div className="post-options">
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
                                        <button className="dropdown-item" onClick={() => setShowOptions(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="post-modal-comments">
                            {post.caption && (
                                <div className="comment-item">
                                    <Link to={`/profile/${post.user?.username}`} className="comment-user">
                                        <div className="avatar-small">
                                            {post.user?.profilePic ? (
                                                <img src={getMediaUrl(post.user.profilePic)} alt={post.user.username} />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {post.user?.username?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="comment-content">
                                        <Link to={`/profile/${post.user?.username}`} className="comment-username">
                                            {post.user?.username}
                                        </Link>
                                        <span className="comment-text">{post.caption}</span>
                                    </div>
                                </div>
                            )}

                            {comments.map((comment) => (
                                <div key={comment._id} className="comment-item">
                                    <Link to={`/profile/${comment.user?.username}`} className="comment-user">
                                        <div className="avatar-small">
                                            {comment.user?.profilePic ? (
                                                <img src={getMediaUrl(comment.user.profilePic)} alt={comment.user.username} />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {comment.user?.username?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="comment-content">
                                        <Link to={`/profile/${comment.user?.username}`} className="comment-username">
                                            {comment.user?.username}
                                        </Link>
                                        <span className="comment-text">{comment.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="post-modal-actions">
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
                        </div>

                        <div className="post-modal-stats">
                            <button
                                className="stat-item clickable"
                                onClick={() => setShowLikesModal(true)}
                            >
                                <strong>{likes.length} likes</strong>
                            </button>
                        </div>

                        <form onSubmit={handleCommentSubmit} className="comment-form">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="comment-input"
                                maxLength={500}
                            />
                            <button
                                type="submit"
                                className="comment-submit"
                                disabled={!commentText.trim() || isSubmitting}
                            >
                                Post
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {showLikesModal && (
                <LikesModal
                    postId={post._id}
                    onClose={() => setShowLikesModal(false)}
                />
            )}
        </>
    );
}

export default PostModal;
