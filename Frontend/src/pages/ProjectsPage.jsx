/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import api from "../services/api";

const emptyProject = { name: "", description: "", members: [] };

function ProjectsPage({ user }) {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState("");

  const isAdmin = user.role === "admin";

  async function loadProjects(nextPage = page) {
    try {
      const { data } = await api.get(`/projects?page=${nextPage}&limit=6`);
      setProjects(data.projects);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load projects");
    }
  }

  async function loadMembers() {
    if (!isAdmin) return;
    try {
      const { data } = await api.get("/users/members");
      setMembers(data.members);
    } catch {
      setMembers([]);
    }
  }

  useEffect(() => {
    loadProjects(1);
    loadMembers();
  }, []);

  async function createProject(event) {
    event.preventDefault();
    setMessage("");

    try {
      await api.post("/projects", form);
      setForm(emptyProject);
      loadProjects(1);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not create project");
    }
  }

  async function removeMember(projectId, memberId) {
    try {
      await api.delete(`/projects/${projectId}/members/${memberId}`);
      loadProjects(page);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not remove member");
    }
  }

  function toggleMember(memberId) {
    const exists = form.members.includes(memberId);
    setForm({
      ...form,
      members: exists
        ? form.members.filter((id) => id !== memberId)
        : [...form.members, memberId]
    });
  }

  return (
    <section className="page">
      <PageHeader title="Projects" text="Create projects and manage team members." />
      {message && <p className="alert">{message}</p>}

      {isAdmin && (
        <section className="panel">
          <h3>Create Project</h3>
          <form className="form grid-form" onSubmit={createProject}>
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Website redesign"
              />
            </label>
            <label>
              Description
              <input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Short project details"
              />
            </label>
            <div className="checkbox-list">
              {members.map((member) => (
                <label key={member._id} className="check-row">
                  <input
                    type="checkbox"
                    checked={form.members.includes(member._id)}
                    onChange={() => toggleMember(member._id)}
                  />
                  {member.name}
                </label>
              ))}
            </div>
            <button className="primary-btn">Create Project</button>
          </form>
        </section>
      )}

      <div className="card-grid">
        {projects.map((project) => (
          <article className="card" key={project._id}>
            <h3>{project.name}</h3>
            <p>{project.description || "No description"}</p>
            <p className="muted">Members: {project.members.length}</p>

            {isAdmin && (
              <div className="member-list">
                {project.members.map((member) => (
                  <span key={member._id} className="chip">
                    {member.name}
                    {member._id !== project.createdBy?._id && (
                      <button onClick={() => removeMember(project._id, member._id)}>x</button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={loadProjects} />
    </section>
  );
}

export default ProjectsPage;
