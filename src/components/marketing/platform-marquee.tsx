import {
  SiSpotify,
  SiApplemusic,
  SiDeezer,
  SiYoutubemusic,
  SiTiktok,
  SiTidal,
  SiPandora,
  SiIheartradio,
  SiNapster,
  SiFacebook,
  SiInstagram,
  SiSnapchat,
  SiShazam,
  SiAudiomack,
} from "@icons-pack/react-simple-icons";
import { MusicIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformLogo {
  name: string;
  Icon: React.ComponentType<{ size?: number; color?: string; className?: string }> | LucideIcon;
  /** Pas de marque officielle disponible (@icons-pack/react-simple-icons) — pastille de repli, à remplacer dès que le vrai logo est fourni. */
  placeholder?: boolean;
}

const PLATFORM_LOGOS: PlatformLogo[] = [
  { name: "Spotify", Icon: SiSpotify },
  { name: "Apple Music", Icon: SiApplemusic },
  { name: "Deezer", Icon: SiDeezer },
  { name: "YouTube Music", Icon: SiYoutubemusic },
  { name: "TikTok", Icon: SiTiktok },
  { name: "Amazon Music", Icon: MusicIcon, placeholder: true },
  { name: "Boomplay", Icon: MusicIcon, placeholder: true },
  { name: "Audiomack", Icon: SiAudiomack },
  { name: "Tidal", Icon: SiTidal },
  { name: "Pandora", Icon: SiPandora },
  { name: "iHeartRadio", Icon: SiIheartradio },
  { name: "Claro Música", Icon: MusicIcon, placeholder: true },
  { name: "Anghami", Icon: MusicIcon, placeholder: true },
  { name: "Napster", Icon: SiNapster },
  { name: "Facebook", Icon: SiFacebook },
  { name: "Instagram", Icon: SiInstagram },
  { name: "Snapchat", Icon: SiSnapchat },
  { name: "Shazam", Icon: SiShazam },
];

/**
 * Bandeau de plateformes (§11.1) : vrais logos de marque
 * (@icons-pack/react-simple-icons — choisi pour son usage factuel/répandu
 * des marques réelles, sans dépendre d'assets officiels non fournis, cf.
 * ADR redesign Home) rendus en monochrome pour rester cohérent et évoquer
 * les pages "Disponible sur" d'Apple/Stripe plutôt qu'une mosaïque de
 * couleurs. Défilement CSS pur (`animate-marquee`, déjà dans globals.css)
 * — pas de JS par frame, donc pas de jank possible ; pause au survol via
 * `animation-play-state` (voir globals.css).
 *
 * 4 plateformes (Amazon Music, Boomplay, Claro Música, Anghami) n'ont pas
 * de marque dans la librairie : pastille de repli (icône générique +
 * initiale), clairement remplaçable en fournissant un vrai logo plus tard.
 */
interface PlatformMarqueeProps {
  ariaLabel: string;
}

export function PlatformMarquee({ ariaLabel }: PlatformMarqueeProps) {
  const doubled = [...PLATFORM_LOGOS, ...PLATFORM_LOGOS];

  return (
    <div
      className="group border-border overflow-hidden border-y py-6"
      role="group"
      aria-label={ariaLabel}
    >
      <div className="animate-marquee flex w-max gap-12 [animation-play-state:running] group-hover:[animation-play-state:paused]">
        {doubled.map(({ name, Icon, placeholder }, i) => (
          <div
            key={`${name}-${i}`}
            className={cn(
              "text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-2.5 opacity-70 transition-[opacity,color] duration-300 hover:opacity-100",
              placeholder && "opacity-40",
            )}
            aria-hidden={i >= PLATFORM_LOGOS.length}
          >
            <Icon size={22} className="shrink-0" />
            <span className="text-small font-medium whitespace-nowrap">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
