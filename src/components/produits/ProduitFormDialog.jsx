import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useLanguage } from "../../context/useLanguage";
import Dialog from "./Dialog";
import CategoryFormDialog from "../categories/CategoryFormDialog";
import { Plus } from "lucide-react";

function ProductFormField({ label, error, id, children }) {
  return (
    <div className="products-form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="products-field-error" role="alert">{error}</span>}
    </div>
  );
}

function ProduitFormDialog({ produit, categories, busy, onClose, onSave, onCategorySaved }) {
  const { t } = useLanguage();
  const editing = Boolean(produit);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      nom: produit?.nom ?? "",
      reference: produit?.reference ?? "",
      categorie_id: produit?.categorie_id ? String(produit.categorie_id) : "",
      prix: produit?.prix ?? "",
      quantite_stock: "",
      seuil_alerte: produit?.seuil_alerte ?? 0,
    },
  });
  const categoryRegistration = register("categorie_id");

  const schema = z.object({
    nom: z.string().trim().min(1, t("products.validation.required")),
    reference: z.string().trim().min(1, t("products.validation.required")),
    categorie_id: z.string().min(1, t("products.validation.required"))
      .regex(/^\d+$/, t("products.validation.category")),
    prix: z.string().trim().min(1, t("products.validation.required"))
      .regex(/^\d+(\.\d+)?$/, t("products.validation.number"))
      .refine((value) => Number(value) >= 0, t("products.validation.nonNegative")),
    seuil_alerte: z.string().regex(/^\d*$/, t("products.validation.integer")),
    ...(editing ? {} : {
      quantite_stock: z.string().regex(/^\d*$/, t("products.validation.integer")),
    }),
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
      categorie_id: Number(parsed.data.categorie_id),
      nom: parsed.data.nom.trim(),
      reference: parsed.data.reference.trim(),
      prix: Number(parsed.data.prix),
      ...(parsed.data.seuil_alerte !== "" ? { seuil_alerte: Number(parsed.data.seuil_alerte) } : {}),
      ...(!editing && parsed.data.quantite_stock !== ""
        ? { quantite_stock: Number(parsed.data.quantite_stock) }
        : {}),
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
          setError("root.server", { type: "server", message: response.message ?? t("products.errors.save") });
        }
      } else {
        setError("root.server", { type: "server", message: response?.message ?? t("products.errors.save") });
      }
    }
  }

  return (
    <Dialog
      title={t(editing ? "products.form.editTitle" : "products.form.createTitle")}
      onClose={onClose}
      className="products-form-dialog"
    >
      <form className="products-form" onSubmit={handleSubmit(submit)} noValidate>
        <ProductFormField id="product-name" label={t("products.fields.name")} error={errors.nom?.message}>
          <input id="product-name" autoComplete="off" {...register("nom")} />
        </ProductFormField>
        <ProductFormField id="product-reference" label={t("products.fields.reference")} error={errors.reference?.message}>
          <input id="product-reference" autoComplete="off" {...register("reference")} />
        </ProductFormField>
        <ProductFormField id="product-category" label={t("products.fields.category")} error={errors.categorie_id?.message}>
          <select
            id="product-category"
            {...categoryRegistration}
            onChange={(event) => {
              if (event.target.value === "__new_category__") {
                event.target.value = getValues("categorie_id");
                setCategoryDialogOpen(true);
              } else {
                categoryRegistration.onChange(event);
              }
            }}
          >
            <option value="">{t("products.form.selectCategory")}</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>{category.nom}</option>
            ))}
            <option value="__new_category__">{`+ ${t("categories.actions.new")}`}</option>
          </select>
        </ProductFormField>
        <ProductFormField id="product-price" label={t("products.fields.price")} error={errors.prix?.message}>
          <input id="product-price" type="number" min="0" step="any" inputMode="decimal" {...register("prix")} />
        </ProductFormField>
        {editing ? (
          <div className="products-readonly-stock">
            <strong>{t("products.fields.stock")}: {produit.quantite_stock}</strong>
            <p>{t("products.form.stockReadonly")}</p>
          </div>
        ) : (
          <ProductFormField id="product-stock" label={t("products.form.initialStock")} error={errors.quantite_stock?.message}>
            <input id="product-stock" type="number" min="0" step="1" inputMode="numeric" {...register("quantite_stock")} />
          </ProductFormField>
        )}
        <ProductFormField id="product-threshold" label={t("products.form.alertThreshold")} error={errors.seuil_alerte?.message}>
          <input id="product-threshold" type="number" min="0" step="1" inputMode="numeric" {...register("seuil_alerte")} />
        </ProductFormField>
        {errors.root?.server?.message && (
          <p className="products-form-error" role="alert">{errors.root.server.message}</p>
        )}
        <div className="products-dialog-actions">
          <button className="product-button product-button-secondary" type="button" onClick={onClose} disabled={busy || isSubmitting}>
            {t("products.actions.cancel")}
          </button>
          <button className="product-button product-button-primary" type="submit" disabled={busy || isSubmitting}>
            {busy || isSubmitting ? t("products.actions.saving") : t(editing ? "products.actions.save" : "products.actions.create")}
          </button>
        </div>
      </form>
      {categoryDialogOpen && (
        <CategoryFormDialog
          onClose={() => setCategoryDialogOpen(false)}
          onSaved={async (createdCategory) => {
            const refreshedCategories = await onCategorySaved();
            const matchingCategory = createdCategory?.id
              ? refreshedCategories?.find((item) => item.id === createdCategory.id)
              : refreshedCategories?.find((item) => item.nom === createdCategory?.nom);
            if (matchingCategory) setValue("categorie_id", String(matchingCategory.id));
          }}
          notify={(message) => toast.success(message)}
        />
      )}
    </Dialog>
  );
}

export default ProduitFormDialog;
