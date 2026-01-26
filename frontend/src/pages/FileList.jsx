import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import fileService from '../services/fileService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate, formatTimeRemaining, getRoleBadgeColor } from '../utils/formatters';
import { ROLE_PERMISSIONS } from '../utils/constants';

const FileList = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadResult, setDownloadResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fileService.listFiles();
      setFiles(result.files || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId) => {
    setDownloadingId(fileId);
    setError('');
    try {
      console.log('Downloading file:', fileId, 'User role:', user?.role);
      const result = await fileService.downloadFile(fileId, user?.role);
      console.log('Download result:', result);
      setDownloadResult(result);
    } catch (err) {
      console.error('Download error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.detail || err.message || 'Download failed. Check your permissions.');
      setDownloadingId(null);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    setDeletingId(fileId);
    setError('');
    try {
      await fileService.deleteFile(fileId, user?.role);
      // Refresh file list after deletion
      await fetchFiles();
      setDeletingId(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Delete failed. Only Admin can delete files.');
      setDeletingId(null);
    }
  };

  const closeDownloadModal = () => {
    setDownloadResult(null);
    setDownloadingId(null);
  };

  const canDownload = () => {
    const permissions = ROLE_PERMISSIONS[user?.role] || [];
    return permissions.includes('download');
  };

  const canDelete = () => {
    const permissions = ROLE_PERMISSIONS[user?.role] || [];
    return permissions.includes('delete');
  };

  const isExpired = (expiryDate) => {
    // Ensure UTC parsing by adding 'Z' if not present
    const utcDateString = expiryDate.endsWith('Z') ? expiryDate : expiryDate + 'Z';
    return new Date(utcDateString) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading files..." />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📁 All Files</h1>
              <p className="text-gray-600 mt-1">Total: {files.length} files</p>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              + Upload File
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError('')} />}

        {files.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <span className="text-6xl">📭</span>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No files uploaded yet</h3>
            <p className="text-gray-600 mt-2">Start by uploading your first secure file</p>
            <button
              onClick={() => navigate('/upload')}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Upload Now
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {files.map((file) => {
              const expired = isExpired(file.expiry_at);
              const canUserDownload = canDownload();

              return (
                <div
                  key={file.file_id}
                  className={`bg-white rounded-lg shadow-md p-6 ${expired ? 'opacity-60 border-2 border-red-300' : 'hover:shadow-lg transition'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">📄</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{file.filename}</h3>
                          <p className="text-sm text-gray-500">Owner: {file.owner}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">File ID:</span>
                          <p className="font-mono text-xs mt-1 bg-gray-100 px-2 py-1 rounded">
                            {file.file_id}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Uploaded:</span>
                          <p className="mt-1">{formatDate(file.uploaded_at)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Expires:</span>
                          <p className={`mt-1 font-semibold ${expired ? 'text-red-600' : 'text-orange-600'}`}>
                            {expired ? '❌ Expired' : `⏳ ${formatTimeRemaining(file.expiry_at)}`}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Security:</span>
                          <div className="mt-1 flex space-x-2">
                            {file.has_encryption && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🔒 Encrypted</span>
                            )}
                            {file.has_signature && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">✍️ Signed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      {expired ? (
                        <button
                          disabled
                          className="bg-gray-300 text-gray-500 font-semibold py-2 px-6 rounded-lg cursor-not-allowed"
                        >
                          Expired
                        </button>
                      ) : !canUserDownload ? (
                        <button
                          disabled
                          className="bg-gray-300 text-gray-500 font-semibold py-2 px-6 rounded-lg cursor-not-allowed"
                        >
                          No Access
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownload(file.file_id)}
                          disabled={downloadingId === file.file_id}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
                        >
                          {downloadingId === file.file_id ? 'Loading...' : 'Download'}
                        </button>
                      )}
                      
                      {/* Delete button - Only for Admin */}
                      {canDelete() && (
                        <button
                          onClick={() => handleDelete(file.file_id)}
                          disabled={deletingId === file.file_id}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50"
                        >
                          {deletingId === file.file_id ? 'Deleting...' : '🗑️ Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Download Result Modal */}
        {downloadResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="text-center mb-6">
                <span className="text-6xl">✅</span>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">File Downloaded Successfully</h2>
                <p className="text-gray-600 mt-2">{downloadResult.message}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📄 File Details:</h3>
                  <p className="text-sm">
                    <strong>Filename:</strong> {downloadResult.filename}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">🔓 Decrypted Content:</h3>
                  <textarea
                    readOnly
                    value={downloadResult.decrypted_content}
                    className="w-full h-32 text-sm bg-white p-3 rounded border resize-none"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Encrypted Data (Base64):</h3>
                  <textarea
                    readOnly
                    value={downloadResult.encrypted_data}
                    className="w-full h-20 text-xs font-mono bg-white p-2 rounded border resize-none"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Digital Signature:</h3>
                  <textarea
                    readOnly
                    value={downloadResult.digital_signature}
                    className="w-full h-16 text-xs font-mono bg-white p-2 rounded border resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    // Determine MIME type based on file extension
                    const extension = downloadResult.filename.split('.').pop().toLowerCase();
                    const mimeTypes = {
                      'txt': 'text/plain',
                      'pdf': 'application/pdf',
                      'doc': 'application/msword',
                      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'jpg': 'image/jpeg',
                      'jpeg': 'image/jpeg',
                      'png': 'image/png',
                      'gif': 'image/gif',
                      'json': 'application/json',
                      'xml': 'text/xml',
                      'csv': 'text/csv',
                      'html': 'text/html',
                      'js': 'text/javascript',
                      'css': 'text/css',
                      'zip': 'application/zip',
                      'mp3': 'audio/mpeg',
                      'mp4': 'video/mp4'
                    };
                    const mimeType = mimeTypes[extension] || 'application/octet-stream';
                    
                    let blobData;
                    if (downloadResult.is_binary) {
                      // Decode base64 to binary
                      const binaryString = atob(downloadResult.decrypted_content);
                      const bytes = new Uint8Array(binaryString.length);
                      for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                      }
                      blobData = bytes;
                    } else {
                      // Text file
                      blobData = downloadResult.decrypted_content;
                    }
                    
                    // Create a Blob from the decrypted content
                    const blob = new Blob([blobData], { type: mimeType });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = downloadResult.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  💾 Save to Computer
                </button>
                <button
                  onClick={closeDownloadModal}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileList;
