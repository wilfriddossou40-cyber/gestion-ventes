import { useLanguage } from "../../context/useLanguage";
import PageHeader from "../ui/PageHeader";

function PageScaffold({ titleKey, descriptionKey }) {
  const { t } = useLanguage();

  return (
    <section className="app-page">
      <PageHeader title={t(titleKey)} description={t(descriptionKey)} />
    </section>
  );
}

export default PageScaffold;
