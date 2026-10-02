type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export default function AdminPageHeader({
  eyebrow = "Dokuntag",
  title,
  description,
  actions
}: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            {eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            {title}
          </h1>

          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-wrap gap-3">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}