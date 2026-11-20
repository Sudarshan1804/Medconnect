import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import NotificationsDropdown from './NotificationsDropdown';
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Calendar,
  FileText,
  Stethoscope,
  Home,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path) => location.pathname === path;

  const logoTarget = isAuthenticated && role === 'ADMIN' ? '/admin/dashboard' : '/';

  const navLinks = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
      show: isAuthenticated && role !== 'ADMIN',
    },
    {
      to: '/doctors',
      label: 'Doctors',
      icon: Stethoscope,
      show: isAuthenticated && role === 'PATIENT',
    },
    {
      to: '/appointments',
      label: 'My Appointments',
      icon: Calendar,
      show: isAuthenticated && role === 'PATIENT',
    },
    {
      to: '/records',
      label: 'Medical Records',
      icon: FileText,
      show: isAuthenticated && role === 'PATIENT',
    },
    {
      to: '/doctor/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: isAuthenticated && role === 'DOCTOR',
    },
    {
      to: '/admin/dashboard',
      label: 'Admin',
      icon: LayoutDashboard,
      show: isAuthenticated && role === 'ADMIN',
    },
  ];

  const visibleLinks = navLinks.filter((l) => l.show);

  return (
    <nav className="sticky top-0 z-40 bg-[#f0f4f6]/95 dark:bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={logoTarget} className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-700 to-slate-900 dark:from-teal-400 dark:to-teal-200 bg-clip-text text-transparent">
              MedConnect
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60'
                    : 'text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-button"
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-all duration-200 focus:outline-none"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <NotificationsDropdown />

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    id="profile-menu-toggle"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-tight">
                        {user?.first_name || 'User'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight capitalize">
                        {role?.toLowerCase()}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 animate-slide-down z-50">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        id="logout-button"
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                          navigate('/', { replace: true });
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost btn-sm text-sm">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary btn-sm text-sm">
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {visibleLinks.length > 0 && (
              <button
                className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && visibleLinks.length > 0 && (
          <div className="md:hidden pb-4 animate-slide-down">
            <div className="flex flex-col gap-1 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              {visibleLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/60'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
