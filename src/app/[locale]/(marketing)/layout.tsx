import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

/**
 * Chrome du site public (§9, §11.1 du CDC). Les pages d'authentification
 * (route group voisin `(auth)`) n'héritent pas de ce layout — elles gardent
 * une mise en page minimale centrée.
 *
 * `setRequestLocale` doit être appelé ici aussi, pas seulement dans le
 * layout racine et dans chaque page : `Footer` (Server Component) lit des
 * traductions, et sans ce signal à ce niveau de l'arbre, Next.js perd la
 * garantie de rendu statique pour toutes les pages de ce groupe de routes.
 */
export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
