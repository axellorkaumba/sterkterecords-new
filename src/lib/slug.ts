/** Utilisé pour les slugs artistes (`actions.ts`) et labels (`label-actions.ts`). */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}
