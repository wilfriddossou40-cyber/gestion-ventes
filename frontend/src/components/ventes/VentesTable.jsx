import { useMemo } from "react";
import { useLanguage } from "../../context/useLanguage";
import { formatCurrency, formatDateOnly } from "../../lib/format";
import DataTable from "../ui/DataTable";

function VentesTable({ ventes, language, onSelect, loading = false }) {
  const { t } = useLanguage();
  const columns = useMemo(() => [
    {
      id: "id",
      accessorFn: (sale) => Number(sale.id),
      header: t("sales.history.fields.number"),
      cell: ({ row }) => t("sales.history.number", { id: row.original.id }),
    },
    {
      id: "date_vente",
      accessorFn: (sale) => String(sale.date_vente ?? "").slice(0, 10),
      header: t("sales.history.fields.date"),
      cell: ({ row }) => formatDateOnly(row.original.date_vente, language),
      sortFn: (left, right, id) => (
        String(left.getValue(id)).localeCompare(String(right.getValue(id)))
        || Number(left.original.id) - Number(right.original.id)
      ),
    },
    {
      id: "client",
      accessorFn: (sale) => sale.client?.nom ?? "",
      header: t("sales.history.fields.client"),
      cell: ({ row }) => row.original.client?.nom ?? "—",
      meta: { truncate: true },
    },
    {
      id: "details_count",
      accessorFn: (sale) => Number(sale.details_count),
      header: t("sales.history.fields.items"),
      cell: ({ row }) => t("sales.history.itemCount", { count: row.original.details_count }),
      meta: { numeric: true },
    },
    {
      id: "montant_total",
      accessorFn: (sale) => Number(sale.montant_total),
      header: t("sales.history.fields.amount"),
      cell: ({ row }) => formatCurrency(Number(row.original.montant_total), language),
      meta: { numeric: true },
    },
  ], [language, t]);

  function renderCard(sale) {
    return (
      <>
        <div className="ui-data-table-card-heading">
          <strong className="ui-data-table-card-title">
            {t("sales.history.number", { id: sale.id })}
          </strong>
          <strong className="ui-data-table-card-status sales-history-amount">
            {formatCurrency(Number(sale.montant_total), language)}
          </strong>
        </div>
        <dl className="ui-data-table-card-fields">
          <div><dt>{t("sales.history.fields.date")}</dt><dd>{formatDateOnly(sale.date_vente, language)}</dd></div>
          <div><dt>{t("sales.history.fields.client")}</dt><dd title={sale.client?.nom}>{sale.client?.nom ?? "—"}</dd></div>
          <div><dt>{t("sales.history.fields.items")}</dt><dd>{t("sales.history.itemCount", { count: sale.details_count })}</dd></div>
        </dl>
      </>
    );
  }

  return (
    <DataTable
      data={ventes}
      columns={columns}
      pageSize={10}
      initialSorting={[{ id: "date_vente", desc: true }]}
      renderCard={renderCard}
      onRowClick={onSelect}
      getRowLabel={(sale) => t("sales.history.openSale", { id: sale.id })}
      className="sales-history-table"
      loading={loading}
    />
  );
}

export default VentesTable;
