import { useLanguage } from "../../context/useLanguage";

function PageScaffold({ titleKey, descriptionKey }) {
  const { t } = useLanguage();

  return (
    <section className="app-page">
      <h1>{t(titleKey)}</h1>
      <p>{t(descriptionKey)}</p>
    </section>
  );
}

export default PageScaffold;
