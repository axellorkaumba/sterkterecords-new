"use client";

import * as React from "react";
import * as ReactHookForm from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = ReactHookForm.FormProvider;

type FormFieldContextValue<
  TFieldValues extends ReactHookForm.FieldValues = ReactHookForm.FieldValues,
  TName extends ReactHookForm.FieldPath<TFieldValues> = ReactHookForm.FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

function FormField<
  TFieldValues extends ReactHookForm.FieldValues = ReactHookForm.FieldValues,
  TName extends ReactHookForm.FieldPath<TFieldValues> = ReactHookForm.FieldPath<TFieldValues>,
>(props: ReactHookForm.ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <ReactHookForm.Controller {...props} />
    </FormFieldContext.Provider>
  );
}

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = ReactHookForm.useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField doit être utilisé à l'intérieur de <FormField>.");
  }
  if (!itemContext) {
    throw new Error("useFormField doit être utilisé à l'intérieur de <FormItem>.");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("flex flex-col gap-1.5", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

/**
 * Base UI n'expose pas de `Slot` générique (à la Radix) — contrairement à
 * `Button`/`Select` qui acceptent chacun leur propre prop `render`, un champ
 * de formulaire quelconque (Input, Textarea, Select, Checkbox…) n'a pas
 * d'API de composition commune. On clone donc l'unique enfant pour lui
 * injecter `id`/`aria-*`, ce qui reste l'équivalent direct de `asChild` pour
 * ce cas précis (un seul enfant, toujours un contrôle de formulaire).
 */
interface FormControlProps {
  children: React.ReactElement<Record<string, unknown>>;
}

function FormControl({ children }: FormControlProps) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return React.cloneElement(children, {
    "data-slot": "form-control",
    id: formItemId,
    "aria-describedby": !error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`,
    "aria-invalid": !!error,
  });
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-small", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  // `children` explicite (message traduit choisi par l'appelant) prend
  // toujours le pas sur `error.message` — qui vient de Zod et n'est jamais
  // traduit. `error.message` ne sert que de repli quand l'appelant n'a rien
  // précisé (ex. `<FormMessage />` seul).
  const body = props.children ?? (error ? String(error.message ?? "") : undefined);

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-small", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
