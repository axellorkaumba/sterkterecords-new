"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2Icon, AlertTriangleIcon, XCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ValidationIssue, ValidationReport, ValidationSeverity } from "@/lib/validation/types";

const SEVERITY_ICONS: Record<ValidationSeverity, typeof CheckCircle2Icon> = {
  ok: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  error: XCircleIcon,
};

const SEVERITY_STYLES: Record<ValidationSeverity, string> = {
  ok: "text-success",
  warning: "text-warning",
  error: "text-destructive",
};

/**
 * Affiche un résultat du moteur de validation (§11.4) — jamais de message
 * technique brut : statut clair, explication compréhensible, proposition de
 * correction, lien vers la règle si pertinent (décision UX validée par
 * Axel, voir docs/adr/0009-distribution-module.md).
 */
export function ValidationIssueRow({ issue }: { issue: ValidationIssue }) {
  const t = useTranslations("Validation");
  const Icon = SEVERITY_ICONS[issue.severity];

  return (
    <div className="border-border flex gap-3 rounded-lg border p-3">
      <Icon
        className={cn("mt-0.5 size-4 shrink-0", SEVERITY_STYLES[issue.severity])}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1">
        <p className="text-small font-medium">{t(issue.messageKey, issue.messageValues)}</p>
        {issue.explanationKey ? (
          <p className="text-caption text-muted-foreground">{t(issue.explanationKey)}</p>
        ) : null}
        {issue.suggestionKey ? (
          <p className="text-caption text-primary">{t(issue.suggestionKey)}</p>
        ) : null}
        {issue.ruleUrl ? (
          <a
            href={issue.ruleUrl}
            target="_blank"
            rel="noreferrer"
            className="text-caption text-primary underline underline-offset-2"
          >
            {t("ruleLinkLabel")}
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function ValidationReportView({
  report,
  emptyLabel,
}: {
  report: ValidationReport;
  emptyLabel: string;
}) {
  if (report.issues.length === 0) {
    return (
      <div className="text-success text-small flex items-center gap-2">
        <CheckCircle2Icon className="size-4" aria-hidden="true" />
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {report.issues.map((issue, index) => (
        <ValidationIssueRow key={`${issue.ruleId}-${index}`} issue={issue} />
      ))}
    </div>
  );
}
