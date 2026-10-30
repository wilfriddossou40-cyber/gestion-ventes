import { ArrowDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import AppPreview from "./AppPreview";

function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero-section">
      <div className="hero-inner page-width">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" />{t("hero.eyebrow")}</p>
          <h1>{t("hero.title")}</h1>
          <p className="hero-description">{t("hero.description")}</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/app">
              {t("hero.primary")}<ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a className="button button-secondary" href="#features">
              {t("hero.secondary")}<ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
          <p className="hero-note">{t("hero.note")}</p>
        </div>
        <AppPreview />
      </div>
    </section>
  );
}

export default Hero;
