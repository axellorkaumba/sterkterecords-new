import { useCallback, useRef, useState } from "react";
import {
  startUploadSession,
  getPresignedPartUrl,
  recordUploadedPart,
  completeUploadSession,
  abortUploadSession,
} from "@/lib/uploads/actions";
import type { Database } from "@/types/database.types";

type UploadKind = Database["public"]["Enums"]["upload_kind"];

export type ResumableUploadStatus =
  "idle" | "hashing" | "uploading" | "completed" | "error" | "aborted";

export interface ResumableUploadState {
  status: ResumableUploadStatus;
  /** 0 à 100. */
  progress: number;
  speedBytesPerSecond: number;
  error: string | null;
  r2Key: string | null;
  sessionId: string | null;
}

const INITIAL_STATE: ResumableUploadState = {
  status: "idle",
  progress: 0,
  speedBytesPerSecond: 0,
  error: null,
  r2Key: null,
  sessionId: null,
};

/**
 * SHA-256 du fichier entier — sert à la fois de clé de reprise (identifie
 * "le même fichier" après un rechargement de page, où l'objet File d'origine
 * est perdu et l'utilisateur doit re-sélectionner le fichier) et à la
 * détection de doublons (§11.4 étape 2, voir moteur de validation).
 *
 * `crypto.subtle.digest` n'est pas incrémental : on lit le fichier entier en
 * mémoire une fois pour le hash, indépendamment du découpage en parts pour
 * l'upload. Acceptable pour des fichiers audio/pochette (quelques dizaines à
 * ~200 Mo) dans un navigateur moderne.
 */
async function computeSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * PUT direct-to-R2 d'une part via XHR (pas `fetch`) : seul `XMLHttpRequest`
 * expose un événement de progression fiable pour un upload (`upload.onprogress`),
 * nécessaire à la barre de progression et au calcul de vitesse (§11.4, §9.8).
 *
 * Nécessite que le bucket R2 autorise PUT en CORS pour l'origine du site et
 * expose l'en-tête `ETag` (`Access-Control-Expose-Headers: ETag`) — sans
 * quoi le navigateur masque l'ETag renvoyé par R2, indispensable pour
 * `CompleteMultipartUpload`. Configuration à faire une fois côté Cloudflare
 * (voir docs/adr/0009-distribution-module.md).
 */
function uploadPartWithProgress(
  url: string,
  blob: Blob,
  onProgress: (loadedDelta: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    let lastLoaded = 0;

    xhr.upload.onprogress = (event) => {
      onProgress(event.loaded - lastLoaded);
      lastLoaded = event.loaded;
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader("ETag");
        if (!etag) {
          reject(new Error("etag_missing"));
          return;
        }
        resolve(etag);
      } else {
        reject(new Error("part_upload_failed"));
      }
    };
    xhr.onerror = () => reject(new Error("network_error"));
    xhr.send(blob);
  });
}

/**
 * Upload multipart résumable (§11.4 étape 2). `upload(file)` reprend
 * automatiquement une session `in_progress` existante pour le même hash de
 * fichier (même après un rechargement de page) : les parts déjà confirmées
 * côté R2 ne sont jamais renvoyées.
 */
export function useResumableUpload(kind: UploadKind) {
  const [state, setState] = useState<ResumableUploadState>(INITIAL_STATE);
  const cancelledRef = useRef(false);

  const upload = useCallback(
    async (file: File) => {
      cancelledRef.current = false;
      setState({ ...INITIAL_STATE, status: "hashing" });

      const sha256Hash = await computeSha256(file);

      if (cancelledRef.current) {
        setState((current) => ({ ...current, status: "aborted" }));
        return null;
      }

      try {
        const session = await startUploadSession({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          kind,
          sha256Hash,
        });

        setState((current) => ({ ...current, status: "uploading", sessionId: session.sessionId }));

        const completedPartNumbers = new Set(session.completedParts.map((p) => p.partNumber));
        let uploadedBytes = 0;
        for (const partNumber of completedPartNumbers) {
          const isLastPart = partNumber === session.totalParts;
          uploadedBytes += isLastPart
            ? file.size - (partNumber - 1) * session.partSize
            : session.partSize;
        }
        const startTime = Date.now();

        for (let partNumber = 1; partNumber <= session.totalParts; partNumber += 1) {
          if (cancelledRef.current) {
            setState((current) => ({ ...current, status: "aborted" }));
            return null;
          }
          if (completedPartNumbers.has(partNumber)) continue;

          const start = (partNumber - 1) * session.partSize;
          const end = Math.min(start + session.partSize, file.size);
          const blob = file.slice(start, end);

          const { url } = await getPresignedPartUrl(session.sessionId, partNumber);
          const etag = await uploadPartWithProgress(url, blob, (delta) => {
            uploadedBytes += delta;
            const elapsedSeconds = (Date.now() - startTime) / 1000;
            setState((current) => ({
              ...current,
              progress: Math.min(100, Math.round((uploadedBytes / file.size) * 100)),
              speedBytesPerSecond: elapsedSeconds > 0 ? uploadedBytes / elapsedSeconds : 0,
            }));
          });

          await recordUploadedPart(session.sessionId, partNumber, etag, end - start);
        }

        const { r2Key } = await completeUploadSession(session.sessionId);
        setState((current) => ({ ...current, status: "completed", progress: 100, r2Key }));
        return { r2Key, sessionId: session.sessionId, sha256Hash };
      } catch (error) {
        setState((current) => ({
          ...current,
          status: "error",
          error: error instanceof Error ? error.message : "unknown",
        }));
        return null;
      }
    },
    [kind],
  );

  const cancel = useCallback(async () => {
    cancelledRef.current = true;
    if (state.sessionId) {
      await abortUploadSession(state.sessionId);
    }
  }, [state.sessionId]);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { state, upload, cancel, reset };
}
