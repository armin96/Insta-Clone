import { useState, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { getMediaUrl } from '../utils/media';
import './CreatePost.css';

function CreatePost({ isOpen, onClose, onPostCreated }) {
    const { user } = useAuthStore();
    const fileInputRef = useRef(null);
    const [media, setMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState('');
    const [mediaType, setMediaType] = useState(''); // 'image' or 'video'
    const [caption, setCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 50MB for videos, 5MB for images)
            const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
            if (file.size > maxSize) {
                setError(`File size should be less than ${file.type.startsWith('video/') ? '50MB' : '5MB'}`);
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                setError('Please select an image or video file');
                return;
            }

            setError('');
            setMedia(file);
            setMediaType(file.type.startsWith('video/') ? 'video' : 'image');

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!media) {
            setError('Please select an image or video');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('media', media);
            formData.append('caption', caption);

            const response = await axios.post('/api/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Reset form
            setMedia(null);
            setMediaPreview('');
            setMediaType('');
            setCaption('');

            // Notify parent and close modal
            if (onPostCreated) {
                onPostCreated(response.data);
            }
            onClose();
        } catch (error) {
            console.error('Error creating post:', error);
            setError(error.response?.data?.message || 'Failed to create post');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setMedia(null);
        setMediaPreview('');
        setMediaType('');
        setCaption('');
        setError('');
        onClose();
    };

    const handleSelectClick = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    {mediaPreview ? (
                        <>
                            <button className="back-btn" onClick={() => { setMedia(null); setMediaPreview(''); setMediaType(''); }}>
                                <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                                    <path d="M21 17.502a.997.997 0 0 1-1 1H4.414L12.707 26.793a1 1 0 0 1-1.414 1.414l-10-10a1 1 0 0 1 0-1.414l10-10a1 1 0 1 1 1.414 1.414L4.414 16.502H20a1 1 0 0 1 1 1Z" transform="scale(1,-1) translate(0,-32)" />
                                </svg>
                            </button>
                            <h2>Create New Post</h2>
                            <button
                                type="button"
                                className="share-header-btn"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sharing...' : 'Share'}
                            </button>
                        </>
                    ) : (
                        <>
                            <h2>Create New Post</h2>
                            <button className="close-btn" onClick={handleClose}>
                                <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                                    <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
                                </svg>
                            </button>
                        </>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="create-post-form">
                    {!mediaPreview ? (
                        <div className="image-upload-area">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleMediaChange}
                                className="file-input"
                                style={{ display: 'none' }}
                            />
                            <div className="upload-content">
                                <svg aria-label="Icon to represent media" fill="currentColor" height="77" viewBox="0 0 97.6 77.3" width="96">
                                    <path d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z"></path>
                                    <path d="M84.7 18.4 58 16.9l-.2-3c-.3-5.7-5.2-10.1-11-9.8L12.9 6c-5.7.3-10.1 5.3-9.8 11L5 51v.8c.7 5.2 5.1 9.1 10.3 9.1h.6l21.7-1.2v.6c-.3 5.7 4 10.7 9.8 11l34 2h.6c5.5 0 10.1-4.3 10.4-9.8l2-34c.4-5.8-4-10.7-9.7-11.1zM7.2 10.8C8.7 9.1 10.8 8.1 13 8l34-1.9c4.6-.3 8.6 3.3 8.9 7.9l.2 2.8-5.3-.3c-5.7-.3-10.7 4-11 9.8l-.6 9.5-9.5 10.7c-.2.3-.6.4-1 .5-.4 0-.7-.1-1-.4l-7.8-7c-1.4-1.3-3.5-1.1-4.8.3L7 49 5.2 17c-.2-2.3.6-4.5 2-6.2zm8.7 48c-4.3.2-8.1-2.8-8.8-7.1l9.4-10.5c.2-.3.6-.4 1-.5.4 0 .7.1 1 .4l7.8 7c.7.6 1.6.9 2.5.9.9 0 1.7-.5 2.3-1.1l7.8-8.8-1.1 18.6-21.9 1.1zm76.5-29.5-2 34c-.3 4.6-4.3 8.2-8.9 7.9l-34-2c-4.6-.3-8.2-4.3-7.9-8.9l2-34c.3-4.4 3.9-7.9 8.4-7.9h.5l34 2c4.7.3 8.2 4.3 7.9 8.9z"></path>
                                    <path d="M78.2 41.6 61.3 30.5c-2.1-1.4-4.9-.8-6.2 1.3-.4.7-.7 1.4-.7 2.2l-1.2 20.1c-.1 2.5 1.7 4.6 4.2 4.8h.3c.7 0 1.4-.2 2-.5l18-9c2.2-1.1 3.1-3.8 2-6-.4-.7-.9-1.3-1.5-1.8zm-1.4 6-18 9c-.4.2-.8.3-1.3.3-.4 0-.9-.2-1.2-.4-.7-.5-1.2-1.3-1.1-2.2l1.2-20.1c.1-.9.6-1.7 1.4-2.1.8-.4 1.7-.3 2.5.1L77 43.3c1.2.8 1.5 2.3.7 3.4-.2.4-.5.7-.9.9z"></path>
                                </svg>
                                <p>Drag photos and videos here</p>
                                <button
                                    type="button"
                                    className="btn-primary select-btn"
                                    onClick={handleSelectClick}
                                >
                                    Select from computer
                                </button>
                                {error && <div className="error-message" style={{ marginTop: '16px', color: '#ed4956' }}>{error}</div>}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="image-preview">
                                {mediaType === 'video' ? (
                                    <video src={mediaPreview} controls style={{ width: '100%', maxHeight: '500px' }} />
                                ) : (
                                    <img src={mediaPreview} alt="Preview" />
                                )}
                                <button
                                    type="button"
                                    className="change-image-btn"
                                    onClick={() => {
                                        setMedia(null);
                                        setMediaPreview('');
                                        setMediaType('');
                                    }}
                                >
                                    Change {mediaType === 'video' ? 'Video' : 'Image'}
                                </button>
                            </div>

                            <div className="caption-section">
                                <div className="user-info">
                                    <div className="avatar-small">
                                        {user?.profilePic ? (
                                            <img src={getMediaUrl(user.profilePic)} alt={user.username} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {user?.username?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="username">{user?.username}</span>
                                </div>

                                <textarea
                                    placeholder="Write a caption..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="caption-input"
                                    maxLength={2200}
                                />

                                <div className="caption-counter">
                                    {caption.length}/2200
                                </div>

                                {mediaType === 'video' && (
                                    <div className="video-performance-tip" style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)', padding: '8px', background: 'rgba(255,165,0,0.1)', borderRadius: '4px', borderLeft: '2px solid orange' }}>
                                        <p>💡 <b>Tip:</b> For faster loading on mobile, try to keep videos under 10MB or compress them before uploading.</p>
                                    </div>
                                )}
                            </div>

                            {error && <div className="error-message" style={{ margin: '16px', color: '#ed4956' }}>{error}</div>}
                        </>
                    )}
                </form>

                {/* Mobile Share Button - Fixed at bottom */}
                {mediaPreview && (
                    <div className="mobile-share-footer">
                        <button
                            type="button"
                            className="mobile-share-btn"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sharing...' : 'Share Post'}
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
}

export default CreatePost;
