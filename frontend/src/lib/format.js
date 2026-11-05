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

export function formatDateOnly(value, language = "fr") {
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat(locales[language] ?? locales.fr, {
    dateStyle: "medium",
  }).format(new Date(year, month - 1, day));
}

export function formatDateTime(value, language = "fr") {
  return new Intl.DateTimeFormat(locales[language] ?? locales.fr, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
