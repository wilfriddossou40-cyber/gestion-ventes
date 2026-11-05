import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useMemo } from "react";
import { useLanguage } from "../../context/useLanguage";
import { formatDateTime } from "../../lib/format";
import DataTable from "../ui/DataTable";

function MovementType({ type }) {
  const { t } = useLanguage();
  const isEntry = type === "entree";
  const Icon = isEntry ? ArrowDownToLine : ArrowUpFromLine;
  return (
    <span className={`stock-movement-type${isEntry ? " is-entry" : " is-exit"}`}>
      <Icon size={15} aria-hidden="true" />
      {t(isEntry ? "stock.types.entry" : "stock.types.exit")}
    </span>
  );
}

function MouvementsTable({ movements, language, loading = false }) {
  const { t } = useLanguage();
  const sortedMovements = useMemo(() => [...movements].sort((a, b) => (
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime() || Number(b.id) - Number(a.id)
  )), [movements]);
  const columns = useMemo(() => [
    {
      id: "created_at",
      accessorFn: (movement) => movement.created_at,
      header: t("stock.journal.fields.date"),
      cell: ({ row }) => formatDateTime(row.original.created_at, language),
      enableSorting: false,
    },
    {
      id: "produit",
      accessorFn: (movement) => movement.produit?.nom ?? "",
      header: t("stock.journal.fields.product"),
      cell: ({ row }) => row.original.produit?.nom ?? "—",
      enableSorting: false,
      meta: { truncate: true },
    },
    {
      id: "type",
      accessorFn: (movement) => movement.type,
      header: t("stock.journal.fields.type"),
      cell: ({ row }) => <MovementType type={row.original.type} />,
      enableSorting: false,
    },
    {
      id: "quantite",
      accessorFn: (movement) => Number(movement.quantite),
      header: t("stock.journal.fields.quantity"),
      cell: ({ row }) => {
        const sign = row.original.type === "entree" ? "+" : "−";
        const color = row.original.type === "entree" ? "is-entry" : "is-exit";
        return (
          <span className={`stock-movement-quantity ${color}`}>
            {sign}{row.original.quantite}
          </span>
        );
      },
      enableSorting: false,
      meta: { numeric: true },
    },
    {
      id: "motif",
      accessorFn: (movement) => movement.motif ?? "",
      header: t("stock.journal.fields.reason"),
      cell: ({ row }) => row.original.motif
        ? <span title={row.original.motif}>{row.original.motif}</span>
        : <span className="stock-muted-dash">—</span>,
      enableSorting: false,
      meta: { truncate: true },
    },
  ], [language, t]);

  function renderCard(movement) {
    const sign = movement.type === "entree" ? "+" : "−";
    const quantityClass = movement.type === "entree" ? "is-entry" : "is-exit";
    return (
      <>
        <div className="ui-data-table-card-heading">
          <strong className="ui-data-table-card-title" title={movement.produit?.nom}>
            {movement.produit?.nom ?? "—"}
          </strong>
          <span className="ui-data-table-card-status"><MovementType type={movement.type} /></span>
        </div>
        <dl className="ui-data-table-card-fields">
          <div>
            <dt>{t("stock.journal.fields.date")}</dt>
            <dd><time dateTime={movement.created_at}>{formatDateTime(movement.created_at, language)}</time></dd>
          </div>
          <div>
            <dt>{t("stock.journal.fields.quantity")}</dt>
            <dd className={`stock-movement-quantity ${quantityClass}`}>{sign}{movement.quantite}</dd>
          </div>
          <div>
            <dt>{t("stock.journal.fields.reason")}</dt>
            <dd title={movement.motif}>{movement.motif || <span className="stock-muted-dash">—</span>}</dd>
          </div>
        </dl>
      </>
    );
  }

  return (
    <DataTable
      data={sortedMovements}
      columns={columns}
      pageSize={15}
      renderCard={renderCard}
      className="stock-movements-table"
      loading={loading}
    />
  );
}

export default MouvementsTable;
