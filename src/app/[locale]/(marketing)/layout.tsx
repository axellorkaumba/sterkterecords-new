/**
 * Chrome du site public (header/footer) — placeholder d'infrastructure.
 * Le vrai header/footer premium (charte §9 du CDC) arrive au Sprint 1
 * (Design System) et Sprint 2 (Site Public).
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex-1">{children}</main>;
}
