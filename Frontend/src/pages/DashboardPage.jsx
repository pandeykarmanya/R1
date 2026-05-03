import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import TaskList from "../components/TaskList";
import api from "../services/api";

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data } = await api.get("/dashboard");
        setDashboard(data);
      } catch (error) {
        setError(error.response?.data?.message || "Could not load dashboard");
      }
    }

    loadDashboard();
  }, []);

  if (error) return <p className="alert">{error}</p>;
  if (!dashboard) return <p className="muted">Loading dashboard...</p>;

  const stats = dashboard.stats;

  return (
    <section className="page">
      <PageHeader title="Dashboard" text="Quick view of your task progress." />

      <div className="stats-grid">
        <StatCard title="Total" value={stats.totalTasks} />
        <StatCard title="Todo" value={stats.todoTasks} />
        <StatCard title="In Progress" value={stats.inProgressTasks} />
        <StatCard title="Done" value={stats.completedTasks} />
        <StatCard title="Overdue" value={stats.overdueTasks} />
      </div>

      <section className="panel">
        <h3>Recent Tasks</h3>
        <TaskList tasks={dashboard.recentTasks} />
      </section>
    </section>
  );
}

export default DashboardPage;
