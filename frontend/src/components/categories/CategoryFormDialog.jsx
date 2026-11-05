import { z } from "zod";
import { useForm } from "react-hook-form";
import { createCategorie, updateCategorie } from "../../api/categories";
import { useLanguage } from "../../context/useLanguage";
import Dialog from "../ui/ModalShell";
import Field from "../ui/FormField";
import { normalizeApiError } from "../../lib/apiErrors";

function CategoryFormDialog({ category = null, onClose, onSaved, notify }) {
  const { t } = useLanguage();
  const editing = Boolean(category);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nom: category?.nom ?? "",
      description: category?.description ?? "",
    },
  });

  const schema = z.object({
    nom: z.string().trim().min(1, t("categories.validation.required"))
      .max(255, t("categories.validation.maxName")),
    description: z.union([z.string(), z.null()]).optional(),
  });

  async function submit(values, closeDialog) {
    clearErrors();
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
      description: parsed.data.description?.trim() || null,
    };

    try {
      const saved = editing
        ? await updateCategorie(category.id, payload)
        : await createCategorie(payload);
      if (!editing) {
        const result = await onSaved(saved);
        if (result === false) return;
      } else {
        await onSaved(saved);
      }
      notify(t(editing ? "categories.toast.updated" : "categories.toast.created"));
      closeDialog();
    } catch (requestError) {
      const normalized = normalizeApiError(requestError, t);
      const knownFields = ["nom", "description"];
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
      title={t(editing ? "categories.form.editTitle" : "categories.form.createTitle")}
      onClose={onClose}
      className="products-form-dialog"
      error={errors.root?.server?.message}
      busy={isSubmitting}
      actions={(closeDialog) => (
        <>
          <button className="product-button product-button-secondary" type="button" onClick={closeDialog} disabled={isSubmitting}>
            {t("products.actions.cancel")}
          </button>
          <button className="product-button product-button-primary" type="submit" form="category-form" disabled={isSubmitting}>
            {isSubmitting ? t("products.actions.saving") : t(editing ? "categories.actions.save" : "categories.actions.create")}
          </button>
        </>
      )}
    >
      {(closeDialog) => {
        return (
          <form id="category-form" className="products-form" onSubmit={handleSubmit((values) => submit(values, closeDialog))} noValidate>
            <Field id="category-name" label={t("categories.fields.name")} required error={errors.nom?.message} maxLength={255} autoComplete="off" {...register("nom")} />
            <Field as="textarea" id="category-description" label={t("categories.fields.description")} error={errors.description?.message} rows={3} {...register("description")} />
          </form>
        );
      }}
    </Dialog>
  );
}

export default CategoryFormDialog;
