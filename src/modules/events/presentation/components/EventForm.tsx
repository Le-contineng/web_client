"use client";

import {
  CameraIcon,
  CaretLeftIcon,
  GlobeHemisphereWestIcon,
  MapPinIcon,
  TagIcon,
  TrashIcon,
  TextAlignLeftIcon,
  UploadSimpleIcon,
} from "@/shared/components/icons";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { FormFrame } from "@/shared/components/FormFrame";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { useRouteModalGuard } from "@/shared/components/RouteModal";
import { useFormAction } from "@/shared/hooks/useFormAction";
import { useMounted } from "@/shared/hooks/useMounted";
import { useErrorMessages } from "@/shared/i18n/errors";
import type { FormAction, FormState } from "@/shared/lib/form";
import { cn } from "@/shared/lib/utils";
import { PRIMARY_ACTION } from "@/shared/components/form-kit";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { usePhotoUpload } from "@/modules/medias";
import { CATEGORIES, type Event } from "@/modules/events/domain/event";
import { DateTimeField } from "@/modules/events/presentation/components/DateTimeField";
import { mediaSrc } from "@/shared/lib/media-src";

type OrganizerPage = { id: string; name: string; photoUrl: string | null };
type CreateAction = (
  pageId: string,
  state: FormState,
  formData: FormData,
) => Promise<FormState>;

const p2 = (n: number) => String(n).padStart(2, "0");

type Step = 0 | 1;
/**
 * Champs dans l'ordre d'affichage, avec leur étape : on revient à l'étape
 * du premier champ refusé et on y place le curseur.
 */
const FIELDS: [string, Step][] = [
  ["name", 0],
  ["startsAt", 0],
  ["endsAt", 0],
  ["location", 0],
  ["photo", 1],
  ["photoUrl", 1],
  ["description", 1],
  ["categories", 1],
];

/** ISO UTC → date et heure d'un champ, dans l'heure de l'appareil (D7). */
function toLocalParts(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  return {
    date: `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`,
    time: `${p2(d.getHours())}:${p2(d.getMinutes())}`,
  };
}

/** Date et heure saisies (heure de l'appareil) → ISO UTC, ou vide. */
function toUtc(date: string, time: string): string {
  if (!date) return "";
  return new Date(`${date}T${time || "00:00"}`).toISOString();
}

/** Fuseau de l'appareil : décalage (« GMT+01:00 ») et ville (« Douala »). */
function deviceZone() {
  const iana = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset =
    new Intl.DateTimeFormat("en", { timeZoneName: "longOffset" })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  return { offset, city: iana.split("/").pop()?.replace(/_/g, " ") ?? iana };
}

const INVALID = "aria-invalid:ring-2 aria-invalid:ring-destructive/50";

/**
 * Formulaire d'un événement, en une colonne, pour une page choisie avant
 * (rappelée en haut). La création (US-11) se fait en deux étapes :
 * 1. l'essentiel, sans quoi l'événement n'existe pas (nom, quand, où) ;
 * 2. ce qui donne envie (affiche et description facultatives, catégories).
 * Une erreur s'affiche sous son champ, qui reçoit le curseur ; un refus du
 * serveur ramène à l'étape du premier champ en erreur. Dans un modal, le
 * fermer avec une saisie en cours demande confirmation. En modification
 * (US-15, la page ne change pas), tout s'affiche d'un coup.
 */
