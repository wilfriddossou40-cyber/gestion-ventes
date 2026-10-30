import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useLanguage } from "../../context/useLanguage";
import Dialog from "../ui/Dialog";
import Field from "../ui/Field";
import { normalizeApiError } from "../../lib/apiErrors";
import CategoryFormDialog from "../categories/CategoryFormDialog";

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
      title={t(editing ? "products.form.editTitle" : "products.form.createTitle")}
      onClose={onClose}
      className="products-form-dialog"
      error={errors.root?.server?.message}
      busy={busy || isSubmitting}
      actions={(closeDialog) => (
        <>
          <button className="product-button product-button-secondary" type="button" onClick={closeDialog} disabled={busy || isSubmitting}>
            {t("products.actions.cancel")}
          </button>
          <button className="product-button product-button-primary" type="submit" form="product-form" disabled={busy || isSubmitting}>
            {busy || isSubmitting ? t("products.actions.saving") : t(editing ? "products.actions.save" : "products.actions.create")}
          </button>
        </>
      )}
    >
      {(closeDialog) => (
      <>
      <form id="product-form" className="products-form" onSubmit={handleSubmit((values) => submit(values, closeDialog))} noValidate>
        <Field id="product-name" label={t("products.fields.name")} required autoComplete="off" error={errors.nom?.message} {...register("nom")} />
        <Field id="product-reference" label={t("products.fields.reference")} required autoComplete="off" error={errors.reference?.message} {...register("reference")} />
        <Field
            as="select"
            id="product-category"
            label={t("products.fields.category")}
            required
            error={errors.categorie_id?.message}
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
        </Field>
        <Field id="product-price" label={t("products.fields.price")} required type="number" min="0" step="any" inputMode="decimal" error={errors.prix?.message} {...register("prix")} />
        {editing ? (
          <div className="products-readonly-stock">
            <strong>{t("products.fields.stock")}: {produit.quantite_stock}</strong>
            <p>{t("products.form.stockReadonly")}</p>
          </div>
        ) : (
          <Field id="product-stock" label={t("products.form.initialStock")} type="number" min="0" step="1" inputMode="numeric" error={errors.quantite_stock?.message} {...register("quantite_stock")} />
        )}
        <Field id="product-threshold" label={t("products.form.alertThreshold")} type="number" min="0" step="1" inputMode="numeric" error={errors.seuil_alerte?.message} {...register("seuil_alerte")} />
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
      </>
      )}
    </Dialog>
  );
}

export default ProduitFormDialog;
