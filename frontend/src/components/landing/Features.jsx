import { BellRing, BookOpenText, Calculator, ChartNoAxesCombined, PackageCheck, PackagePlus, UsersRound } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";

const features = [
  { key: "catalog", icon: PackagePlus, className: "feature-catalog" },
  { key: "clients", icon: UsersRound, className: "feature-clients" },
  { key: "sales", icon: Calculator, className: "feature-sales" },
  { key: "stock", icon: PackageCheck, className: "feature-stock" },
  { key: "journal", icon: BookOpenText, className: "feature-journal" },
  { key: "dashboard", icon: ChartNoAxesCombined, className: "feature-dashboard" },
];

function Features() {
  const { t } = useLanguage();

  return (
    <section className="features-section section-pad" id="features">
      <div className="page-width">
        <div className="section-intro">
          <p className="eyebrow"><span className="eyebrow-dot" />{t("features.eyebrow")}</p>
          <h2>{t("features.title")}</h2>
          <p>{t("features.description")}</p>
        </div>
        <div className="feature-grid">
          {features.map(({ key, icon: Icon, className }, index) => (
            <article className={`feature-card ${className}`} key={key}>
              <div className="feature-card-top">
                <span className="feature-icon"><Icon size={20} aria-hidden="true" /></span>
                <span className="feature-number">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{t(`features.items.${key}.title`)}</h3>
              <p>{t(`features.items.${key}.description`)}</p>
              {key === "stock" && (
                <div className="feature-stock-marker">
                  <BellRing size={14} aria-hidden="true" />
                  <span>{t("features.stockMarker")}</span>
                  <span className="marker-line" />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
