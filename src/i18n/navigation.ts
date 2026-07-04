import { createNavigation } from "next-intl/navigation";
import { routing } from "@/i18n/routing";

/**
 * Wrappers `Link`, `redirect`, `usePathname`, `useRouter` conscients de la
 * locale active. À utiliser dans tout le site public (marketing + auth)
 * à la place des primitives `next/link` et `next/navigation`.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
