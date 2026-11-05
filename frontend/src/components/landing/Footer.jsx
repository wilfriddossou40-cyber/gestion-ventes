import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";

function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

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
          <div className="footer-column">
            <strong className="footer-app-name">{t("brand.name")}</strong>
            <p className="footer-description">{t("footer.description")}</p>
          </div>
          <nav className="footer-column footer-navigation" aria-label={t("footer.navigation")}>
            <strong className="footer-column-title">{t("footer.navigation")}</strong>
            <a href="#features">{t("header.features")}</a>
            <a href="#how-it-works">{t("header.howItWorks")}</a>
            <Link to="/app">{t("header.openApp")}</Link>
          </nav>
          <div className="footer-copyright">
            {t("footer.copyright", { year: String(year), appName: t("brand.name") })}
          </div>
        </div>
        <style>{`
          .site-footer .footer-inner {
            display: grid;
            grid-template-columns: minmax(0, 2fr) minmax(200px, 1fr);
            align-items: start;
            gap: 32px 64px;
            padding: 48px 0 24px;
          }

          .footer-column {
            min-width: 0;
            text-align: left;
          }

          .footer-app-name {
            display: block;
            color: var(--text);
            font-size: 20px;
            font-weight: 760;
            letter-spacing: -0.035em;
          }

          .footer-column-title {
            display: block;
            color: var(--text);
            font-size: 13px;
            font-weight: 650;
          }

          .footer-description {
            max-width: 40ch;
            margin: 10px 0 0;
            color: var(--muted);
            font-size: 13px;
            line-height: 1.65;
            text-wrap: balance;
          }

          .footer-navigation {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-self: end;
            gap: 12px;
          }

          .footer-navigation a {
            display: inline-flex;
            min-height: 30px;
            align-items: center;
            color: var(--muted);
            font-size: 13px;
            text-decoration: none;
          }

          .footer-navigation a:hover {
            color: var(--accent-ink);
          }

          .footer-copyright {
            grid-column: 1 / -1;
            padding-top: 16px;
            border-top: 1px solid var(--border);
            color: var(--muted);
            font-size: 12px;
            text-align: left;
          }

          @media (max-width: 600px) {
            .site-footer .footer-inner {
              grid-template-columns: minmax(0, 1fr);
              gap: 28px;
              padding: 32px 0 20px;
            }

            .footer-navigation {
              justify-self: start;
            }

            .footer-copyright {
              grid-column: 1;
            }
          }
        `}</style>
      </footer>
    </>
  );
}

export default Footer;
