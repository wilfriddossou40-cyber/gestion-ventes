import { ArrowDownRight, ArrowUpRight, Boxes, CircleAlert } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";
import { formatCurrency, formatDate } from "../../lib/format";

function AppPreview() {
  const { language, t } = useLanguage();
  const exampleDate = new Date(2026, 8, 24);

  return (
    <div className="preview-wrap" role="region" aria-label={t("preview.accessibleLabel")}>
      <div className="preview-card">
        <div className="preview-topbar">
          <div className="preview-brand">
            <span className="preview-brand-icon"><Boxes size={16} aria-hidden="true" /></span>
            <span>{t("brand.name")}</span>
          </div>
          <span className="demo-badge">{t("preview.demo")}</span>
        </div>
        <div className="preview-heading">
          <div>
            <p className="preview-kicker">{t("preview.dashboard")}</p>
            <h2>{t("preview.overview")}</h2>
          </div>
          <span className="preview-date">{formatDate(exampleDate, language)}</span>
        </div>

        <div className="preview-metrics">
          <article className="metric-card">
            <span>{t("preview.products")}</span>
            <strong>24</strong>
            <small><Boxes size={13} aria-hidden="true" />{t("preview.demoValue")}</small>
          </article>
          <article className="metric-card metric-sales">
            <span>{t("preview.todaySales")}</span>
            <strong>{formatCurrency(87500, language)}</strong>
            <small><ArrowUpRight size={13} aria-hidden="true" />{t("preview.demoValue")}</small>
          </article>
        </div>

        <div className="preview-stock">
          <div className="stock-heading">
            <div>
              <p className="preview-kicker">{t("preview.stockStatus")}</p>
              <strong>{t("preview.stockTitle")}</strong>
            </div>
            <span className="stock-alert"><CircleAlert size={14} aria-hidden="true" />{t("preview.lowStock")}</span>
          </div>
          <div className="stock-row">
            <div className="stock-item"><span className="product-dot product-dot-terracotta" />{t("preview.productOne")}</div>
            <span className="stock-quantity">3 {t("preview.units")}</span>
          </div>
          <div className="stock-bar" role="img" aria-label={t("preview.stockLevel")}>
            <span />
          </div>
          <div className="stock-scale">
            <span>{t("preview.lowThreshold")}</span><span>{t("preview.demoInventory")}</span>
          </div>
        </div>

        <div className="preview-activity">
          <div className="activity-title">
            <span>{t("preview.lastMovement")}</span>
            <span className="activity-kind"><ArrowDownRight size={14} aria-hidden="true" />{t("preview.sale")}</span>
          </div>
          <div className="activity-line">
            <span className="activity-dot" aria-hidden="true" />
            <span>{t("preview.movementDescription")}</span>
            <strong>{formatCurrency(12500, language)}</strong>
          </div>
        </div>
      </div>
      <p className="preview-caption">{t("preview.caption")}</p>
    </div>
  );
}

export default AppPreview;
