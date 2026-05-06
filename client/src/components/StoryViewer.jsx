import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getMediaUrl } from '../utils/media';
import './StoryViewer.css';

function StoryViewer({ stories, initialIndex = 0, onClose }) {
    const [currentUserIndex, setCurrentUserIndex] = useState(initialIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const currentUserStories = stories[currentUserIndex];
    const currentStory = currentUserStories?.stories[currentStoryIndex];

    useEffect(() => {
        if (!currentStory) return;

        // Mark story as viewed
        axios.post(`/api/stories/${currentStory._id}/view`).catch(console.error);

        // Progress bar animation
        const duration = 5000; // 5 seconds per story
        const interval = 50;
        let elapsed = 0;

        const timer = setInterval(() => {
            elapsed += interval;
            setProgress((elapsed / duration) * 100);

            if (elapsed >= duration) {
                handleNext();
            }
        }, interval);

        return () => clearInterval(timer);
    }, [currentStory?._id]);

    const handleNext = () => {
        if (currentStoryIndex < currentUserStories.stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
            setProgress(0);
        } else if (currentUserIndex < stories.length - 1) {
            setCurrentUserIndex(currentUserIndex + 1);
            setCurrentStoryIndex(0);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const handlePrevious = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
            setProgress(0);
        } else if (currentUserIndex > 0) {
            setCurrentUserIndex(currentUserIndex - 1);
            const prevUserStories = stories[currentUserIndex - 1];
            setCurrentStoryIndex(prevUserStories.stories.length - 1);
            setProgress(0);
        }
    };

    const handleAreaClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        if (x < width / 2) {
            handlePrevious();
        } else {
            handleNext();
        }
    };

    if (!currentStory) return null;

    return (
        <div className="story-viewer-overlay" onClick={onClose}>
            <div className="story-viewer" onClick={(e) => e.stopPropagation()}>
                <div className="story-header">
                    <div className="progress-bars">
                        {currentUserStories.stories.map((_, index) => (
                            <div key={index} className="progress-bar-container">
                                <div
                                    className="progress-bar"
                                    style={{
                                        width: index < currentStoryIndex ? '100%' :
                                            index === currentStoryIndex ? `${progress}%` : '0%'
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="story-user-info">
                        <Link to={`/profile/${currentUserStories.user.username}`} onClick={onClose}>
                            <div className="avatar-small">
                                {currentUserStories.user.profilePic ? (
                                    <img src={getMediaUrl(currentUserStories.user.profilePic)} alt={currentUserStories.user.username} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {currentUserStories.user.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </Link>
                        <Link to={`/profile/${currentUserStories.user.username}`} className="username" onClick={onClose}>
                            {currentUserStories.user.username}
                        </Link>
                        <button onClick={onClose} className="close-story-btn">
                            <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="story-content" onClick={handleAreaClick}>
                    {currentStory.mediaType === 'video' ? (
                        <video
                            src={`${getMediaUrl(currentStory.image)}#t=0.001`}
                            autoPlay
                            muted
                            playsInline
                            className="story-video"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <img src={getMediaUrl(currentStory.image)} alt="Story" />
                    )}
                </div>
            </div>
        </div>
    );
}

export default StoryViewer;
