"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Stepper, type StepperStep } from "@/components/ui/stepper";
import { updateReleaseStep } from "../actions";
import { StepAudio } from "./step-audio";
import { StepMetadata } from "./step-metadata";
import { StepContributors } from "./step-contributors";
import { StepArtwork } from "./step-artwork";
import { StepPlatforms } from "./step-platforms";
import { StepSchedule } from "./step-schedule";
import { StepSummary } from "./step-summary";
import { StepSubmit } from "./step-submit";
import type { CatalogFingerprint, DspInfo, TunnelReleaseData, TunnelTrack } from "./types";

const STEP_KEYS = [
  "audio",
  "metadata",
  "contributors",
  "artwork",
  "platforms",
  "schedule",
  "summary",
  "submit",
] as const;

interface DistributionTunnelProps {
  release: TunnelReleaseData;
  initialTracks: TunnelTrack[];
  initialPlatforms: string[];
  catalogFingerprint: CatalogFingerprint;
  availableDsps: DspInfo[];
  initialStep: number;
}

export function DistributionTunnel({
  release,
  initialTracks,
  initialPlatforms,
  catalogFingerprint,
  availableDsps,
  initialStep,
}: DistributionTunnelProps) {
  const t = useTranslations("DistributionApp.steps");
  // Étapes 2 à 9 dans le tunnel ([releaseId]) — l'étape 1 (type) a déjà créé la sortie.
  const [stepIndex, setStepIndex] = useState(() => Math.min(Math.max(initialStep - 2, 0), 7));
  const [tracks, setTracks] = useState<TunnelTrack[]>(initialTracks);
  const [releaseData, setReleaseData] = useState<TunnelReleaseData>(release);
  const [platforms, setPlatforms] = useState<string[]>(initialPlatforms);

  const steps: StepperStep[] = STEP_KEYS.map((key) => ({ id: key, label: t(key) }));

  function goTo(index: number) {
    const clamped = Math.min(Math.max(index, 0), STEP_KEYS.length - 1);
    setStepIndex(clamped);
    void updateReleaseStep(release.id, clamped + 2);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-4 sm:p-8">
      <Stepper steps={steps} currentStep={stepIndex} />

      {stepIndex === 0 ? (
        <StepAudio
          releaseId={release.id}
          releaseType={releaseData.type}
          tracks={tracks}
          onTracksChange={setTracks}
          catalogFingerprint={catalogFingerprint}
          onNext={() => goTo(1)}
        />
      ) : null}

      {stepIndex === 1 ? (
        <StepMetadata
          release={releaseData}
          tracks={tracks}
          onReleaseChange={setReleaseData}
          onTracksChange={setTracks}
          onBack={() => goTo(0)}
          onNext={() => goTo(2)}
        />
      ) : null}

      {stepIndex === 2 ? (
        <StepContributors
          releaseId={release.id}
          tracks={tracks}
          onTracksChange={setTracks}
          onBack={() => goTo(1)}
          onNext={() => goTo(3)}
        />
      ) : null}

      {stepIndex === 3 ? (
        <StepArtwork
          releaseId={release.id}
          release={releaseData}
          onReleaseChange={setReleaseData}
          onBack={() => goTo(2)}
          onNext={() => goTo(4)}
        />
      ) : null}

      {stepIndex === 4 ? (
        <StepPlatforms
          releaseId={release.id}
          availableDsps={availableDsps}
          selectedDsps={platforms}
          onSelectedDspsChange={setPlatforms}
          onBack={() => goTo(3)}
          onNext={() => goTo(5)}
        />
      ) : null}

      {stepIndex === 5 ? (
        <StepSchedule
          releaseId={release.id}
          release={releaseData}
          onReleaseChange={setReleaseData}
          onBack={() => goTo(4)}
          onNext={() => goTo(6)}
        />
      ) : null}

      {stepIndex === 6 ? (
        <StepSummary
          release={releaseData}
          tracks={tracks}
          platforms={platforms}
          availableDsps={availableDsps}
          catalogFingerprint={catalogFingerprint}
          onBack={() => goTo(5)}
          onNext={() => goTo(7)}
        />
      ) : null}

      {stepIndex === 7 ? (
        <StepSubmit
          releaseId={release.id}
          appleArtworkAddon={releaseData.appleArtworkAddon}
          onBack={() => goTo(6)}
        />
      ) : null}
    </div>
  );
}
