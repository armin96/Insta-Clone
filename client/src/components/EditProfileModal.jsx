import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { getMediaUrl } from '../utils/media';
import './EditProfileModal.css';

function EditProfileModal({ profile, onClose, onProfileUpdated }) {
    const { user, checkAuth } = useAuthStore();
    const [username, setUsername] = useState(profile.username);
    const [bio, setBio] = useState(profile.bio || '');
    const [profilePic, setProfilePic] = useState(null);
    const [profilePicPreview, setProfilePicPreview] = useState(getMediaUrl(profile.profilePic) || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            setError('');
            setProfilePic(file); // Store raw file
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('bio', bio);
            if (profilePic) {
                formData.append('profilePic', profilePic);
            }

            const response = await axios.put('/api/users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update auth store with new user data
            await checkAuth();

            if (onProfileUpdated) {
                onProfileUpdated(response.data);
            }

            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content edit-profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Profile</h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="edit-profile-form">
                    <div className="profile-pic-section">
                        <div className="profile-pic-preview">
                            {profilePicPreview ? (
                                <img src={profilePicPreview} alt="Profile" />
                            ) : (
                                <div className="avatar-placeholder-large">
                                    {username[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="profile-pic-actions">
                            <h3>{username}</h3>
                            <label htmlFor="profile-pic-input" className="change-photo-btn">
                                Change profile photo
                            </label>
                            <input
                                id="profile-pic-input"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            maxLength={30}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={150}
                            rows={3}
                            placeholder="Tell us about yourself..."
                        />
                        <span className="char-count">{bio.length}/150</span>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProfileModal;
