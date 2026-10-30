import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { createMouvementStock } from "../../api/mouvementsStock";
import { useLanguage } from "../../context/useLanguage";
import Dialog from "../produits/Dialog";

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

    try {
      const movement = await createMouvementStock({
        produit_id: Number(parsed.data.produit_id),
        type: parsed.data.type,
        quantite: Number(parsed.data.quantite),
        motif: parsed.data.motif.trim() || null,
      });
      await onSaved(movement);
    } catch (requestError) {
      const response = requestError.response?.data;
      if (requestError.response?.status === 422 && response?.errors) {
        for (const [field, messages] of Object.entries(response.errors)) {
          if (["produit_id", "type", "quantite", "motif"].includes(field) && Array.isArray(messages)) {
            setError(field, { type: "server", message: messages.join(" ") });
          }
        }
        if (!Object.keys(response.errors).some((field) => ["produit_id", "type", "quantite", "motif"].includes(field))) {
          setError("root.server", { type: "server", message: response.message ?? t("stock.form.errors.save") });
        }
      } else {
        setError("root.server", { type: "server", message: response?.message ?? t("stock.form.errors.save") });
      }
    }
  }

  return (
    <Dialog
      title={t("stock.form.title")}
      onClose={onClose}
      className="products-form-dialog"
    >
      <form className="products-form stock-movement-form" onSubmit={handleSubmit(submit)} noValidate>
        <div className="products-form-field">
          <label htmlFor="movement-product">{t("stock.form.product")}</label>
          <input
            type="search"
            className="stock-product-search"
            placeholder={t("stock.form.productSearch")}
            aria-label={t("stock.form.productSearch")}
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
          />
          <select
            id="movement-product"
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
          </select>
          {errors.produit_id?.message && <span className="products-field-error" role="alert">{errors.produit_id.message}</span>}
          {selectedProduct && (
            <span className="stock-current-quantity">
              {t("stock.form.currentStock", { stock: selectedProduct.quantite_stock })}
            </span>
          )}
        </div>
        <div className="products-form-field">
          <label htmlFor="movement-type">{t("stock.form.type")}</label>
          <select id="movement-type" aria-invalid={Boolean(errors.type)} {...register("type")}>
            <option value="entree">{t("stock.types.entry")}</option>
            <option value="sortie">{t("stock.types.exit")}</option>
          </select>
          {errors.type?.message && <span className="products-field-error" role="alert">{errors.type.message}</span>}
        </div>
        <div className="products-form-field">
          <label htmlFor="movement-quantity">{t("stock.form.quantity")}</label>
          <input
            id="movement-quantity"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            aria-invalid={Boolean(errors.quantite)}
            {...register("quantite")}
          />
          {errors.quantite?.message && <span className="products-field-error" role="alert">{errors.quantite.message}</span>}
          {stockWarning && (
            <span className="stock-quantity-warning" role="status">
              {t("stock.form.exceedsStock", { stock: selectedProduct.quantite_stock })}
            </span>
          )}
        </div>
        <div className="products-form-field">
          <label htmlFor="movement-reason">{t("stock.form.reason")}</label>
          <textarea id="movement-reason" rows="3" maxLength={255} aria-invalid={Boolean(errors.motif)} {...register("motif")} />
          {errors.motif?.message && <span className="products-field-error" role="alert">{errors.motif.message}</span>}
        </div>
        {errors.root?.server?.message && (
          <p className="products-form-error" role="alert">{errors.root.server.message}</p>
        )}
        <div className="products-dialog-actions">
          <button className="product-button product-button-secondary" type="button" onClick={onClose} disabled={isSubmitting || busy}>
            {t("stock.form.cancel")}
          </button>
          <button className="product-button product-button-primary" type="submit" disabled={isSubmitting || busy}>
            {isSubmitting || busy ? t("stock.form.saving") : t("stock.form.submit")}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

export default MouvementFormDialog;
