import { Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";

function ClientCard({ client, onEdit, onDelete }) {
  const { t } = useLanguage();

  return (
    <article className="client-card product-card">
      <div className="product-card-heading">
        <div className="product-card-name">
          <h2>{client.nom}</h2>
        </div>
      </div>
      <dl className="client-card-details product-card-details">
        <div>
          <dt>{t("clients.fields.phone")}</dt>
          <dd>
            {client.telephone
              ? <a className="client-contact-link" href={`tel:${client.telephone}`}>{client.telephone}</a>
              : <span className="client-empty-value">—</span>}
          </dd>
        </div>
        <div>
          <dt>{t("clients.fields.email")}</dt>
          <dd>
            {client.email
              ? <a className="client-contact-link" href={`mailto:${client.email}`}>{client.email}</a>
              : <span className="client-empty-value">—</span>}
          </dd>
        </div>
        <div className="client-card-address">
          <dt>{t("clients.fields.address")}</dt>
          <dd>{client.adresse || <span className="client-empty-value">—</span>}</dd>
        </div>
      </dl>
      <div className="product-card-actions">
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
    </article>
  );
}

export default ClientCard;
