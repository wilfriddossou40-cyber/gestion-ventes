import Card from "./Card";
import PageHeader from "./PageHeader";
import "./ListPage.css";

function ListPage({
  title,
  description,
  eyebrow,
  actions,
  toolbar,
  summary,
  beforeCard,
  children,
  className = "",
  headerClassName = "",
  card = true,
  toolbarLabel,
}) {
  return (
    <div className={`list-page mx-auto flex w-full max-w-[1280px] flex-col gap-6 ${className}`.trim()}>
      <PageHeader
        className={`list-page-header ${headerClassName}`.trim()}
        title={title}
        description={description}
        eyebrow={eyebrow}
        actions={actions}
      />
      {beforeCard}
      {card ? (
        <Card className="list-page-card">
          {toolbar && (
            <div
              className="list-page-toolbar flex flex-wrap items-center gap-3 p-4"
              {...(toolbarLabel ? { role: "region", "aria-label": toolbarLabel } : {})}
            >
                {toolbar}
            </div>
          )}
          {summary}
          {children}
        </Card>
      ) : (
        <>
          {toolbar && (
            <div
              className="list-page-toolbar flex flex-wrap items-center gap-3 p-4"
              {...(toolbarLabel ? { role: "region", "aria-label": toolbarLabel } : {})}
            >
            {toolbar}
            </div>
          )}
          {summary}
          {children}
        </>
      )}
    </div>
  );
}

export default ListPage;
