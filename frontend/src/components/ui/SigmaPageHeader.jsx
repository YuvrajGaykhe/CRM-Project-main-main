import Breadcrumb from "../Breadcrumb";

const SigmaPageHeader = ({
  title,
  subtitle,
  badge,
  breadcrumbItems = [],
  children,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumbItems} showBackButton={false} />
      )}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          {badge && (
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--sigma-accent)]">
              {badge}
            </p>
          )}
          {title && (
            <h1 className="mt-1 text-2xl font-medium text-white lg:text-3xl">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {children && (
          <div className="flex flex-wrap items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default SigmaPageHeader;
