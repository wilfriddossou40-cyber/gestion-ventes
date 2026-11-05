function Skeleton({ width = "100%", height = 14, className = "", ...props }) {
  return (
    <span
      className={`ui-skeleton ${className}`.trim()}
      style={{ width, height }}
      aria-hidden="true"
      {...props}
    />
  );
}

export default Skeleton;
