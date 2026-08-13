/**
 * Habillage commun des 5 pages d'authentification (§11.2) — remplace la
 * `Card` boxée par un panneau plat directement posé sur le fond, avec un
 * titre plus affirmé (`text-h1` au lieu de `text-h3`). Demande d'Axel après
 * capture d'écran de /inscription ("visuel très amateur") — comparé à une
 * référence externe (TuneCore) où le formulaire n'est jamais encadré, juste
 * une composition typographique sur fond plein cadre.
 */
export function AuthPanel({
  tag,
  title,
  subtitle,
  children,
}: {
  tag: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-caption text-primary font-medium tracking-wide uppercase">{tag}</p>
        <h1 className="text-h1 font-display">{title}</h1>
        {subtitle ? <p className="text-body text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
