import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import {
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { useLanguage } from "../../context/useLanguage";
import "./DataTable.css";

const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

function DataTable({
  data,
  columns,
  pageSize = 10,
  initialSorting = [],
  renderCard,
  onRowClick,
  getRowLabel,
  className = "",
  loading = false,
  loadingRows = 5,
}) {
  const { language, t } = useLanguage();
  const [sorting, setSorting] = useState(initialSorting);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  const table = useTableInstance({
    columns,
    data,
    sorting,
    setSorting,
    pagination,
    setPagination,
  });
  const rows = table.getRowModel().rows;
  const rowCount = table.getRowCount();
  const currentPage = pagination.pageIndex;
  const firstItem = rowCount === 0 ? 0 : currentPage * pageSize + 1;
  const lastItem = Math.min((currentPage + 1) * pageSize, rowCount);
  const numberFormat = new Intl.NumberFormat(language === "en" ? "en-US" : "fr-FR");

  function handleRowKeyDown(event, row) {
    if (!onRowClick || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onRowClick(row.original);
  }

  return (
    <div className={`ui-data-table ${className}`.trim()} aria-busy={loading || undefined}>
      <div className="ui-data-table-desktop">
        <div className="ui-data-table-scroll">
          <table className="ui-data-table-table">
            <thead>
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => {
                    const column = header.column;
                    const sorted = column.getIsSorted();
                    const canSort = column.getCanSort();
                    const SortIcon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={sorted ? (sorted === "asc" ? "ascending" : "descending") : "none"}
                        className={[
                          column.columnDef.meta?.numeric ? "is-numeric" : "",
                          column.columnDef.meta?.actions ? "is-actions" : "",
                        ].filter(Boolean).join(" ")}
                      >
                        {canSort ? (
                          <button
                            className="ui-data-table-sort"
                            type="button"
                            aria-label={t("dataTable.sortBy", {
                              field: String(column.columnDef.header),
                            })}
                            onClick={column.getToggleSortingHandler()}
                          >
                            <table.FlexRender header={header} />
                            <SortIcon size={14} aria-hidden="true" />
                          </button>
                        ) : (
                          <table.FlexRender header={header} />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: loadingRows }, (_, rowIndex) => (
                  <tr className="ui-data-table-skeleton-row" key={`skeleton-${rowIndex}`} aria-hidden="true">
                    {columns.map((column) => <td key={column.id}><span /></td>)}
                  </tr>
                ))
              ) : rows.map((row) => (
                <tr
                  key={row.id}
                  className={`${onRowClick ? "is-interactive " : ""}${row.original.className ?? ""}`.trim()}
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-label={onRowClick ? getRowLabel?.(row.original) : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  onKeyDown={onRowClick ? (event) => handleRowKeyDown(event, row) : undefined}
                >
                  {row.getAllCells().map((cell) => {
                    const value = cell.getValue();
                    return (
                      <td
                        key={cell.id}
                        className={[
                          cell.column.columnDef.meta?.numeric ? "is-numeric" : "",
                          cell.column.columnDef.meta?.actions ? "is-actions" : "",
                          cell.column.columnDef.meta?.truncate ? "is-truncated" : "",
                        ].filter(Boolean).join(" ")}
                        title={typeof value === "string" ? value : undefined}
                      >
                        <table.FlexRender cell={cell} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ui-data-table-cards">
        {loading
          ? Array.from({ length: Math.min(loadingRows, pageSize) }, (_, index) => (
            <div className="ui-data-table-card-skeleton" key={`card-skeleton-${index}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          ))
          : rows.map((row) => (
            <article
              className={`ui-data-table-card${onRowClick ? " is-interactive" : ""}`}
              key={row.id}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              aria-label={onRowClick ? getRowLabel?.(row.original) : undefined}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              onKeyDown={onRowClick ? (event) => handleRowKeyDown(event, row) : undefined}
            >
              {renderCard?.(row.original, row)}
            </article>
          ))}
      </div>

      <footer className="ui-data-table-footer">
        {loading ? (
          <span className="ui-data-table-footer-skeleton ui-data-table-footer-range" aria-hidden="true" />
        ) : (
          <span className="ui-data-table-range">
            {t("dataTable.range", {
              from: numberFormat.format(firstItem),
              to: numberFormat.format(lastItem),
              total: numberFormat.format(rowCount),
            })}
          </span>
        )}
        <div className="ui-data-table-page-controls">
          {loading
            ? <span className="ui-data-table-footer-skeleton ui-data-table-footer-page" aria-hidden="true" />
            : (
              <span>
                {t("dataTable.page", {
                  current: numberFormat.format(currentPage + 1),
                  total: numberFormat.format(Math.max(table.getPageCount(), 1)),
                })}
              </span>
            )}
          <button
            type="button"
            className="product-icon-action"
            aria-label={t("dataTable.previousPage")}
            disabled={!table.getCanPreviousPage() || loading}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="product-icon-action"
            aria-label={t("dataTable.nextPage")}
            disabled={!table.getCanNextPage() || loading}
            onClick={() => table.nextPage()}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}

function useTableInstance({ columns, data, sorting, setSorting, pagination, setPagination }) {
  return useTable({
    features: dataTableFeatures,
    columns,
    data,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    autoResetPageIndex: true,
  });
}

export default DataTable;
