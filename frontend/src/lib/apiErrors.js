function safeMessage(value) {
  if (typeof value !== "string") return null;
  const message = value.trim();
  return message && message.toLocaleLowerCase() !== "undefined" ? message : null;
}

export function normalizeApiError(error, t) {
  const status = error?.response?.status;
  const response = error?.response?.data;
  const fieldErrors = {};

  if (status === 422 && response?.errors && typeof response.errors === "object") {
    for (const [field, entries] of Object.entries(response.errors)) {
      const messages = Array.isArray(entries) ? entries : [entries];
      const message = messages.map(safeMessage).filter(Boolean).join(" ");
      if (message) fieldErrors[field] = message;
    }
    return { message: t("errors.validation"), fieldErrors };
  }

  if (status === 409) {
    return {
      message: safeMessage(response?.message) ?? t("errors.generic"),
      fieldErrors,
    };
  }

  if (!error?.response) return { message: t("errors.network"), fieldErrors };
  if (status === 500) return { message: t("errors.server"), fieldErrors };
  return { message: t("errors.generic"), fieldErrors };
}
