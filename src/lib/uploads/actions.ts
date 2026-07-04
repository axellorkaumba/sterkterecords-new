"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import {
  createMultipartUpload,
  createPresignedPartUploadUrl,
  completeMultipartUpload,
  abortMultipartUpload,
  MULTIPART_PART_SIZE_BYTES,
} from "@/lib/storage/r2";
import type { Database } from "@/types/database.types";

type UploadKind = Database["public"]["Enums"]["upload_kind"];

interface StartUploadSessionInput {
  fileName: string;
  fileSize: number;
  mimeType: string;
  kind: UploadKind;
  /** SHA-256 du fichier, calculé côté client avant l'upload (Web Crypto). */
  sha256Hash: string;
}

export interface UploadSessionState {
  sessionId: string;
  r2Key: string;
  partSize: number;
  totalParts: number;
  completedParts: Array<{ partNumber: number; etag: string }>;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("[uploads] Action appelée sans session active.");
  }
  return { supabase, user };
}

/**
 * Démarre (ou reprend) un upload multipart résumable (§11.4 étape 2). Une
 * session `in_progress` avec le même hash de fichier pour cet utilisateur
 * est reprise telle quelle — les parts déjà confirmées (`upload_parts`) sont
 * renvoyées pour que le client ne réenvoie pas ce qui est déjà côté R2.
 */
export async function startUploadSession(
  input: StartUploadSessionInput,
): Promise<UploadSessionState> {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("upload_sessions")
    .select("id, r2_key, part_size, total_parts")
    .eq("uploader_id", user.id)
    .eq("sha256_hash", input.sha256Hash)
    .eq("status", "in_progress")
    .maybeSingle();

  if (existing) {
    const { data: parts } = await supabase
      .from("upload_parts")
      .select("part_number, etag")
      .eq("session_id", existing.id)
      .order("part_number");

    return {
      sessionId: existing.id,
      r2Key: existing.r2_key,
      partSize: existing.part_size,
      totalParts: existing.total_parts,
      completedParts: (parts ?? []).map((p) => ({ partNumber: p.part_number, etag: p.etag })),
    };
  }

  const totalParts = Math.max(1, Math.ceil(input.fileSize / MULTIPART_PART_SIZE_BYTES));
  const extensionMatch = /\.([a-zA-Z0-9]+)$/.exec(input.fileName);
  const extension = extensionMatch?.[1] ?? "bin";
  const r2Key = `${input.kind}/${user.id}/${randomUUID()}.${extension}`;

  const { uploadId } = await createMultipartUpload(r2Key, input.mimeType);

  const { data: session, error } = await supabase
    .from("upload_sessions")
    .insert({
      uploader_id: user.id,
      kind: input.kind,
      file_name: input.fileName,
      file_size: input.fileSize,
      mime_type: input.mimeType,
      r2_key: r2Key,
      r2_upload_id: uploadId,
      part_size: MULTIPART_PART_SIZE_BYTES,
      total_parts: totalParts,
      sha256_hash: input.sha256Hash,
    })
    .select("id, r2_key, part_size, total_parts")
    .single();

  if (error || !session) {
    await abortMultipartUpload(r2Key, uploadId);
    throw new Error("[uploads] Impossible de démarrer la session d'upload.");
  }

  return {
    sessionId: session.id,
    r2Key: session.r2_key,
    partSize: session.part_size,
    totalParts: session.total_parts,
    completedParts: [],
  };
}

/** URL présignée pour l'upload direct (PUT) d'une part précise — générée à la demande. */
export async function getPresignedPartUrl(
  sessionId: string,
  partNumber: number,
): Promise<{ url: string }> {
  const { supabase } = await requireUser();

  const { data: session } = await supabase
    .from("upload_sessions")
    .select("r2_key, r2_upload_id")
    .eq("id", sessionId)
    .single();

  if (!session) {
    throw new Error("[uploads] Session d'upload introuvable.");
  }

  return createPresignedPartUploadUrl(session.r2_key, session.r2_upload_id, partNumber);
}

/** Confirme qu'une part a été envoyée avec succès (ETag renvoyé par R2). */
export async function recordUploadedPart(
  sessionId: string,
  partNumber: number,
  etag: string,
  size: number,
): Promise<void> {
  const { supabase } = await requireUser();

  const { error } = await supabase
    .from("upload_parts")
    .upsert(
      { session_id: sessionId, part_number: partNumber, etag, size },
      { onConflict: "session_id,part_number" },
    );

  if (error) {
    throw new Error("[uploads] Impossible d'enregistrer la part envoyée.");
  }
}

/** Assemble toutes les parts confirmées en un objet final R2. */
export async function completeUploadSession(sessionId: string): Promise<{ r2Key: string }> {
  const { supabase } = await requireUser();

  const { data: session } = await supabase
    .from("upload_sessions")
    .select("r2_key, r2_upload_id")
    .eq("id", sessionId)
    .single();

  if (!session) {
    throw new Error("[uploads] Session d'upload introuvable.");
  }

  const { data: parts } = await supabase
    .from("upload_parts")
    .select("part_number, etag")
    .eq("session_id", sessionId)
    .order("part_number");

  await completeMultipartUpload(
    session.r2_key,
    session.r2_upload_id,
    (parts ?? []).map((p) => ({ partNumber: p.part_number, etag: p.etag })),
  );

  await supabase.from("upload_sessions").update({ status: "completed" }).eq("id", sessionId);

  return { r2Key: session.r2_key };
}

/** Abandonne un upload (libère les parts déjà envoyées côté R2). */
export async function abortUploadSession(sessionId: string): Promise<void> {
  const { supabase } = await requireUser();

  const { data: session } = await supabase
    .from("upload_sessions")
    .select("r2_key, r2_upload_id")
    .eq("id", sessionId)
    .single();

  if (!session) return;

  await abortMultipartUpload(session.r2_key, session.r2_upload_id);
  await supabase.from("upload_sessions").update({ status: "aborted" }).eq("id", sessionId);
}
