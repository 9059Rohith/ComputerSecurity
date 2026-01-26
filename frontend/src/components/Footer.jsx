import { APP_NAME, APP_VERSION, LAB_CODE } from '../utils/constants';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm">
              © 2026 {APP_NAME} - Lab Evaluation Project
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Version {APP_VERSION} | {LAB_CODE}
            </p>
          </div>
          <div className="flex space-x-6 text-sm">
            <span className="flex items-center space-x-2">
              <span>🔐</span>
              <span>NIST MFA</span>
            </span>
            <span className="flex items-center space-x-2">
              <span>🛡️</span>
              <span>RBAC</span>
            </span>
            <span className="flex items-center space-x-2">
              <span>🔒</span>
              <span>AES-256</span>
            </span>
            <span className="flex items-center space-x-2">
              <span>🔑</span>
              <span>RSA-2048</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
