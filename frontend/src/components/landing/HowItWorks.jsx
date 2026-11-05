import { ArrowRight, ClipboardPlus, ReceiptText, ScanLine } from "lucide-react";
import { useLanguage } from "../../context/useLanguage";

const steps = [
  { key: "add", icon: ClipboardPlus },
  { key: "sell", icon: ReceiptText },
  { key: "track", icon: ScanLine },
];

function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section className="how-section section-pad" id="how-it-works">
      <div className="page-width how-inner">
        <div className="section-intro how-intro">
          <p className="eyebrow"><span className="eyebrow-dot" />{t("how.eyebrow")}</p>
          <h2>{t("how.title")}</h2>
          <p>{t("how.description")}</p>
        </div>
        <ol className="steps-list">
          {steps.map(({ key, icon: Icon }, index) => (
            <li className="step-item" key={key}>
              <span className="step-icon"><Icon size={20} aria-hidden="true" /></span>
              <span className="step-index">{t("how.step")} {String(index + 1).padStart(2, "0")}</span>
              <h3>{t(`how.steps.${key}.title`)}</h3>
              <p>{t(`how.steps.${key}.description`)}</p>
              {index < steps.length - 1 && <ArrowRight className="step-arrow" size={18} aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default HowItWorks;
