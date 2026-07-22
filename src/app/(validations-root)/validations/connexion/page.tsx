import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function ValidationsLoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-h3 font-display">Dashboard de validation</CardTitle>
          <CardDescription>Réservé à l&apos;équipe Sterkte Records.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
