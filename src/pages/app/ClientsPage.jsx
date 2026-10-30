import { useEffect, useState } from "react";
import { CircleAlert, Plus, Search } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { createClient, deleteClient, updateClient } from "../../api/clients";
import ClientFormDialog from "../../components/clients/ClientFormDialog";
import ClientsTable from "../../components/clients/ClientsTable";
import ConfirmDialog from "../../components/produits/ConfirmDialog";
import ProductsSkeleton from "../../components/produits/ProductsSkeleton";
import { useLanguage } from "../../context/useLanguage";
import useClients from "../../hooks/useClients";
import "./ClientsPage.css";
import "./ProduitsPage.css";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? fallback;
}

function ClientsPage() {
  const { language, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const committedSearch = searchParams.get("search") ?? "";
  const [searchState, setSearchState] = useState({
    urlValue: committedSearch,
    draft: committedSearch,
  });
  const searchDraft = searchState.urlValue === committedSearch ? searchState.draft : committedSearch;
  const search = committedSearch;
  const [dialog, setDialog] = useState(null);
  const [mutating, setMutating] = useState(false);
  const clients = useClients(search ? { search } : {});

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

  async function saveClient(payload) {
    setMutating(true);
    try {
      if (dialog.client) await updateClient(dialog.client.id, payload);
      else await createClient(payload);
      toast.success(t(dialog.client ? "clients.toast.updated" : "clients.toast.created"));
      setDialog(null);
      await clients.reload();
    } finally {
      setMutating(false);
    }
  }

  async function removeClient() {
    if (!dialog?.client) return;
    setMutating(true);
    try {
      await deleteClient(dialog.client.id);
      toast.success(t("clients.toast.deleted"));
      setDialog(null);
      await clients.reload();
    } finally {
      setMutating(false);
    }
  }

  return (
    <div className="clients-page">
      <Toaster position="top-right" toastOptions={{ duration: 2800 }} />
      <header className="products-page-header">
        <div>
          <h1>{t("clients.title")}</h1>
          <p>{t("clients.description")}</p>
        </div>
        <div className="products-header-actions">
          <button
            className="product-button product-button-primary"
            type="button"
            onClick={() => setDialog({ type: "form", client: null })}
          >
            <Plus size={17} aria-hidden="true" />{t("clients.actions.new")}
          </button>
        </div>
      </header>

      <section className="products-filters" aria-label={t("clients.search.label")}>
        <label className="products-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">{t("clients.search.label")}</span>
          <input
            type="search"
            value={searchDraft}
            placeholder={t("clients.search.placeholder")}
            onChange={(event) => setSearchState({
              urlValue: committedSearch,
              draft: event.target.value,
            })}
          />
        </label>
      </section>

      <section className="products-data-panel" aria-live="polite">
        {clients.error ? (
          <div className="products-state">
            <CircleAlert className="products-state-error" size={26} aria-hidden="true" />
            <h2>{t("clients.states.loadErrorTitle")}</h2>
            <p>{getErrorMessage(clients.error, t("clients.states.loadError"))}</p>
            <button className="product-button product-button-primary" type="button" onClick={clients.reload}>
              {t("clients.actions.retry")}
            </button>
          </div>
        ) : clients.loading ? (
          <ProductsSkeleton />
        ) : clients.data.length === 0 ? (
          <div className="products-state">
            <h2>{t(search ? "clients.states.noResultsTitle" : "clients.states.emptyTitle")}</h2>
            <p>{t(search ? "clients.states.noResults" : "clients.states.empty")}</p>
            {!search && (
              <button
                className="product-button product-button-primary"
                type="button"
                onClick={() => setDialog({ type: "form", client: null })}
              >
                {t("clients.actions.new")}
              </button>
            )}
          </div>
        ) : (
          <ClientsTable
            clients={clients.data}
            language={language}
            onEdit={(client) => setDialog({ type: "form", client })}
            onDelete={(client) => setDialog({ type: "confirm", client })}
          />
        )}
      </section>

      {dialog?.type === "form" && (
        <ClientFormDialog
          client={dialog.client}
          busy={mutating}
          onClose={() => setDialog(null)}
          onSave={saveClient}
        />
      )}
      {dialog?.type === "confirm" && (
        <ConfirmDialog
          title={t("clients.confirmDelete.title")}
          message={t("clients.confirmDelete.message", { name: dialog.client.nom })}
          confirmLabel={t("clients.actions.delete")}
          errorFallbackKey="clients.errors.delete"
          errorSuggestion={t("clients.deleteConflictSuggestion")}
          busy={mutating}
          onClose={() => setDialog(null)}
          onConfirm={removeClient}
        />
      )}
    </div>
  );
}

export default ClientsPage;
