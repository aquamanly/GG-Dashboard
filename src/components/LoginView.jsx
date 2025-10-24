import React, { useState } from 'react';
import { supabase } from '../supabase';

const LoginView = () => {
  const [mode, setMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const signInWithPassword = async (e) => {
    e.preventDefault();
    setIsBusy(true); setMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    setIsBusy(false);
  };

  const signInWithMagic = async (e) => {
    e.preventDefault();
    setIsBusy(true); setMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email, options: { emailRedirectTo: window.location.origin }
    });
    if (error) setMsg(error.message);
    else setMsg('Magic link sent! Check your email.');
    setIsBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-gray-500 mb-6">Sign in to access the dashboard</p>

        <div className="flex gap-2 mb-4">
          <button
            className={`px-3 py-2 rounded-lg font-semibold ${mode==='password' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setMode('password')}
          >
            Email + Password
          </button>
          <button
            className={`px-3 py-2 rounded-lg font-semibold ${mode==='magic' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setMode('magic')}
          >
            Magic Link
          </button>
        </div>

        <form onSubmit={mode==='password' ? signInWithPassword : signInWithMagic} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email"
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {mode === 'password' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password"
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {msg && <div className="text-sm text-red-600">{msg}</div>}

          <button type="submit" disabled={isBusy}
            className={`w-full py-2 rounded-lg font-semibold ${isBusy ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            {isBusy ? 'Working…' : (mode==='password' ? 'Sign In' : 'Send Magic Link')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
