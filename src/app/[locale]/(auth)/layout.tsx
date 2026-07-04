/**
 * Chrome des pages d'authentification — placeholder d'infrastructure.
 * Le vrai flux (Supabase Auth, formulaires, validation) arrive au Sprint 3.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex flex-1 items-center justify-center p-8">{children}</main>;
}
