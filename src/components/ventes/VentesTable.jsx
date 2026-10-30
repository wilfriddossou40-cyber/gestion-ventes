import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "../../context/useLanguage";
import { formatCurrency, formatDateOnly } from "../../lib/format";

const pageSize = 10;

function VenteCard({ vente, language, onSelect }) {
  const { t } = useLanguage();

  return (
    <button className="sale-history-card" type="button" onClick={() => onSelect(vente)}>
      <span className="sale-history-card-heading">
        <strong>{t("sales.history.number", { id: vente.id })}</strong>
        <span>{formatDateOnly(vente.date_vente, language)}</span>
      </span>
      <span className="sale-history-card-client">{vente.client?.nom ?? "—"}</span>
      <span className="sale-history-card-footer">
        <span>{t("sales.history.itemCount", { count: vente.details_count })}</span>
        <strong>{formatCurrency(Number(vente.montant_total), language)}</strong>
      </span>
    </button>
  );
}

function VentesTable({ ventes, language, onSelect }) {
  const { t } = useLanguage();
  const [sorting, setSorting] = useState({ column: "date_vente", direction: "desc" });
  const [pageIndex, setPageIndex] = useState(0);

  const columns = useMemo(() => [
    { id: "id", label: t("sales.history.fields.number"), value: (sale) => Number(sale.id) },
    { id: "date_vente", label: t("sales.history.fields.date"), value: (sale) => sale.date_vente ?? "" },
    { id: "client", label: t("sales.history.fields.client"), value: (sale) => sale.client?.nom ?? "" },
    { id: "details_count", label: t("sales.history.fields.items"), value: (sale) => Number(sale.details_count) },
    { id: "montant_total", label: t("sales.history.fields.amount"), value: (sale) => Number(sale.montant_total) },
  ], [t]);

  const sortedVentes = useMemo(() => {
    const column = columns.find((item) => item.id === sorting.column);
    if (!column) return ventes;
    return [...ventes].sort((a, b) => {
      let comparison;
      if (column.id === "date_vente") {
        comparison = String(a.date_vente).slice(0, 10).localeCompare(String(b.date_vente).slice(0, 10));
        if (comparison === 0) comparison = Number(a.id) - Number(b.id);
      } else {
        comparison = typeof column.value(a) === "number"
          ? column.value(a) - column.value(b)
          : String(column.value(a)).localeCompare(String(column.value(b)), language, { sensitivity: "base" });
      }
      return sorting.direction === "asc" ? comparison : -comparison;
    });
  }, [columns, language, sorting, ventes]);

  const pageCount = Math.max(1, Math.ceil(sortedVentes.length / pageSize));
  const activePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageVentes = sortedVentes.slice(activePageIndex * pageSize, (activePageIndex + 1) * pageSize);

  function sortBy(column) {
    setSorting((current) => ({
      column,
      direction: current.column === column && current.direction === "asc" ? "desc" : "asc",
    }));
    setPageIndex(0);
  }

  function handleRowKeyDown(event, vente) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(vente);
    }
  }

  return (
    <>
      <div className="products-table-wrap">
        <table className="products-table sales-history-table">
          <thead>
            <tr>
              {columns.map((column) => {
                const sorted = sorting.column === column.id;
                return (
                  <th key={column.id} scope="col">
                    <button
                      className="product-sort-button"
                      type="button"
                      onClick={() => sortBy(column.id)}
                      aria-label={t("sales.history.sortBy", { field: column.label })}
                      aria-sort={sorted ? (sorting.direction === "asc" ? "ascending" : "descending") : "none"}
                    >
                      {column.label}
                      {sorted
                        ? sorting.direction === "asc"
                          ? <ChevronUp size={14} aria-hidden="true" />
                          : <ChevronDown size={14} aria-hidden="true" />
                        : <ChevronsUpDown size={14} aria-hidden="true" />}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageVentes.map((vente) => (
              <tr
                key={vente.id}
                className="sales-history-row"
                tabIndex={0}
                aria-label={t("sales.history.openSale", { id: vente.id })}
                onClick={() => onSelect(vente)}
                onKeyDown={(event) => handleRowKeyDown(event, vente)}
              >
                <td>{t("sales.history.number", { id: vente.id })}</td>
                <td>{formatDateOnly(vente.date_vente, language)}</td>
                <td>{vente.client?.nom ?? "—"}</td>
                <td>{t("sales.history.itemCount", { count: vente.details_count })}</td>
                <td className="sales-history-amount">{formatCurrency(Number(vente.montant_total), language)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sales-history-mobile">
        {pageVentes.map((vente) => (
          <VenteCard key={vente.id} vente={vente} language={language} onSelect={onSelect} />
        ))}
      </div>
      <div className="products-pagination">
        <span>{t("sales.history.pagination", {
          current: String(activePageIndex + 1),
          total: String(pageCount),
        })}</span>
        <div>
          <button
            className="product-icon-action"
            type="button"
            aria-label={t("sales.history.previousPage")}
            disabled={activePageIndex === 0}
            onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            className="product-icon-action"
            type="button"
            aria-label={t("sales.history.nextPage")}
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

export default VentesTable;
