import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';
import ErrorMessage from '../components/ErrorMessage';
import { isValidMFACode } from '../utils/validators';

const Login = () => {
  const [step, setStep] = useState(1); // 1 = password, 2 = MFA
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    mfaCode: '',
  });
  const [sessionToken, setSessionToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.loginStep1(formData.username, formData.password);
      setSessionToken(response.session_token);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidMFACode(formData.mfaCode)) {
      setError('MFA code must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.loginStep2(
        formData.username,
        sessionToken,
        formData.mfaCode
      );
      login(response.access_token, formData.username, response.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid MFA code');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <span className="text-5xl">🔐</span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Step 2: MFA Verification</h2>
            <p className="mt-2 text-gray-600">Enter code from your authenticator app</p>
          </div>

          {error && <ErrorMessage message={error} onClose={() => setError('')} />}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>✅ Password verified</strong>
              <br />
              <span className="text-gray-700">User: {formData.username}</span>
            </p>
          </div>

          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6-Digit TOTP Code
              </label>
              <input
                type="text"
                name="mfaCode"
                value={formData.mfaCode}
                onChange={handleChange}
                required
                maxLength="6"
                pattern="[0-9]{6}"
                className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest"
                placeholder="000000"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                Open your authenticator app and enter the current code
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || formData.mfaCode.length !== 6}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              NIST SP 800-63-2 compliant two-factor authentication
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🔒</span>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Step 1: Login</h2>
          <p className="mt-2 text-gray-600">Enter your credentials</p>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError('')} />}

        <form onSubmit={handleStep1Submit} className="space-y-6">
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
              autoFocus
            />
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Continue to MFA'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Register here
          </Link>
        </p>

        <div className="mt-6 border-t pt-6">
          <p className="text-xs text-gray-500 text-center">
            🔐 Two-Factor Authentication Required
            <br />
            Password + TOTP (Google Authenticator)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
