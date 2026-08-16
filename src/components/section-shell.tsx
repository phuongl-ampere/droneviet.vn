import type { ReactNode } from "react";

type SectionShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: "light" | "dark";
  children: ReactNode;
};

export function SectionShell({
  eyebrow,
  title,
  description,
  tone = "light",
  children,
}: SectionShellProps) {
  const isDark = tone === "dark";

  return (
    <section
      className={
        isDark
          ? "relative overflow-hidden bg-[#10232A] py-24 text-white sm:py-32"
          : "bg-white py-24 text-[#172226] sm:py-32"
      }
    >
      {isDark ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(0,169,155,0.12),transparent_32%)]" />
      ) : null}
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="mb-14 grid gap-6 border-t border-current/12 pt-6 md:grid-cols-[0.72fr_1.28fr] md:gap-12">
          {eyebrow ? (
            <p
              className={
                isDark
                  ? "text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7DE0D7]"
                  : "text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500"
              }
            >
              {eyebrow}
            </p>
          ) : (
            <span />
          )}
          <div>
            <h2 className="display-type text-balance text-4xl font-medium leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              {title}
            </h2>
            {description ? (
              <p
                className={
                  isDark
                    ? "mt-6 max-w-2xl text-base leading-7 text-slate-300"
                    : "mt-6 max-w-2xl text-base leading-7 text-slate-600"
                }
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
