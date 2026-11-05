import { useState } from "react";
import { Boxes, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeMenu from "../ThemeMenu";
import { useLanguage } from "../../context/useLanguage";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label={t("header.home")}>
          <span className="brand-mark" aria-hidden="true"><Boxes size={18} /></span>
          <span>{t("brand.name")}</span>
        </Link>

        <div className="header-actions">
          <button
            className="icon-button language-button"
            type="button"
            onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
            aria-label={t("header.languageLabel")}
            title={t("header.languageLabel")}
          >
            {language === "fr" ? t("header.frenchShort") : t("header.englishShort")}
          </button>
          <ThemeMenu buttonClassName="icon-button" />
          <button
            className="icon-button menu-button"
            type="button"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
            aria-label={menuOpen ? t("header.closeMenu") : t("header.openMenu")}
            aria-expanded={menuOpen}
            aria-controls="header-navigation"
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>

        <nav
          className={`header-navigation${menuOpen ? " is-open" : ""}`}
          id="header-navigation"
          aria-label={t("header.navigation")}
        >
          <a href="#features" onClick={() => setMenuOpen(false)}>{t("header.features")}</a>
          <Link className="button button-small button-primary" to="/app" onClick={() => setMenuOpen(false)}>
            {t("header.openApp")}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
