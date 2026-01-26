import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import authService from '../services/authService';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { isValidUsername, isValidPassword, getPasswordStrength } from '../utils/validators';
import { ROLES } from '../utils/constants';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: ROLES.RECIPIENT,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mfaData, setMfaData] = useState(null);
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!isValidUsername(formData.username)) {
      setError('Username must be 3-20 characters (letters, numbers, underscore only)');
      return;
    }

    if (!isValidPassword(formData.password)) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(
        formData.username,
        formData.password,
        formData.role
      );
      setMfaData(response);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success && mfaData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="text-6xl">✅</span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Registration Successful!</h2>
            <p className="mt-2 text-gray-600">Set up your Multi-Factor Authentication</p>
          </div>

          <SuccessMessage message={mfaData.message} />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📱 Setup Instructions:</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li>1. Download Google Authenticator or any TOTP app</li>
              <li>2. Scan the QR code below with your authenticator app</li>
              <li>3. Save your secret key in a secure location</li>
              <li>4. Use the 6-digit code when logging in</li>
            </ol>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <QRCodeSVG value={mfaData.qr_code_url} size={200} />
            </div>

            <div className="w-full bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Secret Key (manual entry):</p>
              <code className="block bg-white px-4 py-2 rounded border text-center font-mono text-sm break-all">
                {mfaData.mfa_qr_secret}
              </code>
            </div>
          </div>

          <div className="mt-8 flex space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
            >
              Proceed to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <span className="text-5xl">🔒</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Register for secure access</p>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="alice"
            />
            <p className="mt-1 text-xs text-gray-500">3-20 characters, letters, numbers, underscore</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength.level === 1 ? 'bg-red-500 w-1/4' :
                        passwordStrength.level === 2 ? 'bg-orange-500 w-2/4' :
                        passwordStrength.level === 3 ? 'bg-yellow-500 w-3/4' :
                        'bg-green-500 w-full'
                      }`}
                    ></div>
                  </div>
                  <span className={`text-xs font-semibold text-${passwordStrength.color}-600`}>
                    {passwordStrength.text}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={ROLES.RECIPIENT}>Recipient (Download only)</option>
              <option value={ROLES.MANAGER}>Manager (Upload + Download)</option>
              <option value={ROLES.ADMIN}>Admin (Full access)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
