function PageHeader({ title, text }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

export default PageHeader;
