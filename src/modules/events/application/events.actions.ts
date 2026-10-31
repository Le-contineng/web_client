"use server";

import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { z } from "zod";
import {
  CATEGORIES,
  type EventFormFields,
  type UrlFilters,
  PERIODS,
  validateEventForm,
} from "@/modules/events";
import {
  cancelEvent,
  createEvent,
  type EventPayload,
  getEventById,
  updateEvent,
} from "@/modules/events/server";
import { photoUrlField } from "@/modules/medias/server";
import {
  idField,
  textField,
  type FormState,
  parseForm,
} from "@/shared/lib/form";
import { getCurrentUser, getMyPageById } from "@/modules/pages/server";
import { listEventsFromUrl } from "@/modules/events/infrastructure/event-queries";
import { catchApiError } from "@/shared/api/errors";

/**
 * Vérifie que la personne connectée est membre de la page au nom de laquelle
 * elle agit (US-06, US-37). La page est choisie à chaque action : celle qui
 * organise l'événement, ou celle choisie avant de créer. L'API revérifie.
 */
async function memberPage(
  pageId: string,
): Promise<{ pageId: string } | { state: FormState }> {
  const user = await getCurrentUser();
  if (!user) return { state: { error: "loginRequired" } };
  const page = await getMyPageById(pageId);
  if (!page) return { state: { error: "notAnOrganizerMember" } };
  return { pageId: page.id };
}

const eventShape = {
  name: textField(500),
  startsAt: textField(50),
  endsAt: textField(50),
  location: textField(500),
  categories: z.array(z.string().max(50)).max(CATEGORIES.length),
  description: textField(5000),
  photoUrl: photoUrlField,
  removePhoto: textField(1),
};

/**
 * Vérifie le formulaire puis prépare le corps de la requête. La photo a déjà
 * été envoyée par le navigateur (`usePhotoUpload`) : seule son adresse arrive.
 */
async function prepareEvent(
  form: EventFormFields,
  photoUrl: string | null,
  currentPhoto: string | null,
  remove: boolean,
  currentStartsAt: string | null,
): Promise<{ ok: true; body: EventPayload } | { ok: false; state: FormState }> {
  const valid = validateEventForm(form, new Date(), currentStartsAt);
  if (!valid.ok) {
    return {
      ok: false,
      state: { error: "invalidInput", fieldErrors: valid.fieldErrors },
    };
  }
  const newPhoto = photoUrl ?? (remove ? null : currentPhoto);
  return {
    ok: true,
    body: {
      name: form.name,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      location: form.location,
      categories: valid.content.categories,
      description: form.description,
      photoUrl: newPhoto,
    },
  };
}

/** Créer un événement (US-11) au nom de la page choisie à l'étape précédente. */
export async function createEventAction(
  pageId: string,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = idField.safeParse(pageId);
  if (!id.success) return { error: "invalidInput" };
  const page = await memberPage(id.data);
  if ("state" in page) return page.state;
  const f = parseForm(eventShape, formData);
  if (!f) return { error: "invalidInput" };
  const { photoUrl, removePhoto, ...form } = f;
  const prepared = await prepareEvent(
    form,
    photoUrl,
    null,
    removePhoto === "1",
    null,
  );
  if (!prepared.ok) return prepared.state;
  const result = await catchApiError(() =>
    createEvent(page.pageId, prepared.body),
  );
  if (!result.ok) return result.state;
  revalidatePath("/", "layout");
  // Remplace le formulaire dans l'historique : le retour ne le rouvre pas
  redirect(`/e/${result.value.id}?msg=published`, RedirectType.replace);
}

export async function updateEventAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const f = parseForm({ ...eventShape, id: idField }, formData);
  if (!f) return { error: "invalidInput" };
  const { id, photoUrl, removePhoto, ...form } = f;
  const current = await getEventById(id);
  if (!current) return { error: "eventNotFound" };
  // On agit au nom de la page organisatrice de l'événement.
  const page = await memberPage(current.organizerPageId);
  if ("state" in page) return page.state;
  const prepared = await prepareEvent(
    form,
    photoUrl,
    current.photoUrl,
    removePhoto === "1",
    current.startsAt,
  );
  if (!prepared.ok) return prepared.state;
  const result = await catchApiError(() =>
    updateEvent(page.pageId, id, prepared.body),
  );
  if (!result.ok) return result.state;
  revalidatePath("/", "layout");
  redirect(`/e/${id}?msg=updated`);
}

export async function cancelEventAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const f = parseForm({ id: idField, reason: textField(1000) }, formData);
  if (!f) return { error: "invalidInput" };
  const current = await getEventById(f.id);
  if (!current) return { error: "eventNotFound" };
  const page = await memberPage(current.organizerPageId);
  if ("state" in page) return page.state;
  const result = await catchApiError(() =>
    cancelEvent(page.pageId, f.id, f.reason),
  );
  if (!result.ok) return result.state;
  revalidatePath("/", "layout");
  redirect(`/e/${f.id}?msg=cancelled`);
}

const filtersSchema = z.object({
  categories: z.array(z.enum(CATEGORIES)).max(CATEGORIES.length),
  periods: z.array(z.enum(PERIODS)).max(PERIODS.length),
  pages: z.array(z.string().max(100)).max(100),
});

/** Chargement progressif du fil, 20 par 20 (US-16). */
export async function loadEventsAction(
  filters: UrlFilters,
  offset: number,
  asOf?: string,
) {
  const f = filtersSchema.safeParse(filters);
  const d = z.number().int().min(0).max(100_000).safeParse(offset);
  // Facultatif : une API antérieure à l'ADR 0020 ne le renvoie pas
  const a = z.iso.datetime({ offset: true }).optional().safeParse(asOf);
  if (!f.success || !d.success || !a.success) {
    return { events: [], nextOffset: null };
  }
  const { events, nextOffset } = await listEventsFromUrl(
    f.data,
    d.data,
    a.data,
  );
  return { events, nextOffset };
}
