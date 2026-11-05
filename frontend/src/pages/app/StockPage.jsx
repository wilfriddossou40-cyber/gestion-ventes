import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { createMouvementStock } from "../../api/mouvementsStock";
import MouvementFormDialog from "../../components/stock/MouvementFormDialog";
import MouvementsTable from "../../components/stock/MouvementsTable";
import ProductsSkeleton from "../../components/produits/ProductsSkeleton";
import StockBadge from "../../components/produits/StockBadge";
import { useLanguage } from "../../context/useLanguage";
import useAlertesStock from "../../hooks/useAlertesStock";
import useMouvementsStock from "../../hooks/useMouvementsStock";
import useProduits from "../../hooks/useProduits";
import { normalizeApiError } from "../../lib/apiErrors";
import "./ProduitsPage.css";
import "./StockPage.css";

function StockPage() {
  const { language, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const productId = searchParams.get("produit") ?? "";
  const typeFilter = searchParams.get("type") ?? "";
  const [productSearch, setProductSearch] = useState("");
  const [dialog, setDialog] = useState(null);
  const [mutating, setMutating] = useState(false);

  const alerts = useAlertesStock();
  const products = useProduits({});
  const movementParams = useMemo(() => ({
    ...(productId ? { produit_id: productId } : {}),
    ...(typeFilter ? { type: typeFilter } : {}),
  }), [productId, typeFilter]);
  const movements = useMouvementsStock(movementParams);
  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLocaleLowerCase();
    return products.data.filter((product) =>
      `${product.nom} ${product.reference}`.toLocaleLowerCase().includes(query),
    );
  }, [productSearch, products.data]);
  const selectedProduct = products.data.find((product) => String(product.id) === productId);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  function resetFilters() {
    setSearchParams({});
    setProductSearch("");
  }

  async function saveMovement(payload) {
    setMutating(true);
    try {
      await createMouvementStock(payload);
      toast.success(t("stock.form.toast.created"));
      await Promise.all([movements.reload(), alerts.reload(), products.reload()]);
    } finally {
      setMutating(false);
    }
  }

  const hasFilters = Boolean(productId || typeFilter);

  return (
    <div className="stock-page">
      <Toaster position="top-right" toastOptions={{ duration: 2800 }} />
      <header className="products-page-header">
        <div>
          <h1>{t("app.pages.stock.title")}</h1>
          <p>{t("app.pages.stock.description")}</p>
        </div>
        <div className="stock-page-header-actions">
          <button
            className="product-button product-button-primary"
            type="button"
            onClick={() => setDialog({ product: null, type: "entree" })}
            disabled={products.loading || Boolean(products.error) || products.data.length === 0}
          >
            <Plus size={17} aria-hidden="true" />{t("stock.actions.newMovement")}
          </button>
        </div>
      </header>

      <section className="stock-section" aria-labelledby="stock-alerts-title">
        <div className="stock-section-heading">
          <div>
            <h2 id="stock-alerts-title">{t("stock.alerts.title")}</h2>
            <p>{t("stock.alerts.description")}</p>
          </div>
        </div>
        {alerts.error ? (
          <div className="products-data-panel stock-panel-error">
            <AlertCircle className="products-state-error" size={24} aria-hidden="true" />
            <h3>{t("stock.alerts.errorTitle")}</h3>
            <p>{normalizeApiError(alerts.error, t).message}</p>
            <button className="product-button product-button-primary" type="button" onClick={alerts.reload}>
              {t("stock.actions.retry")}
            </button>
          </div>
        ) : alerts.loading ? (
          <div className="products-data-panel"><ProductsSkeleton /></div>
        ) : alerts.data.length === 0 ? (
          <div className="stock-positive-state">
            <CheckCircle2 size={21} aria-hidden="true" />
            <span>{t("stock.alerts.none")}</span>
          </div>
        ) : (
          <div className="stock-alert-list">
            {alerts.data.map((product) => (
              <article className="stock-alert-card" key={product.id}>
                <div className="stock-alert-name">
                  <h3>{product.nom}</h3>
                  <span>{product.reference}{product.categorie?.nom ? ` · ${product.categorie.nom}` : ""}</span>
                </div>
                <div className="stock-alert-quantities">
                  <span>{t("stock.alerts.currentStock")} <strong>{product.quantite_stock}</strong></span>
                  <span>{t("stock.alerts.threshold")} <strong>{product.seuil_alerte}</strong></span>
                </div>
                <StockBadge produit={product} />
                <button
                  className="product-button product-button-secondary"
                  type="button"
                  disabled={products.error || products.loading}
                  onClick={() => setDialog({ product, type: "entree" })}
                >
                  <Plus size={15} aria-hidden="true" />{t("stock.alerts.restock")}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="stock-section" aria-labelledby="stock-journal-title">
        <div className="stock-section-heading">
          <div>
            <h2 id="stock-journal-title">{t("stock.journal.title")}</h2>
            <p>{t("stock.journal.description")}</p>
          </div>
        </div>
        <div className="stock-journal-filters">
          <label className="stock-filter-product">
            <span>{t("stock.filters.product")}</span>
            <input
              type="search"
              placeholder={t("stock.filters.productSearch")}
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
            />
            <select
              aria-label={t("stock.filters.selectProduct")}
              value={productId}
              disabled={products.loading || Boolean(products.error)}
              onChange={(event) => {
                updateFilter("produit", event.target.value);
                setProductSearch("");
              }}
            >
              <option value="">{t("stock.filters.allProducts")}</option>
              {selectedProduct && !filteredProducts.some((product) => String(product.id) === productId) && (
                <option value={selectedProduct.id}>{selectedProduct.nom} · {selectedProduct.reference}</option>
              )}
              {filteredProducts.map((product) => (
                <option value={product.id} key={product.id}>{product.nom} · {product.reference}</option>
              ))}
            </select>
          </label>
          <label className="stock-filter-type">
            <span>{t("stock.filters.type")}</span>
            <select value={typeFilter} onChange={(event) => updateFilter("type", event.target.value)}>
              <option value="">{t("stock.filters.allTypes")}</option>
              <option value="entree">{t("stock.types.entry")}</option>
              <option value="sortie">{t("stock.types.exit")}</option>
            </select>
          </label>
          <button
            className="product-button product-button-secondary"
            type="button"
            disabled={!hasFilters && !productSearch}
            onClick={resetFilters}
          >
            {t("stock.filters.reset")}
          </button>
        </div>
        {products.error && (
          <div className="stock-products-error" role="alert">
            <span>{normalizeApiError(products.error, t).message}</span>
            <button className="product-button product-button-secondary" type="button" onClick={products.reload}>
              {t("stock.actions.retry")}
            </button>
          </div>
        )}
        {movements.error ? (
          <div className="products-data-panel stock-panel-error">
            <AlertCircle className="products-state-error" size={24} aria-hidden="true" />
            <h3>{t("stock.journal.errorTitle")}</h3>
            <p>{normalizeApiError(movements.error, t).message}</p>
            <button className="product-button product-button-primary" type="button" onClick={movements.reload}>
              {t("stock.actions.retry")}
            </button>
          </div>
        ) : movements.loading ? (
          <div className="products-data-panel stock-journal-panel">
            <MouvementsTable movements={[]} language={language} loading />
          </div>
        ) : movements.data.length === 0 ? (
          <div className="products-data-panel">
            <div className="products-state">
              <h3>{t(hasFilters ? "stock.journal.noResultsTitle" : "stock.journal.emptyTitle")}</h3>
              <p>{t(hasFilters ? "stock.journal.noResults" : "stock.journal.empty")}</p>
            </div>
          </div>
        ) : (
          <div className="products-data-panel stock-journal-panel">
            <MouvementsTable movements={movements.data} language={language} />
          </div>
        )}
      </section>

      {dialog && (
        <MouvementFormDialog
          products={products.data}
          initialProduct={dialog.product}
          initialType={dialog.type}
          busy={mutating}
          onClose={() => setDialog(null)}
          onSaved={saveMovement}
        />
      )}
    </div>
  );
}

export default StockPage;
