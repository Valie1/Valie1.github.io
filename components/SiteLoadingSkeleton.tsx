import Skeleton from "@/components/Skeleton";

const mediaCards = Array.from({ length: 6 });
const reviewCards = Array.from({ length: 3 });
const softwareCards = Array.from({ length: 3 });

export default function SiteLoadingSkeleton() {
  return (
    <main className="site-loading-skeleton" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading VALIE portfolio</span>

      <section className="site-loading-skeleton__hero" aria-hidden="true">
        <div className="site-loading-skeleton__hero-lane is-left">
          {mediaCards.slice(0, 4).map((_, index) => (
            <Skeleton key={`hero-left-${index}`} className="site-loading-skeleton__hero-card is-wide" />
          ))}
        </div>
        <div className="site-loading-skeleton__hero-copy">
          <Skeleton className="site-loading-skeleton__kicker" />
          <Skeleton className="site-loading-skeleton__headline" />
          <Skeleton className="site-loading-skeleton__headline is-red" />
          <Skeleton className="site-loading-skeleton__headline" />
          <Skeleton className="site-loading-skeleton__line" />
          <Skeleton className="site-loading-skeleton__line is-short" />
          <div className="site-loading-skeleton__actions">
            <Skeleton className="site-loading-skeleton__button" />
            <Skeleton className="site-loading-skeleton__button is-quiet" />
          </div>
        </div>
        <div className="site-loading-skeleton__hero-lane is-right">
          {mediaCards.slice(0, 4).map((_, index) => (
            <Skeleton key={`hero-right-${index}`} className="site-loading-skeleton__hero-card is-tall" />
          ))}
        </div>
      </section>

      <section className="site-loading-skeleton__section site-loading-skeleton__about" aria-hidden="true">
        <div className="site-loading-skeleton__section-head">
          <Skeleton className="site-loading-skeleton__eyebrow" />
          <Skeleton className="site-loading-skeleton__section-title" />
        </div>
        <div className="site-loading-skeleton__about-grid">
          <Skeleton className="site-loading-skeleton__about-panel" />
          <div className="site-loading-skeleton__software-panel">
            {softwareCards.map((_, index) => (
              <div className="site-loading-skeleton__software-card" key={`software-${index}`}>
                <Skeleton className="site-loading-skeleton__software-icon" />
                <Skeleton className="site-loading-skeleton__software-name" />
                <Skeleton className="site-loading-skeleton__line" />
                <Skeleton className="site-loading-skeleton__line is-short" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-loading-skeleton__section site-loading-skeleton__work" aria-hidden="true">
        <div className="site-loading-skeleton__section-head">
          <Skeleton className="site-loading-skeleton__eyebrow" />
          <Skeleton className="site-loading-skeleton__section-title is-medium" />
        </div>
        <div className="site-loading-skeleton__tabs">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
        <div className="site-loading-skeleton__work-grid">
          {mediaCards.map((_, index) => (
            <Skeleton key={`work-${index}`} className="site-loading-skeleton__work-card" />
          ))}
        </div>
      </section>

      <section className="site-loading-skeleton__section site-loading-skeleton__reviews" aria-hidden="true">
        <div className="site-loading-skeleton__section-head">
          <Skeleton className="site-loading-skeleton__eyebrow" />
          <Skeleton className="site-loading-skeleton__section-title is-medium" />
        </div>
        <div className="site-loading-skeleton__review-grid">
          {reviewCards.map((_, index) => (
            <div className="site-loading-skeleton__review-card" key={`review-${index}`}>
              <Skeleton className="site-loading-skeleton__avatar" />
              <div>
                <Skeleton className="site-loading-skeleton__review-name" />
                <Skeleton className="site-loading-skeleton__line" />
                <Skeleton className="site-loading-skeleton__line is-short" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="site-loading-skeleton__section site-loading-skeleton__contact" aria-hidden="true">
        <div className="site-loading-skeleton__contact-grid">
          <div className="site-loading-skeleton__contact-copy">
            <Skeleton className="site-loading-skeleton__eyebrow" />
            <Skeleton className="site-loading-skeleton__contact-title" />
            <Skeleton className="site-loading-skeleton__contact-title is-short" />
            <div className="site-loading-skeleton__profile-row">
              <Skeleton className="site-loading-skeleton__profile-avatar" />
              <div>
                <Skeleton className="site-loading-skeleton__profile-name" />
                <Skeleton className="site-loading-skeleton__profile-role" />
              </div>
            </div>
          </div>
          <div className="site-loading-skeleton__contact-actions">
            <Skeleton className="site-loading-skeleton__contact-heading" />
            <div className="site-loading-skeleton__contact-cards">
              <Skeleton className="site-loading-skeleton__contact-card" />
              <Skeleton className="site-loading-skeleton__contact-card" />
            </div>
          </div>
        </div>
      </section>

      <footer className="site-loading-skeleton__footer" aria-hidden="true">
        <div>
          <Skeleton className="site-loading-skeleton__footer-wordmark" />
          <Skeleton className="site-loading-skeleton__footer-copy" />
          <Skeleton className="site-loading-skeleton__footer-copy is-short" />
        </div>
        <div className="site-loading-skeleton__footer-bottom">
          <Skeleton className="site-loading-skeleton__footer-meta" />
          <div className="site-loading-skeleton__footer-links">
            <Skeleton /><Skeleton /><Skeleton /><Skeleton />
          </div>
        </div>
      </footer>
    </main>
  );
}
