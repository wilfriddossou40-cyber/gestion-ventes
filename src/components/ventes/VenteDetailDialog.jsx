import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { getVente } from "../../api/ventes";
import { useLanguage } from "../../context/useLanguage";
import { formatCurrency, formatDateOnly } from "../../lib/format";
import ConfirmDialog from "../produits/ConfirmDialog";
import Dialog from "../produits/Dialog";

function VenteDetailDialog({ saleId, language, busy, onClose, onCancelSale }) {
  const { t } = useLanguage();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const loadSale = useCallback(async () => {
    try {
      setSale(await getVente(saleId));
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  useEffect(() => {
    loadSale();
  }, [loadSale]);

  const errorMessage = error?.response?.data?.message ?? t("sales.history.detail.loadError");

  return (
    <>
      <Dialog
        title={t("sales.history.detail.title", { id: saleId })}
        onClose={onClose}
        className="products-form-dialog sale-detail-dialog"
      >
        {loading ? (
          <div className="sale-detail-state" aria-live="polite">
            <div className="sale-detail-skeleton" aria-hidden="true"><span /><span /><span /></div>
            <p>{t("sales.history.detail.loading")}</p>
          </div>
        ) : error ? (
          <div className="sale-detail-state">
            <AlertCircle size={25} className="products-state-error" aria-hidden="true" />
            <p role="alert">{errorMessage}</p>
            <button
              className="product-button product-button-primary"
              type="button"
              onClick={() => {
                setLoading(true);
                setError(null);
                loadSale();
              }}
            >
              <RotateCw size={15} aria-hidden="true" />{t("sales.history.detail.retry")}
            </button>
          </div>
        ) : (
          <div className="sale-detail-content">
            <dl className="sale-detail-meta">
              <div>
                <dt>{t("sales.history.fields.date")}</dt>
                <dd>{formatDateOnly(sale.date_vente, language)}</dd>
              </div>
              <div>
                <dt>{t("sales.history.fields.client")}</dt>
                <dd>{sale.client?.nom ?? "—"}</dd>
              </div>
            </dl>
            <div className="sale-detail-table-wrap">
              <table className="sale-detail-table">
                <thead>
                  <tr>
                    <th scope="col">{t("sales.history.detail.fields.product")}</th>
                    <th scope="col">{t("sales.history.detail.fields.quantity")}</th>
                    <th scope="col">{t("sales.history.detail.fields.unitPrice")}</th>
                    <th scope="col">{t("sales.history.detail.fields.subtotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.details.map((line) => (
                    <tr key={line.id}>
                      <td>{line.produit?.nom ?? "—"}</td>
                      <td>{line.quantite}</td>
                      <td>{formatCurrency(Number(line.prix_unitaire), language)}</td>
                      <td>{formatCurrency(Number(line.sous_total), language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sale-detail-total">
              <span>{t("sales.history.fields.amount")}</span>
              <strong>{formatCurrency(Number(sale.montant_total), language)}</strong>
            </div>
            <div className="sale-detail-actions">
              <button
                className="product-button product-button-danger"
                type="button"
                onClick={() => setConfirming(true)}
                disabled={busy}
              >
                {t("sales.history.actions.cancelSale")}
              </button>
            </div>
          </div>
        )}
      </Dialog>
      {confirming && sale && (
        <ConfirmDialog
          title={t("sales.history.cancel.title")}
          message={t("sales.history.cancel.message")}
          confirmLabel={t("sales.history.actions.cancelSale")}
          cancelLabel={t("sales.history.cancel.keep")}
          deletingLabel={t("sales.history.cancel.pending")}
          errorFallbackKey="sales.history.cancel.error"
          busy={busy}
          onClose={() => setConfirming(false)}
          onConfirm={() => onCancelSale(sale)}
        />
      )}
    </>
  );
}

export default VenteDetailDialog;
