import { Children, Fragment, cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LoaderCircle, X } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";
import ApiErrorBanner from "./ApiErrorBanner";
import "./Dialog.css";

function Dialog({
  title,
  onClose,
  children,
  className = "",
  error,
  actions,
  busy = false,
  cancelLabel,
  submitLabel,
  onSubmit,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const errorId = useId();
  const onCloseRef = useRef(onClose);
  const [closing, setClosing] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const requestClose = useCallback(() => {
    setClosing(true);
  }, []);

  useEffect(() => {
    if (!closing) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onCloseRef.current();
      return undefined;
    }
    const timer = window.setTimeout(() => onCloseRef.current(), 180);
    return () => window.clearTimeout(timer);
  }, [closing]);

  function withBusyIndicator(actionElements) {
    const flattened = Children.toArray(actionElements).flatMap((element) => (
      isValidElement(element) && element.type === Fragment
        ? Children.toArray(element.props.children)
        : [element]
    ));
    return flattened.map((element) => {
      if (!isValidElement(element) || element.type !== "button") return element;
      const isPrimary = /product-button-primary|product-button-danger-solid/.test(element.props.className ?? "");
      if (!isPrimary) return element;
      return cloneElement(element, {
        disabled: busy || element.props.disabled,
        "aria-busy": busy || undefined,
        children: (
          <>
            {busy && <LoaderCircle className="ui-dialog-spinner" size={16} aria-hidden="true" />}
            {element.props.children}
          </>
        ),
      });
    });
  }

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    document.body.style.overflow = "hidden";
    const focusable = () => [...(dialog?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ) ?? [])].filter((element) => !element.hasAttribute("hidden"));

    requestAnimationFrame(() => focusable()[0]?.focus());

    function handleKeyDown(event) {
      const activeDialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if (activeDialogs[activeDialogs.length - 1] !== dialog) return;
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
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
  }, [requestClose]);

  return createPortal(
    <div
      className={`ui-dialog-backdrop${closing ? " is-closing" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <section
        className={`ui-dialog ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={error ? errorId : undefined}
        aria-busy={busy || undefined}
        ref={dialogRef}
        tabIndex={-1}
      >
        <span className="ui-dialog-handle" aria-hidden="true" />
        <header className="ui-dialog-header">
          <h2 id={titleId}>{title}</h2>
          <button
            className="products-icon-button"
            type="button"
            aria-label={t("products.dialog.close")}
            onClick={requestClose}
          >
            <X size={19} aria-hidden="true" />
          </button>
        </header>
        <ApiErrorBanner message={error} className="ui-dialog-error" id={errorId} />
        <div className="ui-dialog-body">
          {typeof children === "function" ? children(requestClose) : children}
        </div>
        {(actions || onSubmit) && (
          <footer className="ui-dialog-footer">
            {withBusyIndicator(typeof actions === "function" ? actions(requestClose) : actions ?? (
              <>
                <button className="product-button product-button-secondary" type="button" onClick={requestClose} disabled={busy}>
                  {cancelLabel}
                </button>
                <button className="product-button product-button-primary" type="submit" form="ui-dialog-form" disabled={busy}>
                  {busy && <LoaderCircle className="ui-dialog-spinner" size={16} aria-hidden="true" />}
                  {submitLabel}
                </button>
              </>
            ))}
          </footer>
        )}
      </section>
    </div>,
    document.body,
  );
}

export default Dialog;
