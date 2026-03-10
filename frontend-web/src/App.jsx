import { useMemo, useState } from "react";
import DashboardPage from "./dashboard/DashboardPage";
import { loginUser } from "./services/api";

const readStoredUser = () => {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("auth_user");
    return null;
  }
};

function LoginPanel({ onLogin }) {
  const [email, setEmail] = useState("admin@healthmonitor.org");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={submit}>
        <h1>Authority Dashboard Login</h1>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const token = localStorage.getItem("auth_token");
  const [user, setUser] = useState(token ? readStoredUser() : null);

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  const header = useMemo(
    () => (
      <header className="top-header">
        <div className="header-copy">
          <span className="signal-tag">Live Surveillance</span>
          <h1>Smart Community Health Monitoring</h1>
          <p>Water-borne disease surveillance and early warning</p>
        </div>
        {user && (
          <div className="top-actions">
            <div className="user-pill">
              <strong>{user.full_name}</strong>
              <small>{user.role?.replace("_", " ") || "authority"}</small>
            </div>
            <button onClick={logout} className="ghost-btn">Logout</button>
          </div>
        )}
      </header>
    ),
    [user]
  );

  if (!token || !user) {
    return (
      <div className="app-shell">
        <div className="ambient ambient-a" />
        <div className="ambient ambient-b" />
        {header}
        <LoginPanel onLogin={setUser} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      {header}
      <DashboardPage />
    </div>
  );
}
