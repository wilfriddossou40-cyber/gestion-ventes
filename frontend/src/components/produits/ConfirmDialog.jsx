import { useState } from "react";
import { useLanguage } from "../../context/useLanguage";
import Dialog from "../ui/Dialog";
import { normalizeApiError } from "../../lib/apiErrors";

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  deletingLabel,
  errorSuggestion,
  busy,
  onClose,
  onConfirm,
}) {
  const { t } = useLanguage();
  const [error, setError] = useState("");
  const [isConflict, setIsConflict] = useState(false);

  async function confirm(closeDialog) {
    setError("");
    setIsConflict(false);
    try {
      await onConfirm();
      closeDialog();
    } catch (requestError) {
      setError(normalizeApiError(requestError, t).message);
      setIsConflict(requestError.response?.status === 409);
    }
  }

  return (
    <Dialog
      title={title}
      onClose={onClose}
      className="products-confirm-dialog ui-dialog-sm"
      error={error}
      busy={busy}
      actions={(closeDialog) => (
        <>
          <button className="product-button product-button-secondary" type="button" onClick={closeDialog} disabled={busy}>
            {cancelLabel ?? t("products.actions.cancel")}
          </button>
          <button className="product-button product-button-danger-solid" type="button" onClick={() => confirm(closeDialog)} disabled={busy}>
            {busy ? (deletingLabel ?? t("products.actions.deleting")) : confirmLabel}
          </button>
        </>
      )}
    >
      <div className="products-confirm-body">
        <p>{message}</p>
        {isConflict && errorSuggestion && <p>{errorSuggestion}</p>}
      </div>
    </Dialog>
  );
}

export default ConfirmDialog;
