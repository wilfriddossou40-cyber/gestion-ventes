import { ArrowUpRight, Boxes } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";

function Footer() {
  const { t } = useLanguage();

  return (
    <>
      <section className="closing-section">
        <div className="page-width closing-inner">
          <p className="eyebrow"><span className="eyebrow-dot" />{t("closing.eyebrow")}</p>
          <h2>{t("closing.title")}</h2>
          <p>{t("closing.description")}</p>
          <Link className="button button-primary" to="/app">
            {t("closing.button")}<ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <footer className="site-footer">
        <div className="page-width footer-inner">
          <div className="footer-brand">
            <span className="brand-mark" aria-hidden="true"><Boxes size={18} /></span>
            <div><strong>{t("brand.name")}</strong><span>{t("footer.project")}</span></div>
          </div>
          <a className="repository-link" href="#">
            {t("footer.repository")}<span>{t("footer.completeLink")}</span>
          </a>
          <span className="footer-note">{t("footer.note")}</span>
        </div>
      </footer>
    </>
  );
}

export default Footer;
