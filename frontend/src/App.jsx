import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FileProvider } from './context/FileContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FileUpload from './pages/FileUpload';
import FileList from './pages/FileList';
import SecurityDocs from './pages/SecurityDocs';

function App() {
  return (
    <AuthProvider>
      <FileProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <FileUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/files"
                  element={
                    <ProtectedRoute>
                      <FileList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/security-docs"
                  element={
                    <ProtectedRoute>
                      <SecurityDocs />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </FileProvider>
    </AuthProvider>
  );
}

export default App;
