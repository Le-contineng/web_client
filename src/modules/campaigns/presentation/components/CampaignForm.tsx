"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState, useTransition } from "react";
import { usePhotoUpload } from "@/modules/medias";
import type { AdminCampaign } from "@/modules/campaigns/domain/campaign-admin";
import {
  CAMPAIGN_PLACEMENTS,
  type CampaignPlacement,
} from "@/modules/campaigns/domain/campaign";
import { FormField } from "@/shared/components/FormField";
import { useErrorMessages } from "@/shared/i18n/errors";
import type { FormAction, FormState } from "@/shared/lib/form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { mediaSrc } from "@/shared/lib/media-src";

type Option = { id: string; name: string };

/** Pages, comptes et événements proposés, chargés par la route. */
export type CampaignFormOptions = {
  pages: Option[];
  accounts: Option[];
  events: Option[];
};

const SELECT =
  "h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm";

/**
 * Formulaire d'une campagne (ADR 0023 du backend) : type, diffuseur (page ou
 * compte), contenu, deux visuels (affiche de la carte, visuel de la bannière),
 * cible, emplacements et période. Les dates sont saisies à l'heure de
 * l'appareil et envoyées en UTC. L'API vérifie tout et renvoie les erreurs
 * par champ.
 */
export function CampaignForm({
  campaign,
  options,
  action,
}: {
  campaign?: AdminCampaign;
  options: CampaignFormOptions;
  action: FormAction;
}) {
  const t = useTranslations("admin.campaigns");
  const errors = useErrorMessages();
  const [state, submit, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );
  const [, startTransition] = useTransition();
  const field = (name: string) => errors(state.fieldErrors?.[name]);
  const [sponsorType, setSponsorType] = useState(
    campaign?.sponsor.type ?? "ACCOUNT",
  );
  const [targetType, setTargetType] = useState(campaign?.target.type ?? "PAGE");
  const [startsAt, setStartsAt] = useState(local(campaign?.startsAt));
  const [endsAt, setEndsAt] = useState(local(campaign?.endsAt));
  const sponsors = sponsorType === "PAGE" ? options.pages : options.accounts;

  return (
    <form
      // Envoi sans « action » : React viderait le formulaire après chaque
      // envoi, même refusé, et il faudrait tout ressaisir.
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => submit(data));
      }}
      className="grid max-w-2xl gap-5"
    >
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.fieldErrors
            ? t("fixErrors", {
                fields: Object.keys(state.fieldErrors)
                  .map((f) =>
                    t.has(`fieldNames.${f}` as "title")
                      ? t(`fieldNames.${f}` as "title")
                      : f,
                  )
                  .join(", "),
              })
            : errors(state.error)}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="kind" label={t("kind")} error={field("kind")}>
          <select
            id="kind"
            name="kind"
            defaultValue={campaign?.kind ?? "SPONSORED"}
            className={SELECT}
          >
            <option value="SPONSORED">{t("kinds.SPONSORED")}</option>
            <option value="ANNOUNCEMENT">{t("kinds.ANNOUNCEMENT")}</option>
          </select>
        </FormField>
        <FormField id="sponsorId" label={t("sponsor")} error={field("sponsor")}>
          <div className="flex gap-2">
            <select
              aria-label={t("sponsor")}
              name="sponsorType"
              value={sponsorType}
              onChange={(e) =>
                setSponsorType(e.target.value as "PAGE" | "ACCOUNT")
              }
              className={`${SELECT} w-auto`}
            >
              <option value="ACCOUNT">{t("sponsorTypes.ACCOUNT")}</option>
              <option value="PAGE">{t("sponsorTypes.PAGE")}</option>
            </select>
            <select
              id="sponsorId"
              name="sponsorId"
              // Une autre liste : on repart d'un choix vide
              key={sponsorType}
              defaultValue={
                campaign?.sponsor.type === sponsorType
                  ? campaign.sponsor.id
                  : ""
              }
              required
              className={SELECT}
            >
              <option value="">{t("choose")}</option>
              {sponsors.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </FormField>
      </div>

      <FormField id="title" label={t("title")} error={field("title")}>
        <Input
          id="title"
          name="title"
          maxLength={80}
          required
          defaultValue={campaign?.title}
        />
      </FormField>
      <FormField
        id="body"
        label={t("body")}
        help={t("bodyHelp")}
        error={field("body")}
      >
        <Textarea
          id="body"
          name="body"
          maxLength={1000}
          rows={2}
          defaultValue={campaign?.body ?? ""}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="ctaLabel"
          label={t("ctaLabel")}
          error={field("ctaLabel")}
        >
          <Input
            id="ctaLabel"
            name="ctaLabel"
            maxLength={30}
            required
            defaultValue={campaign?.ctaLabel}
          />
        </FormField>
        <FormField
          id="accentColor"
          label={t("accentColor")}
          error={field("accentColor")}
        >
          <Input
            id="accentColor"
            name="accentColor"
            type="color"
            className="h-9 w-20 p-1"
            defaultValue={campaign?.accentColor ?? "#db2777"}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ImageField
          name="posterUrl"
          label={t("poster")}
          initial={campaign?.posterUrl ?? null}
          error={field("posterUrl")}
          previewClassName="aspect-[4/5]"
        />
        <ImageField
          name="bannerImageUrl"
          label={t("banner")}
          help={t("bannerHelp")}
          initial={campaign?.bannerImageUrl ?? null}
          error={field("bannerImageUrl")}
          previewClassName="aspect-square max-w-32"
        />
      </div>

      <FormField id="targetType" label={t("target")} error={field("target")}>
        <div className="flex gap-2">
          <select
            id="targetType"
            name="targetType"
            value={targetType}
            onChange={(e) =>
              setTargetType(e.target.value as "EVENT" | "PAGE" | "URL")
            }
            className={`${SELECT} w-auto`}
          >
            <option value="PAGE">{t("targetTypes.PAGE")}</option>
            <option value="EVENT">{t("targetTypes.EVENT")}</option>
            <option value="URL">{t("targetTypes.URL")}</option>
          </select>
          {targetType === "URL" ? (
            <Input
              aria-label={t("targetUrl")}
              name="targetUrl"
              type="url"
              placeholder="https://"
              required
              defaultValue={campaign?.target.url ?? ""}
            />
          ) : (
            <select
              aria-label={t("target")}
              name={targetType === "PAGE" ? "targetPageId" : "targetEventId"}
              key={targetType}
              required
              defaultValue={
                (targetType === "PAGE"
                  ? campaign?.target.pageId
                  : campaign?.target.eventId) ?? ""
              }
              className={SELECT}
            >
              <option value="">{t("choose")}</option>
              {(targetType === "PAGE" ? options.pages : options.events).map(
                (o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ),
              )}
            </select>
          )}
        </div>
      </FormField>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-medium">{t("placements")}</legend>
        {CAMPAIGN_PLACEMENTS.map((p: CampaignPlacement) => (
          <label key={p} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="placements"
              value={p}
              defaultChecked={campaign ? campaign.placements.includes(p) : true}
            />
            {t(`placementNames.${p}`)}
          </label>
        ))}
        {field("placements") && (
          <p role="alert" className="text-sm text-destructive">
            {field("placements")}
          </p>
        )}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="startsAtLocal"
          label={t("startsAt")}
          error={field("startsAt")}
        >
          <Input
            id="startsAtLocal"
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
          <input type="hidden" name="startsAt" value={utc(startsAt)} />
        </FormField>
        <FormField id="endsAtLocal" label={t("endsAt")} error={field("endsAt")}>
          <Input
            id="endsAtLocal"
            type="datetime-local"
            required
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
          <input type="hidden" name="endsAt" value={utc(endsAt)} />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="priority"
          label={t("priority")}
          help={t("priorityHelp")}
          error={field("priority")}
        >
          <Input
            id="priority"
            name="priority"
            type="number"
            min={0}
            max={100}
            defaultValue={campaign?.priority ?? 0}
          />
        </FormField>
        <label className="flex items-center gap-2 self-center text-sm">
          <input
            type="checkbox"
            name="dismissible"
            defaultChecked={campaign?.dismissible ?? true}
          />
          {t("dismissible")}
        </label>
      </div>

      <Button type="submit" disabled={pending} className="w-fit">
        {campaign ? t("save") : t("create")}
      </Button>
    </form>
  );
}

