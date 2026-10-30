import { useEffect, useRef, useState } from "react";
import { ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { useLanguage } from "../context/useLanguage";
import { useTheme } from "../context/useTheme";
import "./ThemeMenu.css";

const themes = [
  { key: "light", icon: Sun },
  { key: "dark", icon: Moon },
  { key: "system", icon: Monitor },
];

function ThemeMenu({ buttonClassName = "" }) {
  const { t } = useLanguage();
  const { theme, cycleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const ActiveThemeIcon = themes.find(({ key }) => key === theme)?.icon ?? Monitor;

  useEffect(() => {
    if (!isOpen) return undefined;

    const activeIndex = themes.findIndex(({ key }) => key === theme);
    optionRefs.current[activeIndex]?.focus();

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      const currentIndex = optionRefs.current.indexOf(document.activeElement);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = currentIndex < 0
          ? direction > 0 ? 0 : themes.length - 1
          : (currentIndex + direction + themes.length) % themes.length;
        optionRefs.current[nextIndex]?.focus();
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        optionRefs.current[event.key === "Home" ? 0 : themes.length - 1]?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, theme]);

  function selectTheme(selectedTheme) {
    const currentIndex = themes.findIndex(({ key }) => key === theme);
    const selectedIndex = themes.findIndex(({ key }) => key === selectedTheme);
    const steps = (selectedIndex - currentIndex + themes.length) % themes.length;

    for (let step = 0; step < steps; step += 1) cycleTheme();
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="theme-menu-control" ref={rootRef}>
      <button
        className={`${buttonClassName} theme-menu-trigger`.trim()}
        type="button"
        ref={triggerRef}
        aria-label={t("app.layout.themeMenu")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="theme-menu-options"
        title={t("app.layout.themeMenu")}
        onClick={() => setIsOpen((open) => !open)}
      >
        <ActiveThemeIcon size={18} aria-hidden="true" />
        <ChevronDown className="theme-menu-chevron" size={13} aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          className="theme-menu-options"
          id="theme-menu-options"
          role="menu"
          aria-label={t("app.layout.themeMenu")}
        >
          {themes.map(({ key, icon: Icon }, index) => (
            <button
              className="theme-menu-option"
              type="button"
              role="menuitemradio"
              aria-checked={theme === key}
              aria-label={t("app.layout.themeChoice", { theme: t(`theme.${key}`) })}
              key={key}
              ref={(element) => { optionRefs.current[index] = element; }}
              onClick={() => selectTheme(key)}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{t(`theme.${key}`)}</span>
              {theme === key && <span className="theme-menu-selected" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeMenu;
