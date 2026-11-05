import { AlertCircle } from "lucide-react";

function ApiErrorBanner({ message, className = "", id }) {
  if (!message) return null;
  return (
    <div className={`ui-api-error ${className}`.trim()} id={id} role="alert">
      <AlertCircle size={17} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export default ApiErrorBanner;
