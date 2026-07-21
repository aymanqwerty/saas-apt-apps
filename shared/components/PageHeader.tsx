export function PageHeader({
  description,
  children,
}: {
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {description ? (
        <p className="text-muted-foreground text-sm">{description}</p>
      ) : (
        <span />
      )}
      {children ? (
        <div className="flex items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
