import React, { useState, useEffect } from 'react';
import {
  Compass,
  Menu as MenuIcon,
  X as XIcon,
  Zap,
  PlusCircle,
  Library,
  BookOpen,
  LayoutDashboard,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AuthButton from '../auth/AuthButton';
import { useAuth } from '../../hooks/useAuth';

interface NavLinkItem {
  to: string;
  label: string;
  icon?: React.ReactElement;
  authRequired?: boolean;
  hideWhenAuth?: boolean;
}

const Header: React.FC = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Define navigation links in the new desired order
  const navLinks: NavLinkItem[] = [
    {
      to: '/library',
      label: 'Cipher Library',
      icon: <BookOpen size={18} />,
    },
    {
      to: '/solve',
      label: 'Solve a Hunt',
      icon: <Zap size={18} />,
      authRequired: true,
    },
    {
      to: '/create',
      label: 'Create Hunt',
      icon: <PlusCircle size={18} />,
      authRequired: true,
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const renderNavLinks = (isMobile = false) => {
    return navLinks.map((link) => {
      if (link.authRequired && !user) return null;
      if (link.hideWhenAuth && user) return null;

      return (
          <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors
            ${
                  isMobile
                      ? 'text-gray-700 hover:bg-gray-100 w-full text-lg py-3'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={isMobile ? toggleMobileMenu : undefined}
          >
            {link.icon &&
                React.cloneElement(link.icon, {
                  className: isMobile ? 'mr-3' : 'mr-1',
                })}
            {link.label}
          </Link>
      );
    });
  };

  return (
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <Compass className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">CipherChase</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {renderNavLinks()}
            <div className="ml-2">
              <AuthButton />
            </div>
          </nav>

          <div className="md:hidden flex items-center gap-4">
            <AuthButton />
            <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                  <XIcon className="h-6 w-6" />
              ) : (
                  <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm md:hidden">
              <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b">
                <Link
                    to="/"
                    className="flex items-center gap-2"
                    onClick={toggleMobileMenu}
                >
                  <Compass className="h-7 w-7 text-blue-600" />
                  <span className="text-xl font-bold text-gray-800">
                CipherChase
              </span>
                </Link>
                <button
                    onClick={toggleMobileMenu}
                    className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-col space-y-1 p-4">
                {renderNavLinks(true)}
              </nav>
            </div>
        )}
      </header>
  );
};

export default Header;