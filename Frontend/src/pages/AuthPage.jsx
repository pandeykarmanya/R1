import { useState } from "react";
import api from "../services/api";

function AuthPage({ mode, setMode, onLogin, message, setMessage }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await api.post(endpoint, payload);
      onLogin(data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-title">
          <h1>Team Task Manager</h1>
          <p>{isLogin ? "Login to continue" : "Create a member account"}</p>
        </div>

        {message && <p className="alert">{message}</p>}

        <form onSubmit={handleSubmit} className="form">
          {!isLogin && (
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Your name"
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Minimum 6 characters"
            />
          </label>

          <button className="primary-btn" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Signup"}
          </button>
        </form>

        <button className="link-btn" onClick={() => setMode(isLogin ? "signup" : "login")}>
          {isLogin ? "Need an account? Signup" : "Already have an account? Login"}
        </button>
      </section>
    </main>
  );
}

export default AuthPage;
