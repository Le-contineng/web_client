"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ActionBar } from "@/shared/components/ActionBar";
import { FormField } from "@/shared/components/FormField";
import {
  FILLED_FIELD,
  FILLED_TEXTAREA,
  PRIMARY_ACTION,
} from "@/shared/components/form-kit";
import { CameraIcon } from "@/shared/components/icons";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { useFormAction } from "@/shared/hooks/useFormAction";
import { useErrorMessages } from "@/shared/i18n/errors";
import type { FormAction, FormState } from "@/shared/lib/form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { usePhotoUpload } from "@/modules/medias";
import {
  ORGANIZATION_TYPES,
  type Page,
} from "@/modules/pages/domain/page.types";

/**
 * « Modifier la page », réservé au propriétaire : photo, nom, type et
 * description, comme « Modifier le profil » d'un réseau social.
 */
export function PageEditForm({
  page,
  action,
}: {
  page: Page;
  action: FormAction;
}) {
  const t = useTranslations();
  const errors = useErrorMessages();
  const {
    state,
    onSubmit,
    enCours,
    action: send,
  } = useFormAction<FormState>(action, {});
  const c = state.fieldErrors ?? {};
  const [preview, setPreview] = useState(page.photoUrl);
  const [remove, setRemove] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  // La photo part dès qu'elle est choisie ; le formulaire n'envoie que son adresse.
  const photo = usePhotoUpload();
  const types = ORGANIZATION_TYPES.map((type) => ({
    value: type,
    label: t(`pages.types.${type}`),
  }));
  const hasPhoto = !remove && !!preview;
  return (
    <form action={send} onSubmit={onSubmit} className="grid gap-5" noValidate>
      {/* Photo : l'avatar et ses deux actions, à la place du sélecteur de fichier du navigateur */}
      <FormField
        id="photo"
        label={t("pages.edit.photo")}
        error={errors(photo.error ?? c.photo ?? c.photoUrl)}
        help={
          photo.uploading
            ? t("common.photoUploading")
            : t("common.photoFormats")
        }
      >
        <input type="hidden" name="photoUrl" value={photo.url ?? ""} />
        <input type="hidden" name="removePhoto" value={remove ? "1" : ""} />
        <input
          ref={fileInput}
          id="photo"
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : page.photoUrl);
            setRemove(false);
            if (f) void photo.upload(f);
            else photo.reset();
          }}
        />
        <div className="flex items-center gap-4 rounded-xl bg-muted p-3">
          <ProfileAvatar
            name={page.name}
            photo={hasPhoto ? preview : null}
            size="lg"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInput.current?.click()}
              aria-invalid={!!(photo.error ?? c.photo)}
            >
              <CameraIcon /> {t("pages.edit.changePhoto")}
            </Button>
            {hasPhoto && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setRemove(true);
                  photo.reset();
                  if (fileInput.current) fileInput.current.value = "";
                }}
              >
                {t("common.removePhoto")}
              </Button>
            )}
          </div>
        </div>
      </FormField>
      <FormField
        id="name"
        label={t("pages.request.name")}
        error={errors(c.name)}
        help={t("pages.edit.linkKept", { slug: page.slug })}
      >
        <Input
          id="name"
          name="name"
          maxLength={60}
          defaultValue={page.name}
          aria-invalid={!!c.name}
          className={FILLED_FIELD}
        />
      </FormField>
      <FormField
        id="type"
        label={t("pages.request.type")}
        error={errors(c.type)}
      >
        <Select name="type" defaultValue={page.type} items={types}>
          <SelectTrigger
            id="type"
            aria-invalid={!!c.type}
            className={cn(FILLED_FIELD, "w-full pr-3 data-[size=default]:h-12")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {types.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField
        id="description"
        label={t("pages.edit.bio")}
        error={errors(c.description)}
      >
        <Textarea
          id="description"
          name="description"
          maxLength={500}
          rows={4}
          defaultValue={page.description}
          aria-invalid={!!c.description}
          className={FILLED_TEXTAREA}
        />
      </FormField>
      {state.error && !state.fieldErrors && (
        <p role="alert" className="text-sm text-destructive">
          {errors(state.error)}
        </p>
      )}
      <ActionBar>
        <Button
          type="submit"
          size="lg"
          disabled={enCours || photo.uploading}
          className={PRIMARY_ACTION}
        >
          {t("common.save")}
        </Button>
      </ActionBar>
    </form>
  );
}
