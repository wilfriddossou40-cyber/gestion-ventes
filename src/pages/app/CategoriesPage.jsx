import { useMemo, useState } from "react";
import { CircleAlert, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { deleteCategorie } from "../../api/categories";
import CategoryFormDialog from "../../components/categories/CategoryFormDialog";
import ConfirmDialog from "../../components/produits/ConfirmDialog";
import ProductsSkeleton from "../../components/produits/ProductsSkeleton";
import { useLanguage } from "../../context/useLanguage";
import useCategories from "../../hooks/useCategories";
import useProduits from "../../hooks/useProduits";
import "./CategoriesPage.css";

function CategoriesPage() {
  const { t } = useLanguage();
  const categories = useCategories();
  const produits = useProduits({});
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const productCounts = useMemo(() => {
    return produits.data.reduce((counts, product) => {
      const categoryId = String(product.categorie_id);
      counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
      return counts;
    }, new Map());
  }, [produits.data]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return categories.data;
    return categories.data.filter((category) =>
      `${category.nom} ${category.description ?? ""}`.toLocaleLowerCase().includes(query),
    );
  }, [categories.data, search]);

  async function reload() {
    await Promise.all([categories.reload(), produits.reload()]);
  }

  async function saveCategory() {
    await categories.reload();
  }

  async function removeCategory() {
    setDeleting(true);
    try {
      await deleteCategorie(dialog.category.id);
      toast.success(t("categories.toast.deleted"));
      setDialog(null);
      await categories.reload();
    } finally {
      setDeleting(false);
    }
  }

  const requestError = categories.error || produits.error;

  return (
    <div className="categories-page">
      <Toaster position="top-right" toastOptions={{ duration: 2800 }} />
      <header className="categories-page-header">
        <div>
          <h1>{t("categories.title")}</h1>
          <p>{t("categories.description")}</p>
        </div>
        <button
          className="product-button product-button-primary"
          type="button"
          onClick={() => setDialog({ type: "form", category: null })}
        >
          <Plus size={17} aria-hidden="true" />{t("categories.actions.new")}
        </button>
      </header>

      <section className="categories-toolbar" aria-label={t("categories.search.label")}>
        <label className="categories-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">{t("categories.search.label")}</span>
          <input
            type="search"
            value={search}
            placeholder={t("categories.search.placeholder")}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </section>

      <section className="categories-data-panel" aria-live="polite">
        {requestError ? (
          <div className="products-state categories-state">
            <CircleAlert className="products-state-error" size={26} aria-hidden="true" />
            <h2>{t("categories.states.loadErrorTitle")}</h2>
            <p>{requestError.response?.data?.message ?? t("categories.states.loadError")}</p>
            <button className="product-button product-button-primary" type="button" onClick={reload}>
              {t("products.actions.retry")}
            </button>
          </div>
        ) : categories.loading || produits.loading ? (
          <ProductsSkeleton />
        ) : categories.data.length === 0 ? (
          <div className="products-state categories-state">
            <h2>{t("categories.states.emptyTitle")}</h2>
            <p>{t("categories.states.empty")}</p>
            <button
              className="product-button product-button-primary"
              type="button"
              onClick={() => setDialog({ type: "form", category: null })}
            >
              <Plus size={17} aria-hidden="true" />{t("categories.actions.first")}
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="products-state categories-state">
            <h2>{t("categories.states.noResultsTitle")}</h2>
            <p>{t("categories.states.noResults")}</p>
          </div>
        ) : (
          <>
            <div className="categories-table-wrap">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>{t("categories.fields.name")}</th>
                    <th>{t("categories.fields.description")}</th>
                    <th>{t("categories.fields.productCount")}</th>
                    <th>{t("categories.fields.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => {
                    const count = productCounts.get(String(category.id)) ?? 0;
                    return (
                      <tr key={category.id}>
                        <td className="category-table-name">{category.nom}</td>
                        <td className="category-table-description">
                          {category.description || t("categories.noDescription")}
                        </td>
                        <td className="category-product-count">
                          {t(count === 1 ? "categories.productCountOne" : "categories.productCountMany", { count })}
                        </td>
                        <td>
                          <CategoryActions
                            category={category}
                            count={count}
                            t={t}
                            onEdit={() => setDialog({ type: "form", category })}
                            onDelete={() => setDialog({ type: "confirm", category })}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="categories-mobile-list">
              {filteredCategories.map((category) => {
                const count = productCounts.get(String(category.id)) ?? 0;
                return (
                  <article className="category-card" key={category.id}>
                    <div className="category-card-heading">
                      <div>
                        <h2>{category.nom}</h2>
                        <p className="category-card-description">
                          {category.description || t("categories.noDescription")}
                        </p>
                      </div>
                      <span className="category-card-count">
                        {t(count === 1 ? "categories.productCountOne" : "categories.productCountMany", { count })}
                      </span>
                    </div>
                    <div className="category-card-actions">
                      <CategoryActions
                        category={category}
                        count={count}
                        t={t}
                        onEdit={() => setDialog({ type: "form", category })}
                        onDelete={() => setDialog({ type: "confirm", category })}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {dialog?.type === "form" && (
        <CategoryFormDialog
          category={dialog.category}
          onClose={() => setDialog(null)}
          onSaved={saveCategory}
          notify={toast.success}
        />
      )}
      {dialog?.type === "confirm" && (
        <ConfirmDialog
          title={t("categories.confirmDelete.title")}
          message={t("categories.confirmDelete.message", { name: dialog.category.nom })}
          confirmLabel={t("categories.actions.delete")}
          cancelLabel={t("products.actions.cancel")}
          deletingLabel={t("categories.actions.deleting")}
          errorFallbackKey="categories.errors.delete"
          busy={deleting}
          onClose={() => setDialog(null)}
          onConfirm={removeCategory}
        />
      )}
    </div>
  );
}

function CategoryActions({ category, count, t, onEdit, onDelete }) {
  return (
    <>
      <Link className="category-product-link" to={`/app/produits?categorie=${category.id}`}>
        {t("categories.actions.viewProducts")}
      </Link>
      <button
        className="product-icon-action"
        type="button"
        aria-label={t("categories.actions.editNamed", { name: category.nom })}
        onClick={onEdit}
      >
        <Pencil size={15} aria-hidden="true" />
      </button>
      {count > 0 ? (
        <span className="category-delete-disabled">
          <strong>{t("categories.actions.deleteDisabled")}</strong>
          {t(count === 1 ? "categories.actions.hasProductsOne" : "categories.actions.hasProductsMany", { count })}
        </span>
      ) : (
        <button
          className="product-icon-action product-icon-danger"
          type="button"
          aria-label={t("categories.actions.deleteNamed", { name: category.nom })}
          onClick={onDelete}
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      )}
    </>
  );
}

export default CategoriesPage;
