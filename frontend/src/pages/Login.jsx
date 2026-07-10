import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [portalType, setPortalType] = useState('patient'); // 'admin', 'doctor', 'patient'
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
    // Check for error messages from Google OAuth callback
    const searchParams = new URLSearchParams(location.search);
    const urlError = searchParams.get('error');
    if (urlError) {
      // Decode and display error, switch to appropriate portal if we can guess
      if (urlError.includes('Admin')) setPortalType('admin');
      if (urlError.includes('Doctor') || urlError.includes('registration')) setPortalType('doctor');
      setError(urlError);
    }
  }, [location]);

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
        role: portalType === 'doctor' ? 'Doctor' : 'Patient',
        password: formData.password
      };

      if (portalType === 'doctor') {
        payload.email = formData.email;
      } else {
        payload.phone = formData.phone;
      }

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
    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {role === 'admin' 
          ? "Only the designated Administrator can access this portal." 
          : "Doctors must use their Google account to sign in."}
      </p>
      <a 
        href="/api/auth/google" 
        className="btn" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '10px', 
          padding: '0.8rem 1.5rem', 
          backgroundColor: '#fff', 
          color: '#333', 
          fontWeight: 'bold', 
          borderRadius: 'var(--radius-sm)', 
          textDecoration: 'none',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
        }}
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px' }} />
        Continue with Google
      </a>
    </div>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px' }}>
        
        {/* Portal Tabs */}
        <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => { setPortalType('patient'); setIsLogin(true); setError(''); setSuccessMsg(''); }}
            style={{ flex: 1, padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: portalType === 'patient' ? '2px solid var(--accent-cyan)' : 'none', color: portalType === 'patient' ? 'var(--accent-cyan)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: portalType === 'patient' ? 'bold' : 'normal', fontSize: '0.9rem' }}
          >
            Patient Portal
          </button>
          <button 
            onClick={() => { setPortalType('doctor'); setIsLogin(true); setError(''); setSuccessMsg(''); }}
            style={{ flex: 1, padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: portalType === 'doctor' ? '2px solid var(--accent-blue)' : 'none', color: portalType === 'doctor' ? 'var(--accent-blue)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: portalType === 'doctor' ? 'bold' : 'normal', fontSize: '0.9rem' }}
          >
            Doctor Portal
          </button>
          <button 
            onClick={() => { setPortalType('admin'); setIsLogin(true); setError(''); setSuccessMsg(''); }}
            style={{ flex: 1, padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: portalType === 'admin' ? '2px solid var(--accent-purple)' : 'none', color: portalType === 'admin' ? 'var(--accent-purple)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: portalType === 'admin' ? 'bold' : 'normal', fontSize: '0.9rem' }}
          >
            Admin Portal
          </button>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
          {portalType === 'admin' && 'Administrator Login'}
          {portalType === 'doctor' && (isLogin ? 'Doctor Login' : 'Doctor Registration')}
          {portalType === 'patient' && (isLogin ? 'Patient Login' : 'Patient Registration')}
        </h2>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', textAlign: 'center' }}>
            {successMsg}
          </div>
        )}

        {/* ADMIN PORTAL */}
        {portalType === 'admin' && renderGoogleLogin('admin')}

        {/* DOCTOR PORTAL */}
        {portalType === 'doctor' && isLogin && renderGoogleLogin('doctor')}

        {portalType === 'doctor' && !isLogin && (
          <form onSubmit={handleRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Registered Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-field" placeholder="doctor@hospital.com" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Create Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Confirm Password</label>
              <input type="password" name="confirm_password" required value={formData.confirm_password} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Registering...' : 'Register Account'}
            </button>
          </form>
        )}

        {/* PATIENT PORTAL */}
        {portalType === 'patient' && isLogin && (
          <form onSubmit={handlePatientLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Phone Number</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="input-field" placeholder="1234567890" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {portalType === 'patient' && !isLogin && (
          <form onSubmit={handleRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Registered Phone Number</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="input-field" placeholder="1234567890" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Create Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Confirm Password</label>
              <input type="password" name="confirm_password" required value={formData.confirm_password} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Registering...' : 'Register Account'}
            </button>
          </form>
        )}

        {portalType !== 'admin' && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); setFormData({ email: '', phone: '', password: '', confirm_password: '' }); }} 
              style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isLogin ? "First time logging in? Register here." : "Already registered? Sign in."}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