/** Image envoyée dès qu'elle est choisie ; le formulaire ne transmet que son adresse. */
function ImageField({
  name,
  label,
  help,
  initial,
  error,
  previewClassName,
}: {
  name: string;
  label: string;
  help?: string;
  initial: string | null;
  error: string | null;
  previewClassName: string;
}) {
  const t = useTranslations("admin.campaigns");
  const errors = useErrorMessages();
  const upload = usePhotoUpload();
  const [removed, setRemoved] = useState(false);
  const url = upload.url ?? (removed ? null : initial);
  return (
    <FormField
      id={name}
      label={label}
      help={help}
      error={errors(upload.error) ?? error}
    >
      <input type="hidden" name={name} value={url ?? ""} />
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- aperçu de l'image choisie
        <img
          src={mediaSrc(url)}
          alt=""
          className={`w-full rounded-md border bg-muted object-contain ${previewClassName}`}
        />
      )}
      <div className="flex items-center gap-2">
        <Input
          id={name}
          type="file"
          accept="image/*"
          disabled={upload.uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload.upload(file);
          }}
        />
        {url && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              upload.reset();
              setRemoved(true);
            }}
          >
            {t("removePhoto")}
          </Button>
        )}
      </div>
      {upload.uploading && (
        <p className="text-xs text-muted-foreground">{t("uploading")}</p>
      )}
    </FormField>
  );
}

/** ISO → valeur d'un champ datetime-local, à l'heure de l'appareil. */
function local(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Valeur d'un champ datetime-local (heure de l'appareil) → ISO UTC. */
function utc(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}
