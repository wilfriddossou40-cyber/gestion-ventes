import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "../../context/useLanguage";
import { formatCurrency } from "../../lib/format";
import ProduitCard from "./ProduitCard";
import StockBadge from "./StockBadge";

const pageSize = 10;

function ProduitsTable({ produits, language, onEdit, onDelete }) {
  const { t } = useLanguage();
  const [sorting, setSorting] = useState({ column: "nom", direction: "asc" });
  const [pageIndex, setPageIndex] = useState(0);

  const columns = useMemo(() => [
    { id: "nom", label: t("products.fields.name"), value: (product) => product.nom },
    { id: "reference", label: t("products.fields.reference"), value: (product) => product.reference },
    { id: "categorie", label: t("products.fields.category"), value: (product) => product.categorie?.nom ?? "" },
    { id: "prix", label: t("products.fields.price"), value: (product) => Number(product.prix) },
    { id: "quantite_stock", label: t("products.fields.stock"), value: (product) => Number(product.quantite_stock) },
    { id: "statut", label: t("products.fields.status"), value: (product) => Number(product.quantite_stock) },
    { id: "actions", label: t("products.fields.actions"), sortable: false },
  ], [t]);

  const sortedProducts = useMemo(() => {
    const column = columns.find((item) => item.id === sorting.column);
    if (!column?.value) return produits;

    return [...produits].sort((a, b) => {
      const left = column.value(a);
      const right = column.value(b);
      const comparison = typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right), language, { sensitivity: "base" });
      return sorting.direction === "asc" ? comparison : -comparison;
    });
  }, [columns, language, produits, sorting]);

  const pageCount = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const activePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageProducts = sortedProducts.slice(activePageIndex * pageSize, (activePageIndex + 1) * pageSize);

  function sortBy(column) {
    setSorting((current) => ({
      column,
      direction: current.column === column && current.direction === "asc" ? "desc" : "asc",
    }));
    setPageIndex(0);
  }

  const cells = (product) => ({
    nom: <span className="product-table-name">{product.nom}</span>,
    reference: product.reference,
    categorie: product.categorie?.nom ?? t("products.categoryMissing"),
    prix: formatCurrency(Number(product.prix), language),
    quantite_stock: <span className="product-table-quantity">{product.quantite_stock}</span>,
    statut: <StockBadge produit={product} showLevel={false} />,
    actions: (
      <div className="product-row-actions">
        <button
          className="product-icon-action"
          type="button"
          aria-label={t("products.actions.editNamed", { name: product.nom })}
          onClick={() => onEdit(product)}
        >
          <Pencil size={16} aria-hidden="true" />
        </button>
        <button
          className="product-icon-action product-icon-danger"
          type="button"
          aria-label={t("products.actions.deleteNamed", { name: product.nom })}
          onClick={() => onDelete(product)}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    ),
  });

  return (
    <>
      <div className="products-table-wrap">
        <table className="products-table">
          <thead>
            <tr>
              {columns.map((column) => {
                const sorted = sorting.column === column.id;
                return (
                  <th key={column.id} scope="col">
                    {column.sortable === false ? column.label : (
                      <button
                        className="product-sort-button"
                        type="button"
                        onClick={() => sortBy(column.id)}
                        aria-label={t("products.sortBy", { field: column.label })}
                        aria-sort={sorted ? (sorting.direction === "asc" ? "ascending" : "descending") : "none"}
                      >
                        {column.label}
                        {sorted
                          ? sorting.direction === "asc"
                            ? <ChevronUp size={14} aria-hidden="true" />
                            : <ChevronDown size={14} aria-hidden="true" />
                          : <ChevronsUpDown size={14} aria-hidden="true" />}
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageProducts.map((product) => {
              const productCells = cells(product);
              return (
                <tr key={product.id}>
                  {columns.map((column) => <td key={column.id}>{productCells[column.id]}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="products-mobile-list">
        {pageProducts.map((product) => (
          <ProduitCard
            key={product.id}
            produit={product}
            language={language}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      <div className="products-pagination">
        <span>
          {t("products.pagination", {
            current: String(activePageIndex + 1),
            total: String(pageCount),
          })}
        </span>
        <div>
          <button
            className="product-icon-action"
            type="button"
            aria-label={t("products.previousPage")}
            disabled={activePageIndex === 0}
            onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            className="product-icon-action"
            type="button"
            aria-label={t("products.nextPage")}
            disabled={activePageIndex >= pageCount - 1}
            onClick={() => setPageIndex((current) => Math.min(pageCount - 1, current + 1))}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}

export default ProduitsTable;
