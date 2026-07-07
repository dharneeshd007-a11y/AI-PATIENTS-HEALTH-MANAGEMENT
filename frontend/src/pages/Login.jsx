import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { Lock, Phone as PhoneIcon, Globe, Activity, Stethoscope, HeartPulse, UserCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle OAuth callback token and user from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    const errorParam = params.get('error');

    if (errorParam) {
      showToast("Google Authentication failed.", "error");
    } else if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('token', token);
        // authService expects the cached 'user' string to be an object containing { token, user }
        localStorage.setItem('user', JSON.stringify({ token, user }));
        routeUser(user, { token, user });
      } catch (err) {
        console.error("Failed to parse user data from URL", err);
        showToast("Error processing login data.", "error");
      }
    }
  }, []);

  // Clear toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const routeUser = (user, payload) => {
    console.log("=== LOGIN DEBUG LOG ===");
    console.log("Role:", user.role);
    console.log("Patient Type:", user.patient_type);
    console.log("Patient ID:", user.patient_id);
    console.log("Doctor ID:", user.doctor_id);
    console.log("JWT Payload:", payload);
    
    try {
      if (user.role === 'Admin') {
        console.log("Redirecting to: /admin-dashboard");
        navigate('/admin-dashboard');
      } else if (user.role === 'Doctor') {
        console.log("Redirecting to: /doctor-dashboard");
        navigate('/doctor-dashboard');
      } else if (user.role === 'Patient') {
        if (user.patient_type === 'ICU') {
          console.log("Redirecting to: /icu-dashboard");
          navigate('/icu-dashboard');
        } else {
          console.log("Redirecting to: /patient-dashboard");
          navigate('/patient-dashboard');
        }
      } else {
        showToast("Unrecognized role assigned to this user.");
      }
    } catch (err) {
      console.error("Routing failed:", err);
      showToast("Routing Error: Could not determine dashboard.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ show: false, message: '', type: '' });

    console.log(`Attempting login to API...`);
    try {
      const data = await authService.login(formData);
      console.log("Login API Response received successfully.", data);
      routeUser(data.user, data);
    } catch (err) {
      console.error("Login API Error:", err);
      let errorMsg = 'Network Error. Please try again later.';
      if (err.response) {
        if (err.response.status === 401) errorMsg = 'Invalid Phone Number or Password.';
        else if (err.response.status === 400) errorMsg = 'Please fill out all required fields.';
        else if (err.response.status === 500) errorMsg = 'Server Error. Contact Administrator.';
        else errorMsg = err.response.data?.message || 'Authentication failed.';
      }
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Redirect directly to the backend Google OAuth endpoint
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  return (
    <div className="login-wrapper">
      {/* Toast Notification */}
      <div className={`toast-notification ${toast.show ? 'show' : ''} ${toast.type}`}>
        {toast.message}
      </div>

      {/* Animated Background Elements */}
      <div className="medical-background">
        <svg className="ecg-line" viewBox="0 0 1000 200" preserveAspectRatio="none">
          <polyline points="0,100 200,100 250,50 300,150 350,100 500,100 550,20 600,180 650,100 1000,100" />
        </svg>
      </div>

      {/* Floating Medical Icons for Desktop */}
      <div className="floating-icons">
        <Stethoscope className="icon float-1" size={48} />
        <HeartPulse className="icon float-2" size={48} />
        <Activity className="icon float-3" size={48} />
      </div>

      <div className="login-card glass-card">
        <div className="login-header">
          <div className="kmch-logo">
            <UserCircle size={40} color="#0ea5e9" strokeWidth={1.5} />
          </div>
          <h1>KMCH AI Systems</h1>
          <p>Continuous Remote Patient Telemetry</p>
        </div>

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
            {loading ? <span className="spinner"></span> : 'Secure Login'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button onClick={handleGoogleLogin} type="button" className="btn btn-google" disabled={loading || googleLoading}>
          <Globe size={20} color="#ea4335" />
          {googleLoading ? 'Connecting...' : 'Continue with Google (OP Only)'}
        </button>

        <div className="register-prompt">
          New Outpatient? <Link to="/register">Create an account</Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --primary-dark: #0f172a;
          --secondary-dark: #1e293b;
          --accent-kmch: #0ea5e9;
          --accent-kmch-hover: #0284c7;
        }

        body, html {
          margin: 0;
          padding: 0;
          font-family: 'Inter', system-ui, sans-serif;
          background-color: var(--primary-dark);
        }

        .login-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
        }

        /* Toast Notifications */
        .toast-notification {
          position: fixed;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(239, 68, 68, 0.95);
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
          transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 1000;
          backdrop-filter: blur(10px);
        }
        .toast-notification.show {
          top: 40px;
        }

        /* Animated Background Elements */
        .medical-background {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
          opacity: 0.15;
          pointer-events: none;
        }

        .ecg-line {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 200%;
          height: 200px;
          fill: none;
          stroke: var(--accent-kmch);
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          animation: moveEcg 15s linear infinite;
        }

        @keyframes moveEcg {
          0% { transform: translate(0, -50%); }
          100% { transform: translate(-50%, -50%); }
        }

        .floating-icons {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }
        
        .floating-icons .icon {
          position: absolute;
          color: rgba(14, 165, 233, 0.15);
        }

        .float-1 { top: 20%; left: 15%; animation: float 6s ease-in-out infinite; }
        .float-2 { bottom: 25%; right: 20%; animation: float 8s ease-in-out infinite reverse; }
        .float-3 { top: 30%; right: 15%; animation: float 7s ease-in-out infinite 1s; }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }

        /* Glassmorphism Card */
        .login-card {
          width: 100%;
          maxWidth: 420px;
          margin: 0 1.5rem;
          position: relative;
          z-index: 10;
          padding: 3rem 2.5rem;
          background: rgba(30, 41, 59, 0.7);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .kmch-logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(14, 165, 233, 0.05) 100%);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 0 30px rgba(14, 165, 233, 0.2);
          border: 1px solid rgba(14, 165, 233, 0.3);
          transform: rotate(-5deg);
        }

        .login-header h1 {
          font-size: 1.8rem;
          margin: 0 0 0.5rem 0;
          color: white;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .login-header p {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0;
        }

        /* Form Elements */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #cbd5e1;
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
          left: 16px;
          color: #64748b;
          transition: color 0.3s;
        }

        .input-wrapper input {
          width: 100%;
          padding: 1rem 1rem 1rem 48px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(15, 23, 42, 0.6);
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .input-wrapper input:focus {
          border-color: var(--accent-kmch);
          background: rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
          outline: none;
        }

        .input-wrapper input:focus + .input-icon {
          color: var(--accent-kmch);
        }

        .forgot-password {
          text-align: right;
          margin-top: -0.5rem;
        }

        .forgot-password a {
          color: var(--accent-kmch);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .forgot-password a:hover {
          color: #38bdf8;
        }

        /* Buttons */
        .login-btn {
          padding: 1rem;
          font-size: 1.05rem;
          font-weight: 600;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--accent-kmch) 0%, var(--accent-kmch-hover) 100%);
          border: none;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 10px 20px -10px rgba(14, 165, 233, 0.5);
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -10px rgba(14, 165, 233, 0.6);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 1.5rem 0;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 500;
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
          gap: 12px;
          background: white;
          color: #1e293b;
          border: none;
          border-radius: 14px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-google:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(255,255,255,0.2);
        }

        .register-prompt {
          text-align: center;
          margin-top: 2rem;
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .register-prompt a {
          color: var(--accent-kmch);
          font-weight: 600;
          text-decoration: none;
          margin-left: 0.5rem;
          transition: color 0.2s;
        }

        .register-prompt a:hover {
          color: #38bdf8;
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
        
        /* Mobile Adjustments */
        @media (max-width: 480px) {
          .floating-icons {
            display: none;
          }
          .login-card {
            padding: 2.5rem 1.5rem;
            border-radius: 20px;
            margin: 0 1rem;
          }
        }
      `}} />
    </div>
  );
};

export default Login;
