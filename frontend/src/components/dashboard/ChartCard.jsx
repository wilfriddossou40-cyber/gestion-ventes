function ChartCard({ children, className = "", description, loading, title }) {
  return (
    <article className={`dashboard-card ${className}`.trim()}>
      <header className="dashboard-card-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </header>
      <div className={`dashboard-card-content${loading ? " is-loading" : ""}`}>
        {loading ? (
          <div className="dashboard-card-skeleton" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : children}
      </div>
    </article>
  );
}

export default ChartCard;
