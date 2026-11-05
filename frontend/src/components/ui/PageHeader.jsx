function PageHeader({ title, description, actions, eyebrow, className = "" }) {
  return (
    <header className={`ui-page-header ${className}`.trim()}>
      <div className="ui-page-header-copy">
        {eyebrow && <span className="dashboard-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="ui-page-header-actions">{actions}</div>}
    </header>
  );
}

export default PageHeader;
