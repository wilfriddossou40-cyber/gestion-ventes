import { useEffect, useRef, useState } from "react";
import {
  Boxes,
  ArrowLeft,
  ChartNoAxesCombined,
  Menu,
  Package,
  ShoppingCart,
  UsersRound,
  Warehouse,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import ThemeMenu from "../ThemeMenu";
import "./AppLayout.css";

const navigation = [
  { path: "/app", key: "dashboard", icon: ChartNoAxesCombined, end: true },
  { path: "/app/produits", key: "products", icon: Package },
  { path: "/app/clients", key: "clients", icon: UsersRound },
  { path: "/app/ventes", key: "sales", icon: ShoppingCart },
  { path: "/app/stock", key: "stock", icon: Warehouse },
];

function AppLayout() {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia("(max-width: 767px)").matches,
  );
  const drawerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const currentTitleKey = navigation.find(({ path }) => path === location.pathname)?.key;
  const currentTitle = currentTitleKey
    ? t(`app.pages.${currentTitleKey}.title`)
    : t("app.notFound.title");

  useEffect(() => {
    document.title = `${currentTitle} | ${t("brand.name")}`;
  }, [currentTitle, t]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => {
      setIsMobile(mediaQuery.matches);
      if (!mediaQuery.matches) setDrawerOpen(false);
    };

    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!drawerOpen || !isMobile) return undefined;

    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";

    const focusableElements = () =>
      drawerRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [];

    const firstFocusable = focusableElements()[0];
    firstFocusable?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setDrawerOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;
      const elements = focusableElements();
      if (!elements.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!drawerRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [drawerOpen, isMobile]);

  function closeDrawer() {
    setDrawerOpen(false);
    if (isMobile) menuButtonRef.current?.focus();
  }

  return (
    <div className="app-shell">
      {drawerOpen && isMobile && (
        <button
          className="app-drawer-backdrop"
          type="button"
          aria-label={t("app.layout.closeMenu")}
          onClick={closeDrawer}
        />
      )}

      <aside
        className={`app-sidebar${drawerOpen ? " is-open" : ""}`}
        ref={drawerRef}
        aria-label={t("app.layout.navigation")}
        {...(isMobile && drawerOpen ? { role: "dialog", "aria-modal": true } : {})}
      >
        <div className="app-sidebar-header">
          <Link className="app-brand" to="/app" onClick={closeDrawer}>
            <span className="app-brand-icon"><Boxes size={19} aria-hidden="true" /></span>
            <span>{t("brand.name")}</span>
          </Link>
          <button
            className="app-icon-button app-drawer-close"
            type="button"
            aria-label={t("app.layout.closeMenu")}
            onClick={closeDrawer}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="app-nav" id="app-navigation" aria-label={t("app.layout.navigation")}>
          {navigation.map(({ path, key, icon: Icon, end }) => (
            <NavLink
              className={({ isActive }) => `app-nav-link${isActive ? " is-active" : ""}`}
              end={end}
              key={path}
              to={path}
              onClick={closeDrawer}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{t(`app.navigation.${key}`)}</span>
            </NavLink>
          ))}
        </nav>

        <Link className="app-site-link" to="/" onClick={closeDrawer}>
          <ArrowLeft size={17} aria-hidden="true" />
          {t("app.layout.backToSite")}
        </Link>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="app-icon-button app-menu-toggle"
            type="button"
            ref={menuButtonRef}
            aria-label={t("app.layout.openMenu")}
            aria-expanded={drawerOpen}
            aria-controls="app-navigation"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={21} aria-hidden="true" />
          </button>
          <div className="app-topbar-actions">
            <button
              className="app-icon-button app-language-toggle"
              type="button"
              aria-label={t("header.languageLabel")}
              title={t("header.languageLabel")}
              onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
            >
              {language === "fr" ? t("header.englishShort") : t("header.frenchShort")}
            </button>
            <ThemeMenu buttonClassName="app-icon-button" />
          </div>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
