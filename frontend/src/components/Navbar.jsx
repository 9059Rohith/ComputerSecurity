import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { APP_NAME } from '../utils/constants';
import { getRoleBadgeColor } from '../utils/formatters';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-3xl">🔒</span>
              <span className="text-white text-xl font-bold">{APP_NAME}</span>
            </Link>
            {isAuthenticated && (
              <div className="hidden md:flex ml-10 space-x-4">
                <Link
                  to="/dashboard"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/files"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Files
                </Link>
                <Link
                  to="/upload"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Upload
                </Link>
                <Link
                  to="/security-docs"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Security
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3">
                  <span className="text-white text-sm font-medium">{user?.username}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
