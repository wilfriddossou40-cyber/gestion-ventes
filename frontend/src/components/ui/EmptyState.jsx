function EmptyState({ icon: Icon, title, description, actions, className = "" }) {
  return (
    <div className={`ui-empty-state ${className}`.trim()}>
      {Icon && <span className="ui-empty-state-icon"><Icon size={20} aria-hidden="true" /></span>}
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {actions}
    </div>
  );
}

export default EmptyState;
