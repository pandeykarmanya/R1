function StatCard({ title, value }) {
  return (
    <article className="stat-card">
      <p>{title}</p>
      <strong>{value}</strong>
    </article>
  );
}

export default StatCard;
