"use client";

import { ProhibitIcon } from "@/shared/components/icons";
import { useTranslations } from "next-intl";
import { FormField } from "@/shared/components/FormField";
import { useFormAction } from "@/shared/hooks/useFormAction";
import { useErrorMessages } from "@/shared/i18n/errors";
import type { FormAction, FormState } from "@/shared/lib/form";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";

/** Annulation définitive avec motif obligatoire et confirmation (US-15, D9). */
export function CancelEventDialog({
  eventId,
  action,
  open,
  onOpenChange,
}: {
  eventId: string;
  action: FormAction;
  /** Ouverture pilotée de l'extérieur (menu d'actions) : pas de bouton déclencheur. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useTranslations();
  const errors = useErrorMessages();
  const {
    state,
    onSubmit,
    enCours,
    action: send,
  } = useFormAction<FormState>(action, {});
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open === undefined && (
        <DialogTrigger render={<Button variant="destructive" />}>
          <ProhibitIcon /> {t("events.cancel")}
        </DialogTrigger>
      )}
      <DialogContent>
        <form
          action={send}
          onSubmit={onSubmit}
          className="grid gap-4"
          noValidate
        >
          <DialogHeader>
            <DialogTitle>{t("events.cancel")}</DialogTitle>
            <DialogDescription>
              {t("events.cancelConfirmation")}
            </DialogDescription>
          </DialogHeader>
          <input type="hidden" name="id" value={eventId} />
          <FormField
            id="reason"
            label={t("events.cancellationReason")}
            error={errors(state.fieldErrors?.reason)}
          >
            <Textarea
              id="reason"
              name="reason"
              rows={3}
              aria-invalid={!!state.fieldErrors?.reason}
            />
          </FormField>
          {state.error && !state.fieldErrors && (
            <p role="alert" className="text-sm text-destructive">
              {errors(state.error)}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={enCours}>
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
