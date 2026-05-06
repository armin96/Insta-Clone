import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Search.css';

function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <div className="search-container">
            <div className="search-header">
                <div className="search-input-wrapper">
                    <svg aria-label="Search" fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
                        <path d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.511" x2="22" y1="16.511" y2="22"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    {query && (
                        <button className="clear-btn" onClick={() => setQuery('')}>
                            <svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
                                <path d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59 7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12 5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="search-results">
                {isLoading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : query === '' ? (
                    <div className="search-empty">
                        <svg aria-label="Search" fill="currentColor" height="96" viewBox="0 0 24 24" width="96">
                            <path d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.511" x2="22" y1="16.511" y2="22"></line>
                        </svg>
                        <h2>Search for users</h2>
                        <p>Find people by their username</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="search-empty">
                        <p>No results found for "{query}"</p>
                    </div>
                ) : (
                    <div className="search-results-list">
                        {results.map(user => (
                            <Link key={user._id} to={`/profile/${user.username}`} className="search-result-item">
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
            </div>
        </div>
    );
}

export default Search;
