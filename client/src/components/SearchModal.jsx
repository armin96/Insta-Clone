import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getMediaUrl } from '../utils/media';
import './SearchModal.css';

function SearchModal({ onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);

    useEffect(() => {
        // Load recent searches from localStorage
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(recent);
    }, []);

    useEffect(() => {
        const searchUsers = async () => {
            if (query.trim() === '') {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await axios.get(`/api/users/search?q=${encodeURIComponent(query)}`);
                setResults(response.data);
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleUserClick = (user) => {
        // Add to recent searches
        const recent = [user, ...recentSearches.filter(u => u._id !== user._id)].slice(0, 10);
        setRecentSearches(recent);
        localStorage.setItem('recentSearches', JSON.stringify(recent));
        onClose();
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const removeRecentSearch = (userId) => {
        const updated = recentSearches.filter(u => u._id !== userId);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    return (
        <div className="search-modal-overlay" onClick={onClose}>
            <div className="search-modal" onClick={(e) => e.stopPropagation()}>
                <div className="search-modal-header">
                    <h2>Search</h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
                        </svg>
                    </button>
                </div>

                <div className="search-input-container">
                    <div className="search-input-wrapper">
                        <svg aria-label="Search" fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
                            <path d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.511" x2="22" y1="16.511" y2="22"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        {query && (
                            <button className="clear-search-btn" onClick={() => setQuery('')}>
                                <svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
                                    <circle cx="12" cy="12" r="10" fill="var(--text-secondary)"></circle>
                                    <path d="M15 9L9 15M9 9l6 6" stroke="var(--bg-primary)" strokeLinecap="round" strokeWidth="2"></path>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="search-content">
                    {query === '' && recentSearches.length > 0 && (
                        <div className="recent-searches">
                            <div className="recent-header">
                                <h3>Recent</h3>
                                <button onClick={clearRecentSearches}>Clear all</button>
                            </div>
                            <div className="search-results-list">
                                {recentSearches.map(user => (
                                    <div key={user._id} className="search-result-item">
                                        <Link to={`/profile/${user.username}`} onClick={() => handleUserClick(user)}>
                                            <div className="search-result-avatar">
                                                {user.profilePic ? (
                                                    <img src={user.profilePic} alt={user.username} />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {user.username[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="search-result-info">
                                                <span className="search-result-username">{user.username}</span>
                                                {user.bio && <span className="search-result-bio">{user.bio}</span>}
                                            </div>
                                        </Link>
                                        <button className="remove-btn" onClick={() => removeRecentSearch(user._id)}>
                                            <svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
                                                <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {query !== '' && (
                        <>
                            {isLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="no-results">
                                    <p>No results found.</p>
                                </div>
                            ) : (
                                <div className="search-results-list">
                                    {results.map(user => (
                                        <Link
                                            key={user._id}
                                            to={`/profile/${user.username}`}
                                            className="search-result-item"
                                            onClick={() => handleUserClick(user)}
                                        >
                                            <div className="search-result-avatar">
                                                {user.profilePic ? (
                                                    <img src={user.profilePic} alt={user.username} />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {user.username[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="search-result-info">
                                                <span className="search-result-username">{user.username}</span>
                                                {user.bio && <span className="search-result-bio">{user.bio}</span>}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchModal;
