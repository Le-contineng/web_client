"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentAccount } from "@/modules/authentication/server";
import { searchProfiles } from "@/modules/profiles/server";
import type { SearchResult } from "@/modules/pages";
import {
  getMyPageById,
  getPageBySlug,
  PAGES_CACHE_TAG,
  updatePage,
  submitPageRequest,
  grantAccess,
  getMembers,
  revokeAccess,
  withdrawPageRequest,
} from "@/modules/pages/server";
import { photoUrlField } from "@/modules/medias/server";
import {
  idField,
  textField,
  type FormState,
  parseForm,
} from "@/shared/lib/form";
import { apiErrorCode, catchApiError } from "@/shared/api/errors";

/** Demander la création d'une page (US-03) ; l'API prévient les admins. */
export async function requestPageAction(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await getCurrentAccount())) return { error: "loginRequired" };
  const f = parseForm(
    {
      name: textField(200),
      description: textField(2000),
      type: textField(50),
      justification: textField(2000),
      photoUrl: photoUrlField,
    },
    formData,
  );
  if (!f) return { error: "invalidInput" };
  const result = await catchApiError(() => submitPageRequest(f));
  if (!result.ok) return result.state;
  redirect("/page-request?msg=sent");
}

/**
 * Modifier la page : réservé au propriétaire (l'API le revérifie). Sans
 * nouvelle photo ni « retirer la photo », la photo actuelle est gardée.
 */
export async function updatePageAction(
  pageId: string,
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = idField.safeParse(pageId);
  if (!id.success) return { error: "invalidInput" };
  if (!(await getCurrentAccount())) return { error: "loginRequired" };
  const page = await getMyPageById(id.data);
  if (page?.role !== "owner") return { error: "accessDenied" };
  const f = parseForm(
    {
      name: textField(200),
      description: textField(2000),
      type: textField(50),
      photoUrl: photoUrlField,
      removePhoto: z.string().max(1).optional(),
    },
    formData,
  );
  if (!f) return { error: "invalidInput" };
  const current = await getPageBySlug(page.slug);
  const result = await catchApiError(() =>
    updatePage(id.data, {
      name: f.name,
      description: f.description,
      type: f.type,
      photoUrl:
        f.photoUrl ?? (f.removePhoto ? null : (current?.page.photoUrl ?? null)),
    }),
  );
  if (!result.ok) return result.state;
  // Nom ou photo changés : le filtre et le carrousel de l'accueil aussi.
  updateTag(PAGES_CACHE_TAG);
  revalidatePath("/my-pages", "layout");
  revalidatePath(`/p/${page.slug}`);
  redirect(`/my-pages/${page.slug}?msg=pageUpdated`);
}

export async function withdrawPageRequestAction(
  requestId: string,
): Promise<void> {
  const id = idField.safeParse(requestId);
  if (id.success) await apiErrorCode(() => withdrawPageRequest(id.data));
  revalidatePath("/page-request");
}

/**
 * US-06 : nom (3 caractères min) ou e-mail exact ; jamais d'e-mail en retour.
 * Les membres déjà présents sont signalés pour masquer « Donner l'accès ».
 */
export async function searchUsersAction(
  pageId: string,
  query: string,
): Promise<SearchResult> {
  const input = z
    .object({ pageId: idField, query: z.string().max(200) })
    .safeParse({ pageId, query });
  if (!input.success) return [];
  const result = await catchApiError(async () => {
    const [profiles, members] = await Promise.all([
      searchProfiles(input.data.query),
      getMembers(input.data.pageId),
    ]);
    const ids = new Set(members.map((m) => m.accountId));
    return profiles.map((p) => ({ ...p, member: ids.has(p.id) }));
  });
  return result.ok ? result.value : [];
}

const accessInput = z.object({ pageId: idField, accountId: idField });

export async function grantAccessAction(
  pageId: string,
  accountId: string,
): Promise<{ error?: string; name?: string }> {
  const input = accessInput.safeParse({ pageId, accountId });
  if (!input.success) return { error: "invalidInput" };
  const error = await apiErrorCode(() =>
    grantAccess(input.data.pageId, input.data.accountId),
  );
  revalidatePath("/my-pages", "layout");
  if (error) return { error };
  const members = await getMembers(input.data.pageId);
  return {
    name: members.find((m) => m.accountId === input.data.accountId)?.name ?? "",
  };
}

export async function revokeAccessAction(
  pageId: string,
  accountId: string,
): Promise<{ error?: string }> {
  const input = accessInput.safeParse({ pageId, accountId });
  if (!input.success) return { error: "invalidInput" };
  const error = await apiErrorCode(() =>
    revokeAccess(input.data.pageId, input.data.accountId),
  );
  revalidatePath("/my-pages", "layout");
  return error ? { error } : {};
}
