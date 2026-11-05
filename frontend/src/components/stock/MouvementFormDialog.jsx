import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { createMouvementStock } from "../../api/mouvementsStock";
import { useLanguage } from "../../context/useLanguage";
import Dialog from "../ui/Dialog";
import Field from "../ui/Field";
import { normalizeApiError } from "../../lib/apiErrors";

function MouvementFormDialog({ products, initialProduct, initialType = "entree", busy, onClose, onSaved }) {
  const { t } = useLanguage();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      produit_id: initialProduct ? String(initialProduct.id) : "",
      type: initialType,
      quantite: "1",
      motif: "",
    },
  });
  const selectedProductId = watch("produit_id");
  const type = watch("type");
  const quantity = watch("quantite");
  const [productSearch, setProductSearch] = useState("");
  const selectedProduct = products.find((product) => String(product.id) === selectedProductId);
  const filteredProducts = products.filter((product) =>
    `${product.nom} ${product.reference}`.toLocaleLowerCase().includes(productSearch.trim().toLocaleLowerCase()),
  );
  const productRegistration = register("produit_id");
  const schema = z.object({
    produit_id: z.string().min(1, t("stock.form.validation.productRequired")),
    type: z.enum(["entree", "sortie"]),
    quantite: z.string()
      .regex(/^[1-9]\d*$/, t("stock.form.validation.quantity"))
      .refine((value) => Number.isSafeInteger(Number(value)), t("stock.form.validation.quantity")),
    motif: z.string().max(255, t("stock.form.validation.maxReason")),
  });

  const stockWarning = useMemo(() => (
    type === "sortie"
    && selectedProduct
    && Number(quantity) > Number(selectedProduct.quantite_stock)
  ), [quantity, selectedProduct, type]);

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

    try {
      const movement = await createMouvementStock({
        produit_id: Number(parsed.data.produit_id),
        type: parsed.data.type,
        quantite: Number(parsed.data.quantite),
        motif: parsed.data.motif.trim() || null,
      });
      await onSaved(movement);
      closeDialog();
    } catch (requestError) {
      const normalized = normalizeApiError(requestError, t);
      const knownFields = ["produit_id", "type", "quantite", "motif"];
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
      title={t("stock.form.title")}
      onClose={onClose}
      className="products-form-dialog"
      error={errors.root?.server?.message}
      busy={isSubmitting || busy}
      actions={(closeDialog) => (
        <>
          <button className="product-button product-button-secondary" type="button" onClick={closeDialog} disabled={isSubmitting || busy}>
            {t("stock.form.cancel")}
          </button>
          <button className="product-button product-button-primary" type="submit" form="movement-form" disabled={isSubmitting || busy}>
            {isSubmitting || busy ? t("stock.form.saving") : t("stock.form.submit")}
          </button>
        </>
      )}
    >
      {(closeDialog) => (
      <form id="movement-form" className="products-form stock-movement-form" onSubmit={handleSubmit((values) => submit(values, closeDialog))} noValidate>
        <Field
            type="search"
            className="stock-product-search"
            label={t("stock.form.productSearch")}
            help={t("stock.form.product")}
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
          />
          <Field
            as="select"
            id="movement-product"
            label={t("stock.form.product")}
            required
            error={errors.produit_id?.message}
            aria-invalid={Boolean(errors.produit_id)}
            {...productRegistration}
            onChange={(event) => {
              productRegistration.onChange(event);
              clearErrors("produit_id");
            }}
          >
            <option value="">{t("stock.form.selectProduct")}</option>
            {selectedProduct && !filteredProducts.some((product) => product.id === selectedProduct.id) && (
              <option value={selectedProduct.id}>{selectedProduct.nom} · {selectedProduct.reference}</option>
            )}
            {filteredProducts.map((product) => (
              <option value={product.id} key={product.id}>
                {product.nom} · {product.reference}
              </option>
            ))}
          </Field>
          {selectedProduct && (
            <span className="stock-current-quantity">
              {t("stock.form.currentStock", { stock: selectedProduct.quantite_stock })}
            </span>
          )}
        <Field as="select" id="movement-type" label={t("stock.form.type")} required error={errors.type?.message} {...register("type")}>
            <option value="entree">{t("stock.types.entry")}</option>
            <option value="sortie">{t("stock.types.exit")}</option>
        </Field>
        <Field
            id="movement-quantity"
            label={t("stock.form.quantity")}
            required
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            error={errors.quantite?.message}
            {...register("quantite")}
          />
          {stockWarning && (
            <span className="stock-quantity-warning" role="status">
              {t("stock.form.exceedsStock", { stock: selectedProduct.quantite_stock })}
            </span>
          )}
        <Field as="textarea" id="movement-reason" label={t("stock.form.reason")} rows={3} maxLength={255} error={errors.motif?.message} {...register("motif")} />
      </form>
      )}
    </Dialog>
  );
}

export default MouvementFormDialog;
