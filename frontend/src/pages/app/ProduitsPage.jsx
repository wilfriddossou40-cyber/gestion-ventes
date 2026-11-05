import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleAlert, Plus, Search } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createProduit, deleteProduit, updateProduit } from "../../api/produits";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ProduitFormDialog from "../../components/produits/ProduitFormDialog";
import ProduitsTable from "../../components/produits/ProduitsTable";
import EmptyState from "../../components/ui/EmptyState";
import ListPage from "../../components/ui/ListPage";
import { useLanguage } from "../../context/useLanguage";
import useCategories from "../../hooks/useCategories";
import useProduits from "../../hooks/useProduits";
import { normalizeApiError } from "../../lib/apiErrors";

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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2800,
          style: {
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
            color: "var(--text)",
          },
        }}
      />
      <ListPage
        title={t("products.title")}
        description={t("products.description")}
        actions={
          <button className="product-button product-button-primary" type="button" onClick={openNewProduct}>
            <Plus size={17} aria-hidden="true" />{t("products.actions.newProduct")}
          </button>
        }
        toolbar={<>
        <label className="list-page-search">
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
        <label className="list-page-filter">
          <select
            className="list-page-control"
            aria-label={t("products.filters.category")}
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
        <label className="list-page-check">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(event) => updateQuery("faible", event.target.checked ? "1" : "")}
          />
          <span>{t("products.filters.lowStockOnly")}</span>
        </label>
        </>}
      >

        {requestError ? (
          <EmptyState
            className="products-state"
            icon={CircleAlert}
            title={t("products.states.loadErrorTitle")}
            description={normalizeApiError(requestError, t).message}
            actions={<button className="product-button product-button-primary" type="button" onClick={retry}>
              {t("products.actions.retry")}
            </button>}
          />
        ) : produits.loading || categories.loading ? (
          <ProduitsTable
            produits={[]}
            language={language}
            onEdit={() => {}}
            onDelete={() => {}}
            loading
          />
        ) : produits.data.length === 0 ? (
          <EmptyState
            className="products-state"
            title={t("products.states.emptyTitle")}
            description={categories.data.length === 0 ? t("products.states.noCategories") : t("products.states.empty")}
            actions={<button
              className="product-button product-button-primary"
              type="button"
              onClick={categories.data.length === 0 ? () => navigate("/app/categories") : openNewProduct}
            >
              {categories.data.length === 0
                ? t("products.actions.goCategories")
                : t("products.actions.createFirst")}
            </button>}
          />
        ) : (
          <ProduitsTable
            produits={produits.data}
            language={language}
            onEdit={(product) => setDialog({ type: "form", product })}
            onDelete={(product) => setDialog({ type: "confirm", product })}
          />
        )}
      </ListPage>

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