export function EventForm({
  title,
  page,
  changePageHref,
  event,
  action,
  createAction,
}: {
  /** Titre affiché en tête (dans le modal ; la page a déjà le sien). */
  title?: string;
  /** Page au nom de laquelle publier, choisie avant le formulaire. */
  page: OrganizerPage;
  /** Retour au choix de la page (création seulement). */
  changePageHref?: string;
  event?: Event;
  /** Modification : action déjà prête. */
  action?: FormAction;
  /** Création : action liée à la page choisie. */
  createAction?: CreateAction;
}) {
  const t = useTranslations();
  const errors = useErrorMessages();
  const mounted = useMounted();
  const submit = useMemo<FormAction>(
    () => action ?? createAction!.bind(null, page.id),
    [action, createAction, page.id],
  );

  const start = toLocalParts(event?.startsAt ?? null);
  const end = toLocalParts(event?.endsAt ?? null);
  const [startDate, setStartDate] = useState(start.date);
  const [startTime, setStartTime] = useState(start.time);
  const [endDate, setEndDate] = useState(end.date);
  const [endTime, setEndTime] = useState(end.time);

  const {
    state,
    onSubmit,
    enCours,
    action: send,
  } = useFormAction<FormState>(submit, {}, (formData) => {
    formData.set("startsAt", toUtc(startDate, startTime));
    // Le jour de fin est prérempli : la fin ne compte qu'avec son heure
    formData.set("endsAt", endTime ? toUtc(endDate || startDate, endTime) : "");
  });

  // La photo part dès qu'elle est choisie ; le formulaire n'envoie que son adresse.
  const photo = usePhotoUpload();
  const [preview, setPreview] = useState(event?.photoUrl ?? null);
  const [remove, setRemove] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Unique : le libellé ne doit viser que le champ de ce formulaire
  const photoId = useId();
  // Format que le navigateur ne sait pas afficher (photo HEIC d'iPhone…)
  const [previewFailed, setPreviewFailed] = useState(false);
  const shownPhoto = remove ? null : preview;

  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<Step>(0);
  // Champs obligatoires manquants, vérifiés avant de changer d'étape
  const [missing, setMissing] = useState<Record<string, string>>({});
  const fieldErrors: Record<string, string> = {
    ...(state.fieldErrors ?? {}),
    ...missing,
  };
  /** Le champ corrigé perd son erreur « obligatoire ». */
  function clearMissing(field: string) {
    if (!(field in missing)) return;
    const rest = { ...missing };
    delete rest[field];
    setMissing(rest);
  }
  const [focusTarget, setFocusTarget] = useState<{ field: string } | null>(
    null,
  );

  // Refus du serveur : retour à l'étape du premier champ en erreur, curseur dessus
  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    const first = FIELDS.find(([field]) => field in (state.fieldErrors ?? {}));
    if (first) {
      setStep(first[1]);
      setFocusTarget({ field: first[0] });
    }
  }
  // Le curseur va sur le champ visé, une fois son étape affichée
  useEffect(() => {
    if (!focusTarget) return;
    formRef.current
      ?.querySelector<HTMLElement>(`[data-field="${focusTarget.field}"]`)
      ?.focus();
  }, [focusTarget]);

  // Champs obligatoires remplis : le bouton reste grisé tant qu'ils ne le sont pas
  const [filled, setFilled] = useState({
    name: !!event?.name,
    location: !!event?.location,
    categories: (event?.categories.length ?? 0) > 0,
  });
  function readFilled() {
    const form = formRef.current;
    if (!form) return;
    const value = (name: string) =>
      String(
        (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "",
      ).trim();
    setFilled({
      name: !!value("name"),
      location: !!value("location"),
      categories: !!form.querySelector('input[name="categories"]:checked'),
    });
  }

  // Saisie en cours dans un modal : sa fermeture demande confirmation
  const [dirty, setDirty] = useState(false);
  const guard = useMemo(
    () => ({
      title: t("events.form.leaveTitle"),
      description: t("events.form.leaveDescription"),
      confirm: t("events.form.leaveConfirm"),
      cancel: t("events.form.leaveCancel"),
    }),
    [t],
  );
  useRouteModalGuard(dirty && !enCours ? guard : null);

  function choosePhoto(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    setPreviewFailed(false);
    setRemove(false);
    setDirty(true);
    void photo.upload(file);
  }
  /** Retire la photo sans la remplacer (en modification, l'actuelle est supprimée). */
  function removePhoto() {
    photo.reset();
    setPreview(null);
    setRemove(!!event?.photoUrl);
    setDirty(true);
    if (fileRef.current) fileRef.current.value = "";
  }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    choosePhoto(e.dataTransfer.files[0]);
  }

  // Les dates dépendent du fuseau de l'appareil : rendu côté navigateur uniquement.
  if (!mounted) return <Skeleton className="h-[520px] w-full rounded-xl" />;
  const zone = deviceZone();
  // Pas de date passée : le calendrier commence aujourd'hui
  const today = toLocalParts(new Date().toISOString()).date;
  const stepped = !event;
  const shown = (s: Step) => !stepped || step === s;
  const errorOf = (field: string) => errors(fieldErrors[field]);

  /** Champs obligatoires de l'étape 1 remplis ? Sinon, erreurs sous les champs. */
  function validateEssentials(): boolean {
    const value = (name: string) =>
      String(
        (formRef.current?.elements.namedItem(name) as HTMLInputElement | null)
          ?.value ?? "",
      ).trim();
    const next: Record<string, string> = {};
    if (!value("name")) next.name = "required";
    if (!startDate) next.startsAt = "required";
    if (!value("location")) next.location = "required";
    setMissing(next);
    const first = FIELDS.find(([field]) => field in next);
    if (first) setFocusTarget({ field: first[0] });
    return !first;
  }

  const essentialsReady = filled.name && !!startDate && filled.location;
  const ready =
    stepped && step === 0
      ? essentialsReady
      : filled.categories && (stepped || essentialsReady);

  // Pied : bouton sur toute la largeur, grisé tant que l'étape n'est pas remplie
  const navigation = (
    <div className="flex items-center gap-2">
      {stepped && step > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label={t("events.form.back")}
          title={t("events.form.back")}
          onClick={() => setStep(0)}
          className="size-11 shrink-0 rounded-full"
        >
          <CaretLeftIcon />
        </Button>
      )}
      <Button
        type="submit"
        size="lg"
        disabled={!ready || enCours || photo.uploading}
        className={cn(PRIMARY_ACTION, "flex-1 sm:flex-none")}
      >
        {event
          ? t("common.save")
          : step === 0
            ? t("events.form.next")
            : t("events.publish")}
      </Button>
    </div>
  );

  return (
    <form
      ref={formRef}
      action={send}
      onChange={(e) => {
        setDirty(true);
        readFilled();
        // Le champ corrigé perd son erreur
        clearMissing((e.target as unknown as HTMLInputElement).name);
      }}
      onSubmit={(e) => {
        if (stepped && step === 0) {
          e.preventDefault();
          if (validateEssentials()) setStep(1);
          return;
        }
        onSubmit(e);
      }}
      noValidate
      className="flex min-h-0 flex-1 flex-col"
    >
      {event && <input type="hidden" name="id" value={event.id} />}
      <input type="hidden" name="photoUrl" value={photo.url ?? ""} />
      <input type="hidden" name="removePhoto" value={remove ? "1" : ""} />

      <FormFrame title={title} footer={navigation}>
        {stepped && <StepDots step={step} />}

        {/* ——— Étape 1 : l'essentiel (nom, quand, où) ——— */}
        <div hidden={!shown(0)} className="grid gap-4">
          {/* Page organisatrice, choisie avant le formulaire */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5 text-sm font-medium">
              <ProfileAvatar name={page.name} photo={page.photoUrl} size="xs" />
              {page.name}
            </span>
            {changePageHref && (
              <Link
                href={changePageHref}
                replace
                scroll={false}
                className="text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                {t("events.form.changePage")}
              </Link>
            )}
          </div>

          <Field error={errorOf("name")}>
            <input
              name="name"
              data-field="name"
              maxLength={100}
              defaultValue={event?.name}
              placeholder={t("events.form.namePlaceholder")}
              aria-label={t("events.name")}
              aria-invalid={!!fieldErrors.name}
              className={cn(
                "h-12 w-full rounded-xl bg-muted px-4 text-base font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40",
                INVALID,
              )}
            />
          </Field>

          <Field error={errorOf("startsAt") ?? errorOf("endsAt")}>
            <div className="grid gap-2 rounded-xl bg-muted p-2">
              <DateRow label={t("events.form.start")} filled>
                <DateTimeField
                  label={t("events.form.start")}
                  field="startsAt"
                  min={today}
                  placeholder={t("events.form.pickDate")}
                  date={startDate}
                  time={startTime}
                  invalid={!!fieldErrors.startsAt}
                  onDate={(v) => {
                    setStartDate(v);
                    clearMissing("startsAt");
                    // Le jour de fin suit le début tant qu'il n'est pas plus tard
                    if (!endDate || endDate < v) setEndDate(v);
                    setDirty(true);
                  }}
                  onTime={(v) => {
                    setStartTime(v);
                    setDirty(true);
                  }}
                />
              </DateRow>
              <DateRow label={t("events.form.end")}>
                <DateTimeField
                  label={t("events.form.end")}
                  field="endsAt"
                  min={startDate || today}
                  placeholder={t("events.form.pickDate")}
                  date={endDate}
                  time={endTime}
                  invalid={!!fieldErrors.endsAt}
                  onDate={(v) => {
                    setEndDate(v);
                    setDirty(true);
                  }}
                  onTime={(v) => {
                    setEndTime(v);
                    setDirty(true);
                  }}
                />
              </DateRow>
              <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                <GlobeHemisphereWestIcon className="size-3.5" />
                {zone.offset} · {zone.city}
              </p>
            </div>
          </Field>

          <Field error={errorOf("location")}>
            <Row icon={<MapPinIcon />} invalid={!!fieldErrors.location}>
              <input
                name="location"
                data-field="location"
                maxLength={150}
                defaultValue={event?.location}
                placeholder={t("events.form.locationPlaceholder")}
                aria-label={t("events.location")}
                aria-invalid={!!fieldErrors.location}
                className="w-full bg-transparent font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
            </Row>
          </Field>
        </div>

        {/* ——— Étape 2 : ce qui donne envie (affiche, description, catégories) ——— */}
        <div hidden={!shown(1)} className="grid gap-4">
          {stepped && (
            <p className="text-center text-sm text-muted-foreground">
              {t("events.form.optionalHint")}
            </p>
          )}

          {/* Affiche : zone d'ajout claire, ou aperçu (défilement au-delà de 340 px) */}
          <Field
            error={
              errorOf("photo") ??
              errorOf("photoUrl") ??
              (photo.error ? errors(photo.error) : undefined)
            }
          >
            <input
              ref={fileRef}
              id={photoId}
              data-field="photo"
              type="file"
              accept="image/*"
              aria-label={t("common.optionalPhoto")}
              aria-invalid={!!(photo.error ?? fieldErrors.photo)}
              className="sr-only"
              onChange={(e) => choosePhoto(e.target.files?.[0])}
            />
            {shownPhoto ? (
              <div className="relative">
                <div className="max-h-[340px] overflow-y-auto rounded-[6px] bg-muted">
                  {previewFailed ? (
                    <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                      {t("events.form.previewUnavailable")}
                    </p>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element -- aperçu local
                    <img
                      src={mediaSrc(shownPhoto)}
                      alt=""
                      onError={() => setPreviewFailed(true)}
                      className="block h-auto w-full"
                    />
                  )}
                </div>
                <label
                  htmlFor={photoId}
                  title={t("events.form.changePhoto")}
                  className="absolute right-3 bottom-3 grid size-10 cursor-pointer place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-transform hover:scale-105 [&_svg]:size-5"
                >
                  <CameraIcon />
                  <span className="sr-only">
                    {t("events.form.changePhoto")}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={removePhoto}
                  aria-label={t("common.removePhoto")}
                  title={t("common.removePhoto")}
                  className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-transform hover:scale-105 [&_svg]:size-4"
                >
                  <TrashIcon />
                </button>
              </div>
            ) : (
              <label
                htmlFor={photoId}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                  "grid cursor-pointer justify-items-center gap-2 rounded-[6px] border border-dashed px-4 py-8 text-center transition-colors hover:bg-muted/60",
                  dragging ? "border-primary bg-primary/5" : "bg-muted/40",
                )}
              >
                <span className="grid size-11 place-items-center rounded-full bg-background text-muted-foreground shadow-sm [&_svg]:size-5">
                  <UploadSimpleIcon />
                </span>
                <span className="text-sm font-medium">
                  {t("events.form.addPoster")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("events.form.posterHint")}
                </span>
              </label>
            )}
            <p className="text-xs text-muted-foreground">
              {photo.uploading
                ? t("common.photoUploading")
                : t("common.photoFormats")}
            </p>
          </Field>

          <Field error={errorOf("description")}>
            <Row
              icon={<TextAlignLeftIcon />}
              alignTop
              invalid={!!fieldErrors.description}
            >
              {/* Jusqu'à 8 lignes visibles, puis défilement sans barre */}
              <textarea
                name="description"
                data-field="description"
                rows={3}
                maxLength={2000}
                defaultValue={event?.description ?? ""}
                placeholder={t("events.form.descriptionPlaceholder")}
                aria-label={t("events.description")}
                aria-invalid={!!fieldErrors.description}
                className="field-sizing-content max-h-[8lh] min-h-[3lh] w-full resize-none [scrollbar-width:none] overflow-y-auto bg-transparent outline-none placeholder:text-muted-foreground [&::-webkit-scrollbar]:hidden"
              />
            </Row>
          </Field>

          <fieldset className="grid gap-2">
            <legend className="mb-2 flex items-center gap-2 text-sm font-medium">
              <TagIcon className="size-4 text-muted-foreground" />
              {t("events.categories")}
            </legend>
            <div
              className={cn(
                "flex flex-wrap gap-1.5 rounded-xl bg-muted p-2",
                fieldErrors.categories && "ring-2 ring-destructive/50",
              )}
            >
              {CATEGORIES.map((cat, i) => (
                <label key={cat} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="categories"
                    value={cat}
                    data-field={i === 0 ? "categories" : undefined}
                    defaultChecked={event?.categories.includes(cat)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "inline-flex rounded-lg px-2.5 py-1 text-sm transition-colors select-none",
                      "text-muted-foreground hover:bg-background/60",
                      "peer-checked:bg-background peer-checked:font-medium peer-checked:text-foreground peer-checked:shadow-sm",
                      "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                    )}
                  >
                    {t(`categories.${cat}`)}
                  </span>
                </label>
              ))}
            </div>
            <FieldError message={errorOf("categories")} />
          </fieldset>
        </div>

        {/* Erreur générale seulement : les erreurs de champ sont sous leur champ */}
        {state.error && Object.keys(fieldErrors).length === 0 && (
          <p
            role="alert"
            className="rounded-lg bg-danger-fond p-3 text-sm text-danger"
          >
            {errors(state.error)}
          </p>
        )}
      </FormFrame>
    </form>
  );
}

