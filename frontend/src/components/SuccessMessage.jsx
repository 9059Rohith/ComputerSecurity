const SuccessMessage = ({ message, onClose }) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">✅</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">Success</h3>
          <div className="mt-2 text-sm text-green-700">
            <p>{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto flex-shrink-0 text-green-400 hover:text-green-600"
          >
            <span className="text-xl">×</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SuccessMessage;
