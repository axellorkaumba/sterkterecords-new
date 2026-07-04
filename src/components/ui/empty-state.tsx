import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * État vide — composant sur-mesure (§9.5, §9.8 du CDC), absent de
 * shadcn/ui : "États vides soignés : illustration + message + CTA (ex.
 * « Aucune sortie pour l'instant — Distribuez votre première œuvre »)."
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <div className="bg-muted flex size-12 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-body text-foreground font-medium">{title}</p>
        {description ? <p className="text-small text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
