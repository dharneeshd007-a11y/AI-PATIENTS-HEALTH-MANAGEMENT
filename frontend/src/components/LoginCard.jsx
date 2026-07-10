import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiLock, FiUser, FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import GoogleLoginButton from './ui/GoogleLoginButton';
import authService from '../services/authService';

const LoginCard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    full_name: '', email: '', phone: '', password: '', role: 'Patient'
  });

  // ─── Handle Google OAuth redirect (token + user in URL query params) ───────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname + '#/login');
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        // Store in the same format as regular login
        localStorage.setItem('user', JSON.stringify({ token, user }));
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname + '#/login');
        // Redirect based on role
        if (user.role === 'Admin') navigate('/admin-dashboard', { replace: true });
        else if (user.role === 'Doctor') navigate('/doctor-dashboard', { replace: true });
        else navigate('/patient-dashboard', { replace: true });
      } catch (e) {
        setError('Login failed. Please try again.');
      }
    }
  }, [location.search, navigate]);

  // ─── Phone + Password Login ───────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(loginForm);
      if (data.user.role === 'Admin') navigate('/admin-dashboard');
      else if (data.user.role === 'Doctor') navigate('/doctor-dashboard');
      else navigate('/patient-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(registerForm);
      setSuccess('Registration successful! Please log in.');
      setTab('login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700
    bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100
    placeholder-slate-400 dark:placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
    transition duration-200 text-sm font-poppins`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Card Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-poppins">
          Welcome Back
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-poppins">
          Sign in to KMCH AI Health Management
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1 mb-6">
        {['login', 'register'].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 font-poppins capitalize
              ${tab === t
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            {t === 'login' ? 'Sign In' : 'Register'}
          </button>
        ))}
      </div>

      {/* Alert: Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-5 text-sm font-poppins"
          >
            <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert: Success */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl mb-5 text-sm font-poppins"
          >
            <FiCheckCircle className="mt-0.5 shrink-0" size={16} />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* ──── LOGIN FORM ──── */}
        {tab === 'login' && (
          <motion.div key="login" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Phone */}
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={loginForm.phone}
                  onChange={e => setLoginForm({ ...loginForm, phone: e.target.value })}
                  required
                  className={inputCls}
                />
              </div>
              {/* Password */}
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  className={`${inputCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all duration-200 font-poppins disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In with Phone'}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium font-poppins">OR FOR STAFF</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            <GoogleLoginButton disabled={loading} />

            <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500 font-poppins">
              Google Sign-In is for Doctors &amp; Administrators only
            </p>
          </motion.div>
        )}

        {/* ──── REGISTER FORM ──── */}
        {tab === 'register' && (
          <motion.div key="register" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerForm.full_name}
                  onChange={e => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                  required
                  className={inputCls}
                />
              </div>
              {/* Phone */}
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={registerForm.phone}
                  onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  required
                  className={inputCls}
                />
              </div>
              {/* Role */}
              <div className="relative">
                <select
                  value={registerForm.role}
                  onChange={e => setRegisterForm({ ...registerForm, role: e.target.value })}
                  className={`${inputCls} pl-4 appearance-none`}
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                </select>
              </div>
              {/* Email (Doctor only) */}
              {registerForm.role === 'Doctor' && (
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={registerForm.email}
                    onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required={registerForm.role === 'Doctor'}
                    className={inputCls}
                  />
                </div>
              )}
              {/* Password */}
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create Password"
                  value={registerForm.password}
                  onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                  className={`${inputCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all duration-200 font-poppins disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Create Account'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LoginCard;
