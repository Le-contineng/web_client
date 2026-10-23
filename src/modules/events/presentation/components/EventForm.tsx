"use client";

import { ImageIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { FIELD_CLASS, FormField } from "@/shared/components/FormField";
import { useFormAction } from "@/shared/hooks/useFormAction";
import { useMounted } from "@/shared/hooks/useMounted";
import { useErrorMessages } from "@/shared/i18n/errors";
import type { FormAction, FormState } from "@/shared/lib/form";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { Textarea } from "@/shared/ui/textarea";
import { usePhotoUpload } from "@/modules/medias";
import { CATEGORIES, type Event } from "@/modules/events/domain/event";
import { DEFAULT_IMAGE } from "@/modules/events/presentation/components/EventCard";
import {
  CAPSULE_CLASS,
  CapsuleMark,
  chipStyle,
} from "@/modules/events/presentation/components/CategoryChips";

/** Section du formulaire : carte opaque. */
const SECTION = "rounded-card bg-card p-4 shadow-card sm:p-5";

/** ISO UTC → valeur d'un champ datetime-local dans l'heure de l'appareil (D7). */
function toLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Heure locale saisie → ISO UTC envoyé au serveur. */
function toUtc(formData: FormData, source: string, target: string) {
  const local = formData.get(source);
  formData.set(
    target,
    typeof local === "string" && local ? new Date(local).toISOString() : "",
  );
}

function zoneName(locale: string): string {
  const iana = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const long = new Intl.DateTimeFormat(locale, { timeZoneName: "long" })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName")?.value;
  return long ? `${long} (${iana})` : iana;
}

/**
 * Formulaire de création (US-11) et de modification (US-15). La page
 * organisatrice, choisie avant le formulaire, n'y est pas modifiable. Les valeurs saisies
 * sont conservées en cas d'erreur.
 */
export function EventForm({
  page,
  event,
  action,
}: {
  page: { name: string; photoUrl: string | null };
  event?: Event;
  action: FormAction;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const errors = useErrorMessages();
  const mounted = useMounted();
  const {
    state,
    onSubmit,
    enCours,
    action: send,
  } = useFormAction<FormState>(action, {}, (formData) => {
    toUtc(formData, "startsAtLocal", "startsAt");
    toUtc(formData, "endsAtLocal", "endsAt");
  });
  const [preview, setPreview] = useState(event?.photoUrl ?? null);
  const [remove, setRemove] = useState(false);
  // La photo part dès qu'elle est choisie ; le formulaire n'envoie que son adresse.
  const photo = usePhotoUpload();
  const [description, setDescription] = useState(event?.description ?? "");
  const c = state.fieldErrors ?? {};

  // Les dates dépendent du fuseau de l'appareil : rendu côté navigateur uniquement.
  if (!mounted) return <Skeleton className="h-[640px] w-full rounded-card" />;

  return (
    <form action={send} onSubmit={onSubmit} className="grid gap-3" noValidate>
      {event && <input type="hidden" name="id" value={event.id} />}

      <div className={cn(SECTION, "flex items-center gap-3")}>
        <ProfileAvatar name={page.name} photo={page.photoUrl} size="sm" />
        <div className="text-sm">
          <p className="text-xs text-muted-foreground">
            {t("events.organizerPage")}
          </p>
          <p className="font-semibold">{page.name}</p>
        </div>
      </div>

      <FormField
        className={SECTION}
        id="photo"
        label={t("common.optionalPhoto")}
        error={errors(photo.error ?? c.photo ?? c.photoUrl)}
        help={
          photo.uploading
            ? t("common.photoUploading")
            : t("common.photoFormats")
        }
      >
        <input type="hidden" name="photoUrl" value={photo.url ?? ""} />
        <div className="flex items-center gap-4">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-media bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local */}
            <img
              src={(!remove && preview) || DEFAULT_IMAGE}
              alt=""
              className="size-full object-cover"
            />
            {!preview && (
              <ImageIcon className="absolute inset-0 m-auto size-6 text-white/80" />
            )}
          </div>
          <div className="grid flex-1 gap-2">
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-invalid={!!(photo.error ?? c.photo)}
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreview(
                  f ? URL.createObjectURL(f) : (event?.photoUrl ?? null),
                );
                setRemove(false);
                if (f) void photo.upload(f);
                else photo.reset();
              }}
            />
            {event?.photoUrl && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="hidden"
                  name="removePhoto"
                  value={remove ? "1" : ""}
                />
                <Checkbox
                  checked={remove}
                  onCheckedChange={(v) => setRemove(v === true)}
                />
                {t("common.removePhoto")}
              </label>
            )}
          </div>
        </div>
      </FormField>

      <div className={cn(SECTION, "grid gap-5")}>
        <FormField id="name" label={t("events.name")} error={errors(c.name)}>
          <Input
            className={FIELD_CLASS}
            id="name"
            name="name"
            maxLength={100}
            defaultValue={event?.name}
            aria-invalid={!!c.name}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="startsAtLocal"
            label={t("events.startsAt")}
            error={errors(c.startsAt)}
          >
            <Input
              className={FIELD_CLASS}
              id="startsAtLocal"
              name="startsAtLocal"
              type="datetime-local"
              defaultValue={toLocal(event?.startsAt ?? null)}
              aria-invalid={!!c.startsAt}
            />
          </FormField>
          <FormField
            id="endsAtLocal"
            label={
              <>
                {t("events.endsAt")}{" "}
                <span className="font-normal text-muted-foreground">
                  ({t("common.optional")})
                </span>
              </>
            }
            error={errors(c.endsAt)}
          >
            <Input
              className={FIELD_CLASS}
              id="endsAtLocal"
              name="endsAtLocal"
              type="datetime-local"
              defaultValue={toLocal(event?.endsAt ?? null)}
              aria-invalid={!!c.endsAt}
            />
          </FormField>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            {t("events.timeZone", { timeZone: zoneName(locale) })}
          </p>
        </div>

        <FormField
          id="location"
          label={t("events.location")}
          error={errors(c.location)}
        >
          <Input
            className={FIELD_CLASS}
            id="location"
            name="location"
            maxLength={150}
            defaultValue={event?.location}
            aria-invalid={!!c.location}
          />
        </FormField>
      </div>

      <fieldset className={cn(SECTION, "grid gap-2")}>
        <legend className="float-left mb-3 text-sm font-medium">
          {t("events.categories")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <label key={cat} className={CAPSULE_CLASS} style={chipStyle(cat)}>
              <input
                type="checkbox"
                name="categories"
                value={cat}
                defaultChecked={event?.categories.includes(cat)}
                className="sr-only"
              />
              <CapsuleMark />
              {t(`categories.${cat}`)}
            </label>
          ))}
        </div>
        {c.categories && (
          <p role="alert" className="text-sm text-destructive">
            {errors(c.categories)}
          </p>
        )}
      </fieldset>

      <FormField
        className={SECTION}
        id="description"
        label={
          <>
            {t("events.description")}{" "}
            <span className="font-normal text-muted-foreground">
              ({t("common.optional")})
            </span>
          </>
        }
        error={errors(c.description)}
        help={t("common.characters", { n: description.length, max: 2000 })}
      >
        <Textarea
          id="description"
          name="description"
          rows={5}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={!!c.description}
          className="min-h-32 rounded-field border-transparent bg-muted px-4 py-3 text-base md:text-base dark:bg-muted"
        />
      </FormField>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg bg-danger-fond p-3 text-sm text-danger"
        >
          {errors(state.error)}
        </p>
      )}

      {/* Barre d'action flottante, au-dessus de la barre d'onglets. */}
      <div className="sticky bottom-[calc(6rem+env(safe-area-inset-bottom))] z-20 md:bottom-4">
        <div className="ct-glass flex rounded-full p-1.5">
          <Button
            type="submit"
            variant="glass-primary"
            size="pill"
            disabled={enCours || photo.uploading}
            className="h-12 flex-1 text-base sm:flex-none sm:px-8"
          >
            {event ? t("common.save") : t("events.publish")}
          </Button>
        </div>
      </div>
    </form>
  );
}
