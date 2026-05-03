function Navbar({ user, activePage, setActivePage, onLogout }) {
  const pages = ["dashboard", "projects", "tasks"];

  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-mark">TT</div>
        <div>
          <h2>Team Task Manager</h2>
          <p>Manage projects and tasks</p>
        </div>
      </div>

      <div className="navbar-right">
        <nav>
          {pages.map((page) => (
            <button
              key={page}
              className={activePage === page ? "nav-btn active" : "nav-btn"}
              onClick={() => setActivePage(page)}
            >
              {page}
            </button>
          ))}
        </nav>

        <div className="user-box">
          <span>{user.name}</span>
          <small>{user.role}</small>
        </div>

        <button className="nav-btn" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
}

export default Navbar;
