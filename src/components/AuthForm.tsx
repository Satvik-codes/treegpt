import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, TreePine, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, Link } from '@tanstack/react-router';
import TreeConceptImage from '@/components/TreeConceptImage';

import '@/styles/login.css';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
  setStatus(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // If the user doesn't want persistence, sign out after closing the tab/window is hard to enforce
        // with Supabase web auth (it uses localStorage). Best-effort: if rememberMe is false, we clear
        // the stored session immediately on navigation events.
        if (!rememberMe) {
          try {
            // Remove our storage key if present.
            window.localStorage.removeItem('treegpt-auth');
            window.localStorage.removeItem('supabase.auth.token');
          } catch {
            // ignore
          }
        }

        // Double-check session and use replace to avoid landing back on /login.
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          throw new Error('Signed in but no session found. Check Supabase URL/keys and Auth settings.');
        }

        navigate({ to: '/app', replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + '/app' },
        });
        if (error) throw error;
        toast.success('Account created! Check your email (if confirmation is enabled), then sign in.');
      }
    } catch (e: any) {
  const msg = e?.message ? String(e.message) : 'Authentication failed.';
  setStatus(msg);
  toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
  setStatus('Enter your email first.');
  toast.error('Enter your email first.');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (error) throw error;
      toast.success('Password reset email sent.');
    } catch (e: any) {
  const msg = e?.message ? String(e.message) : 'Password reset failed.';
  setStatus(msg);
  toast.error(msg);
    }
  }

  return (
    <div className="login">
      

      {/* Go back button explicitly placed at the window edge */}


      <div className="loginCard">
        <aside className="left">
          <div className="brandRow">
            <div className="brandMark" aria-hidden="true">
              <TreePine className="h-6 w-6" style={{ color: 'var(--login-gold)' }} />
            </div>
            <div>
              <div className="brandName">TreeGPT</div>
              <div className="brandTag">Branch your thinking.</div>
            </div>
          </div>

          <Link 
            to="/" 
            className="back-to-home"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '13px',
              color: 'var(--login-gold)',
              textDecoration: 'none',
              marginTop: '24px',
              opacity: 0.8,
              transition: 'opacity 0.2s'
            }}
          >
            ← Back to Home
          </Link>

          <div className="welcome">
            <h2>Welcome back!</h2>
            <p>You can sign in to access your existing account.</p>
          </div>

          <div className="sparkle s1" aria-hidden="true" />
          <div className="sparkle s2" aria-hidden="true" />
          <div className="sparkle s3" aria-hidden="true" />

          <div className="treeArt">
            <TreeConceptImage />
          </div>
        </aside>

        <main className="right">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="form">
            <h1 className="title">{isLogin ? 'Sign In' : 'Create Account'}</h1>
            <p className="subtitle">Enter your details below.</p>

            {status && (
              <div
                role="status"
                style={{
                  marginTop: 16,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(16,20,19,0.14)',
                  background: 'rgba(200,145,58,0.10)',
                  color: 'rgba(16,20,19,0.82)',
                  fontSize: 13,
                }}
              >
                {status}
              </div>
            )}

            <form onSubmit={handleSubmit} className="fields">
              <div className="field">
                <User className="icon" aria-hidden="true" />
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username or email"
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>

              <div className="field">
                <Lock className="icon" aria-hidden="true" />
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  className="pwToggle"
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="metaRow">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  Remember me
                </label>

                <button className="link" type="button" onClick={handleForgotPassword} disabled={loading}>
                  Forgot password?
                </button>
              </div>

              <button className="cta" type="submit" disabled={loading}>
                {loading ? 'Working…' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="bottom">
              {isLogin ? 'New here? ' : 'Already have an account? '}
              <button className="switch" type="button" onClick={() => setIsLogin((v) => !v)} disabled={loading}>
                {isLogin ? 'Create an Account' : 'Sign In'}
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
