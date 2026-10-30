import { useEffect, useMemo, useState } from "react";
import { CircleAlert, Plus, RotateCcw, Search } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { deleteVente } from "../../api/ventes";
import VenteDetailDialog from "../../components/ventes/VenteDetailDialog";
import VentesTable from "../../components/ventes/VentesTable";
import ProductsSkeleton from "../../components/produits/ProductsSkeleton";
import { useLanguage } from "../../context/useLanguage";
import useClients from "../../hooks/useClients";
import useVentes from "../../hooks/useVentes";
import { formatCurrency } from "../../lib/format";
import "./ProduitsPage.css";
import "./VentesPage.css";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? fallback;
}

function VentesPage() {
  const { language, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const committedSearch = searchParams.get("search") ?? "";
  const [searchState, setSearchState] = useState({
    urlValue: committedSearch,
    draft: committedSearch,
  });
  const searchDraft = searchState.urlValue === committedSearch ? searchState.draft : committedSearch;
  const clientId = searchParams.get("client_id") ?? "";
  const dateStart = searchParams.get("date_debut") ?? "";
  const dateEnd = searchParams.get("date_fin") ?? "";
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [canceling, setCanceling] = useState(false);

  const params = useMemo(() => ({
    ...(committedSearch ? { search: committedSearch } : {}),
    ...(clientId ? { client_id: clientId } : {}),
    ...(dateStart ? { date_debut: dateStart } : {}),
    ...(dateEnd ? { date_fin: dateEnd } : {}),
  }), [clientId, committedSearch, dateEnd, dateStart]);
  const ventes = useVentes(params);
  const clients = useClients({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      const normalized = searchDraft.trim();
      if (normalized) next.set("search", normalized);
      else next.delete("search");
      if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchDraft, searchParams, setSearchParams]);

  useEffect(() => {
    if (!location.state?.successMessage) return;
    toast.success(location.state.successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  function resetFilters() {
    setSearchState({ urlValue: "", draft: "" });
    setSearchParams({});
  }

  async function retryLoading() {
    await Promise.all([ventes.reload(), clients.reload()]);
  }

  async function cancelSale(sale) {
    setCanceling(true);
    try {
      await deleteVente(sale.id);
      toast.success(t("sales.history.toast.cancelled", { id: sale.id }));
      setSelectedSaleId(null);
      await ventes.reload();
    } finally {
      setCanceling(false);
    }
  }

  const sortedVentes = useMemo(() => [...ventes.data].sort((a, b) => {
    const dateComparison = String(b.date_vente).slice(0, 10).localeCompare(String(a.date_vente).slice(0, 10));
    return dateComparison || Number(b.id) - Number(a.id);
  }), [ventes.data]);
  const selectedTotal = sortedVentes.reduce((total, sale) => total + Number(sale.montant_total), 0);
  const filtersActive = Boolean(committedSearch || clientId || dateStart || dateEnd);
  const loading = ventes.loading || clients.loading;
  const loadError = ventes.error || clients.error;

  return (
    <div className="sales-page">
      <Toaster position="top-right" toastOptions={{ duration: 2800 }} />
      <header className="products-page-header">
        <div>
          <h1>{t("app.pages.sales.title")}</h1>
          <p>{t("app.pages.sales.description")}</p>
        </div>
        <div className="products-header-actions">
          <Link className="product-button product-button-primary" to="/app/ventes/nouvelle">
            <Plus size={17} aria-hidden="true" />{t("sales.new.actions.newSale")}
          </Link>
        </div>
      </header>

      <section className="products-filters sales-filters" aria-label={t("sales.history.filters.label")}>
        <label className="products-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">{t("sales.history.filters.search")}</span>
          <input
            type="search"
            value={searchDraft}
            placeholder={t("sales.history.filters.searchPlaceholder")}
            onChange={(event) => setSearchState({
              urlValue: committedSearch,
              draft: event.target.value,
            })}
          />
        </label>
        <label className="sales-filter-field">
          <span>{t("sales.history.filters.client")}</span>
          <select
            value={clientId}
            onChange={(event) => updateFilter("client_id", event.target.value)}
            disabled={clients.loading || Boolean(clients.error)}
          >
            <option value="">{t("sales.history.filters.allClients")}</option>
            {clients.data.map((client) => (
              <option value={client.id} key={client.id}>{client.nom}</option>
            ))}
          </select>
        </label>
        <label className="sales-filter-field">
          <span>{t("sales.history.filters.from")}</span>
          <input
            type="date"
            value={dateStart}
            onChange={(event) => updateFilter("date_debut", event.target.value)}
          />
        </label>
        <label className="sales-filter-field">
          <span>{t("sales.history.filters.to")}</span>
          <input
            type="date"
            value={dateEnd}
            onChange={(event) => updateFilter("date_fin", event.target.value)}
          />
        </label>
        <button
          className="product-button product-button-secondary sales-reset-button"
          type="button"
          onClick={resetFilters}
          disabled={!filtersActive}
        >
          <RotateCcw size={15} aria-hidden="true" />{t("sales.history.filters.reset")}
        </button>
      </section>

      <section className="sales-selection-summary" aria-live="polite">
        <div>
          <span>{t("sales.history.summary.label")}</span>
          <strong>{t("sales.history.summary.count", { count: sortedVentes.length })}</strong>
        </div>
        <div>
          <span>{t("sales.history.summary.amount")}</span>
          <strong>{formatCurrency(selectedTotal, language)}</strong>
        </div>
        <small>{t("sales.history.summary.selection")}</small>
      </section>

      {loadError ? (
        <section className="products-data-panel">
          <div className="products-state">
            <CircleAlert className="products-state-error" size={26} aria-hidden="true" />
            <h2>{t("sales.history.states.loadErrorTitle")}</h2>
            <p>{getErrorMessage(loadError, t("sales.history.states.loadError"))}</p>
            <button className="product-button product-button-primary" type="button" onClick={retryLoading}>
              {t("sales.history.actions.retry")}
            </button>
          </div>
        </section>
      ) : loading ? (
        <section className="products-data-panel"><ProductsSkeleton /></section>
      ) : sortedVentes.length === 0 ? (
        <section className="products-data-panel">
          <div className="products-state">
            <h2>{t(filtersActive ? "sales.history.states.noResultsTitle" : "sales.history.states.emptyTitle")}</h2>
            <p>{t(filtersActive ? "sales.history.states.noResults" : "sales.history.states.empty")}</p>
            {filtersActive ? (
              <button className="product-button product-button-secondary" type="button" onClick={resetFilters}>
                {t("sales.history.filters.reset")}
              </button>
            ) : (
              <Link className="product-button product-button-primary" to="/app/ventes/nouvelle">
                <Plus size={16} aria-hidden="true" />{t("sales.new.actions.newSale")}
              </Link>
            )}
          </div>
        </section>
      ) : (
        <section className="products-data-panel">
          <VentesTable
            ventes={sortedVentes}
            language={language}
            onSelect={(sale) => setSelectedSaleId(sale.id)}
          />
        </section>
      )}

      {selectedSaleId !== null && (
        <VenteDetailDialog
          saleId={selectedSaleId}
          language={language}
          busy={canceling}
          onClose={() => setSelectedSaleId(null)}
          onCancelSale={cancelSale}
        />
      )}
    </div>
  );
}

export default VentesPage;
