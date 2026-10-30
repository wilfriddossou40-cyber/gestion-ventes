import { Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";
import { formatCurrency } from "../../lib/format";
import StockBadge from "./StockBadge";

function ProduitCard({ produit, language, onEdit, onDelete }) {
  const { t } = useLanguage();

  return (
    <article className="product-card">
      <div className="product-card-heading">
        <div className="product-card-name">
          <h2>{produit.nom}</h2>
          <span>{produit.reference}</span>
        </div>
        <strong className="product-card-price">
          {formatCurrency(Number(produit.prix), language)}
        </strong>
      </div>
      <dl className="product-card-details">
        <div>
          <dt>{t("products.fields.category")}</dt>
          <dd>{produit.categorie?.nom ?? t("products.categoryMissing")}</dd>
        </div>
        <div>
          <dt>{t("products.fields.stock")}</dt>
          <dd>{produit.quantite_stock}</dd>
        </div>
      </dl>
      <StockBadge produit={produit} />
      <div className="product-card-actions">
        <button className="product-button product-button-secondary" type="button" onClick={() => onEdit(produit)}>
          <Pencil size={16} aria-hidden="true" />{t("products.actions.edit")}
        </button>
        <button className="product-button product-button-danger" type="button" onClick={() => onDelete(produit)}>
          <Trash2 size={16} aria-hidden="true" />{t("products.actions.delete")}
        </button>
      </div>
    </article>
  );
}

export default ProduitCard;
