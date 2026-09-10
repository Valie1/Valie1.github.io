import { site } from "@/lib/content";









export default function OnePageFooter() {
  return (
    <footer className="valie-footer is-visible">
      <div className="valie-footer__inner">
        <div className="valie-footer__identity">
          <div className="valie-footer__mark" role="img" aria-label={`${site.name} logo`}>
            <svg
              className="valie-footer__wordmark footer-valie-static"
              viewBox="0 0 89 32"
              aria-hidden="true"
              preserveAspectRatio="xMinYMid meet"
            >
              <g className="footer-valie-static__draw">
                <text className="footer-valie-static__letter" x="0" y="25.7">V</text>
                <text className="footer-valie-static__letter" x="20.7" y="25.7">A</text>
                <text className="footer-valie-static__letter" x="41.3" y="25.7">L</text>
                <text className="footer-valie-static__letter" x="57.3" y="25.7">I</text>
                <text className="footer-valie-static__letter" x="67" y="25.7">E</text>
              </g>
              <text className="footer-valie-static__fill" x="0" y="25.7">VALIE</text>
              <g className="footer-valie-static__secret-map" aria-hidden="true">
                <rect className="footer-valie-static__secret-hit" x="0" y="0" width="20.7" height="32" data-valie-secret-letter="V" />
                <rect className="footer-valie-static__secret-hit" x="20.7" y="0" width="20.6" height="32" data-valie-secret-letter="A" />
                <rect className="footer-valie-static__secret-hit" x="41.3" y="0" width="16" height="32" data-valie-secret-letter="L" />
                <rect className="footer-valie-static__secret-hit" x="57.3" y="0" width="9.7" height="32" data-valie-secret-letter="I" />
                <rect className="footer-valie-static__secret-hit" x="67" y="0" width="22" height="32" data-valie-secret-letter="E" />
              </g>
            </svg>
          </div>

          <p className="valie-footer__description">
            Video editing and web design focused on clean visuals, smooth pacing, and memorable digital experiences.
          </p>
        </div>

        <div className="valie-footer__bottom">
          <span data-valie-secret-confirm>© {site.year} {site.name.toUpperCase()}. ALL RIGHTS RESERVED.</span>
          <nav className="valie-footer__legal" aria-label="Footer legal links">
            <a href="/privacy">PRIVACY</a>
            <a href="/cookies">COOKIES</a>
            <a href="/policies">POLICIES</a>
            <button type="button" className="cookie-settings-trigger">COOKIE SETTINGS</button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
