import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";

function Dialog({ title, onClose, children, className = "" }) {
  const { t } = useLanguage();
  const dialogRef = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    document.body.style.overflow = "hidden";

    const focusable = () =>
      dialog?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ) ?? [];

    focusable()[0]?.focus();

    function handleKeyDown(event) {
      const activeDialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if (activeDialogs[activeDialogs.length - 1] !== dialog) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const elements = focusable();
      if (elements.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!dialog?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  return (
    <div
      className="products-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`products-dialog ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="products-dialog-header">
          <h2 id={titleId}>{title}</h2>
          <button
            className="products-icon-button"
            type="button"
            aria-label={t("products.dialog.close")}
            onClick={onClose}
          >
            <X size={19} aria-hidden="true" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

export default Dialog;
