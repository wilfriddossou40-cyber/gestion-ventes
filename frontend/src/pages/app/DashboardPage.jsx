import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CalendarDays,
  CircleAlert,
  RotateCw,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import ChartCard from "../../components/dashboard/ChartCard";
import Avatar from "../../components/ui/Avatar";
import ListPage from "../../components/ui/ListPage";
import StatCard from "../../components/ui/StatCard";
import { useLanguage } from "../../context/useLanguage";
import useDashboard from "../../hooks/useDashboard";
import { formatCurrency, formatDateOnly } from "../../lib/format";
import { normalizeApiError } from "../../lib/apiErrors";
import "./DashboardPage.css";

const locales = { en: "en-US", fr: "fr-FR" };
const dateFnsLocales = { en: enUS, fr };
const categoryColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

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
    maximumFractionDigits: 1,
  }).format(value / 100);
}

function formatDay(value, language) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(locales[language] ?? locales.fr, {
    day: "numeric",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

function DashboardError({ error, onRetry, t }) {
  return (
    <div className="dashboard-error" role="alert">
      <CircleAlert size={20} aria-hidden="true" />
      <div>
        <strong>{t("app.dashboard.errorTitle")}</strong>
        <p>{normalizeApiError(error, t).message}</p>
      </div>
      <button className="dashboard-retry" type="button" onClick={onRetry}>
        <RotateCw size={15} aria-hidden="true" />
        {t("app.dashboard.retry")}
      </button>
    </div>
  );
}

function ChartTooltip({ active, payload, label, language, t }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="dashboard-tooltip">
      <span>{formatDay(label, language)}</span>
      <strong>{formatCurrency(Number(payload[0].value), language)}</strong>
      <small>{t("app.dashboard.chart.revenue")}</small>
    </div>
  );
}

function DashboardPage() {
  const { language, t } = useLanguage();
  const { data, loading, error, reload } = useDashboard();
  const [period, setPeriod] = useState(30);
  const [productRanking, setProductRanking] = useState("quantity");

  const dailySales = useMemo(() => (
    data ? data.ventes_par_jour.map((item) => ({
      ...item,
      jour: String(item.jour).slice(0, 10),
      total: Number(item.total),
    })) : []
  ), [data]);
  const periodSales = dailySales.slice(-period);
  const hasPeriodSales = periodSales.some((item) => item.total > 0);
  const sparklineSales = dailySales.slice(-7);
  const topProducts = useMemo(() => (
    data ? data.top_produits.slice(0, 5).map((product) => ({
      ...product,
      quantity: Number(product.total_vendu),
    })) : []
  ), [data]);
  const topProductsByRevenue = useMemo(() => (
    data ? data.top_produits_par_chiffre_affaires.slice(0, 5).map((product) => ({
      ...product,
      revenue: Number(product.chiffre_affaires),
    })) : []
  ), [data]);
  const categories = useMemo(() => (
    data ? data.ventes_par_categorie.map((category, index) => ({
      ...category,
      chiffre_affaires: Number(category.chiffre_affaires),
      color: categoryColors[index % categoryColors.length],
    })) : []
  ), [data]);
  const totalCategoryRevenue = categories.reduce(
    (total, category) => total + category.chiffre_affaires,
    0,
  );
  const rankedProducts = productRanking === "quantity" ? topProducts : topProductsByRevenue;
  const maxProductValue = Math.max(
    ...rankedProducts.map((product) => (
      productRanking === "quantity" ? product.quantity : product.revenue
    )),
    1,
  );
  const variationRevenue = data?.variation_chiffre_affaires ?? null;
  const variationSales = data?.variation_nombre_ventes ?? null;
  const lowStockCount = Number(data?.produits_stock_faible);
  const productCount = Number(data?.nombre_produits);
  const lowStockLevel = productCount > 0
    ? Math.min((lowStockCount / productCount) * 100, 100)
    : 0;
  const recentSales = data ? data.dernieres_ventes.slice(0, 5) : [];
  const dayLocale = dateFnsLocales[language] ?? dateFnsLocales.fr;

  if (error) {
    return (
      <div className="app-page dashboard-page">
        <DashboardError error={error} onRetry={reload} t={t} />
      </div>
    );
  }

  return (
    <ListPage
      card={false}
      className="app-page dashboard-page"
      headerClassName="dashboard-header"
      eyebrow={t("app.dashboard.headerEyebrow")}
      title={t("app.pages.dashboard.title")}
      description={(
        <>
          <CalendarDays size={15} aria-hidden="true" />
          {data ? formatDateOnly(dailySales.at(-1)?.jour, language) : <span className="dashboard-date-skeleton" />}
        </>
      )}
      actions={
        <div className="dashboard-period" role="group" aria-label={t("app.dashboard.periodLabel")}>
          {[7, 30].map((days) => (
            <button
              aria-pressed={period === days}
              className={period === days ? "is-active" : ""}
              key={days}
              onClick={() => setPeriod(days)}
              type="button"
            >
              {t(`app.dashboard.period${days}`)}
            </button>
          ))}
        </div>
      }
    >

      <section className="dashboard-stat-grid" aria-label={t("app.dashboard.overviewTitle")}>
        <StatCard
          icon={Wallet}
          label={t("app.dashboard.kpi.revenue")}
          loading={loading}
          sparkline={sparklineSales}
          trend={variationRevenue}
          trendLabel={t("app.dashboard.variation", {
            variation: variationRevenue === null ? "" : formatVariation(variationRevenue, language),
          })}
          value={data ? formatCurrency(Number(data.chiffre_affaires), language) : ""}
          valueLabel={t("app.dashboard.kpi.revenue")}
          variant="revenue"
        />
        <StatCard
          icon={ShoppingCart}
          label={t("app.dashboard.kpi.sales")}
          loading={loading}
          trend={variationSales}
          trendLabel={t("app.dashboard.variation", {
            variation: variationSales === null ? "" : formatVariation(variationSales, language),
          })}
          value={data ? new Intl.NumberFormat(locales[language] ?? locales.fr).format(Number(data.nombre_ventes)) : ""}
          valueLabel={t("app.dashboard.kpi.sales")}
        />
        <StatCard
          icon={Users}
          label={t("app.dashboard.kpi.clients")}
          loading={loading}
          value={data ? new Intl.NumberFormat(locales[language] ?? locales.fr).format(Number(data.nombre_clients)) : ""}
          valueLabel={t("app.dashboard.kpi.clients")}
        />
        <StatCard
          icon={Boxes}
          label={t("app.dashboard.kpi.stockValue")}
          loading={loading}
          value={data ? formatCurrency(Number(data.valeur_stock), language) : ""}
          valueLabel={t("app.dashboard.kpi.stockValue")}
          variant="stock"
        />
      </section>

      <section className="dashboard-chart-grid" aria-label={t("app.dashboard.chartsTitle")}>
        <ChartCard
          className="dashboard-revenue-card"
          description={t("app.dashboard.chart.description", { days: String(period) })}
          loading={loading}
          title={t("app.dashboard.chart.title")}
        >
          {!hasPeriodSales ? (
            <div className="dashboard-empty-chart">{t("app.dashboard.chart.empty")}</div>
          ) : (
            <div
              aria-label={t("app.dashboard.chart.accessibleLabel")}
              className="dashboard-area-chart"
              role="img"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={periodSales} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardRevenueFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.015} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="jour"
                    minTickGap={24}
                    tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
                    tickFormatter={(value) => formatDay(value, language)}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fill: "var(--color-text-secondary)", fontSize: 11 }}
                    tickFormatter={(value) => formatCompactAmount(value, language)}
                    tickLine={false}
                    width={58}
                  />
                  <Tooltip
                    content={<ChartTooltip language={language} t={t} />}
                    cursor={{ stroke: "var(--chart-1)", strokeDasharray: "4 4" }}
                  />
                  <Area
                    activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 3 }}
                    dataKey="total"
                    fill="url(#dashboardRevenueFill)"
                    isAnimationActive={false}
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard
          className="dashboard-category-card"
          description={t("app.dashboard.category.description")}
          loading={loading}
          title={t("app.dashboard.category.title")}
        >
          {categories.length === 0 || totalCategoryRevenue === 0 ? (
            <div className="dashboard-empty-chart">{t("app.dashboard.category.empty")}</div>
          ) : (
            <>
              <div
                aria-label={t("app.dashboard.category.title")}
                className="dashboard-donut-wrap"
                role="img"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories.filter((category) => category.chiffre_affaires > 0)}
                      dataKey="chiffre_affaires"
                      innerRadius="69%"
                      isAnimationActive={false}
                      outerRadius="92%"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {categories.filter((category) => category.chiffre_affaires > 0).map((category) => (
                        <Cell key={category.id} fill={category.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value), language)}
                      contentStyle={{
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        backgroundColor: "var(--surface)",
                        color: "var(--text)",
                        boxShadow: "var(--color-shadow-popover)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dashboard-donut-total">
                  <span>{t("app.dashboard.category.total")}</span>
                  <strong>{formatCurrency(totalCategoryRevenue, language)}</strong>
                </div>
              </div>
              <ul className="dashboard-category-legend">
                {categories.filter((category) => category.chiffre_affaires > 0).map((category) => (
                  <li key={category.id}>
                    <span className="dashboard-legend-name">
                      <i style={{ backgroundColor: category.color }} />
                      {category.nom}
                    </span>
                    <strong>
                      {new Intl.NumberFormat(locales[language] ?? locales.fr, {
                        maximumFractionDigits: 1,
                      }).format((category.chiffre_affaires / totalCategoryRevenue) * 100)}%
                    </strong>
                  </li>
                ))}
              </ul>
            </>
          )}
        </ChartCard>
      </section>

      <section className="dashboard-bottom-grid" aria-label={t("app.dashboard.activityTitle")}>
        <ChartCard
          description={t("app.dashboard.topProducts.description")}
          loading={loading}
          title={t("app.dashboard.topProducts.title")}
        >
          <div className="dashboard-ranking-switch" role="group" aria-label={t("app.dashboard.topProducts.rankingLabel")}>
            {["quantity", "revenue"].map((ranking) => (
              <button
                aria-pressed={productRanking === ranking}
                className={productRanking === ranking ? "is-active" : ""}
                key={ranking}
                onClick={() => setProductRanking(ranking)}
                type="button"
              >
                {t(`app.dashboard.topProducts.by${ranking === "quantity" ? "Quantity" : "Revenue"}`)}
              </button>
            ))}
          </div>
          {rankedProducts.length === 0 ? (
            <div className="dashboard-empty-list">{t("app.dashboard.topProducts.empty")}</div>
          ) : (
            <ol className="dashboard-top-products">
              {rankedProducts.map((product, index) => {
                const value = productRanking === "quantity" ? product.quantity : product.revenue;

                return (
                <li key={product.id}>
                  <span className="dashboard-product-rank">{String(index + 1).padStart(2, "0")}</span>
                  <div className="dashboard-product-detail">
                    <div className="dashboard-product-label">
                      <strong>{product.nom}</strong>
                      <span>
                        {productRanking === "quantity"
                          ? t("app.dashboard.topProducts.sold", { count: String(value) })
                          : formatCurrency(value, language)}
                      </span>
                    </div>
                    <div className="dashboard-progress-track">
                      <span style={{ width: `${(value / maxProductValue) * 100}%` }} />
                    </div>
                  </div>
                </li>
                );
              })}
            </ol>
          )}
        </ChartCard>

        <ChartCard
          description={t("app.dashboard.alertDescription")}
          loading={loading}
          title={t("app.dashboard.alertTitle")}
        >
          <div className="dashboard-alert-summary">
            <div className="dashboard-alert-count">
              <span className="dashboard-alert-icon"><AlertTriangle size={17} aria-hidden="true" /></span>
              <strong>{data ? lowStockCount : ""}</strong>
              <span>{t("app.dashboard.alertCountLabel")}</span>
            </div>
            {lowStockCount === 0 ? (
              <p className="dashboard-alert-ok">{t("app.dashboard.noAlerts")}</p>
            ) : (
              <>
                <div
                  aria-label={t("app.dashboard.alertProgress", { percent: String(Math.round(lowStockLevel)) })}
                  className="dashboard-alert-track"
                  role="img"
                >
                  <span style={{ width: `${lowStockLevel}%` }} />
                </div>
                <p className="dashboard-alert-caption">
                  {t("app.dashboard.alertProgress", { percent: String(Math.round(lowStockLevel)) })}
                </p>
              </>
            )}
            <Link className="dashboard-products-link" to="/app/produits">
              {t("app.dashboard.alertLink")}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </ChartCard>

        <ChartCard
          description={t("app.dashboard.recent.description")}
          loading={loading}
          title={t("app.dashboard.recent.title")}
        >
          {recentSales.length === 0 ? (
            <div className="dashboard-empty-list">{t("app.dashboard.recent.empty")}</div>
          ) : (
            <ul className="dashboard-recent-sales">
              {recentSales.map((sale) => {
                const customerName = sale.client?.nom ?? t("app.dashboard.unknownClient");

                return (
                  <li key={sale.id}>
                    <Avatar className="dashboard-sale-avatar" name={customerName} aria-hidden="true" />
                    <span className="dashboard-sale-main">
                      <strong>{customerName}</strong>
                      <small>
                        {formatDistanceToNow(new Date(sale.date_vente), {
                          addSuffix: true,
                          locale: dayLocale,
                        })}
                      </small>
                    </span>
                    <strong className="dashboard-sale-amount">
                      {formatCurrency(Number(sale.montant_total), language)}
                    </strong>
                  </li>
                );
              })}
            </ul>
          )}
        </ChartCard>
      </section>
    </ListPage>
  );
}

export default DashboardPage;
