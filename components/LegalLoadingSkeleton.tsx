import Skeleton from "@/components/Skeleton";

const sections = Array.from({ length: 5 });

export default function LegalLoadingSkeleton() {
  return (
    <main className="legal-loading-skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading policy page</span>
      <div className="legal-loading-skeleton__wrap" aria-hidden="true">
        <div className="legal-loading-skeleton__topbar">
          <Skeleton className="legal-loading-skeleton__back" />
          <Skeleton className="legal-loading-skeleton__doc-id" />
        </div>

        <div className="legal-loading-skeleton__hero">
          <div>
            <Skeleton className="legal-loading-skeleton__kicker" />
            <Skeleton className="legal-loading-skeleton__headline" />
            <Skeleton className="legal-loading-skeleton__headline is-accent" />
            <Skeleton className="legal-loading-skeleton__summary" />
            <Skeleton className="legal-loading-skeleton__summary is-short" />
          </div>
          <div className="legal-loading-skeleton__card">
            <Skeleton className="legal-loading-skeleton__card-icon" />
            <Skeleton className="legal-loading-skeleton__card-row" />
            <Skeleton className="legal-loading-skeleton__card-row" />
            <Skeleton className="legal-loading-skeleton__card-row" />
          </div>
        </div>

        <div className="legal-loading-skeleton__rule" />

        <div className="legal-loading-skeleton__layout">
          <aside className="legal-loading-skeleton__index">
            <Skeleton className="legal-loading-skeleton__index-label" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton className="legal-loading-skeleton__index-row" key={index} />
            ))}
          </aside>

          <div className="legal-loading-skeleton__sections">
            {sections.map((_, index) => (
              <section className="legal-loading-skeleton__section" key={index}>
                <Skeleton className="legal-loading-skeleton__section-title" />
                <div>
                  <Skeleton className="legal-loading-skeleton__line" />
                  <Skeleton className="legal-loading-skeleton__line" />
                  <Skeleton className="legal-loading-skeleton__line is-short" />
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
