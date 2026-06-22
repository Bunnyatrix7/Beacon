import { useEffect, useState } from "react";
import AuthPage from "./components/auth/AuthPage.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import { api, clearSession, getToken, saveSession } from './services/api.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  useEffect(() => {
    if(!getToken()) return;
    api('/auth/me').then(setUser).catch(clearSession).finally(()=>setChecking(false));
  }, []);

  const authenticated = session => { saveSession(session); setUser(session.user); };
  const logout = () => { clearSession(); setUser(null); };

  return (
    <ThemeProvider>
      {checking ? <div className="grid min-h-screen place-items-center bg-slate-950 text-cyan-200">Opening Beacon…</div> : user ? (
        <AppShell user={user} onUserChange={setUser} onLogout={logout} />
      ) : (
        <AuthPage onAuthenticated={authenticated} />
      )}
    </ThemeProvider>
  );
}
