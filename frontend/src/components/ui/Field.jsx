import { useId } from "react";
import { AlertCircle } from "lucide-react";
import "./Field.css";

function Field({
  as = "input",
  id,
  label,
  required = false,
  help,
  error,
  children,
  className = "",
  ...props
}) {
  const generatedId = useId();
  const fieldId = id ?? `field-${generatedId}`;
  const helpId = help ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const Element = as;
  const describedBy = [props["aria-describedby"], helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`ui-field${error ? " has-error" : ""}${className ? ` ${className}` : ""}`}>
      <label className="ui-field-label" htmlFor={fieldId}>
        {label}
        {required && <span className="ui-field-required" aria-hidden="true"> *</span>}
      </label>
      <Element
        {...props}
        id={fieldId}
        className={`ui-field-control${props.className ? ` ${props.className}` : ""}`}
        required={required || props.required}
        aria-invalid={Boolean(error) || props["aria-invalid"] || undefined}
        aria-describedby={describedBy}
      >
        {as === "select" || as === "textarea" ? children : undefined}
      </Element>
      {help && <span className="ui-field-help" id={helpId}>{help}</span>}
      <span className={`ui-field-error${error ? " is-visible" : ""}`} id={errorId} aria-live="polite">
        {error && <><AlertCircle size={14} aria-hidden="true" /><span>{error}</span></>}
      </span>
    </div>
  );
}

export default Field;
