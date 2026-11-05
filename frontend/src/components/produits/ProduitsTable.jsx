import { Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useLanguage } from "../../context/useLanguage";
import { formatCurrency } from "../../lib/format";
import DataTable from "../ui/DataTable";
import StockBadge from "./StockBadge";

function ProductActions({ product, onEdit, onDelete, t }) {
  return (
    <div className="product-row-actions">
      <button
        className="product-icon-action"
        type="button"
        aria-label={t("products.actions.editNamed", { name: product.nom })}
        onClick={(event) => {
          event.stopPropagation();
          onEdit(product);
        }}
      >
        <Pencil size={16} aria-hidden="true" />
      </button>
      <button
        className="product-icon-action product-icon-danger"
        type="button"
        aria-label={t("products.actions.deleteNamed", { name: product.nom })}
        onClick={(event) => {
          event.stopPropagation();
          onDelete(product);
        }}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

function ProduitsTable({ produits, language, onEdit, onDelete, loading = false }) {
  const { t } = useLanguage();
  const columns = useMemo(() => [
    {
      id: "nom",
      accessorFn: (product) => product.nom,
      header: t("products.fields.name"),
      cell: ({ row }) => <span className="product-table-name">{row.original.nom}</span>,
      sortFn: (left, right, id) => String(left.getValue(id) ?? "").localeCompare(
        String(right.getValue(id) ?? ""),
        language,
        { sensitivity: "base" },
      ),
    },
    {
      id: "reference",
      accessorFn: (product) => product.reference ?? "",
      header: t("products.fields.reference"),
      cell: ({ row }) => row.original.reference || "—",
      meta: { truncate: true },
      sortFn: (left, right, id) => String(left.getValue(id) ?? "").localeCompare(
        String(right.getValue(id) ?? ""),
        language,
        { sensitivity: "base" },
      ),
    },
    {
      id: "categorie",
      accessorFn: (product) => product.categorie?.nom ?? "",
      header: t("products.fields.category"),
      cell: ({ row }) => row.original.categorie?.nom ?? t("products.categoryMissing"),
      meta: { truncate: true },
    },
    {
      id: "prix",
      accessorFn: (product) => Number(product.prix),
      header: t("products.fields.price"),
      cell: ({ row }) => formatCurrency(Number(row.original.prix), language),
      meta: { numeric: true },
    },
    {
      id: "quantite_stock",
      accessorFn: (product) => Number(product.quantite_stock),
      header: t("products.fields.stock"),
      cell: ({ row }) => <span className="product-table-quantity">{row.original.quantite_stock}</span>,
      meta: { numeric: true },
    },
    {
      id: "statut",
      accessorFn: (product) => Number(product.quantite_stock),
      header: t("products.fields.status"),
      cell: ({ row }) => <StockBadge produit={row.original} showLevel={false} />,
    },
    {
      id: "actions",
      accessorFn: () => "",
      header: t("products.fields.actions"),
      enableSorting: false,
      cell: ({ row }) => (
        <ProductActions product={row.original} onEdit={onEdit} onDelete={onDelete} t={t} />
      ),
      meta: { actions: true },
    },
  ], [language, onDelete, onEdit, t]);

  function renderCard(product) {
    return (
      <>
        <div className="ui-data-table-card-heading">
          <strong className="ui-data-table-card-title" title={product.nom}>{product.nom}</strong>
          <span className="ui-data-table-card-status"><StockBadge produit={product} showLevel={false} /></span>
        </div>
        <dl className="ui-data-table-card-fields">
          <div><dt>{t("products.fields.reference")}</dt><dd title={product.reference}>{product.reference || "—"}</dd></div>
          <div><dt>{t("products.fields.category")}</dt><dd title={product.categorie?.nom}>{product.categorie?.nom ?? t("products.categoryMissing")}</dd></div>
          <div><dt>{t("products.fields.price")}</dt><dd>{formatCurrency(Number(product.prix), language)}</dd></div>
          <div><dt>{t("products.fields.stock")}</dt><dd>{product.quantite_stock}</dd></div>
        </dl>
        <div className="ui-data-table-card-actions">
          <ProductActions product={product} onEdit={onEdit} onDelete={onDelete} t={t} />
        </div>
      </>
    );
  }

  return (
    <DataTable
      data={produits}
      columns={columns}
      pageSize={10}
      initialSorting={[{ id: "nom", desc: false }]}
      renderCard={renderCard}
      loading={loading}
    />
  );
}

export default ProduitsTable;
