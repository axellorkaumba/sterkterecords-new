import { getTranslations } from "next-intl/server";
import { BanknoteIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getLabelGridClient } from "@/lib/labelgrid";
import { listPendingWithdrawals, listAllArtists } from "../actions";
import { WithdrawalRow } from "./withdrawal-row";
import { RoyaltyStatementForm } from "./royalty-statement-form";

export async function generateMetadata() {
  const t = await getTranslations("Admin.finances");
  return { title: t("title") };
}

/**
 * Finances (§11.5, module Royalties) — traitement des retraits + saisie
 * manuelle de relevés DSP en attendant une vraie ingestion LabelGrid (voir
 * docs/adr/0032-module-royalties.md).
 */
export default async function AdminFinancesPage() {
  const t = await getTranslations("Admin.finances");

  const [withdrawals, artists, dsps] = await Promise.all([
    listPendingWithdrawals(),
    listAllArtists(),
    getLabelGridClient().listAvailableDsps(),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-h2 font-display">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("statementForm.title")}</CardTitle>
          <CardDescription>{t("statementForm.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <RoyaltyStatementForm
            artists={artists.map((artist) => ({ id: artist.id, name: artist.name }))}
            dsps={dsps.map((dsp) => ({ id: dsp.id, name: dsp.name }))}
          />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-h3 font-display mb-4">{t("withdrawalsTitle")}</h2>
        {withdrawals.length === 0 ? (
          <EmptyState
            icon={BanknoteIcon}
            title={t("empty.title")}
            description={t("empty.description")}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {withdrawals.map((withdrawal) => (
              <WithdrawalRow key={withdrawal.id} withdrawal={withdrawal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
