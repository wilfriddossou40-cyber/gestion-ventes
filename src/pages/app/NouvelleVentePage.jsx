import { useMemo, useState } from "react";
import { AlertCircle, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { createVente } from "../../api/ventes";
import { createClient } from "../../api/clients";
import ClientFormDialog from "../../components/clients/ClientFormDialog";
import ProductsSkeleton from "../../components/produits/ProductsSkeleton";
import ApiErrorBanner from "../../components/ui/ApiErrorBanner";
import Field from "../../components/ui/Field";
import { useLanguage } from "../../context/useLanguage";
import useClients from "../../hooks/useClients";
import useProduits from "../../hooks/useProduits";
import { normalizeApiError } from "../../lib/apiErrors";
import { formatCurrency } from "../../lib/format";
import "./NouvelleVentePage.css";
import "./ProduitsPage.css";

function getLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getProductStock(product) {
  return Math.max(0, Number(product.quantite_stock) || 0);
}

function NouvelleVentePage() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const products = useProduits({});
  const clients = useClients({});
  const [query, setQuery] = useState("");
  const [clientQuery, setClientQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [date, setDate] = useState(getLocalDate);
  const [cart, setCart] = useState([]);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [linesError, setLinesError] = useState("");
  const [requestError, setRequestError] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(language);
    if (!normalizedQuery) return products.data;
    return products.data.filter((product) =>
      `${product.nom} ${product.reference}`.toLocaleLowerCase(language).includes(normalizedQuery),
    );
  }, [language, products.data, query]);

  const filteredClients = useMemo(() => {
    const normalizedQuery = clientQuery.trim().toLocaleLowerCase(language);
    if (!normalizedQuery) return clients.data;
    return clients.data.filter((client) =>
      client.nom.toLocaleLowerCase(language).includes(normalizedQuery),
    );
  }, [clientQuery, clients.data, language]);

  const estimatedTotal = cart.reduce(
    (total, line) => total + Number(line.product.prix) * line.quantity,
    0,
  );
  const canSubmit = cart.length > 0 && Boolean(selectedClientId) && Boolean(date) && !submitting;

  function addProduct(product) {
    if (getProductStock(product) < 1) return;
    setLinesError("");
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (!existing) return [...current, { product, quantity: 1 }];
      if (existing.quantity >= getProductStock(product)) return current;
      return current.map((line) => (
        line.product.id === product.id
          ? { ...line, quantity: line.quantity + 1 }
          : line
      ));
    });
  }

  function changeQuantity(productId, nextValue) {
    const product = products.data.find((item) => item.id === productId);
    if (!product) return;
    const quantity = Math.min(getProductStock(product), Math.max(1, Math.floor(Number(nextValue) || 1)));
    setCart((current) => current.map((line) => (
      line.product.id === productId ? { ...line, quantity } : line
    )));
  }

  function removeProduct(productId) {
    setCart((current) => current.filter((line) => line.product.id !== productId));
    setLinesError("");
  }

  async function submitSale(event) {
    event.preventDefault();
    setFieldErrors({});
    setLinesError("");
    setRequestError("");
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const sale = await createVente({
        client_id: Number(selectedClientId),
        date_vente: date,
        lignes: cart.map(({ product, quantity }) => ({
          produit_id: product.id,
          quantite: quantity,
        })),
      });
      const successMessage = t("sales.new.success", {
        amount: formatCurrency(Number(sale.montant_total), language),
      });
      navigate("/app/ventes", { state: { successMessage } });
    } catch (error) {
      const normalized = normalizeApiError(error, t);
      if (normalized.fieldErrors.lignes) {
        setLinesError(normalized.fieldErrors.lignes);
        await products.reload();
      }
      setFieldErrors({
        client_id: normalized.fieldErrors.client_id,
        date_vente: normalized.fieldErrors.date_vente,
      });
      const hasHandledErrors = normalized.fieldErrors.lignes
        || normalized.fieldErrors.client_id
        || normalized.fieldErrors.date_vente;
      setRequestError(hasHandledErrors ? "" : normalized.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function saveNewClient(payload) {
    const client = await createClient(payload);
    toast.success(t("clients.toast.created"));
    await clients.reload();
    setSelectedClientId(String(client.id));
    setClientQuery("");
  }

  async function retryLoading() {
    await Promise.all([products.reload(), clients.reload()]);
  }

  const loading = products.loading || clients.loading;
  const loadError = products.error || clients.error;

  return (
    <div className="new-sale-page">
      <Toaster position="top-right" toastOptions={{ duration: 2800 }} />
      <header className="products-page-header">
        <div>
          <h1>{t("sales.new.title")}</h1>
          <p>{t("sales.new.description")}</p>
        </div>
      </header>

      {loadError ? (
        <section className="products-data-panel">
          <div className="products-state">
            <AlertCircle className="products-state-error" size={26} aria-hidden="true" />
            <h2>{t("sales.new.states.loadErrorTitle")}</h2>
            <p>{normalizeApiError(loadError, t).message}</p>
            <button className="product-button product-button-primary" type="button" onClick={retryLoading}>
              {t("sales.new.actions.retry")}
            </button>
          </div>
        </section>
      ) : loading ? (
        <section className="products-data-panel"><ProductsSkeleton /></section>
      ) : products.data.length === 0 ? (
        <section className="products-data-panel">
          <div className="products-state">
            <h2>{t("sales.new.states.noProductsTitle")}</h2>
            <p>{t("sales.new.states.noProducts")}</p>
            <Link className="product-button product-button-primary" to="/app/produits">
              {t("sales.new.actions.viewProducts")}
            </Link>
          </div>
        </section>
      ) : (
        <form className="new-sale-layout" onSubmit={submitSale}>
          <section className="sale-catalog" aria-labelledby="sale-catalog-title">
            <div className="sale-section-heading">
              <div>
                <h2 id="sale-catalog-title">{t("sales.new.catalog.title")}</h2>
                <p>{t("sales.new.catalog.description")}</p>
              </div>
              <div className="products-search sale-product-search">
                <Search size={17} aria-hidden="true" />
                <Field
                  className="ui-field--visually-hidden-label"
                  id="sale-product-search"
                  label={t("sales.new.catalog.searchLabel")}
                  type="search"
                  value={query}
                  placeholder={t("sales.new.catalog.searchPlaceholder")}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
            <div className="sale-product-list">
              {filteredProducts.map((product) => {
                const stock = getProductStock(product);
                return (
                  <button
                    className="sale-product-item"
                    type="button"
                    key={product.id}
                    disabled={stock === 0}
                    onClick={() => addProduct(product)}
                  >
                    <span className="sale-product-main">
                      <strong>{product.nom}</strong>
                      <small>{product.reference}</small>
                    </span>
                    <span className="sale-product-stock">
                      {stock === 0 ? t("sales.new.catalog.outOfStock") : t("sales.new.catalog.stock", { stock })}
                    </span>
                    <span className="sale-product-price">
                      {formatCurrency(Number(product.prix), language)}
                    </span>
                    {stock > 0 && <Plus size={18} aria-hidden="true" />}
                  </button>
                );
              })}
              {filteredProducts.length === 0 && (
                <p className="sale-list-empty">{t("sales.new.catalog.noResults")}</p>
              )}
            </div>
          </section>

          <aside className="sale-cart" aria-labelledby="sale-cart-title">
            <div className="sale-cart-heading">
              <h2 id="sale-cart-title">{t("sales.new.cart.title")}</h2>
              <span>{t("sales.new.cart.itemCount", { count: cart.length })}</span>
            </div>

            {linesError && <ApiErrorBanner message={linesError} className="sale-alert" />}
            {requestError && <ApiErrorBanner message={requestError} className="sale-alert" />}

            <div className="sale-fields">
              <div className="sale-client-field">
                {clients.data.length === 0 ? (
                  <p className="sale-no-clients">
                    {t("sales.new.client.none")} <Link to="/app/clients">{t("sales.new.client.goToClients")}</Link>
                  </p>
                ) : (
                  <>
                    <div className="sale-client-controls">
                      <Field
                        id="sale-client-search"
                        label={t("sales.new.client.searchPlaceholder")}
                        className="ui-field--visually-hidden-label"
                        type="search"
                        autoComplete="off"
                        placeholder={t("sales.new.client.searchPlaceholder")}
                        value={clientQuery}
                        onChange={(event) => setClientQuery(event.target.value)}
                      />
                      <Field
                        as="select"
                        id="sale-client"
                        label={t("sales.new.client.label")}
                        required
                        error={fieldErrors.client_id}
                        aria-label={t("sales.new.client.selectLabel")}
                        value={selectedClientId}
                        onChange={(event) => {
                          setSelectedClientId(event.target.value);
                          setFieldErrors((current) => ({ ...current, client_id: undefined }));
                        }}
                      >
                        <option value="">{t("sales.new.client.selectPlaceholder")}</option>
                        {filteredClients.map((client) => (
                          <option value={client.id} key={client.id}>{client.nom}</option>
                        ))}
                      </Field>
                    </div>
                    {filteredClients.length === 0 && clientQuery && (
                      <span className="products-field-error">{t("sales.new.client.noResults")}</span>
                    )}
                    <button className="sale-new-client" type="button" onClick={() => setClientDialogOpen(true)}>
                      <Plus size={15} aria-hidden="true" />{t("sales.new.client.new")}
                    </button>
                  </>
                )}
              </div>
              <div className="sale-date-field">
                <Field
                  id="sale-date"
                  type="date"
                  label={t("sales.new.date.label")}
                  required
                  value={date}
                  error={fieldErrors.date_vente}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setFieldErrors((current) => ({ ...current, date_vente: undefined }));
                  }}
                />
              </div>
            </div>

            <div className="sale-cart-lines" aria-live="polite">
              {cart.length === 0 ? (
                <div className="sale-cart-empty">
                  <ShoppingCart size={23} aria-hidden="true" />
                  <p>{t("sales.new.cart.empty")}</p>
                </div>
              ) : cart.map(({ product, quantity }) => {
                const stock = getProductStock(product);
                const subtotal = Number(product.prix) * quantity;
                return (
                  <article className="sale-cart-line" key={product.id}>
                    <div className="sale-cart-line-header">
                      <div>
                        <h3>{product.nom}</h3>
                        <span>{formatCurrency(Number(product.prix), language)} {t("sales.new.cart.unitPrice")}</span>
                      </div>
                      <button
                        className="product-icon-action product-icon-danger"
                        type="button"
                        aria-label={t("sales.new.cart.remove", { name: product.nom })}
                        onClick={() => removeProduct(product.id)}
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="sale-cart-line-footer">
                      <div className="sale-quantity-control">
                        <button
                          className="product-icon-action"
                          type="button"
                          aria-label={t("sales.new.cart.decrease", { name: product.nom })}
                          disabled={quantity <= 1}
                          onClick={() => changeQuantity(product.id, quantity - 1)}
                        >
                          <Minus size={16} aria-hidden="true" />
                        </button>
                        <Field
                          className="sale-quantity-field ui-field--visually-hidden-label"
                          label={t("sales.new.cart.quantity", { name: product.nom })}
                          type="number"
                          min="1"
                          max={stock}
                          step="1"
                          inputMode="numeric"
                          value={quantity}
                          onChange={(event) => changeQuantity(product.id, event.target.value)}
                        />
                        <button
                          className="product-icon-action"
                          type="button"
                          aria-label={t("sales.new.cart.increase", { name: product.nom })}
                          disabled={quantity >= stock}
                          onClick={() => changeQuantity(product.id, quantity + 1)}
                        >
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      </div>
                      <span className="sale-line-stock">{t("sales.new.cart.availableStock", { stock })}</span>
                      <strong>{formatCurrency(subtotal, language)}</strong>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="sale-total">
              <div className="sale-total-heading">
                <strong>{t("sales.new.total.label")}</strong>
                <strong>{formatCurrency(estimatedTotal, language)}</strong>
              </div>
              <p>{t("sales.new.total.note")}</p>
            </div>

            <div className="sale-submit-desktop">
              <button className="product-button product-button-primary" type="submit" disabled={!canSubmit}>
                {submitting ? t("sales.new.actions.sending") : t("sales.new.actions.submit")}
              </button>
            </div>
          </aside>

          <div className="sale-mobile-submit">
            <div>
              <span>{t("sales.new.total.label")}</span>
              <strong>{formatCurrency(estimatedTotal, language)}</strong>
            </div>
            <button className="product-button product-button-primary" type="submit" disabled={!canSubmit}>
              {submitting ? t("sales.new.actions.sending") : t("sales.new.actions.submit")}
            </button>
          </div>
        </form>
      )}

      {clientDialogOpen && (
        <ClientFormDialog
          client={null}
          busy={false}
          onClose={() => setClientDialogOpen(false)}
          onSave={saveNewClient}
        />
      )}
    </div>
  );
}

export default NouvelleVentePage;
