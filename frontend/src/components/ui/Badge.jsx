const variants = new Set(["success", "alert", "neutral", "info"]);

function Badge({ variant = "neutral", children, className = "", ...props }) {
  const safeVariant = variants.has(variant) ? variant : "neutral";
  return (
    <span className={`ui-badge ui-badge-${safeVariant} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}

export default Badge;
