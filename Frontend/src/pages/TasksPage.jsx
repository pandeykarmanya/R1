/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import TaskList from "../components/TaskList";
import api from "../services/api";

const emptyTask = {
  title: "",
  description: "",
  project: "",
  assignedTo: "",
  status: "todo",
  priority: "medium",
  dueDate: ""
};

function TasksPage({ user }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState("");

  const isAdmin = user.role === "admin";

  async function loadTasks(nextPage = page) {
    try {
      const params = new URLSearchParams({ page: nextPage, limit: 8 });
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await api.get(`/tasks?${params.toString()}`);
      setTasks(data.tasks);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load tasks");
    }
  }

  async function loadData() {
    try {
      const projectRes = await api.get("/projects?limit=50");
      setProjects(projectRes.data.projects);

      if (isAdmin) {
        const memberRes = await api.get("/users/members");
        setMembers(memberRes.data.members);
      }
    } catch {
      setMessage("Could not load form data");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTasks(1);
  }, [statusFilter]);

  async function createTask(event) {
    event.preventDefault();
    setMessage("");

    try {
      await api.post("/tasks", form);
      setForm(emptyTask);
      loadTasks(1);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create task");
    }
  }

  async function updateStatus(taskId, status) {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      loadTasks(page);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update status");
    }
  }

  return (
    <section className="page">
      <PageHeader title="Tasks" text="Assign work and track task status." />
      {message && <p className="alert">{message}</p>}

      {isAdmin && (
        <section className="panel">
          <h3>Create Task</h3>
          <form className="form grid-form" onSubmit={createTask}>
            <label>
              Title
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Prepare dashboard"
              />
            </label>
            <label>
              Project
              <select
                value={form.project}
                onChange={(event) => setForm({ ...form, project: event.target.value })}
              >
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>{project.name}</option>
                ))}
              </select>
            </label>
            <label>
              Assign To
              <select
                value={form.assignedTo}
                onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}
              >
                <option value="">Select member</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>{member.name}</option>
                ))}
              </select>
            </label>
            <label>
              Due Date
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
              />
            </label>
            <label className="full-field">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Task details"
              />
            </label>
            <button className="primary-btn">Create Task</button>
          </form>
        </section>
      )}

      <div className="toolbar">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">All status</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <TaskList tasks={tasks} onStatusChange={updateStatus} />
      <Pagination page={page} totalPages={totalPages} onPageChange={loadTasks} />
    </section>
  );
}

export default TasksPage;
