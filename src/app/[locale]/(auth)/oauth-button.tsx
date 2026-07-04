import { signInWithOAuth } from "./actions";
import { Button } from "@/components/ui/button";
import type { OAuthProviderId } from "./oauth-providers";

/** Icône officielle Google "G" (multicolore) — SVG statique, pas une font icon. */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

/** Logo Apple — silhouette officielle, monochrome (s'adapte au thème via currentColor). */
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.462 2.11-1.114 2.865-.717.83-1.9 1.47-2.878 1.47-.13 0-.256-.02-.36-.03-.02-.11-.04-.24-.04-.38 0-1.1.518-2.13 1.18-2.85.71-.77 1.94-1.36 2.94-1.42.01.11.02.23.02.345Zm3.24 15.44c-.44 1.02-.65 1.48-1.22 2.38-.79 1.25-1.9 2.81-3.28 2.82-1.23.02-1.55-.8-3.22-.79-1.67.01-2.02.81-3.25.79-1.38-.02-2.43-1.42-3.22-2.67-2.2-3.5-2.44-7.6-1.08-9.79.97-1.55 2.5-2.46 3.94-2.46 1.47 0 2.39.81 3.61.81 1.18 0 1.9-.81 3.61-.81 1.28 0 2.64.7 3.61 1.9-3.17 1.74-2.66 6.27.5 7.83Z" />
    </svg>
  );
}

const PROVIDER_ICONS: Record<OAuthProviderId, () => React.JSX.Element> = {
  google: GoogleIcon,
  apple: AppleIcon,
};

interface OAuthButtonProps {
  provider: OAuthProviderId;
  locale: string;
  next?: string;
  label: string;
}

export function OAuthButton({ provider, locale, next, label }: OAuthButtonProps) {
  const Icon = PROVIDER_ICONS[provider];

  return (
    <form action={signInWithOAuth}>
      <input type="hidden" name="provider" value={provider} />
      <input type="hidden" name="locale" value={locale} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <Button type="submit" variant="outline" className="w-full">
        <Icon />
        {label}
      </Button>
    </form>
  );
}

interface OAuthButtonsProps {
  providers: OAuthProviderId[];
  locale: string;
  next?: string;
  labels: Record<OAuthProviderId, string>;
}

/**
 * Rend un bouton par provider activé (`getEnabledOAuthProviders()`, calculé
 * côté Server Component — voir `oauth-providers.ts`). Aujourd'hui Google
 * seul ; Apple apparaît automatiquement dès que ses identifiants sont
 * configurés, sans changement dans ce composant.
 */
export function OAuthButtons({ providers, locale, next, labels }: OAuthButtonsProps) {
  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {providers.map((provider) => (
        <OAuthButton
          key={provider}
          provider={provider}
          locale={locale}
          next={next}
          label={labels[provider]}
        />
      ))}
    </div>
  );
}
