import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useLanguage } from "../../context/useLanguage";
import ClientCard from "./ClientCard";

const pageSize = 10;

function ClientsTable({ clients, language, onEdit, onDelete }) {
  const { t } = useLanguage();
  const [sorting, setSorting] = useState({ column: "nom", direction: "asc" });
  const [pageIndex, setPageIndex] = useState(0);

  const columns = useMemo(() => [
    { id: "nom", label: t("clients.fields.name"), value: (client) => client.nom ?? "" },
    { id: "telephone", label: t("clients.fields.phone"), value: (client) => client.telephone ?? "" },
    { id: "email", label: t("clients.fields.email"), value: (client) => client.email ?? "" },
    { id: "adresse", label: t("clients.fields.address"), value: (client) => client.adresse ?? "" },
    { id: "actions", label: t("clients.fields.actions"), sortable: false },
  ], [t]);

  const sortedClients = useMemo(() => {
    const column = columns.find((item) => item.id === sorting.column);
    if (!column?.value) return clients;

    return [...clients].sort((a, b) => {
      const comparison = String(column.value(a)).localeCompare(
        String(column.value(b)),
        language,
        { sensitivity: "base" },
      );
      return sorting.direction === "asc" ? comparison : -comparison;
    });
  }, [clients, columns, language, sorting]);

  const pageCount = Math.max(1, Math.ceil(sortedClients.length / pageSize));
  const activePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageClients = sortedClients.slice(activePageIndex * pageSize, (activePageIndex + 1) * pageSize);

  function sortBy(column) {
    setSorting((current) => ({
      column,
      direction: current.column === column && current.direction === "asc" ? "desc" : "asc",
    }));
    setPageIndex(0);
  }

  const displayValue = (value) => value || <span className="client-empty-value">—</span>;
  const cells = (client) => ({
    nom: <span className="product-table-name">{client.nom}</span>,
    telephone: client.telephone
      ? <a className="client-contact-link" href={`tel:${client.telephone}`}>{client.telephone}</a>
      : displayValue(client.telephone),
    email: client.email
      ? <a className="client-contact-link" href={`mailto:${client.email}`}>{client.email}</a>
      : displayValue(client.email),
    adresse: displayValue(client.adresse),
    actions: (
      <div className="product-row-actions">
        <button
          className="product-icon-action"
          type="button"
          aria-label={t("clients.actions.editNamed", { name: client.nom })}
          onClick={() => onEdit(client)}
        >
          <Pencil size={16} aria-hidden="true" />
        </button>
        <button
          className="product-icon-action product-icon-danger"
          type="button"
          aria-label={t("clients.actions.deleteNamed", { name: client.nom })}
          onClick={() => onDelete(client)}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    ),
  });

  return (
    <>
      <div className="products-table-wrap">
        <table className="products-table clients-table">
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
                        aria-label={t("clients.sortBy", { field: column.label })}
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
            {pageClients.map((client) => {
              const clientCells = cells(client);
              return (
                <tr key={client.id}>
                  {columns.map((column) => <td key={column.id}>{clientCells[column.id]}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="products-mobile-list clients-mobile-list">
        {pageClients.map((client) => (
          <ClientCard key={client.id} client={client} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      <div className="products-pagination">
        <span>
          {t("clients.pagination", {
            current: String(activePageIndex + 1),
            total: String(pageCount),
          })}
        </span>
        <div>
          <button
            className="product-icon-action"
            type="button"
            aria-label={t("clients.previousPage")}
            disabled={activePageIndex === 0}
            onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            className="product-icon-action"
            type="button"
            aria-label={t("clients.nextPage")}
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

export default ClientsTable;
