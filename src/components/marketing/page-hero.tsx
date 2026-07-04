const richTags = {
  gold: (chunks: React.ReactNode) => <span className="text-or-400">{chunks}</span>,
};

interface PageHeroProps {
  tag: string;
  description: string;
  /**
   * Rend le titre à partir de `t.rich("title", tags)` (balises `<gold>`)
   * ou `t("title")` si la clé n'a pas de mise en forme riche. Ne PAS
   * calculer le titre séparément avec `t("title")` côté appelant quand la
   * clé contient des balises : next-intl lève une `FORMATTING_ERROR` si
   * `<gold>` n'est pas résolu (voir docs/adr/0006, leçon retenue au
   * Sprint 2 avec `Studio.title`, `About.title`, etc.).
   */
  renderTitle: (tags: typeof richTags) => React.ReactNode;
}

/** En-tête de page standard pour les pages de service (§11.6-11.9 du CDC). */
export function PageHero({ tag, description, renderTitle }: PageHeroProps) {
  return (
    <div className="border-border border-b px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-caption text-primary font-medium tracking-wide uppercase">{tag}</p>
        <h1 className="text-h1 font-display mt-2">{renderTitle(richTags)}</h1>
        <p className="text-body-lg text-muted-foreground mt-4">{description}</p>
      </div>
    </div>
  );
}
