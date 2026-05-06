import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './MobileNavbar.css';

function MobileNavbar({ onCreatePost }) {
    const location = useLocation();
    const { user } = useAuthStore();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="mobile-navbar">
            <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`}>
                <svg aria-label="Home" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997A2.997 2.997 0 0 1 15 16.545V22h7V11.543L12 2 2 11.543V22h7.005Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span>Home</span>
            </Link>

            <Link to="/explore" className={`mobile-nav-item ${isActive('/explore') ? 'active' : ''}`}>
                <svg aria-label="Explore" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                    <polygon fill="none" points="13.941 13.953 7.581 16.424 10.06 10.056 16.42 7.585 13.941 13.953" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                    <polygon fillRule="evenodd" points="10.88 21.94 6.52 9.92 18.54 5.56 22.9 17.58 10.88 21.94" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                </svg>
                <span>Explore</span>
            </Link>

            <button onClick={onCreatePost} className="mobile-nav-item mobile-create-btn">
                <svg aria-label="New post" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M2 12v3.45c0 2.849.698 4.005 1.606 4.944.94.909 2.098 1.608 4.946 1.608h6.896c2.848 0 4.006-.7 4.946-1.608C21.302 19.455 22 18.3 22 15.45V8.552c0-2.849-.698-4.006-1.606-4.945C19.454 2.7 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.547 2 5.703 2 8.552Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="6.545" x2="17.455" y1="12.001" y2="12.001"></line>
                    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="12.003" x2="12.003" y1="6.545" y2="17.455"></line>
                </svg>
                <span>Create</span>
            </button>

            <Link to="/saved" className={`mobile-nav-item ${isActive('/saved') ? 'active' : ''}`}>
                <svg aria-label="Saved" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
                    <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon>
                </svg>
                <span>Saved</span>
            </Link>

            <Link to={`/profile/${user?.username}`} className={`mobile-nav-item ${isActive(`/profile/${user?.username}`) ? 'active' : ''}`}>
                <div className="mobile-nav-avatar">
                    {user?.profilePic ? (
                        <img src={user.profilePic} alt={user.username} />
                    ) : (
                        <div className="mobile-avatar-placeholder">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                    )}
                </div>
                <span>Profile</span>
            </Link>
        </nav>
    );
}

export default MobileNavbar;
