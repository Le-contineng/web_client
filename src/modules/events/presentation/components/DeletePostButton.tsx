"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deletePostAction } from "@/modules/events/application/posts.actions";
import { TrashIcon } from "@/shared/components/icons";
import { useErrorMessages } from "@/shared/i18n/errors";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";

/**
 * Suppression d'un post par un membre de la page (ADR 0029 du backend), après
 * une confirmation : le post et ses photos disparaissent pour de bon.
 */
export function DeletePostButton({
  pageId,
  eventId,
  postId,
  onDeleted,
}: {
  pageId: string;
  eventId: string;
  postId: string;
  onDeleted: () => void;
}) {
  const t = useTranslations();
  const errors = useErrorMessages();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const confirm = () =>
    start(async () => {
      const { error } = await deletePostAction(pageId, eventId, postId);
      if (error) {
        toast.error(errors(error));
        return;
      }
      setOpen(false);
      toast.success(t("posts.deleted"));
      onDeleted();
    });
  return (
    <AlertDialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <AlertDialogTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            aria-label={t("posts.delete")}
            className="ml-auto text-muted-foreground hover:text-destructive"
          />
        }
      >
        <TrashIcon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("posts.deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("posts.deleteDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={confirm}
          >
            {t("posts.deleteConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
