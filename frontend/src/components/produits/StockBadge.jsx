import { AlertTriangle, CircleCheck, CircleX } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";
import Badge from "../ui/Badge";

function StockBadge({ produit, showLevel = true }) {
  const { t } = useLanguage();
  const quantity = Number(produit.quantite_stock);
  const threshold = Number(produit.seuil_alerte);
  const status = quantity === 0 ? "out" : quantity <= threshold ? "low" : "available";
  const StatusIcon = status === "out" ? CircleX : status === "low" ? AlertTriangle : CircleCheck;
  const scale = Math.max(quantity, threshold, 1);
  const marker = Math.min((threshold / scale) * 100, 100);
  const fill = Math.min((quantity / scale) * 100, 100);

  return (
    <div className={`product-stock product-stock-${status}`}>
      <Badge className="product-stock-label" variant={status === "available" ? "success" : "alert"}>
        <StatusIcon size={15} aria-hidden="true" />
        {t(`products.status.${status}`)}
      </Badge>
      {showLevel && (
        <div className="product-stock-meter">
          <div
            className="product-stock-track"
            role="img"
            aria-label={t("products.stockMeter", {
              quantity: String(quantity),
              threshold: String(threshold),
            })}
          >
            <span className="product-stock-fill" style={{ width: `${fill}%` }} />
            <span className="product-stock-marker" style={{ left: `${marker}%` }} />
          </div>
          <span className="product-stock-threshold">
            {t("products.threshold", { quantity: String(threshold) })}
          </span>
        </div>
      )}
    </div>
  );
}

export default StockBadge;
