import type { Metadata } from "next";
import { listPendingPaymentProofs } from "./actions";
import { ProofReviewCard } from "./proof-review-card";

export const metadata: Metadata = { title: "Preuves de paiement à valider" };

export default async function ValidationsDashboardPage() {
  const proofs = await listPendingPaymentProofs();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-h2 font-display">Preuves de paiement à valider</h1>
        <p className="text-muted-foreground">
          {proofs.length === 0
            ? "Aucune demande en attente."
            : `${proofs.length} demande${proofs.length > 1 ? "s" : ""} en attente, la plus ancienne d'abord.`}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {proofs.map((proof) => (
          <ProofReviewCard key={proof.id} proof={proof} />
        ))}
      </div>
    </div>
  );
}
