import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import SearchModal from './SearchModal';
import { getMediaUrl } from '../utils/media';
import './Navbar.css';

function Navbar({ onCreatePost }) {
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [showSearch, setShowSearch] = useState(false);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sidebar">
            <div className="sidebar-content">
                {/* Logo */}
                <Link to="/" className="sidebar-logo">
                    <svg aria-label="Instagram" fill="currentColor" height="29" viewBox="0 0 448 512" width="103">
                        <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                    </svg>
                    <span className="logo-text">Instagram</span>
                </Link>

                {/* Navigation Links */}
                <div className="sidebar-nav">
                    <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                        <svg aria-label="Home" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                        <span>Home</span>
                    </Link>

                    <button onClick={() => setShowSearch(true)} className="nav-item">
                        <svg aria-label="Search" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M19 10.5A8.5 8.5 0 1 1 10.5 2a8.5 8.5 0 0 1 8.5 8.5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.511" x2="22" y1="16.511" y2="22"></line>
                        </svg>
                        <span>Search</span>
                    </button>

                    <Link to="/explore" className={`nav-item ${isActive('/explore') ? 'active' : ''}`}>
                        <svg aria-label="Explore" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <polygon fill="none" points="13.941 13.953 7.581 16.424 10.06 10.056 16.42 7.585 13.941 13.953" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                            <polygon fillRule="evenodd" points="10.06 10.056 13.949 13.945 7.581 16.424 10.06 10.056"></polygon>
                            <circle cx="12.001" cy="12.005" fill="none" r="10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
                        </svg>
                        <span>Explore</span>
                    </Link>

                    <Link to="/saved" className={`nav-item ${isActive('/saved') ? 'active' : ''}`}>
                        <svg aria-label="Saved" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                        </svg>
                        <span>Saved</span>
                    </Link>

                    <button onClick={onCreatePost} className="nav-item">
                        <svg aria-label="New post" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                            <path d="M2 12v3.45c0 2.849.698 4.005 1.606 4.944.94.909 2.098 1.608 4.946 1.608h6.896c2.848 0 4.006-.7 4.946-1.608C21.302 19.455 22 18.3 22 15.45V8.552c0-2.849-.698-4.006-1.606-4.945C19.454 2.7 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.547 2 5.703 2 8.552Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="6.545" x2="17.455" y1="12.001" y2="12.001"></line>
                            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="12.003" x2="12.003" y1="6.545" y2="17.455"></line>
                        </svg>
                        <span>Create</span>
                    </button>

                    <Link to={`/profile/${user?.username}`} className={`nav-item ${isActive(`/profile/${user?.username}`) ? 'active' : ''}`}>
                        <div className="nav-avatar">
                            {user?.profilePic ? (
                                <img src={getMediaUrl(user.profilePic)} alt={user.username} />
                            ) : (
                                <div className="avatar-placeholder-nav">
                                    {user?.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <span>Profile</span>
                    </Link>
                </div>

                {/* Logout Button */}
                <button onClick={logout} className="nav-item logout-btn">
                    <svg aria-label="Settings" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                        <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="3" x2="21" y1="4" y2="4"></line>
                        <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="3" x2="21" y1="12" y2="12"></line>
                        <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="3" x2="21" y1="20" y2="20"></line>
                    </svg>
                    <span>Logout</span>
                </button>
            </div>

            {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
        </nav>
    );
}

export default Navbar;
