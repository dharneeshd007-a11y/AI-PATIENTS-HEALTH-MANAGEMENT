import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { HeartPulse, Lock, Phone as PhoneIcon, Chrome } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const routeUser = (user) => {
    if (user.role === 'Admin') {
      navigate('/admin-dashboard');
    } else if (user.role === 'Doctor') {
      navigate('/doctor-dashboard');
    } else if (user.role === 'Patient') {
      // Both OP and ICU use the unified patient dashboard which toggles context internally
      navigate('/patient-dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(formData);
      routeUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      // Mock Google OAuth Popup
      const mockEmail = window.prompt("Google Sign-In Simulation\n\nEnter your Google Email Address:");
      if (!mockEmail) {
        setGoogleLoading(false);
        return;
      }
      
      const payload = {
        email: mockEmail,
        full_name: mockEmail.split('@')[0]
      };
      
      const data = await authService.googleLogin(payload);
      routeUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated Background Elements */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="login-card glass-card">
        <div className="login-header">
          <div className="logo-circle">
            <HeartPulse size={40} color="var(--accent-blue)" />
          </div>
          <h2>Welcome Back</h2>
          <p>Access your secure hospital portal</p>
        </div>
        
        {error && (
          <div className="error-toast fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <PhoneIcon size={18} className="input-icon" />
              <input 
                type="tel" 
                name="phone" 
                required 
                placeholder="Enter your registered phone"
                value={formData.phone} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                name="password" 
                required 
                placeholder="••••••••"
                value={formData.password} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading || googleLoading}>
            {loading ? <span className="spinner"></span> : 'Login to Dashboard'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button onClick={handleGoogleLogin} type="button" className="btn btn-google" disabled={loading || googleLoading}>
          <Chrome size={20} />
          {googleLoading ? 'Connecting...' : 'Continue with Google (OP Patients)'}
        </button>

        <div className="register-prompt">
          New Outpatient? <Link to="/register">Create an account</Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
          opacity: 0.5;
        }
        .blob-1 {
          width: 400px;
          height: 400px;
          background: var(--accent-blue);
          top: -100px;
          left: -100px;
          animation: float 8s ease-in-out infinite;
        }
        .blob-2 {
          width: 350px;
          height: 350px;
          background: var(--accent-cyan);
          bottom: -50px;
          right: -100px;
          animation: float 10s ease-in-out infinite reverse;
        }
        @keyframes float {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(30px) scale(1.1); }
          100% { transform: translateY(0) scale(1); }
        }
        .login-card {
          width: 100%;
          maxWidth: 420px;
          position: relative;
          z-index: 1;
          padding: 3rem 2.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .logo-circle {
          width: 80px;
          height: 80px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
        }
        .login-header h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: white;
        }
        .login-header p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .error-toast {
          background-color: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          text-align: center;
          border: 1px solid rgba(239, 68, 68, 0.3);
          font-weight: 500;
        }
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-secondary);
        }
        .input-wrapper input {
          width: 100%;
          padding: 1rem 1rem 1rem 42px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        .input-wrapper input:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          outline: none;
        }
        .forgot-password {
          text-align: right;
          margin-top: -0.5rem;
        }
        .forgot-password a {
          color: var(--accent-cyan);
          text-decoration: none;
          font-size: 0.85rem;
          transition: opacity 0.2s;
        }
        .forgot-password a:hover {
          opacity: 0.8;
        }
        .login-btn {
          padding: 1rem;
          font-size: 1.1rem;
          font-weight: bold;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-cyan) 100%);
          border: none;
          color: white;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px var(--accent-cyan);
        }
        .login-btn:active {
          transform: translateY(0);
        }
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.5rem 0;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .divider span {
          padding: 0 1rem;
        }
        .btn-google {
          width: 100%;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: white;
          color: #333;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .btn-google:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(255,255,255,0.5);
        }
        .register-prompt {
          text-align: center;
          margin-top: 2rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .register-prompt a {
          color: white;
          font-weight: bold;
          text-decoration: none;
          margin-left: 0.5rem;
        }
        .register-prompt a:hover {
          text-decoration: underline;
        }
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default Login;
