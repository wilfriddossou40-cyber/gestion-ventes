import { z } from "zod";
import { useForm } from "react-hook-form";
import { useLanguage } from "../../context/useLanguage";
import Dialog from "../produits/Dialog";

function ClientFormField({ id, label, error, children }) {
  return (
    <div className="products-form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="products-field-error" role="alert">{error}</span>}
    </div>
  );
}

function ClientFormDialog({ client, busy, onClose, onSave }) {
  const { t } = useLanguage();
  const editing = Boolean(client);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nom: client?.nom ?? "",
      telephone: client?.telephone ?? "",
      email: client?.email ?? "",
      adresse: client?.adresse ?? "",
    },
  });

  const schema = z.object({
    nom: z.string().trim().min(1, t("clients.validation.required"))
      .max(255, t("clients.validation.maxName")),
    telephone: z.string().max(30, t("clients.validation.maxPhone")),
    email: z.string().max(255, t("clients.validation.maxEmail"))
      .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
        message: t("clients.validation.email"),
      }),
    adresse: z.string().max(255, t("clients.validation.maxAddress")),
  });

  async function submit(values) {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") setError(field, { type: "validate", message: issue.message });
      }
      return;
    }

    const payload = {
      nom: parsed.data.nom.trim(),
      telephone: parsed.data.telephone.trim() || null,
      email: parsed.data.email.trim() || null,
      adresse: parsed.data.adresse.trim() || null,
    };

    try {
      await onSave(payload);
    } catch (requestError) {
      const response = requestError.response?.data;
      if (requestError.response?.status === 422 && response?.errors) {
        for (const [field, messages] of Object.entries(response.errors)) {
          if (field in values && Array.isArray(messages)) {
            setError(field, { type: "server", message: messages.join(" ") });
          }
        }
        const hasFieldErrors = Object.keys(response.errors).some((field) => field in values);
        if (!hasFieldErrors) {
          setError("root.server", { type: "server", message: response.message ?? t("clients.errors.save") });
        }
      } else {
        setError("root.server", { type: "server", message: response?.message ?? t("clients.errors.save") });
      }
    }
  }

  return (
    <Dialog
      title={t(editing ? "clients.form.editTitle" : "clients.form.createTitle")}
      onClose={onClose}
      className="products-form-dialog"
    >
      <form className="products-form" onSubmit={handleSubmit(submit)} noValidate>
        <ClientFormField id="client-name" label={t("clients.fields.name")} error={errors.nom?.message}>
          <input id="client-name" autoComplete="name" maxLength={255} aria-invalid={Boolean(errors.nom)} {...register("nom")} />
        </ClientFormField>
        <ClientFormField id="client-phone" label={t("clients.fields.phone")} error={errors.telephone?.message}>
          <input id="client-phone" type="tel" autoComplete="tel" maxLength={30} aria-invalid={Boolean(errors.telephone)} {...register("telephone")} />
        </ClientFormField>
        <ClientFormField id="client-email" label={t("clients.fields.email")} error={errors.email?.message}>
          <input id="client-email" type="email" autoComplete="email" maxLength={255} aria-invalid={Boolean(errors.email)} {...register("email")} />
        </ClientFormField>
        <ClientFormField id="client-address" label={t("clients.fields.address")} error={errors.adresse?.message}>
          <textarea id="client-address" rows="3" autoComplete="street-address" maxLength={255} aria-invalid={Boolean(errors.adresse)} {...register("adresse")} />
        </ClientFormField>
        {errors.root?.server?.message && (
          <p className="products-form-error" role="alert">{errors.root.server.message}</p>
        )}
        <div className="products-dialog-actions">
          <button className="product-button product-button-secondary" type="button" onClick={onClose} disabled={busy || isSubmitting}>
            {t("clients.actions.cancel")}
          </button>
          <button className="product-button product-button-primary" type="submit" disabled={busy || isSubmitting}>
            {busy || isSubmitting
              ? t("clients.actions.saving")
              : t(editing ? "clients.actions.save" : "clients.actions.create")}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export default ClientFormDialog;
