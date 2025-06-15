
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Calculator, Coins, MessageSquare, Home, Shield } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

const Navigation = () => {
  const location = useLocation();
  const { isAdmin } = useProfile();

  const navigationItems = [
    { name: '首頁', path: '/', icon: Home },
    { name: '減碳路徑', path: '/carbon-path', icon: Leaf },
    { name: '碳費模擬', path: '/carbon-tax', icon: Calculator },
    { name: '自願性碳權', path: '/carbon-credits', icon: Coins },
    { name: '減碳Chatbot', path: '/chatbot', icon: MessageSquare },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">CarbonPath 教育平台</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
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
            {isAdmin && (
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
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
