import { Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useLanguage } from "../../context/useLanguage";
import Avatar from "../ui/Avatar";
import DataTable from "../ui/DataTable";

function ClientActions({ client, onEdit, onDelete, t }) {
  return (
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
  );
}

function ClientsTable({ clients, language, onEdit, onDelete, loading = false }) {
  const { t } = useLanguage();
  const columns = useMemo(() => [
    {
      id: "nom",
      accessorFn: (client) => client.nom ?? "",
      header: t("clients.fields.name"),
      cell: ({ row }) => (
        <span className="client-table-identity">
          <Avatar name={row.original.nom} />
          <span>
            <strong className="product-table-name">{row.original.nom}</strong>
            {row.original.email && <small>{row.original.email}</small>}
          </span>
        </span>
      ),
      sortFn: (left, right, id) => String(left.getValue(id) ?? "").localeCompare(
        String(right.getValue(id) ?? ""),
        language,
        { sensitivity: "base" },
      ),
    },
    {
      id: "telephone",
      accessorFn: (client) => client.telephone ?? "",
      header: t("clients.fields.phone"),
      cell: ({ row }) => row.original.telephone
        ? <a className="client-contact-link" href={`tel:${row.original.telephone}`}>{row.original.telephone}</a>
        : <span className="client-empty-value">—</span>,
    },
    {
      id: "email",
      accessorFn: (client) => client.email ?? "",
      header: t("clients.fields.email"),
      cell: ({ row }) => row.original.email
        ? <a className="client-contact-link" href={`mailto:${row.original.email}`}>{row.original.email}</a>
        : <span className="client-empty-value">—</span>,
      meta: { truncate: true },
    },
    {
      id: "adresse",
      accessorFn: (client) => client.adresse ?? "",
      header: t("clients.fields.address"),
      cell: ({ row }) => row.original.adresse || <span className="client-empty-value">—</span>,
      meta: { truncate: true },
    },
    {
      id: "actions",
      accessorFn: () => "",
      header: t("clients.fields.actions"),
      enableSorting: false,
      cell: ({ row }) => (
        <ClientActions client={row.original} onEdit={onEdit} onDelete={onDelete} t={t} />
      ),
      meta: { actions: true },
    },
  ], [language, onDelete, onEdit, t]);

  function renderCard(client) {
    return (
      <>
        <div className="ui-data-table-card-heading">
          <span className="client-card-identity">
            <Avatar name={client.nom} />
            <strong className="ui-data-table-card-title" title={client.nom}>{client.nom}</strong>
          </span>
        </div>
        <dl className="ui-data-table-card-fields">
          <div>
            <dt>{t("clients.fields.phone")}</dt>
            <dd>{client.telephone
              ? <a className="client-contact-link" href={`tel:${client.telephone}`}>{client.telephone}</a>
              : <span className="client-empty-value">—</span>}</dd>
          </div>
          <div>
            <dt>{t("clients.fields.email")}</dt>
            <dd title={client.email}>{client.email
              ? <a className="client-contact-link" href={`mailto:${client.email}`}>{client.email}</a>
              : <span className="client-empty-value">—</span>}</dd>
          </div>
          <div>
            <dt>{t("clients.fields.address")}</dt>
            <dd title={client.adresse}>{client.adresse || <span className="client-empty-value">—</span>}</dd>
          </div>
        </dl>
        <div className="ui-data-table-card-actions">
          <button
            className="product-button product-button-secondary"
            type="button"
            aria-label={t("clients.actions.editNamed", { name: client.nom })}
            onClick={() => onEdit(client)}
          >
            <Pencil size={16} aria-hidden="true" />{t("clients.actions.edit")}
          </button>
          <button
            className="product-button product-button-danger"
            type="button"
            aria-label={t("clients.actions.deleteNamed", { name: client.nom })}
            onClick={() => onDelete(client)}
          >
            <Trash2 size={16} aria-hidden="true" />{t("clients.actions.delete")}
          </button>
        </div>
      </>
    );
  }

  return (
    <DataTable
      data={clients}
      columns={columns}
      pageSize={10}
      initialSorting={[{ id: "nom", desc: false }]}
      renderCard={renderCard}
      loading={loading}
    />
  );
}

export default ClientsTable;
