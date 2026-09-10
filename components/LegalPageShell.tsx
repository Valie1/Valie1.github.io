import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type LegalKind = "privacy" | "cookies" | "policies";

type LegalSection = {
  id: string;
  number: string;
  title: string;
  content: ReactNode;
};

type Props = {
  kind: LegalKind;
  titlePrimary: string;
  titleAccent: string;
  summary: string;
  updated: string;
  code: string;
  statusLabel: string;
  statusValue: string;
  sections: LegalSection[];
  action?: ReactNode;
};

const docs = [
  ["/privacy", "PRIVACY"],
  ["/cookies", "COOKIES"],
  ["/policies", "POLICIES"],
] as const;

const legalDocumentTransitionRuntime = String.raw`
(function(){
  'use strict';

  var LEGAL_PATHS = { '/privacy': true, '/cookies': true, '/policies': true };
  var CLOSE_MESSAGE = 'valie:legal-portal-close';
  var NAVIGATE_MESSAGE = 'valie:legal-portal-navigate';
  var DIRECT_LEAVE_MS = 430;
  var insideFrame = window.parent !== window;
  var leaving = false;

  function resetEmbeddedScroll(){
    if(!insideFrame) return;
    try{ window.history.scrollRestoration = 'manual'; }catch(_){}
    try{ window.scrollTo({top:0,left:0,behavior:'auto'}); }catch(_){ window.scrollTo(0,0); }
    try{
      document.documentElement.scrollTop = 0;
      if(document.body) document.body.scrollTop = 0;
    }catch(_){}
  }

  
  if(insideFrame){
    resetEmbeddedScroll();
    requestAnimationFrame(resetEmbeddedScroll);
    window.addEventListener('pageshow', resetEmbeddedScroll);
  }

  function isModifiedClick(event){
    return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  }

  function legalUrl(rawHref){
    if(!rawHref || rawHref.charAt(0) === '#') return null;
    try{
      var url = new URL(rawHref, window.location.href);
      return LEGAL_PATHS[normalizePath(url.pathname)] ? url : null;
    }catch(_){ return null; }
  }

  function normalizePath(path){ if(!path || path === '/') return path || '/'; return path.replace(/\/+$/, ''); }

  function routeValue(url){ return url.pathname + url.search + url.hash; }

  function directLeave(path){
    if(leaving) return;
    leaving = true;
    document.body.classList.add('cnh-direct-leave');
    window.setTimeout(function(){ window.location.href = path; }, DIRECT_LEAVE_MS);
  }

  document.addEventListener('click', function(event){
    if(isModifiedClick(event)) return;
    var target = event.target;
    if(!(target instanceof Element)) return;

    var back = target.closest('.portfolio-back-button');
    if(back){
      event.preventDefault();
      event.stopImmediatePropagation();
      if(insideFrame){
        window.parent.postMessage({type:CLOSE_MESSAGE}, window.location.origin);
      }else{
        directLeave('/');
      }
      return;
    }

    var anchor = target.closest('a[href],a[data-valie-link-href]');
    if(!anchor || anchor.target === '_blank') return;
    var destination = legalUrl(anchor.getAttribute('href') || anchor.getAttribute('data-valie-link-href') || '');
    if(!destination || normalizePath(destination.pathname) === normalizePath(window.location.pathname)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    if(insideFrame){
      
      window.parent.postMessage({type:NAVIGATE_MESSAGE,path:routeValue(destination)}, window.location.origin);
    }else{
      directLeave(routeValue(destination));
    }
  }, true);

  window.addEventListener('keydown', function(event){
    if(event.key !== 'Escape' || !insideFrame) return;
    event.preventDefault();
    window.parent.postMessage({type:CLOSE_MESSAGE}, window.location.origin);
  });
})();
`;

export default function LegalPageShell({
  kind,
  titlePrimary,
  titleAccent,
  summary,
  updated,
  code,
  statusLabel,
  statusValue,
  sections,
  action,
}: Props) {
  return (
    <main className={`legal-page legal-page--${kind}`}>
      <div className="legal-page__grid" aria-hidden="true" />
      <div className="legal-page__glow" aria-hidden="true" />

      <div className="legal-shell">
        <div className="legal-topbar">
          <a href="/" className="portfolio-back-button legal-back"><ArrowLeft size={13} strokeWidth={1.8} aria-hidden="true" /><span>BACK TO PORTFOLIO</span></a>
        </div>

        <header className="legal-hero">
          <div className="legal-hero__copy">
            <h1>
              {titlePrimary}<br />
              <span>{titleAccent}</span>
            </h1>
            <p className="legal-hero__summary">{summary}</p>
          </div>
        </header>

        <div className="legal-rule" />

        <div className="legal-layout">
          <aside className="legal-index">
            <div className="legal-index__sticky">
              <p className="legal-index__label">ON THIS PAGE</p>
              <nav className="legal-index__sections" aria-label={`${titlePrimary} ${titleAccent} sections`}>
                {sections.map((section) => (
                  <a href={`#${section.id}`} key={section.id}>
                    <span>{section.number}</span>
                    <strong>{section.title}</strong>
                  </a>
                ))}
              </nav>

              <div className="legal-index__docs">
                <p>LEGAL DOCUMENTS</p>
                <nav aria-label="Legal documents">
                  {docs.map(([href, label]) => (
                    <a href={href} key={href} aria-current={`/${kind}` === href ? "page" : undefined}>
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
              {action ? <div className="legal-index__action">{action}</div> : null}
            </div>
          </aside>

          <div className="legal-content">
            {sections.map((section) => (
              <section className="legal-section" id={section.id} key={section.id}>
                <div className="legal-section__head">
                  <span>{section.number}</span>
                  <h2>{section.title}</h2>
                </div>
                <div className="legal-section__body">{section.content}</div>
              </section>
            ))}
          </div>
        </div>
      </div>
      <script id="valie-legal-document-transition" dangerouslySetInnerHTML={{ __html: legalDocumentTransitionRuntime }} />
    </main>
  );
}
