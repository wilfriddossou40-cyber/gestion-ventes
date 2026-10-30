import { useState } from "react";
import { Boxes, Menu, Moon, Sun, Monitor, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import { useTheme } from "../../context/useTheme";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, cycleTheme } = useTheme();
  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

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
            {language === "fr" ? t("header.englishShort") : t("header.frenchShort")}
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={cycleTheme}
            aria-label={t("header.themeLabel", { theme: t(`theme.${theme}`) })}
            title={t("header.themeLabel", { theme: t(`theme.${theme}`) })}
          >
            <ThemeIcon size={19} aria-hidden="true" />
          </button>
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
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>{t("header.howItWorks")}</a>
          <Link className="button button-small button-primary" to="/app" onClick={() => setMenuOpen(false)}>
            {t("header.openApp")}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
