import "server-only";

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
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

/** URL publique (artworks livrés aux DSP) — bucket/domaine servi via CDN. */
export function getPublicUrl(key: string) {
  const publicUrl = requireEnv("R2_PUBLIC_URL", "getPublicUrl (fichiers publics R2)");
  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}
