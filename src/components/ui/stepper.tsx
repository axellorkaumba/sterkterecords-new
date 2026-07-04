import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  /** Index (0-based) de l'étape courante. */
  currentStep: number;
  className?: string;
}

/**
 * Stepper — composant sur-mesure (§9.5 du CDC), absent de shadcn/ui.
 * Construit pour le tunnel de distribution en 9 étapes (§11.4), mais
 * générique : réutilisable pour tout parcours multi-étapes (booking,
 * réservation studio...).
 *
 * Responsive : libellés visibles à partir de `sm`, réduit à des puces
 * numérotées sur mobile pour ne pas déborder (§9.4 mobile-first).
 */
export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <ol className={cn("flex w-full items-center", className)} aria-label="Progression">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <li key={step.id} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary/15 text-primary ring-primary ring-2",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <CheckIcon className="size-3.5" aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-caption hidden max-w-20 text-center sm:block",
                  isCurrent ? "text-foreground font-medium" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                aria-hidden="true"
                className={cn(
                  "mx-2 h-px flex-1 transition-colors",
                  isCompleted ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
