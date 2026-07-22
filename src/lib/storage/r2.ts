import "server-only";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import type { Readable } from "node:stream";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireEnv } from "@/lib/env";

/**
 * Cloudflare R2 (compatible S3) — stockage des fichiers audio et artworks
 * (§6.1, §11.4). Choisi pour l'absence de frais d'egress, critique pour des
 * WAV/FLAC volumineux servis en lecture répétée.
 *
 * Les uploads passent par des URLs présignées générées ici et utilisées
 * directement par le navigateur (upload direct-to-R2, multipart pour les
 * gros fichiers) — le serveur Next.js ne proxy jamais le binaire audio.
 */
function getR2Client() {
  const accountId = requireEnv("R2_ACCOUNT_ID", "le client Cloudflare R2");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID", "le client Cloudflare R2");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY", "le client Cloudflare R2");

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const PRESIGNED_URL_TTL_SECONDS = 15 * 60;

/**
 * Génère une URL présignée d'upload (PUT) pour un fichier donné.
 * @param key Chemin dans le bucket, ex. `releases/{releaseId}/tracks/{trackId}.wav`
 * @param contentType Type MIME du fichier (ex. `audio/wav`, `image/png`)
 */
export async function createPresignedUploadUrl(key: string, contentType: string) {
  const client = getR2Client();
  const bucket = requireEnv("R2_BUCKET_NAME", "le client Cloudflare R2");

  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const url = await getSignedUrl(client, command, { expiresIn: PRESIGNED_URL_TTL_SECONDS });

  return { url, key, expiresInSeconds: PRESIGNED_URL_TTL_SECONDS };
}

/**
 * Génère une URL présignée de lecture (GET), pour les fichiers non publics
 * (§17 : "audio non public par défaut").
 */
export async function createPresignedDownloadUrl(key: string) {
  const client = getR2Client();
  const bucket = requireEnv("R2_BUCKET_NAME", "le client Cloudflare R2");

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(client, command, { expiresIn: PRESIGNED_URL_TTL_SECONDS });

  return { url, expiresInSeconds: PRESIGNED_URL_TTL_SECONDS };
}

/**
 * Télécharge un objet R2 directement en mémoire (pas d'URL présignée) — sert
 * à l'OCR best-effort des preuves de paiement (§ ADR 0026), exécuté
 * server-side juste après l'upload, sur un fichier de quelques centaines de
 * Ko au plus (capture d'écran), jamais sur de l'audio/artwork volumineux.
 */
export async function downloadObjectBuffer(key: string): Promise<Buffer> {
  const client = getR2Client();
  const bucket = requireEnv("R2_BUCKET_NAME", "le client Cloudflare R2");

  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const stream = response.Body as Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/** URL publique (artworks livrés aux DSP) — bucket/domaine servi via CDN. */
export function getPublicUrl(key: string) {
  const publicUrl = requireEnv("R2_PUBLIC_URL", "getPublicUrl (fichiers publics R2)");
  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}

/**
 * Taille de part multipart — 8 MiB. R2/S3 exige un minimum de 5 MiB pour
 * toute part sauf la dernière ; 8 MiB équilibre le nombre de parts (donc la
 * granularité de la reprise après coupure, §11.4 étape 2) et le nombre total
 * de requêtes (limite S3 : 10 000 parts, soit ~80 Go de marge).
 */
export const MULTIPART_PART_SIZE_BYTES = 8 * 1024 * 1024;

/**
 * Démarre un upload multipart réel (§11.4 étape 2 — "multipart/resumable").
 * Le `UploadId` retourné est persisté (table `upload_sessions`) pour
 * permettre de reprendre l'upload après une coupure réseau ou une fermeture
 * d'onglet : toute part déjà confirmée (table `upload_parts`) est resservie
 * telle quelle, seules les parts manquantes sont renvoyées.
 */
export async function createMultipartUpload(key: string, contentType: string) {
  const client = getR2Client();
  const bucket = requireEnv("R2_BUCKET_NAME", "le client Cloudflare R2");

  const command = new CreateMultipartUploadCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const response = await client.send(command);

  if (!response.UploadId) {
    throw new Error("[r2] CreateMultipartUpload n'a pas renvoyé d'UploadId.");
  }

  return { uploadId: response.UploadId };
}

/** URL présignée pour l'upload direct (PUT) d'une seule part d'un upload multipart. */
export async function createPresignedPartUploadUrl(
  key: string,
  uploadId: string,
  partNumber: number,
) {
  const client = getR2Client();
  const bucket = requireEnv("R2_BUCKET_NAME", "le client Cloudflare R2");

  const command = new UploadPartCommand({
    Bucket: bucket,
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber,
  });
  const url = await getSignedUrl(client, command, { expiresIn: PRESIGNED_URL_TTL_SECONDS });

  return { url };
}

/** Assemble les parts confirmées en un objet final. */
export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: Array<{ partNumber: number; etag: string }>,
) {
  const client = getR2Client();
  const bucket = requireEnv("R2_BUCKET_NAME", "le client Cloudflare R2");

  await client.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .sort((a, b) => a.partNumber - b.partNumber)
          .map((part) => ({ PartNumber: part.partNumber, ETag: part.etag })),
      },
    }),
  );
}

/** Annule un upload multipart abandonné (libère le stockage des parts déjà envoyées). */
export async function abortMultipartUpload(key: string, uploadId: string) {
  const client = getR2Client();
  const bucket = requireEnv("R2_BUCKET_NAME", "le client Cloudflare R2");

  await client.send(
    new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: uploadId }),
  );
}
