import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Vrai uniquement après l'hydratation côté client. Utilisé pour les
 * composants dont le rendu dépend d'un état seulement connu côté navigateur
 * (ex. thème persisté en localStorage via next-themes), afin d'éviter un
 * mismatch d'hydratation.
 *
 * Implémenté avec `useSyncExternalStore` plutôt que
 * `useState` + `useEffect(() => setMounted(true))` : cette dernière forme
 * déclenche un re-render en cascade que `eslint-plugin-react-hooks`
 * (règle `set-state-in-effect`) signale désormais comme anti-pattern.
 */
export function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
