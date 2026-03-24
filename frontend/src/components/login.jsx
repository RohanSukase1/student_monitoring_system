import React, { useState } from 'react';
import { FaUser, FaLock, FaFingerprint, FaCircleNotch } from 'react-icons/fa';
import { MdSecurity, MdLogin } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const styles = {
    glassHeavy: "bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-white/10 shadow-2xl",
    inputField: "w-full bg-slate-950/50 border border-slate-700/50 text-slate-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300 placeholder:text-slate-600 font-medium",
    glow: "absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none"
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const rawRole = data.role || ""; 
        const normalizedRole = rawRole.toLowerCase().trim();
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', normalizedRole); 

        const user = username.toLowerCase();

        // ROUTING LOGIC based on Username
        if (normalizedRole === 'admin' || normalizedRole === 'principal') {
            navigate('/admin'); 
        } else if (user.includes('aiml') || user.includes('an')) {
            localStorage.setItem('dept_name', 'AI & ML');
            navigate('/an-dept'); // Route to AN Dashboard
        } else if (user.includes('comp') || user.includes('co')) {
            localStorage.setItem('dept_name', 'Computer Engineering');
            navigate('/co-dept'); // Route to CO Dashboard
        } else {
            setError('Department not recognized for this user.');
        }
      } else {
        setError(data.error || 'Access Denied');
      }
    } catch (err) {
      setError('Server unreachable. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030306] font-sans flex items-center justify-center relative overflow-hidden text-slate-200">
      <div className={`${styles.glow} bg-blue-600 -top-20 -left-20 animate-pulse`} />
      <div className={`${styles.glow} bg-purple-600 -bottom-20 -right-20 animate-pulse delay-1000`} />

      <div className={`relative z-10 w-full max-w-md p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent`}>
        <div className={`${styles.glassHeavy} p-8 md:p-12 rounded-[2.4rem]`}>
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-400/20 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
              <MdSecurity size={32} className="text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">System <span className="text-blue-500">Access</span></h1>
            <p className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase mt-2">Authentication Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-blue-400 transition-colors">Username</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-4 text-slate-500 text-sm group-focus-within:text-blue-400 transition-colors" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={styles.inputField} placeholder="ID / EMAIL" required />
              </div>
            </div>
            <div className="space-y-2 group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-purple-400 transition-colors">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-4 text-slate-500 text-sm group-focus-within:text-purple-400 transition-colors" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${styles.inputField} focus:border-purple-500 focus:ring-purple-500`} placeholder="••••••••" required />
              </div>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest p-3 rounded-lg text-center animate-bounce">⚠ {error}</div>
            )}
            <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold uppercase tracking-[0.15em] text-xs transition-all duration-300 relative overflow-hidden group ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:scale-[1.02]'}`}>
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <>Verifying <FaCircleNotch className="animate-spin" /></> : <>Connect <MdLogin size={16} /></>}
              </div>
              {!loading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;