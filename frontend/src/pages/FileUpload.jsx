import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import fileService from '../services/fileService';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { EXPIRY_OPTIONS, MAX_FILE_SIZE, ROLE_PERMISSIONS } from '../utils/constants';
import { formatFileSize, formatDate } from '../utils/formatters';

const FileUpload = () => {
  const { user } = useContext(AuthContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expiryMinutes, setExpiryMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const navigate = useNavigate();

  // Check if user has upload permission
  const hasUploadPermission = user?.role && ROLE_PERMISSIONS[user.role]?.includes('upload');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File size exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await fileService.uploadFile(selectedFile, user.username, expiryMinutes, user.role);
      setUploadResult(result);
      setSuccess(true);
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'File upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success && uploadResult) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <span className="text-6xl">✅</span>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">Upload Successful!</h2>
              <p className="mt-2 text-gray-600">Your file has been encrypted and stored securely</p>
            </div>

            <SuccessMessage message={uploadResult.message} />

            <div className="space-y-4 mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">🔒 Security Details:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">File ID:</span>
                    <span className="font-mono text-gray-900">{uploadResult.file_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires At:</span>
                    <span className="font-semibold text-red-600">{formatDate(uploadResult.expiry_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Encryption:</span>
                    <span className="text-gray-900">AES-256-GCM + RSA-2048</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">📝 What Happened:</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>✅ File encrypted with AES-256</li>
                  <li>✅ AES key encrypted with RSA-2048</li>
                  <li>✅ Digital signature generated</li>
                  <li>✅ All data Base64 encoded</li>
                  <li>✅ Stored in MongoDB with expiry policy</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Encrypted Data (sample):</h3>
                <code className="block text-xs bg-white p-2 rounded border font-mono break-all">
                  {uploadResult.encrypted_data_sample}
                </code>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Digital Signature (sample):</h3>
                <code className="block text-xs bg-white p-2 rounded border font-mono break-all">
                  {uploadResult.digital_signature}
                </code>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => setSuccess(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition"
              >
                Upload Another
              </button>
              <button
                onClick={() => navigate('/files')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                View All Files
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <span className="text-5xl">📤</span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Upload Secure File</h2>
            <p className="mt-2 text-gray-600">File will be encrypted with AES-256 + RSA-2048</p>
          </div>

          {/* Permission Check Alert */}
          {!hasUploadPermission && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🚫</span>
                <div>
                  <h3 className="text-red-800 font-semibold">Upload Permission Denied</h3>
                  <p className="text-red-600 text-sm mt-1">
                    Your role <strong>({user?.role})</strong> does not have permission to upload files. 
                    Only <strong>Admin</strong> and <strong>Manager</strong> roles can upload.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && <ErrorMessage message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <div className="text-4xl mb-2">📁</div>
                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600">Click to select file</p>
                      <p className="text-xs text-gray-400 mt-1">Maximum size: {formatFileSize(MAX_FILE_SIZE)}</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
              <input
                type="text"
                value={user?.username}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Time</label>
              <select
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {EXPIRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                File will be automatically deleted after expiration (temporal policy enforcement)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">🔒 Security Features:</h3>
              <ul className="space-y-1 text-xs text-gray-700">
                <li>✅ Hybrid encryption (AES-256 + RSA-2048)</li>
                <li>✅ Digital signature for integrity</li>
                <li>✅ Base64 encoding for storage</li>
                <li>✅ Temporal access control with expiry</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFile || !hasUploadPermission}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Encrypting & Uploading...' : hasUploadPermission ? 'Upload File' : 'Upload Permission Required'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
