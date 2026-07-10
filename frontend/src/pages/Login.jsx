import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [portalType, setPortalType] = useState('doctor'); // default to doctor for the requirement focus
  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Inject Poppins font if it isn't already in the document
    if (!document.getElementById('poppins-font')) {
      const link = document.createElement('link');
      link.id = 'poppins-font';
      link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    const searchParams = new URLSearchParams(location.search);
    const urlError = searchParams.get('error');
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ user: decodedUser }));
        
        // Strict redirection based on role
        if (decodedUser.role === 'Admin') {
          navigate('/admin-dashboard');
        } else if (decodedUser.role === 'Doctor') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/patient-dashboard');
        }
      } catch (err) {
        console.error("Failed to parse user data", err);
        setError('Login failed due to invalid data.');
      }
    } else if (urlError) {
      if (urlError.includes('Admin')) setPortalType('admin');
      if (urlError.includes('Doctor') || urlError.includes('registration')) setPortalType('doctor');
      
      // Specifically handle the auth failure message requested
      if (urlError === 'Authentication failed') {
        setError('Google authentication failed. Please try again.');
      } else {
        setError(urlError);
      }
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePatientLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const data = await authService.login({ phone: formData.phone, password: formData.password });
      navigate('/patient-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (formData.password !== formData.confirm_password) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const payload = {
        role: 'Patient', // Only Patient is allowed to register now per requirements
        password: formData.password,
        phone: formData.phone
      };

      await authService.register(payload);
      setSuccessMsg('Registration successful! You can now login.');
      setIsLogin(true);
      setFormData({ email: '', phone: '', password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderGoogleLogin = (role) => (
    <div style={{ textAlign: 'center', marginTop: '1rem', width: '100%' }}>
      {role === 'admin' && (
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Only the designated Administrator can access this portal.
        </p>
      )}
      
      <a 
        href={`/api/auth/google?role=${role}`} 
        className="google-auth-btn"
        style={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center', 
          gap: '12px', 
          padding: '1rem 1.5rem', 
          backgroundColor: '#ffffff', 
          color: '#1a1a1a', 
          fontWeight: '600', 
          borderRadius: '8px', 
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          border: '1px solid transparent',
          transition: 'all 0.3s ease',
          fontSize: '1rem',
          boxSizing: 'border-box'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.border = '1px solid #3b82f6';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.2)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.border = '1px solid transparent';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <FcGoogle size={24} />
        Continue with Google
      </a>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'Poppins', sans-serif", backgroundColor: '#0a192f', color: 'white', position: 'relative' }}>
      
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '480px', 
          background: 'rgba(17, 34, 64, 0.7)', 
          backdropFilter: 'blur(10px)', 
          borderRadius: '16px', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          boxSizing: 'border-box'
        }}>
          
          {/* EXACT LOGIN CARD HEADER BRANDING */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start',
            textAlign: 'center', 
            marginBottom: '2.5rem',
            paddingTop: '0.5rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>≡ƒÅÑ</div>
            
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: '700', letterSpacing: '0.5px', color: '#ffffff', wordWrap: 'break-word' }}>
              DKD HOSPITAL AI
            </h1>
            
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64ffda', fontWeight: '500' }}>
              AI Powered Hospital Management System
            </p>

            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: '600', color: '#ffffff' }}>
              Welcome to DKD HOSPITAL AI
            </h2>

            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4' }}>
              Secure, Intelligent & Real-Time Healthcare Platform powered by Artificial Intelligence.
            </p>
            
            <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.2rem', fontWeight: '600', color: '#ffffff' }}>
              Welcome Back
            </h3>
            
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
              Sign in to continue
            </p>
          </div>

          {/* Portal Tabs */}
          <div style={{ display: 'flex', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <button 
              onClick={() => { setPortalType('patient'); setIsLogin(true); setError(''); setSuccessMsg(''); }}
              style={{ flex: 1, padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: portalType === 'patient' ? '2px solid #06b6d4' : 'none', color: portalType === 'patient' ? '#06b6d4' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: portalType === 'patient' ? '600' : '400', fontSize: '0.9rem', transition: 'all 0.2s', fontFamily: 'inherit' }}
            >
              Patient Portal
            </button>
            <button 
              onClick={() => { setPortalType('doctor'); setIsLogin(true); setError(''); setSuccessMsg(''); }}
              style={{ flex: 1, padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: portalType === 'doctor' ? '2px solid #3b82f6' : 'none', color: portalType === 'doctor' ? '#3b82f6' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: portalType === 'doctor' ? '600' : '400', fontSize: '0.9rem', transition: 'all 0.2s', fontFamily: 'inherit' }}
            >
              Doctor Portal
            </button>
            <button 
              onClick={() => { setPortalType('admin'); setIsLogin(true); setError(''); setSuccessMsg(''); }}
              style={{ flex: 1, padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: portalType === 'admin' ? '2px solid #8b5cf6' : 'none', color: portalType === 'admin' ? '#8b5cf6' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: portalType === 'admin' ? '600' : '400', fontSize: '0.9rem', transition: 'all 0.2s', fontFamily: 'inherit' }}
            >
              Admin Portal
            </button>
          </div>
          
          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              {successMsg}
            </div>
          )}

          {/* ADMIN PORTAL */}
          {portalType === 'admin' && renderGoogleLogin('admin')}

          {/* DOCTOR PORTAL */}
          {/* Strictly only the Google Login button for Doctors */}
          {portalType === 'doctor' && renderGoogleLogin('doctor')}

          {/* PATIENT PORTAL */}
          {portalType === 'patient' && isLogin && (
            <form onSubmit={handlePatientLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%', boxSizing: 'border-box' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Phone Number</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="1234567890" style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Password</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', fontSize: '1rem', fontWeight: '600', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s', fontFamily: 'inherit', boxSizing: 'border-box' }} disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          {portalType === 'patient' && !isLogin && (
            <form onSubmit={handleRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', width: '100%', boxSizing: 'border-box' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Registered Phone Number</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="1234567890" style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Create Password</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Confirm Password</label>
                <input type="password" name="confirm_password" required value={formData.confirm_password} onChange={handleChange} style={{ width: '100%', padding: '0.9rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', fontSize: '1rem', fontWeight: '600', backgroundColor: '#06b6d4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s', fontFamily: 'inherit', boxSizing: 'border-box' }} disabled={loading}>
                {loading ? 'Registering...' : 'Register Account'}
              </button>
            </form>
          )}

          {/* Only Patient Portal gets the registration toggle link */}
          {portalType === 'patient' && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); setFormData({ email: '', phone: '', password: '', confirm_password: '' }); }} 
                style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', fontFamily: 'inherit' }}
              >
                {isLogin ? "First time logging in? Register here" : "Already registered? Sign in"}
              </button>
            </div>
          )}

        </div>
      </div>
      
      {/* Static Footer */}
      <div style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(10, 25, 47, 0.8)', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
        ┬⌐ 2026 DKD HOSPITAL AI. All Rights Reserved.
      </div>

    </div>
  );
};

export default Login;
