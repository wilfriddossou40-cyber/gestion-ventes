function Card({ as: Element = "section", children, className = "", ...props }) {
  return <Element className={`ui-card ${className}`.trim()} {...props}>{children}</Element>;
}

export default Card;
