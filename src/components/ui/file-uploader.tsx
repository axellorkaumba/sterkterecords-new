"use client";

import { useRef, useState, type DragEvent } from "react";
import { AlertCircleIcon, CheckCircle2Icon, FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export interface UploaderFile {
  id: string;
  name: string;
  sizeBytes: number;
  /** 0 à 100. */
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

interface FileUploaderProps {
  /** Ex. "audio/wav,audio/flac,audio/mpeg" (§11.4 : WAV/FLAC/MP3). */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** L'orchestration réelle de l'upload (URLs présignées R2) est branchée
   * au Sprint Distribution — ce composant ne fait que remonter les fichiers
   * choisis, il ne les envoie pas lui-même. */
  onFilesSelected: (files: File[]) => void;
  /** Fichiers en cours/déjà traités, avec leur progression — contrôlé par le parent. */
  files?: UploaderFile[];
  onRemoveFile?: (id: string) => void;
  className?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Uploader de fichiers — composant sur-mesure (§9.5 du CDC), absent de
 * shadcn/ui. Glisser-déposer + sélection multiple (§11.4), barre de
 * progression déterminée avec % (§9.8). Purement présentationnel : la
 * logique d'upload direct-to-R2 (URL présignée, multipart/resumable)
 * arrive avec le module Distribution.
 */
export function FileUploader({
  accept,
  multiple = false,
  disabled = false,
  onFilesSelected,
  files = [],
  onRemoveFile,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = Array.from(event.dataTransfer.files);
    if (dropped.length > 0) onFilesSelected(dropped);
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
          disabled && "pointer-events-none cursor-not-allowed opacity-40",
        )}
      >
        <UploadCloudIcon className="text-muted-foreground size-8" aria-hidden="true" />
        <p className="text-small text-foreground font-medium">
          Glissez-déposez vos fichiers ici, ou cliquez pour parcourir
        </p>
        <p className="text-caption text-muted-foreground">
          WAV recommandé — FLAC, MP3 également acceptés
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            const selected = Array.from(event.target.files ?? []);
            if (selected.length > 0) onFilesSelected(selected);
            event.target.value = "";
          }}
        />
      </div>

      {files.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="border-border bg-card flex items-center gap-3 rounded-md border px-3 py-2"
            >
              <FileIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-small text-foreground truncate font-medium">
                    {file.name}
                  </span>
                  <span className="text-caption text-muted-foreground shrink-0">
                    {formatBytes(file.sizeBytes)}
                  </span>
                </div>
                {file.status === "uploading" ? (
                  <Progress value={file.progress} className="gap-1" />
                ) : file.status === "error" ? (
                  <p className="text-caption text-destructive flex items-center gap-1">
                    <AlertCircleIcon className="size-3" aria-hidden="true" />
                    {file.errorMessage ?? "Échec de l'envoi."}
                  </p>
                ) : null}
              </div>
              {file.status === "success" && (
                <CheckCircle2Icon className="text-success size-4 shrink-0" aria-hidden="true" />
              )}
              {onRemoveFile && file.status !== "uploading" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Retirer ${file.name}`}
                  onClick={() => onRemoveFile(file.id)}
                >
                  <XIcon className="size-3.5" aria-hidden="true" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
