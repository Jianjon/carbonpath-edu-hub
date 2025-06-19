
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Calculator, MessageSquare, Home, Puzzle, Shield, LogOut, LogIn, X, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';

const Navigation = () => {
  const location = useLocation();
  const { user, isAdmin, logout, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: '首頁', path: '/', icon: Home },
    { name: '減碳路徑', path: '/carbon-path', icon: Leaf },
    { name: '碳費模擬', path: '/carbon-tax', icon: Calculator },
    { name: '減碳行動', path: '/carbon-credits', icon: Puzzle },
    { name: 'TCFD模擬', path: '/tcfd-simulator', icon: FileText },
    { name: '減碳Chatbot', path: '/chatbot', icon: MessageSquare },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2" onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}>
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">CarbonPath 教育平台</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="flex items-center space-x-2">
              {!loading && user && isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === '/admin'
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>管理後台</span>
                </Link>
              )}
              {!loading && user ? (
                <Button onClick={logout} variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  登出
                </Button>
              ) : !loading && (
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    登入
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'text-green-700 bg-green-100'
                      : 'text-gray-900 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-2 space-y-1">
              {!loading && user && isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === '/admin'
                      ? 'text-green-700 bg-green-100'
                      : 'text-gray-900 hover:text-green-700 hover:bg-green-50'
                  }`}
                >
                  <Shield className="h-6 w-6" />
                  <span>管理後台</span>
                </Link>
              )}
              {!loading && user ? (
                <Button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-900 hover:text-green-700 hover:bg-green-50"
                >
                  <LogOut className="h-6 w-6" />
                  <span>登出</span>
                </Button>
              ) : !loading && (
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-900 hover:text-green-700 hover:bg-green-50">
                    <LogIn className="h-6 w-6" />
                    <span>登入</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
