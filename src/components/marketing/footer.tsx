import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const SERVICE_LINKS = [
  { href: "/distribution" as const, key: "distribution" as const },
  { href: "/studio" as const, key: "studio" as const },
  { href: "/booking" as const, key: "booking" as const },
  { href: "/featuring" as const, key: "featuring" as const },
  { href: "/consulting" as const, key: "consulting" as const },
];

const LABEL_LINKS = [
  { href: "/a-propos" as const, key: "about" as const },
  { href: "/contact" as const, key: "contact" as const },
];

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-border border-t">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <p className="text-h3 font-display font-semibold">
            Sterkte <span className="text-primary">Records</span>
          </p>
          <p className="text-small text-muted-foreground">{t("brandDescription")}</p>
        </div>

        <div className="flex flex-col gap-3">
          <h5 className="text-caption text-muted-foreground font-medium tracking-wide uppercase">
            {t("servicesHeading")}
          </h5>
          <ul className="flex flex-col gap-2">
            {SERVICE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-small text-muted-foreground hover:text-foreground"
                >
                  {tNav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h5 className="text-caption text-muted-foreground font-medium tracking-wide uppercase">
            {t("labelHeading")}
          </h5>
          <ul className="flex flex-col gap-2">
            {LABEL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-small text-muted-foreground hover:text-foreground"
                >
                  {tNav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h5 className="text-caption text-muted-foreground font-medium tracking-wide uppercase">
            {t("contactHeading")}
          </h5>
          <ul className="text-small text-muted-foreground flex flex-col gap-2">
            <li>
              <a href="mailto:contact.sterkterecords@gmail.com" className="hover:text-foreground">
                contact.sterkterecords@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+243850510209" className="hover:text-foreground">
                +243 850 510 209
              </a>
            </li>
            <li>Avenue Mama Yemo, Lubumbashi, RDC</li>
            <li>
              <a
                href="https://linktr.ee/sterkterecords"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                {t("allSocialLinks")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-border border-t px-4 py-6 sm:px-6">
        <div className="text-caption text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p>{t("copyright", { year })}</p>
          <div className="flex gap-4">
            <Link href="/legal/cgu" className="hover:text-foreground">
              {t("terms")}
            </Link>
            <Link href="/legal/confidentialite" className="hover:text-foreground">
              {t("privacy")}
            </Link>
            <Link href="/legal/mentions" className="hover:text-foreground">
              {t("legalNotice")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
