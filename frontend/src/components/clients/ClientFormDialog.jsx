import { z } from "zod";
import { useForm } from "react-hook-form";
import { useLanguage } from "../../context/useLanguage";
import Dialog from "../ui/Dialog";
import Field from "../ui/Field";
import { normalizeApiError } from "../../lib/apiErrors";

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

  async function submit(values, closeDialog) {
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
      closeDialog();
    } catch (requestError) {
      const normalized = normalizeApiError(requestError, t);
      const knownFields = Object.keys(values);
      const fieldEntries = Object.entries(normalized.fieldErrors);
      for (const [field, message] of fieldEntries) {
        if (knownFields.includes(field)) setError(field, { type: "server", message });
      }
      if (!fieldEntries.some(([field]) => knownFields.includes(field))) {
        setError("root.server", { type: "server", message: normalized.message });
      }
    }
  }

  return (
    <Dialog
      title={t(editing ? "clients.form.editTitle" : "clients.form.createTitle")}
      onClose={onClose}
      className="products-form-dialog"
      error={errors.root?.server?.message}
      busy={busy || isSubmitting}
      actions={(closeDialog) => (
        <>
          <button className="product-button product-button-secondary" type="button" onClick={closeDialog} disabled={busy || isSubmitting}>
            {t("clients.actions.cancel")}
          </button>
          <button className="product-button product-button-primary" type="submit" form="client-form" disabled={busy || isSubmitting}>
            {busy || isSubmitting ? t("clients.actions.saving") : t(editing ? "clients.actions.save" : "clients.actions.create")}
          </button>
        </>
      )}
    >
      {(closeDialog) => (
        <form id="client-form" className="products-form" onSubmit={handleSubmit((values) => submit(values, closeDialog))} noValidate>
          <Field id="client-name" label={t("clients.fields.name")} required error={errors.nom?.message} autoComplete="name" maxLength={255} {...register("nom")} />
          <Field id="client-phone" label={t("clients.fields.phone")} type="tel" autoComplete="tel" maxLength={30} error={errors.telephone?.message} {...register("telephone")} />
          <Field id="client-email" label={t("clients.fields.email")} type="email" autoComplete="email" maxLength={255} error={errors.email?.message} {...register("email")} />
          <Field as="textarea" id="client-address" label={t("clients.fields.address")} rows={3} autoComplete="street-address" maxLength={255} error={errors.adresse?.message} {...register("adresse")} />
        </form>
      )}
    </Dialog>
  );
}

export default ClientFormDialog;
