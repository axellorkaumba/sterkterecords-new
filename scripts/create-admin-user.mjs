#!/usr/bin/env node
/**
 * Crée (ou met à jour le mot de passe d') un compte nommé du dashboard de
 * validation des paiements (`/validations`) — table `admin_users`, auth
 * séparée de Supabase Auth (voir docs/adr/0026-validation-manuelle-paiements.md).
 *
 * Le mot de passe n'est jamais stocké/journalisé en clair : hashé (bcrypt)
 * localement avant l'écriture en base via le client service_role.
 *
 * Usage : pnpm admin:create-user -- <username> "<Nom affiché>" "<mot de passe>"
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const [username, displayName, password] = process.argv.slice(2);

if (!username || !displayName || !password) {
  console.error('Usage : pnpm admin:create-user -- <username> "<Nom affiché>" "<mot de passe>"');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "[admin:create-user] NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis " +
      "(dans .env.local — le script est lancé avec --env-file=.env.local).",
  );
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error } = await supabase
  .from("admin_users")
  .upsert(
    { username, display_name: displayName, password_hash: passwordHash, active: true },
    { onConflict: "username" },
  );

if (error) {
  console.error(`[admin:create-user] Échec : ${error.message}`);
  process.exit(1);
}

console.log(`[admin:create-user] Compte "${username}" (${displayName}) créé/mis à jour.`);
