import { createContext, useState } from 'react';

export const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const addFile = (file) => {
    setFiles((prevFiles) => [file, ...prevFiles]);
  };

  const updateFiles = (newFiles) => {
    setFiles(newFiles);
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const value = {
    files,
    setFiles,
    addFile,
    updateFiles,
    clearFiles,
    loading,
    setLoading,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};
