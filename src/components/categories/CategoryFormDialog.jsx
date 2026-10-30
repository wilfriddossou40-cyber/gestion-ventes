import { z } from "zod";
import { useForm } from "react-hook-form";
import { createCategorie, updateCategorie } from "../../api/categories";
import { useLanguage } from "../../context/useLanguage";
import Dialog from "../produits/Dialog";

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

  async function submit(values) {
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
      onClose();
    } catch (requestError) {
      const response = requestError.response?.data;
      if (requestError.response?.status === 422 && response?.errors) {
        for (const [field, messages] of Object.entries(response.errors)) {
          if (field === "nom" || field === "description") {
            setError(field, { type: "server", message: messages.join(" ") });
          } else {
            setError("root.server", { type: "server", message: messages.join(" ") });
          }
        }
        if (Object.keys(response.errors).length === 0) {
          setError("root.server", { type: "server", message: response.message ?? t("categories.errors.save") });
        }
      } else {
        setError("root.server", {
          type: "server",
          message: response?.message ?? t("categories.errors.save"),
        });
      }
    }
  }

  return (
    <Dialog
      title={t(editing ? "categories.form.editTitle" : "categories.form.createTitle")}
      onClose={onClose}
      className="products-form-dialog"
    >
      <form className="products-form" onSubmit={handleSubmit(submit)} noValidate>
        <div className="products-form-field">
          <label htmlFor="category-name">{t("categories.fields.name")}</label>
          <input
            id="category-name"
            autoComplete="off"
            maxLength={255}
            aria-invalid={Boolean(errors.nom)}
            {...register("nom")}
          />
          {errors.nom?.message && <span className="products-field-error" role="alert">{errors.nom.message}</span>}
        </div>
        <div className="products-form-field">
          <label htmlFor="category-description">{t("categories.fields.description")}</label>
          <textarea
            id="category-description"
            rows="3"
            aria-invalid={Boolean(errors.description)}
            {...register("description")}
          />
          {errors.description?.message && <span className="products-field-error" role="alert">{errors.description.message}</span>}
        </div>
        {errors.root?.server?.message && (
          <p className="products-form-error" role="alert">{errors.root.server.message}</p>
        )}
        <div className="products-dialog-actions">
          <button className="product-button product-button-secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            {t("products.actions.cancel")}
          </button>
          <button className="product-button product-button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t("products.actions.saving")
              : t(editing ? "categories.actions.save" : "categories.actions.create")}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export default CategoryFormDialog;
