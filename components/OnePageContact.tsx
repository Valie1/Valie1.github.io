import LoadedImage from "@/components/LoadedImage";
import { site } from "@/lib/content";

const channels = [
  {
    id: "01",
    name: "DISCORD",
    meta: "FASTEST RESPONSE",
    detail: "Open Discord Profile",
    href: "https://discord.com/users/1461961683110072431",
    icon: "/media/contact/discord-optimized.webp",
    external: true,
    className: "is-discord",
  },
  {
    id: "02",
    name: "EMAIL",
    meta: "PROJECT INQUIRIES",
    detail: site.email,
    href: `mailto:${site.email}`,
    icon: "/media/contact/email-optimized.webp",
    external: false,
    className: "is-email",
  },
];

export default function OnePageContact() {
  return (
    <section id="contact" className="one-section one-contact one-contact--hub" aria-labelledby="contact-title">
      <div className="one-section-label">
        <span>CONTACT</span>
        <span>06</span>
      </div>

      <div className="one-contact-hub">
        <div className="one-contact-identity">
          <h2 id="contact-title">LET&apos;S MAKE<br />SOMETHING GOOD</h2>

          <div className="one-contact-profile">
            <div className="one-contact-profile__image-wrap">
              <LoadedImage
                src="/media/contact/clarie-optimized.webp"
                alt="Valie profile picture"
                className="one-contact-profile__image"
                skeletonClassName="one-contact-profile__image-skeleton"
                width={66}
                height={66}
                sizes="66px"
                quality={72}
              />
              <span className="one-contact-profile__orbit" aria-hidden="true" />
            </div>

            <div className="one-contact-profile__copy">
              <span className="one-contact-profile__name">VALIE</span>
              <span className="one-contact-profile__role">VIDEO EDITOR / WEB DESIGNER</span>
            </div>
          </div>
        </div>

        <div className="one-contact-channels-wrap">
          <div className="one-contact-channels-head">
            <h3>CONTACT ME</h3>
          </div>

          <div className="one-contact-channels">
            {channels.map((channel) => (
              <a
                key={channel.name}
                className={`one-contact-channel ${channel.className}`}
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
                aria-label={channel.external ? `${channel.name}: ${channel.detail}, opens in a new tab` : `${channel.name}: ${channel.detail}`}
              >
                <span className="one-contact-channel__icon-shell">
                  <LoadedImage
                    src={channel.icon}
                    alt=""
                    className="one-contact-channel__icon"
                    skeletonClassName="one-contact-channel__icon-skeleton"
                    width={28}
                    height={28}
                    sizes="28px"
                    quality={68}
                  />
                </span>

                <span className="one-contact-channel__copy">
                  <strong>{channel.name}</strong>
                  <small>{channel.detail}</small>
                </span>

              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
