import { useState } from "react";
import { useLanguage } from "../../context/useLanguage";
import Dialog from "./Dialog";

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  deletingLabel,
  errorFallbackKey = "products.errors.delete",
  errorSuggestion,
  busy,
  onClose,
  onConfirm,
}) {
  const { t } = useLanguage();
  const [error, setError] = useState("");
  const [isConflict, setIsConflict] = useState(false);

  async function confirm() {
    setError("");
    setIsConflict(false);
    try {
      await onConfirm();
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? t(errorFallbackKey));
      setIsConflict(requestError.response?.status === 409);
    }
  }

  return (
    <Dialog title={title} onClose={onClose} className="products-confirm-dialog">
      <div className="products-confirm-body">
        <p>{message}</p>
        {error && <p className="products-form-error" role="alert">{error}</p>}
        {isConflict && errorSuggestion && <p>{errorSuggestion}</p>}
        <div className="products-dialog-actions">
          <button className="product-button product-button-secondary" type="button" onClick={onClose} disabled={busy}>
            {cancelLabel ?? t("products.actions.cancel")}
          </button>
          <button className="product-button product-button-danger-solid" type="button" onClick={confirm} disabled={busy}>
            {busy ? (deletingLabel ?? t("products.actions.deleting")) : confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default ConfirmDialog;
