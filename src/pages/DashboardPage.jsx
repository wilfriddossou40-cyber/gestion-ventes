import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";

function DashboardPage() {
  const { t } = useLanguage();

  return (
    <main className="placeholder-page">
      <h1>{t("dashboard.title")}</h1>
      <Link className="button button-primary" to="/">
        {t("dashboard.back")}
      </Link>
    </main>
  );
}

export default DashboardPage;
