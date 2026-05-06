import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNavbar from './mobile/MobileNavbar';
import MobileHeader from './mobile/MobileHeader';
import CreatePost from './CreatePost';
import SearchModal from './SearchModal';
import useIsMobile from '../hooks/useIsMobile';
import './Layout.css';

function Layout() {
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const isMobile = useIsMobile();

    const handlePostCreated = () => {
        window.location.reload();
    };

    return (
        <div className={`layout ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
            {isMobile ? (
                <>
                    <MobileHeader onSearchClick={() => setIsSearchOpen(true)} />
                    <main className="main-content mobile-main">
                        <Outlet />
                    </main>
                    <MobileNavbar onCreatePost={() => setIsCreatePostOpen(true)} />
                </>
            ) : (
                <>
                    <Navbar onCreatePost={() => setIsCreatePostOpen(true)} />
                    <main className="main-content desktop-main">
                        <Outlet />
                    </main>
                </>
            )}

            <CreatePost
                isOpen={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
                onPostCreated={handlePostCreated}
            />

            {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}
        </div>
    );
}

export default Layout;
