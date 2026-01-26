import { Link } from 'react-router-dom';
import { APP_NAME, LAB_CODE, SECURITY_COMPONENTS } from '../utils/constants';

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-16">
          <span className="text-8xl mb-6 inline-block">🔒</span>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{APP_NAME}</h1>
          <p className="text-xl text-gray-600 mb-8">Enterprise-Grade Security System for {LAB_CODE} Lab Evaluation</p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition text-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white hover:bg-gray-100 text-blue-600 border-2 border-blue-600 font-bold py-3 px-8 rounded-lg transition text-lg"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Security Components */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Security Components</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {SECURITY_COMPONENTS.map((component) => (
              <div key={component.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="text-5xl mb-4">{component.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{component.name}</h3>
                <p className="text-sm text-gray-600 mb-3">Component {component.id}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{component.marks} marks</span>
                  <span className="text-green-600 text-2xl">✅</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🔐 Authentication</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>NIST SP 800-63-2 Level 2 compliant</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Two-factor authentication (Password + TOTP)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>bcrypt password hashing with salt</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Session management with secure tokens</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🛡️ Authorization</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Role-Based Access Control (RBAC)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>3×3 Access Control Matrix</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Temporal policy enforcement (expiry)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Least privilege principle</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🔒 Encryption</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Hybrid cryptography (AES + RSA)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>AES-256-GCM for data encryption</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>RSA-2048-OAEP for key exchange</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Authenticated encryption with GCM</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🔑 Signatures & Encoding</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>RSA-PSS digital signatures</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>SHA-256 hash function</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Base64 encoding for binary data</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Data integrity and authenticity</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Technology Stack</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">⚛️</div>
              <h4 className="font-semibold">React</h4>
              <p className="text-sm text-gray-600">Frontend</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🚀</div>
              <h4 className="font-semibold">FastAPI</h4>
              <p className="text-sm text-gray-600">Backend</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🍃</div>
              <h4 className="font-semibold">MongoDB</h4>
              <p className="text-sm text-gray-600">Database</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🔐</div>
              <h4 className="font-semibold">Cryptography</h4>
              <p className="text-sm text-gray-600">Security</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            to="/security-docs"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-lg transition text-lg"
          >
            📚 View Security Documentation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
