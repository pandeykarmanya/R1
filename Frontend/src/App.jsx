import { useState } from "react";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [authMode, setAuthMode] = useState("login");
  const [activePage, setActivePage] = useState("dashboard");
  const [message, setMessage] = useState("");

  function handleLogin(authUser) {
    setUser(authUser);
    setToken(authUser.token);
    localStorage.setItem("user", JSON.stringify(authUser));
    localStorage.setItem("token", authUser.token);
    setActivePage("dashboard");
    setMessage("");
  }

  function logout() {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  if (!user || !token) {
    return (
      <AuthPage
        mode={authMode}
        setMode={setAuthMode}
        onLogin={handleLogin}
        message={message}
        setMessage={setMessage}
      />
    );
  }

  return (
    <div className="app-shell">
      <Navbar user={user} activePage={activePage} setActivePage={setActivePage} onLogout={logout} />

      <main className="main">
        {activePage === "dashboard" && <DashboardPage />}
        {activePage === "projects" && <ProjectsPage user={user} />}
        {activePage === "tasks" && <TasksPage user={user} />}
      </main>
    </div>
  );
}

export default App;
