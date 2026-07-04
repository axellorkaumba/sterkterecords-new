"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/lib/analytics/posthog-client-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

/**
 * Composition unique des providers client, partagée par les deux root
 * layouts (`[locale]` et `(private)`) pour éviter de dupliquer l'empilement
 * à chaque fois qu'un nouveau provider global est ajouté.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PostHogProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </PostHogProvider>
    </ThemeProvider>
  );
}
