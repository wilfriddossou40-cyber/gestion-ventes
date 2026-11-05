import { Boxes } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";

function getCurrentYear() {
  return new Date().getFullYear();
}

function Footer() {
  const { t } = useLanguage();
  const year = getCurrentYear();

  return (
    <footer className="site-footer">
      <div className="page-width footer-inner">
        <div className="footer-brand-block">
          <Link className="brand footer-brand" to="/" aria-label={t("header.home")}>
            <span className="brand-mark" aria-hidden="true"><Boxes size={18} /></span>
            <span>{t("brand.name")}</span>
          </Link>
          <p className="footer-description">{t("footer.description")}</p>
        </div>
        <nav className="footer-navigation" aria-label={t("footer.navigation")}>
          <strong className="footer-column-title">{t("footer.navigation")}</strong>
          <a href="#features">{t("header.features")}</a>
          <Link to="/app">{t("header.openApp")}</Link>
        </nav>
        <div className="footer-copyright">
          {t("footer.copyright", { year: String(year), appName: t("brand.name") })}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
