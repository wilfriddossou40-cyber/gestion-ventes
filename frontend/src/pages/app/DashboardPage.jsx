import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  CircleDollarSign,
  Package,
  RotateCw,
  ShoppingBag,
  TriangleAlert,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import ProductsSkeleton from "../../components/produits/ProductsSkeleton";
import StockBadge from "../../components/produits/StockBadge";
import { useLanguage } from "../../context/useLanguage";
import useAlertesStock from "../../hooks/useAlertesStock";
import useDashboard from "../../hooks/useDashboard";
import useVentes from "../../hooks/useVentes";
import { formatCurrency, formatDateOnly } from "../../lib/format";
import { normalizeApiError } from "../../lib/apiErrors";
import "./DashboardPage.css";

const locales = { en: "en-US", fr: "fr-FR" };

function toAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function getMonthLabel(value, language) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(locales[language] ?? locales.fr, {
    month: "short",
    year: "2-digit",
  }).format(new Date(year, month - 1, 1));
}

function formatCompactAmount(value, language) {
  return new Intl.NumberFormat(locales[language] ?? locales.fr, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatVariation(value, language) {
  return new Intl.NumberFormat(locales[language] ?? locales.fr, {
    style: "percent",
    signDisplay: "always",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function BlockError({ error, onRetry, t }) {
  return (
    <div className="dashboard-error" role="alert">
      <CircleAlert size={20} aria-hidden="true" />
      <div>
        <strong>{t("app.dashboard.errorTitle")}</strong>
        <p>{normalizeApiError(error, t).message}</p>
      </div>
      <button className="product-button product-button-secondary" type="button" onClick={onRetry}>
        <RotateCw size={15} aria-hidden="true" />
        {t("app.dashboard.retry")}
      </button>
    </div>
  );
}

function DashboardPage() {
  const { language, t } = useLanguage();
  const alerts = useAlertesStock();
  const dashboard = useDashboard();
  const sales = useVentes({});

  const monthlySales = useMemo(() => (
    (dashboard.data?.ventes_par_mois ?? [])
      .map((item) => ({
        ...item,
        total: toAmount(item.total),
        monthLabel: getMonthLabel(item.mois, language),
      }))
      .sort((left, right) => left.mois.localeCompare(right.mois))
  ), [dashboard.data?.ventes_par_mois, language]);
  const chartSales = monthlySales.slice(-6);
  const recentSales = useMemo(() => (
    sales.data
      .slice()
      .sort((left, right) => {
        const dateDifference = Date.parse(right.date_vente) - Date.parse(left.date_vente);
        if (dateDifference !== 0) return dateDifference;
        return Number(right.id) - Number(left.id);
      })
      .slice(0, 5)
      .map((sale) => ({ ...sale, amount: toAmount(sale.montant_total) }))
  ), [sales.data]);
  const topProducts = useMemo(() => (
    (dashboard.data?.top_produits ?? [])
      .map((product) => ({ ...product, sold: Number(product.total_vendu) || 0 }))
      .sort((left, right) => right.sold - left.sold)
  ), [dashboard.data?.top_produits]);
  const maxTopProductSold = Math.max(...topProducts.map((product) => product.sold), 1);

  const currentMonth = monthlySales.at(-1);
  const previousMonth = monthlySales.at(-2);
  const variation = previousMonth && previousMonth.total !== 0
    ? ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100
    : null;
  const lowStockCount = Number(dashboard.data?.produits_stock_faible) || 0;
  const hasEmptyDatabase = dashboard.data
    && Number(dashboard.data.nombre_produits) === 0
    && Number(dashboard.data.nombre_ventes) === 0;

  return (
    <div className="app-page dashboard-page">
      <header className="products-page-header dashboard-header">
        <div>
          <h1>{t("app.pages.dashboard.title")}</h1>
          <p>{t("app.pages.dashboard.description")}</p>
        </div>
      </header>

      <section className="dashboard-section dashboard-action-section" aria-labelledby="dashboard-actions-title">
        <div className="dashboard-section-heading">
          <div>
            <h2 id="dashboard-actions-title">{t("app.dashboard.actionTitle")}</h2>
            <p>{t("app.dashboard.actionDescription")}</p>
          </div>
          <Link className="dashboard-text-link" to="/app/stock">
            {t("app.dashboard.viewStock")}
          </Link>
        </div>
        {alerts.error ? (
          <BlockError
            error={alerts.error}
            onRetry={alerts.reload}
            t={t}
          />
        ) : alerts.loading ? (
          <div className="dashboard-panel dashboard-skeleton"><ProductsSkeleton /></div>
        ) : alerts.data.length === 0 ? (
          <div className="dashboard-positive-state">
            <CircleCheck size={20} aria-hidden="true" />
            <p>{t("app.dashboard.noAlerts")}</p>
          </div>
        ) : (
          <div className="dashboard-alert-list">
            {alerts.data.slice(0, 5).map((product) => (
              <article className="dashboard-alert-item" key={product.id}>
                <div className="dashboard-alert-product">
                  <strong>{product.nom}</strong>
                  {product.categorie?.nom && <span>{product.categorie.nom}</span>}
                </div>
                <span className="dashboard-alert-stock">
                  {t("app.dashboard.stockValue", { stock: String(product.quantite_stock) })}
                  <span>{t("app.dashboard.thresholdValue", { threshold: String(product.seuil_alerte) })}</span>
                </span>
                <StockBadge produit={product} showLevel={false} />
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section" aria-labelledby="dashboard-kpi-title">
        <div className="dashboard-section-heading">
          <div>
            <h2 id="dashboard-kpi-title">{t("app.dashboard.overviewTitle")}</h2>
            <p>{t("app.dashboard.overviewDescription")}</p>
          </div>
        </div>
        {dashboard.error ? (
          <BlockError
            error={dashboard.error}
            onRetry={dashboard.reload}
            t={t}
          />
        ) : dashboard.loading ? (
          <div className="dashboard-panel dashboard-skeleton"><ProductsSkeleton /></div>
        ) : (
          <>
            <div className="dashboard-kpi-grid">
              <article className="dashboard-kpi dashboard-kpi-revenue">
                <span className="dashboard-kpi-heading">
                  <span>{t("app.dashboard.kpi.revenue")}</span>
                  <span className="dashboard-kpi-icon"><CircleDollarSign size={19} aria-hidden="true" /></span>
                </span>
                <strong>{formatCurrency(toAmount(dashboard.data.chiffre_affaires), language)}</strong>
                {variation !== null && Number.isFinite(variation) && (
                  <span className={`dashboard-variation${variation < 0 ? " is-down" : ""}`}>
                    {variation < 0
                      ? <ArrowDownRight size={16} aria-hidden="true" />
                      : variation > 0
                        ? <ArrowUpRight size={16} aria-hidden="true" />
                        : <ArrowRight size={16} aria-hidden="true" />}
                    {t("app.dashboard.variation", { variation: formatVariation(variation, language) })}
                  </span>
                )}
              </article>
              <article className="dashboard-kpi">
                <span className="dashboard-kpi-heading">
                  <span>{t("app.dashboard.kpi.todaySales")}</span>
                  <span className="dashboard-kpi-icon"><ShoppingBag size={18} aria-hidden="true" /></span>
                </span>
                <strong>{Number(dashboard.data.ventes_aujourdhui) || 0}</strong>
                <small>{formatCurrency(toAmount(dashboard.data.ca_aujourdhui), language)}</small>
              </article>
              <Link className="dashboard-kpi dashboard-kpi-link" to="/app/stock">
                <span className="dashboard-kpi-heading">
                  <span>{t("app.dashboard.kpi.lowStock")}</span>
                  <span className="dashboard-kpi-icon"><TriangleAlert size={18} aria-hidden="true" /></span>
                </span>
                <strong>{lowStockCount}</strong>
                <small>{t("app.dashboard.viewStock")}</small>
              </Link>
              <article className="dashboard-kpi">
                <span className="dashboard-kpi-heading">
                  <span>{t("app.dashboard.kpi.products")}</span>
                  <span className="dashboard-kpi-icon"><Package size={18} aria-hidden="true" /></span>
                </span>
                <strong>{Number(dashboard.data.nombre_produits) || 0}</strong>
              </article>
              <article className="dashboard-kpi">
                <span className="dashboard-kpi-heading">
                  <span>{t("app.dashboard.kpi.clients")}</span>
                  <span className="dashboard-kpi-icon"><Users size={18} aria-hidden="true" /></span>
                </span>
                <strong>{Number(dashboard.data.nombre_clients) || 0}</strong>
              </article>
            </div>
            {hasEmptyDatabase && (
              <div className="dashboard-welcome">
                <div>
                  <h3>{t("app.dashboard.emptyTitle")}</h3>
                  <p>{t("app.dashboard.emptyDescription")}</p>
                </div>
                <div className="dashboard-welcome-links">
                  <Link to="/app/produits">{t("app.dashboard.addProducts")}</Link>
                  <Link to="/app/clients">{t("app.dashboard.addClients")}</Link>
                  <Link to="/app/ventes/nouvelle">{t("app.dashboard.startSale")}</Link>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {!dashboard.error && (
      <section className="dashboard-section" aria-labelledby="dashboard-chart-title">
        <div className="dashboard-section-heading">
          <div>
            <h2 id="dashboard-chart-title">{t("app.dashboard.chart.title")}</h2>
            <p>{t("app.dashboard.chart.description")}</p>
          </div>
        </div>
        {dashboard.loading ? (
          <div className="dashboard-panel dashboard-chart-skeleton"><ProductsSkeleton /></div>
        ) : chartSales.length === 0 ? (
          <div className="dashboard-panel dashboard-empty-chart">
            <p>{t("app.dashboard.chart.empty")}</p>
          </div>
        ) : (
          <div className="dashboard-panel dashboard-chart-panel">
            <div className="dashboard-chart" role="img" aria-label={t("app.dashboard.chart.accessibleLabel")}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSales} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="monthLabel"
                    tick={{ fill: "var(--muted)", fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                    minTickGap={12}
                  />
                  <YAxis
                    width={76}
                    tickFormatter={(value) => `${formatCompactAmount(value, language)} ${t("app.dashboard.currencyShort")}`}
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(toAmount(value), language), t("app.dashboard.chart.revenue")]}
                    contentStyle={{
                      border: "1px solid var(--border)",
                      borderRadius: 9,
                      backgroundColor: "var(--surface-raised)",
                      color: "var(--text)",
                    }}
                    labelStyle={{ color: "var(--text)", fontWeight: 700 }}
                    itemStyle={{ color: "var(--accent-ink)" }}
                    cursor={{ fill: "var(--accent-soft)" }}
                  />
                  <Bar dataKey="total" fill="var(--accent)" radius={[5, 5, 0, 0]} maxBarSize={54} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table className="dashboard-sr-only">
              <caption>{t("app.dashboard.chart.accessibleLabel")}</caption>
              <thead>
                <tr>
                  <th scope="col">{t("app.dashboard.chart.month")}</th>
                  <th scope="col">{t("app.dashboard.chart.revenue")}</th>
                  <th scope="col">{t("app.dashboard.chart.salesCount")}</th>
                </tr>
              </thead>
              <tbody>
                {chartSales.map((item) => (
                  <tr key={item.mois}>
                    <th scope="row">{item.monthLabel}</th>
                    <td>{formatCurrency(item.total, language)}</td>
                    <td>{Number(item.nombre) || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}

      <section
        className={`dashboard-section dashboard-lower-grid${dashboard.error ? " dashboard-lower-grid-single" : ""}`}
        aria-label={t("app.dashboard.activityTitle")}
      >
        {!dashboard.error && (
        <div>
          <div className="dashboard-section-heading">
            <div>
              <h2>{t("app.dashboard.topProducts.title")}</h2>
              <p>{t("app.dashboard.topProducts.description")}</p>
            </div>
          </div>
          {dashboard.loading ? (
            <div className="dashboard-panel dashboard-skeleton"><ProductsSkeleton /></div>
          ) : topProducts.length === 0 ? (
            <div className="dashboard-panel dashboard-empty-list"><p>{t("app.dashboard.topProducts.empty")}</p></div>
          ) : (
            <ol className="dashboard-panel dashboard-top-products">
              {topProducts.map((product, index) => (
                <li key={product.id}>
                  <span className="dashboard-rank">{index + 1}</span>
                  <div className="dashboard-top-product-info">
                    <strong>{product.nom}</strong>
                    <div
                      className="dashboard-progress-track"
                      role="img"
                      aria-label={t("app.dashboard.topProducts.barLabel", {
                        product: product.nom,
                        quantity: String(product.sold),
                      })}
                    >
                      <span style={{ width: `${(product.sold / maxTopProductSold) * 100}%` }} />
                    </div>
                  </div>
                  <span className="dashboard-sold-count">
                    {t("app.dashboard.topProducts.sold", { count: String(product.sold) })}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
        )}

        <div>
          <div className="dashboard-section-heading">
            <div>
              <h2>{t("app.dashboard.recent.title")}</h2>
              <p>{t("app.dashboard.recent.description")}</p>
            </div>
            <Link className="dashboard-text-link" to="/app/ventes">{t("app.dashboard.recent.viewAll")}</Link>
          </div>
          {sales.error ? (
            <BlockError
              error={sales.error}
              onRetry={sales.reload}
              t={t}
            />
          ) : sales.loading ? (
            <div className="dashboard-panel dashboard-skeleton"><ProductsSkeleton /></div>
          ) : recentSales.length === 0 ? (
            <div className="dashboard-panel dashboard-empty-list"><p>{t("app.dashboard.recent.empty")}</p></div>
          ) : (
            <ul className="dashboard-panel dashboard-recent-sales">
              {recentSales.map((sale) => (
                <li key={sale.id}>
                  <Link to="/app/ventes">
                    <span className="dashboard-sale-main">
                      <strong>{sale.client?.nom ?? t("app.dashboard.unknownClient")}</strong>
                      <small>{formatDateOnly(String(sale.date_vente).slice(0, 10), language)}</small>
                    </span>
                    <strong className="dashboard-sale-amount">{formatCurrency(sale.amount, language)}</strong>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
