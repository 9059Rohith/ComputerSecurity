// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Format date to readable string
export const formatDate = (dateString) => {
  // Ensure UTC parsing by adding 'Z' if not present
  const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  const date = new Date(utcDateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format date to relative time (e.g., "2 hours ago")
export const formatRelativeTime = (dateString) => {
  // Ensure UTC parsing by adding 'Z' if not present
  const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  const date = new Date(utcDateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateString);
};

// Format expiry time remaining
export const formatTimeRemaining = (expiryDateString) => {
  // Ensure UTC parsing by adding 'Z' if not present
  const utcDateString = expiryDateString.endsWith('Z') ? expiryDateString : expiryDateString + 'Z';
  const expiry = new Date(utcDateString);
  const now = new Date();
  const diffMs = expiry - now;
  
  if (diffMs < 0) return 'Expired';
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  return 'Less than a minute';
};

// Truncate string with ellipsis
export const truncateString = (str, maxLength) => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

// Format role with badge color
export const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'Admin':
      return 'bg-red-100 text-red-800';
    case 'Manager':
      return 'bg-blue-100 text-blue-800';
    case 'Recipient':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Format security component status
export const getStatusColor = (status) => {
  if (status === 'implemented' || status === '✅') return 'text-green-600';
  if (status === 'partial' || status === '⚠️') return 'text-yellow-600';
  return 'text-red-600';
};
