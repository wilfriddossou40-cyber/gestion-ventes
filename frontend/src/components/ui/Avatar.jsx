function Avatar({ name = "", className = "", ...props }) {
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase()).join("");

  return (
    <span className={`ui-avatar ${className}`.trim()} aria-label={name || undefined} {...props}>
      {initials}
    </span>
  );
}

export default Avatar;
