"use client";

import { useState } from "react";
import { MusicIcon, PlusIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Stepper } from "@/components/ui/stepper";
import { EmptyState } from "@/components/ui/empty-state";
import { FileUploader, type UploaderFile } from "@/components/ui/file-uploader";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

const COLOR_SWATCHES = [
  { name: "cerise-50", className: "bg-cerise-50" },
  { name: "cerise-100", className: "bg-cerise-100" },
  { name: "cerise-300", className: "bg-cerise-300" },
  { name: "cerise-500", className: "bg-cerise-500" },
  { name: "cerise-600", className: "bg-cerise-600" },
  { name: "cerise-700", className: "bg-cerise-700" },
  { name: "cerise-900", className: "bg-cerise-900" },
  { name: "noir-950", className: "bg-noir-950" },
  { name: "noir-900", className: "bg-noir-900" },
  { name: "noir-800", className: "bg-noir-800" },
  { name: "noir-700", className: "bg-noir-700" },
  { name: "or-300", className: "bg-or-300" },
  { name: "or-400", className: "bg-or-400" },
  { name: "or-500", className: "bg-or-500" },
  { name: "or-600", className: "bg-or-600" },
  { name: "blanc", className: "bg-blanc" },
  { name: "gris-100", className: "bg-gris-100" },
  { name: "gris-400", className: "bg-gris-400" },
  { name: "gris-600", className: "bg-gris-600" },
];

const STEPPER_STEPS = [
  { id: "type", label: "Type" },
  { id: "fichiers", label: "Fichiers" },
  { id: "metadonnees", label: "Métadonnées" },
  { id: "contributeurs", label: "Contributeurs" },
  { id: "pochette", label: "Pochette" },
];

const CHART_DATA = [
  { mois: "Jan", streams: 1200 },
  { mois: "Fév", streams: 1900 },
  { mois: "Mar", streams: 1500 },
  { mois: "Avr", streams: 2400 },
  { mois: "Mai", streams: 2100 },
];

