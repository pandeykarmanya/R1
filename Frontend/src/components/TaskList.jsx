function TaskList({ tasks, onStatusChange }) {
  if (!tasks?.length) {
    return <p className="muted">No tasks found.</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article className="task-row" key={task._id}>
          <div>
            <h3>{task.title}</h3>
            <p>{task.description || "No description"}</p>
            <p className="muted">
              {task.project?.name || "No project"} · {task.assignedTo?.name || "Unassigned"}
            </p>
          </div>

          <div className="task-actions">
            <span className="status">{task.status}</span>
            {onStatusChange && (
              <select value={task.status} onChange={(event) => onStatusChange(task._id, event.target.value)}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export default TaskList;
