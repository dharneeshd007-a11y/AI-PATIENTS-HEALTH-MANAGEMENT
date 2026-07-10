import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
    role: 'Patient'
  });
  const [isLogin, setIsLogin] = useState(true);
  const [portalType, setPortalType] = useState('patient'); // 'patient' or 'staff'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await authService.login(formData);
        if (data.user.role === 'Admin') {
          navigate('/admin-dashboard');
        } else if (data.user.role === 'Doctor') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/patient-dashboard');
        }
      } else {
        await authService.register(formData);
        setSuccessMsg('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
        
        {/* Portal Tabs */}
        <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
          <button 
            onClick={() => { setPortalType('patient'); setFormData({...formData, role: 'Patient'}); setError(''); setSuccessMsg(''); }}
            style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: portalType === 'patient' ? '2px solid var(--accent-cyan)' : 'none', color: portalType === 'patient' ? 'var(--accent-cyan)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: portalType === 'patient' ? 'bold' : 'normal' }}
          >
            Patient Portal
          </button>
          <button 
            onClick={() => { setPortalType('staff'); setFormData({...formData, role: 'Doctor'}); setError(''); setSuccessMsg(''); }}
            style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', borderBottom: portalType === 'staff' ? '2px solid var(--accent-blue)' : 'none', color: portalType === 'staff' ? 'var(--accent-blue)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: portalType === 'staff' ? 'bold' : 'normal' }}
          >
            Staff Portal
          </button>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
          {isLogin ? (portalType === 'patient' ? 'Patient Login' : 'Staff Login') : (portalType === 'patient' ? 'Patient Registration' : 'Doctor Registration')}
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input 
                type="text" 
                name="full_name" 
                required={!isLogin} 
                value={formData.full_name} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              required
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="+1 (555) 000-0000"
              style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
          </div>

          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
              <input 
                type="email" 
                name="email" 
                required={!isLogin} 
                value={formData.email} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              value={formData.password} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
            />
          </div>

          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Register As</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                disabled={portalType === 'staff' || portalType === 'patient'} // Disable since it's locked by tab
              >
                {portalType === 'staff' ? (
                  <option value="Doctor" style={{ color: 'black' }}>Doctor</option>
                ) : (
                  <option value="Patient" style={{ color: 'black' }}>Patient</option>
                )}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? (isLogin ? 'Logging in...' : 'Registering...') : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }} 
            style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
