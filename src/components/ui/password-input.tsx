"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  /**
   * Libellés du bouton afficher/masquer. Repli en français codé en dur (pas
   * de `useTranslations` ici — ce composant est un primitif `ui/`, réutilisé
   * jusque dans `/validations` qui n'a volontairement aucun
   * `NextIntlClientProvider`, voir son layout). Les écrans i18n (inscription,
   * connexion, paramètres...) passent `Common.showPassword`/`hidePassword`.
   */
  showLabel?: string;
  hideLabel?: string;
}

/**
 * Champ mot de passe avec bouton afficher/masquer — aucun input `type`
 * "password" du site n'en avait (remarque d'Axel sur /inscription, mais le
 * même trou existait sur /connexion, réinitialisation, changement de mot de
 * passe et suppression de compte). Un seul composant plutôt que de dupliquer
 * le bouton œil à 6 endroits.
 */
const PasswordInput = React.forwardRef<React.ComponentRef<typeof Input>, PasswordInputProps>(
  (
    {
      className,
      showLabel = "Afficher le mot de passe",
      hideLabel = "Masquer le mot de passe",
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-9", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          tabIndex={-1}
          className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-8 items-center justify-center outline-none"
        >
          {visible ? (
            <EyeOffIcon className="size-4" aria-hidden="true" />
          ) : (
            <EyeIcon className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
