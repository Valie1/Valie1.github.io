import LoadedImage from "@/components/LoadedImage";

const tools = [
  {
    key: "ps",
    name: "Photoshop",
    role: "Design & image work",
    copy: "I use Photoshop for thumbnails, cover art, compositing, visual cleanup, and the still-image details that make each project feel finished.",
    src: "/media/tools/photoshop-optimized.webp",
  },
  {
    key: "pr",
    name: "Premiere Pro",
    role: "Primary editing",
    copy: "Premiere Pro is my main editing workspace for pacing, storytelling, dialogue, music, sound design, color finishing, and final exports.",
    src: "/media/tools/premiere-pro-optimized.webp",
  },
  {
    key: "ae",
    name: "After Effects",
    role: "Motion & VFX",
    copy: "I use After Effects for motion graphics, animated typography, compositing, transitions, VFX, and the extra polish an edit needs.",
    src: "/media/tools/after-effects-optimized.webp",
  },
] as const;

export default function CreativeToolkit() {
  return (
    <div className="creative-toolkit creative-toolkit--split-redesign creative-toolkit--pass86 creative-toolkit--pass54">
      <section className="about-redesign about-redesign--editorial" aria-labelledby="about-me-label">
        <div className="about-redesign__heading-row">
          <h2 id="about-me-label" className="about-redesign__eyebrow about-redesign__eyebrow--no-dot">ABOUT ME</h2>
        </div>

        <div className="about-redesign__body about-redesign__body--editorial">
          <p className="about-redesign__statement">
            I&apos;m a <em>video editor</em> and <em>web designer</em> focused on creating <strong>clean, engaging visuals</strong> and smooth digital experiences that keep people <span>watching</span> and interested.
          </p>

        </div>
      </section>

      <section className="software-redesign" aria-labelledby="software-title">
        <div className="software-redesign__head">
          <span className="software-redesign__eyebrow">SOFTWARE I USE</span>
        </div>

        <h2 id="software-title" className="sr-only">Software I use</h2>

        <div className="software-redesign__grid" aria-label="Software used in my creative workflow">
          {tools.map((tool) => (
            <article key={tool.key} className={`software-card software-card--${tool.key}`}>
              <div className="software-card__top">
                <div className="software-card__icon-shell" aria-hidden="true">
                  <LoadedImage
                    src={tool.src}
                    alt=""
                    className="software-card__icon"
                    skeletonClassName="software-card__icon-skeleton"
                    width={160}
                    height={156}
                    sizes="64px"
                    quality={70}
                  />
                </div>
                <div className="software-card__identity">
                  <span>{tool.role}</span>
                  <h3>{tool.name}</h3>
                </div>
              </div>

              <div className="software-card__purpose">
                <span className="software-card__purpose-label">WHAT I USE IT FOR</span>
                <p>{tool.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
