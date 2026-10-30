import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleAlert, Plus, Search } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createProduit, deleteProduit, updateProduit } from "../../api/produits";
import ConfirmDialog from "../../components/produits/ConfirmDialog";
import ProduitFormDialog from "../../components/produits/ProduitFormDialog";
import ProductsSkeleton from "../../components/produits/ProductsSkeleton";
import ProduitsTable from "../../components/produits/ProduitsTable";
import { useLanguage } from "../../context/useLanguage";
import useCategories from "../../hooks/useCategories";
import useProduits from "../../hooks/useProduits";
import "./ProduitsPage.css";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? fallback;
}

function ProduitsPage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const committedSearch = searchParams.get("search") ?? "";
  const [searchState, setSearchState] = useState(() => ({
    urlValue: committedSearch,
    draft: committedSearch,
  }));
  const searchDraft = searchState.urlValue === committedSearch ? searchState.draft : committedSearch;
  const [dialog, setDialog] = useState(null);
  const [mutating, setMutating] = useState(false);

  const search = searchParams.get("search") ?? "";
  const categoryFilter = searchParams.get("categorie") ?? "";
  const lowOnly = searchParams.get("faible") === "1";
  const apiParams = useMemo(() => ({
    ...(search ? { search } : {}),
    ...(categoryFilter ? { categorie_id: categoryFilter } : {}),
    ...(lowOnly ? { stock_faible: "1" } : {}),
  }), [categoryFilter, lowOnly, search]);

  const produits = useProduits(apiParams);
  const categories = useCategories();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      const normalized = searchDraft.trim();
      if (normalized) next.set("search", normalized);
      else next.delete("search");
      if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchDraft, searchParams, setSearchParams]);

  const updateQuery = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  async function saveProduct(payload) {
    setMutating(true);
    try {
      if (dialog.product) await updateProduit(dialog.product.id, payload);
      else await createProduit(payload);
      toast.success(t(dialog.product ? "products.toast.updated" : "products.toast.created"));
      setDialog(null);
      await produits.reload();
    } finally {
      setMutating(false);
    }
  }

  async function removeProduct() {
    if (!dialog?.product) return;
    setMutating(true);
    try {
      await deleteProduit(dialog.product.id);
      toast.success(t("products.toast.deleted"));
      setDialog(null);
      await produits.reload();
    } finally {
      setMutating(false);
    }
  }

  const openNewProduct = () => {
    if (categories.data.length === 0) {
      navigate("/app/categories");
      return;
    }
    setDialog({ type: "form", product: null });
  };

  const requestError = produits.error || categories.error;
  const retry = async () => {
    await Promise.all([produits.reload(), categories.reload()]);
  };

  return (
    <div className="products-page">
      <Toaster position="top-right" toastOptions={{ duration: 2800 }} />
      <header className="products-page-header">
        <div>
          <h1>{t("products.title")}</h1>
          <p>{t("products.description")}</p>
        </div>
        <div className="products-header-actions">
          <button className="product-button product-button-primary" type="button" onClick={openNewProduct}>
            <Plus size={17} aria-hidden="true" />{t("products.actions.newProduct")}
          </button>
        </div>
      </header>

      <section className="products-filters" aria-label={t("products.filters.label")}>
        <label className="products-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">{t("products.filters.search")}</span>
          <input
            type="search"
            value={searchDraft}
            placeholder={t("products.filters.searchPlaceholder")}
            onChange={(event) => setSearchState({
              urlValue: committedSearch,
              draft: event.target.value,
            })}
          />
        </label>
        <label className="products-filter-select">
          <span>{t("products.filters.category")}</span>
          <select
            value={categoryFilter}
            onChange={(event) => updateQuery("categorie", event.target.value)}
            disabled={categories.loading || Boolean(categories.error)}
          >
            <option value="">{t("products.filters.allCategories")}</option>
            {categories.data.map((category) => (
              <option value={category.id} key={category.id}>{category.nom}</option>
            ))}
          </select>
        </label>
        <label className="products-low-filter">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(event) => updateQuery("faible", event.target.checked ? "1" : "")}
          />
          <span>{t("products.filters.lowStockOnly")}</span>
        </label>
      </section>

      <section className="products-data-panel" aria-live="polite">
        {requestError ? (
          <div className="products-state">
            <CircleAlert className="products-state-error" size={26} aria-hidden="true" />
            <h2>{t("products.states.loadErrorTitle")}</h2>
            <p>{getErrorMessage(requestError, t("products.states.loadError"))}</p>
            <button className="product-button product-button-primary" type="button" onClick={retry}>
              {t("products.actions.retry")}
            </button>
          </div>
        ) : produits.loading || categories.loading ? (
          <ProductsSkeleton />
        ) : produits.data.length === 0 ? (
          <div className="products-state">
            <h2>{t("products.states.emptyTitle")}</h2>
            <p>{categories.data.length === 0 ? t("products.states.noCategories") : t("products.states.empty")}</p>
            <button
              className="product-button product-button-primary"
              type="button"
              onClick={categories.data.length === 0 ? () => navigate("/app/categories") : openNewProduct}
            >
              {categories.data.length === 0
                ? t("products.actions.goCategories")
                : t("products.actions.createFirst")}
            </button>
          </div>
        ) : (
          <ProduitsTable
            produits={produits.data}
            language={language}
            onEdit={(product) => setDialog({ type: "form", product })}
            onDelete={(product) => setDialog({ type: "confirm", product })}
          />
        )}
      </section>

      {dialog?.type === "form" && (
        <ProduitFormDialog
          produit={dialog.product}
          categories={categories.data}
          busy={mutating}
          onClose={() => setDialog(null)}
          onSave={saveProduct}
          onCategorySaved={categories.reload}
        />
      )}
      {dialog?.type === "confirm" && (
        <ConfirmDialog
          title={t("products.confirmDelete.title")}
          message={t("products.confirmDelete.message", { name: dialog.product.nom })}
          confirmLabel={t("products.actions.delete")}
          busy={mutating}
          onClose={() => setDialog(null)}
          onConfirm={removeProduct}
        />
      )}
    </div>
  );
}

export default ProduitsPage;
