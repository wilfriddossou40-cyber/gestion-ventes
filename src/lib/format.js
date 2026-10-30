const locales = {
  en: "en-US",
  fr: "fr-FR",
};

export function formatCurrency(amount, language = "fr") {
  return new Intl.NumberFormat(locales[language] ?? locales.fr, {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value, language = "fr") {
  return new Intl.DateTimeFormat(locales[language] ?? locales.fr, {
    dateStyle: "medium",
  }).format(value);
}
