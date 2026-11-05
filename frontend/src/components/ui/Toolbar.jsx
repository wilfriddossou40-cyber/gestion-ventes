import "./Toolbar.css";

function Toolbar({ children, className = "", ...props }) {
  return <section className={`ui-toolbar ${className}`.trim()} {...props}>{children}</section>;
}

export default Toolbar;