const CHART_CONFIG = {
  streams: { label: "Streams", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

/**
 * Page de référence interne du Design System (Sprint 1, §9 du CDC).
 * Pas destinée aux utilisateurs finaux — sert de catalogue vivant pour
 * l'équipe (dev/design) et de terrain de vérification visuelle
 * (light/dark, responsive). `robots: noindex` hérité du layout `(private)`.
 */
export default function DesignSystemPage() {
  const [stepIndex, setStepIndex] = useState(1);
  const [uploaderFiles, setUploaderFiles] = useState<UploaderFile[]>([
    { id: "1", name: "titre-single.wav", sizeBytes: 42_000_000, progress: 62, status: "uploading" },
    { id: "2", name: "artwork.png", sizeBytes: 3_200_000, progress: 100, status: "success" },
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 p-6 sm:p-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Design System</h1>
          <p className="text-body text-muted-foreground">Sterkte Records — Sprint 1 (§9 du CDC)</p>
        </div>
        <ThemeToggle />
      </header>

      {/* --- Typographie --- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Typographie</h2>
        <div className="border-border flex flex-col gap-2 rounded-lg border p-6">
          <p className="text-display">Display 3.5rem</p>
          <p className="text-h1">Titre H1 2.5rem</p>
          <p className="text-h2">Titre H2 1.875rem</p>
          <p className="text-h3">Titre H3 1.375rem</p>
          <p className="text-body-lg">Corps large 1.125rem — intro de section.</p>
          <p className="text-body">Corps 1rem — texte courant.</p>
          <p className="text-small">Petit 0.875rem — légendes.</p>
          <p className="text-caption">Caption 0.75rem — métadonnées.</p>
          <p className="text-small font-mono">ISRC0000001 · UPC123456789012 (font-mono)</p>
        </div>
      </section>

      {/* --- Palette --- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Palette</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-9">
          {COLOR_SWATCHES.map((swatch) => (
            <div key={swatch.name} className="flex flex-col items-center gap-1">
              <div className={`border-border size-12 rounded-md border ${swatch.className}`} />
              <span className="text-caption text-muted-foreground">{swatch.name}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Succès</Badge>
          <Badge variant="destructive">Erreur</Badge>
          <Badge variant="warning">Avertissement</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="gold">Pro</Badge>
        </div>
      </section>

      {/* --- Boutons --- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Boutons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primaire</Button>
          <Button variant="outline">Secondaire</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Danger</Button>
          <Button variant="gold">
            Gold <Badge variant="gold">Pro</Badge>
          </Button>
          <Button loading>Chargement</Button>
          <Button disabled>Désactivé</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs">XS</Button>
          <Button size="sm">SM</Button>
          <Button size="default">Default</Button>
          <Button size="lg">LG</Button>
          <Button size="icon" aria-label="Ajouter">
            <PlusIcon />
          </Button>
        </div>
      </section>

      {/* --- Formulaires --- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Champs de saisie</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="demo-title">Titre de la sortie</Label>
            <Input id="demo-title" placeholder="Ex. Nzembo ya Bomengo" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="demo-genre">Genre</Label>
            <Select>
              <SelectTrigger id="demo-genre" className="w-full">
                <SelectValue placeholder="Choisir un genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="afrobeat">Afrobeat</SelectItem>
                <SelectItem value="ndombolo">Ndombolo</SelectItem>
                <SelectItem value="rnb">R&B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="demo-desc">Description</Label>
            <Textarea id="demo-desc" placeholder="Notes internes sur la sortie…" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="demo-explicit" />
            <Label htmlFor="demo-explicit">Contenu explicite</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="demo-apple" />
            <Label htmlFor="demo-apple">Option Artwork Apple Music (+10 €)</Label>
          </div>
        </div>
      </section>

      {/* --- Cartes / Avatars / Tooltips --- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Cartes</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Streams (30 j)</CardTitle>
              <CardDescription>+12 % vs période précédente</CardDescription>
            </CardHeader>
            <CardContent className="text-h2">24 812</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <Avatar>
                <AvatarFallback>AK</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Axel l&apos;or Kaumba</CardTitle>
                <CardDescription>Artiste principal</CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Retrait</CardTitle>
            </CardHeader>
            <CardContent>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button variant="outline" size="sm">
                      Seuil minimum
                    </Button>
                  }
                />
                <TooltipContent>Retrait possible à partir de 100 $ (§11.5).</TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* --- Table & Tabs --- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Table & onglets</h2>
        <Tabs defaultValue="sorties">
          <TabsList>
            <TabsTrigger value="sorties">Sorties</TabsTrigger>
            <TabsTrigger value="revenus">Revenus</TabsTrigger>
          </TabsList>
          <TabsContent value="sorties">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Nzembo ya Bomengo</TableCell>
                  <TableCell>Single</TableCell>
                  <TableCell>
                    <Badge variant="success">Livrée</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Album Test</TableCell>
                  <TableCell>Album</TableCell>
                  <TableCell>
                    <Badge variant="warning">En validation</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="revenus">
            <p className="text-small text-muted-foreground">Données à venir (Sprint Royalties).</p>
          </TabsContent>
        </Tabs>
      </section>

      {/* --- Dialog / Sheet / Dropdown --- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Overlays</h2>
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger render={<Button variant="outline">Ouvrir une modale</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Retirer de la distribution</DialogTitle>
                <DialogDescription>
                  Cette action interrompt la continuité des statistiques (§11.4).
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive">Confirmer le retrait</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger render={<Button variant="outline">Ouvrir un tiroir</Button>} />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
                <SheetDescription>Statut, type, période, plateforme (§16).</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline">Menu</Button>} />
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => toast.success("Modifications enregistrées.")}>
                Enregistrer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.error("Le paiement n'a pas abouti.")}>
                Simuler une erreur
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* --- Stepper --- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Stepper (tunnel de distribution, §11.4)</h2>
        <Stepper steps={STEPPER_STEPS} currentStep={stepIndex} />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStepIndex((step) => Math.max(0, step - 1))}
          >
            Précédent
          </Button>
          <Button
            size="sm"
            onClick={() => setStepIndex((step) => Math.min(STEPPER_STEPS.length - 1, step + 1))}
          >
            Suivant
          </Button>
        </div>
      </section>

      {/* --- Uploader --- */}
      <section className="flex flex-col gap-3">
        <h2 className="text-h2">Uploader de fichiers</h2>
        <FileUploader
          accept="audio/wav,audio/flac,audio/mpeg"
          multiple
          files={uploaderFiles}
          onFilesSelected={(selected) => {
            setUploaderFiles((current) => [
              ...current,
              ...selected.map((file, index) => ({
                id: `${Date.now()}-${index}`,
                name: file.name,
                sizeBytes: file.size,
                progress: 0,
                status: "pending" as const,
              })),
            ]);
          }}
          onRemoveFile={(id) => setUploaderFiles((current) => current.filter((f) => f.id !== id))}
          dropzoneLabel="Glissez-déposez vos fichiers ici, ou cliquez pour parcourir"
          dropzoneHint="WAV recommandé — FLAC, MP3 également acceptés"
          removeFileLabel={(fileName) => `Retirer ${fileName}`}
          defaultErrorMessage="Échec de l'envoi."
        />
      </section>

      {/* --- État vide & Skeleton --- */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-h2">État vide</h2>
          <EmptyState
            icon={MusicIcon}
            title="Aucune sortie pour l'instant"
            description="Distribuez votre première œuvre pour la voir apparaître ici."
            action={<Button size="sm">Nouvelle sortie</Button>}
          />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-h2">Skeleton</h2>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </section>

      {/* --- Progress & Chart --- */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-h2">Progression</h2>
          <Progress value={68} />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-h2">Graphique (streams/mois, §15)</h2>
          <ChartContainer config={CHART_CONFIG} className="h-40 w-full">
            <BarChart data={CHART_DATA}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="mois" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="streams" fill="var(--color-streams)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </section>

      <Separator />
      <p className="text-caption text-muted-foreground pb-10">
        Page interne — non indexée, non destinée aux utilisateurs finaux.
      </p>
    </div>
  );
}