/** Deux points : l'étape en cours, plus large. */
function StepDots({ step }: { step: Step }) {
  const t = useTranslations("events.form");
  return (
    <div className="flex justify-center gap-1.5">
      {[0, 1].map((i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            i === step ? "w-5 bg-primary" : "w-1.5",
            i < step ? "bg-primary/50" : i > step && "bg-muted-foreground/25",
          )}
        />
      ))}
      <span className="sr-only" aria-live="polite">
        {t("stepOf", { step: step + 1, total: 2 })}
      </span>
    </div>
  );
}

/** Ligne « Début » ou « Fin » du bloc des dates. */
function DateRow({
  label,
  filled = false,
  children,
}: {
  label: string;
  filled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden
        className={cn(
          "ml-1 size-2 shrink-0 rounded-full",
          filled ? "bg-muted-foreground" : "border border-muted-foreground",
        )}
      />
      <span className="w-10 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

/** Ligne grise avec son icône, qui contient un champ. */
function Row({
  icon,
  alignTop = false,
  invalid = false,
  children,
}: {
  icon: ReactNode;
  alignTop?: boolean;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex min-h-12 gap-3 rounded-xl bg-muted px-4 py-3 focus-within:ring-2 focus-within:ring-ring/40",
        alignTop ? "items-start" : "items-center",
        invalid && "ring-2 ring-destructive/50",
      )}
    >
      <span
        className={cn(
          "shrink-0 text-muted-foreground [&_svg]:size-5",
          alignTop && "pt-0.5",
        )}
      >
        {icon}
      </span>
      {children}
    </label>
  );
}

/** Un champ et, dessous, son erreur. */
function Field({
  error,
  children,
}: {
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      {children}
      <FieldError message={error} />
    </div>
  );
}

function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}
