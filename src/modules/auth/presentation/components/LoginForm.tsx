"use client";

import { useTranslations } from "next-intl";
import { FormField } from "@/shared/components/FormField";
import { useFormAction } from "@/shared/hooks/useFormAction";
import { useErrorMessages } from "@/shared/i18n/errors";
import type { FormAction, FormState } from "@/shared/lib/form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { AUTH_FIELD_CLASS } from "@/modules/auth/presentation/components/AuthCard";

export function LoginForm({
  action,
  returnTo = "/",
}: {
  action: FormAction;
  returnTo?: string;
}) {
  const t = useTranslations("auth");
  const errors = useErrorMessages();
  const {
    state,
    onSubmit,
    enCours,
    action: send,
  } = useFormAction<FormState>(action, {});
  return (
    <form action={send} onSubmit={onSubmit} className="grid gap-4" noValidate>
      <input type="hidden" name="returnTo" value={returnTo} />
      <FormField id="email" label={t("email")}>
        <Input
          className={AUTH_FIELD_CLASS}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
        />
      </FormField>
      <FormField id="password" label={t("password")}>
        <Input
          className={AUTH_FIELD_CLASS}
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
      </FormField>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {errors(state.error)}
        </p>
      )}
      <Button
        type="submit"
        variant="glass-primary"
        size="pill"
        disabled={enCours}
        className="mt-1 h-[52px] w-full text-base"
      >
        {t("login")}
      </Button>
    </form>
  );
}
