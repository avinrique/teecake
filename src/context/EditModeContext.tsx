import React, { createContext, useContext, useEffect, useState } from 'react';

interface EditModeContextType {
  isEditMode: boolean;
  isAdmin: boolean;
  toggleEditMode: () => void;
  setEditMode: (enabled: boolean) => void;
  logout: () => Promise<void>;
}
const EditModeContext = createContext<EditModeContextType | null>(null);

export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { cache: 'no-store' }).then(res => res.json()).then(data => {
      if (!active) return;
      setIsAdmin(data.isAdmin === true);
      const params = new URLSearchParams(window.location.search);
      setEditing(data.isAdmin === true && params.get('mode') !== 'view' && params.get('edit') !== 'false' && params.get('view') !== 'true');
    }).catch(() => {});
    const expired = () => { setIsAdmin(false); setEditing(false); };
    window.addEventListener('teecake-auth-expired', expired);
    return () => { active = false; window.removeEventListener('teecake-auth-expired', expired); };
  }, []);

  const setEditMode = (enabled: boolean) => {
    if (!isAdmin && enabled) { setShowLogin(true); return; }
    setEditing(enabled);
  };
  const toggleEditMode = () => setEditMode(!editing);
  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Could not sign out. Please try again.');
      setIsAdmin(false); setEditing(false);
    } catch { setError('Could not sign out. Please try again.'); setShowLogin(true); }
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        if (isAdmin) setEditing(value => !value);
        else setShowLogin(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAdmin]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to sign in.');
      setPassword('');
      // Reload public state before permitting edits, avoiding stale changes from an old tab.
      window.location.assign(window.location.pathname + '?mode=edit' + window.location.hash);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  };

  return (
    <EditModeContext.Provider value={{ isEditMode: isAdmin && editing, isAdmin, toggleEditMode, setEditMode, logout }}>
      {children}
      {showLogin && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" onClick={() => !busy && setShowLogin(false)}>
          <form onSubmit={login} role="dialog" aria-modal="true" aria-labelledby="admin-login-title" className="w-full max-w-sm rounded-2xl bg-[#fff8f4] p-6 shadow-xl space-y-4 text-[#5e2632]" onClick={event => event.stopPropagation()}>
            <h2 id="admin-login-title" className="text-xl font-semibold">Admin sign in</h2>
            <p className="text-sm">Sign in with one of the two admin accounts to edit this website.</p>
            <label className="block text-sm">Email<input type="email" required autoFocus autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} className="mt-1 w-full border rounded-lg p-2 bg-white" /></label>
            <label className="block text-sm">Password<input type="password" required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="mt-1 w-full border rounded-lg p-2 bg-white" /></label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" disabled={busy} onClick={() => { setShowLogin(false); setPassword(''); setError(''); }} className="px-3 py-2">Cancel</button>
              <button type="submit" disabled={busy} className="rounded-lg bg-[#9e4c5b] text-white px-4 py-2 disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
            </div>
          </form>
        </div>
      )}
    </EditModeContext.Provider>
  );
};

export const useEditMode = (): EditModeContextType => {
  const context = useContext(EditModeContext);
  if (!context) throw new Error('useEditMode must be used within an EditModeProvider');
  return context;
};
