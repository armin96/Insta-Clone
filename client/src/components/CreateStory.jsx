import { useState } from 'react';
import axios from 'axios';
import './CreateStory.css';

function CreateStory({ onClose, onStoryCreated }) {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleMediaSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file); // Store raw file (kept name as image for compatibility or can rename to media)
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleShare = async () => {
        if (!image || isUploading) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('media', image);

            const response = await axios.post('/api/stories', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onStoryCreated?.(response.data);
            onClose();
        } catch (error) {
            console.error('Error creating story:', error);
            alert('Failed to create story');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="create-story-overlay" onClick={onClose}>
            <div className="create-story-modal" onClick={(e) => e.stopPropagation()}>
                <div className="create-story-header">
                    <button onClick={onClose} className="back-btn">
                        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M21 11H5.414l4.293-4.293a1 1 0 1 0-1.414-1.414l-6 6a1 1 0 0 0 0 1.414l6 6a1 1 0 0 0 1.414-1.414L5.414 13H21a1 1 0 0 0 0-2z"></path>
                        </svg>
                    </button>
                    <h2>Create Story</h2>
                    {preview && (
                        <button onClick={handleShare} className="share-btn" disabled={isUploading}>
                            {isUploading ? 'Sharing...' : 'Share'}
                        </button>
                    )}
                </div>

                <div className="create-story-content">
                    {!preview ? (
                        <div className="upload-area">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleMediaSelect}
                                id="story-upload"
                                hidden
                            />
                            <label htmlFor="story-upload" className="upload-label">
                                <svg fill="currentColor" height="77" viewBox="0 0 97.6 77.3" width="97">
                                    <path d="M16.3 29.3c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16-7.2-16-16-16zm0 26.7c-5.9 0-10.7-4.8-10.7-10.7s4.8-10.7 10.7-10.7 10.7 4.8 10.7 10.7-4.8 10.7-10.7 10.7zm70.5-39.9c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16-7.2-16-16-16zm0 26.7c-5.9 0-10.7-4.8-10.7-10.7s4.8-10.7 10.7-10.7S97.6 26.2 97.6 32s-4.8 10.7-10.7 10.7zM44.4 0C33.2 0 24.1 9.1 24.1 20.3s9.1 20.3 20.3 20.3 20.3-9.1 20.3-20.3S55.6 0 44.4 0zm0 35.3c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z"></path>
                                </svg>
                                <p>Select photo from computer</p>
                            </label>
                        </div>
                    ) : (
                        <div className="story-preview">
                            {image?.type.startsWith('video/') || (typeof preview === 'string' && preview.startsWith('data:video/')) ? (
                                <video src={preview} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <img src={preview} alt="Story preview" />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateStory;
