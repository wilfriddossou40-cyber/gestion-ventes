import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";

function NotFoundPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = `${t("app.notFound.title")} | ${t("brand.name")}`;
  }, [t]);

  return (
    <section className="app-not-found">
      <p className="app-not-found-code">404</p>
      <h1>{t("app.notFound.title")}</h1>
      <p>{t("app.notFound.description")}</p>
      <Link className="app-return-link" to="/">
        {t("app.notFound.return")}
      </Link>
    </section>
  );
}

export default NotFoundPage;
