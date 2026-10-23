"use client";

import { useTranslations } from "next-intl";
import { FormField } from "@/shared/components/FormField";
import { useFormAction } from "@/shared/hooks/useFormAction";
import { useErrorMessages } from "@/shared/i18n/errors";
import type { FormAction, FormState } from "@/shared/lib/form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { AUTH_FIELD_CLASS } from "@/modules/auth/presentation/components/AuthCard";

export function RegisterForm({
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
  const c = state.fieldErrors ?? {};
  return (
    <form action={send} onSubmit={onSubmit} className="grid gap-4" noValidate>
      <input type="hidden" name="returnTo" value={returnTo} />
      <FormField id="name" label={t("name")} error={errors(c.name)}>
        <Input
          className={AUTH_FIELD_CLASS}
          id="name"
          name="name"
          autoComplete="name"
          aria-invalid={!!c.name}
        />
      </FormField>
      <FormField id="email" label={t("email")} error={errors(c.email)}>
        <Input
          className={AUTH_FIELD_CLASS}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!c.email}
        />
      </FormField>
      <FormField id="password" label={t("password")} error={errors(c.password)}>
        <Input
          className={AUTH_FIELD_CLASS}
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!c.password}
        />
      </FormField>
      <Button
        type="submit"
        variant="glass-primary"
        size="pill"
        disabled={enCours}
        className="mt-1 h-[52px] w-full text-base"
      >
        {t("register")}
      </Button>
    </form>
  );
}
