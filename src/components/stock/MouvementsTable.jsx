import { ArrowDownToLine, ArrowUpFromLine, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "../../context/useLanguage";
import { formatDateTime } from "../../lib/format";

const pageSize = 15;

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

function MouvementsTable({ movements, language }) {
  const { t } = useLanguage();
  const [pageIndex, setPageIndex] = useState(0);
  const sortedMovements = useMemo(() => [...movements].sort((a, b) => (
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime() || Number(b.id) - Number(a.id)
  )), [movements]);
  const pageCount = Math.max(1, Math.ceil(sortedMovements.length / pageSize));
  const activePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageMovements = sortedMovements.slice(activePageIndex * pageSize, (activePageIndex + 1) * pageSize);

  function signedQuantity(movement) {
    const sign = movement.type === "entree" ? "+" : "−";
    return `${sign}${movement.quantite}`;
  }

  return (
    <>
      <div className="products-table-wrap stock-movements-table-wrap">
        <table className="products-table stock-movements-table">
          <thead>
            <tr>
              <th scope="col">{t("stock.journal.fields.date")}</th>
              <th scope="col">{t("stock.journal.fields.product")}</th>
              <th scope="col">{t("stock.journal.fields.type")}</th>
              <th scope="col">{t("stock.journal.fields.quantity")}</th>
              <th scope="col">{t("stock.journal.fields.reason")}</th>
            </tr>
          </thead>
          <tbody>
            {pageMovements.map((movement) => (
              <tr key={movement.id}>
                <td>{formatDateTime(movement.created_at, language)}</td>
                <td>{movement.produit?.nom ?? "—"}</td>
                <td><MovementType type={movement.type} /></td>
                <td className={`stock-movement-quantity ${movement.type === "entree" ? "is-entry" : "is-exit"}`}>
                  {signedQuantity(movement)}
                </td>
                <td>{movement.motif || <span className="stock-muted-dash">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="stock-movements-mobile">
        {pageMovements.map((movement) => (
          <article className="stock-movement-card" key={movement.id}>
            <div className="stock-movement-card-top">
              <strong>{movement.produit?.nom ?? "—"}</strong>
              <MovementType type={movement.type} />
            </div>
            <div className="stock-movement-card-meta">
              <time dateTime={movement.created_at}>{formatDateTime(movement.created_at, language)}</time>
              <strong className={`stock-movement-quantity ${movement.type === "entree" ? "is-entry" : "is-exit"}`}>
                {signedQuantity(movement)}
              </strong>
            </div>
            <p>{movement.motif || <span className="stock-muted-dash">—</span>}</p>
          </article>
        ))}
      </div>
      <div className="products-pagination">
        <span>{t("stock.journal.pagination", {
          current: String(activePageIndex + 1),
          total: String(pageCount),
        })}</span>
        <div>
          <button
            className="product-icon-action"
            type="button"
            aria-label={t("stock.journal.previousPage")}
            disabled={activePageIndex === 0}
            onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            className="product-icon-action"
            type="button"
            aria-label={t("stock.journal.nextPage")}
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

export default MouvementsTable;
