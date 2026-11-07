"use server";

import { z } from "zod";
import {
  MAX_CAPTION,
  MAX_POST_IMAGES,
  type EventPost,
  type PostPage,
  type PostPayload,
} from "@/modules/events/domain/event-post";
import {
  deletePost,
  listMorePosts,
  publishPost,
} from "@/modules/events/server";
import { getCurrentUser } from "@/modules/pages/server";
import { catchApiError } from "@/shared/api/errors";
import { idField } from "@/shared/lib/form";

const pageSchema = z.object({
  eventId: idField,
  cursor: z.string().min(1).max(500),
});

/** Page suivante du fil d'un événement (public, ADR 0023). */
export async function loadMorePostsAction(
  eventId: string,
  cursor: string,
): Promise<{ ok: true; value: PostPage } | { ok: false; error: string }> {
  const f = pageSchema.safeParse({ eventId, cursor });
  if (!f.success) return { ok: false, error: "invalidInput" };
  const result = await catchApiError(() =>
    listMorePosts(f.data.eventId, f.data.cursor),
  );
  if (!result.ok) return { ok: false, error: result.state.error ?? "unknown" };
  return {
    ok: true,
    value: result.value ?? { posts: [], nextCursor: null },
  };
}

const publishSchema = z.object({
  pageId: z.uuid(),
  eventId: idField,
  caption: z
    .string()
    .max(MAX_CAPTION * 2)
    .nullable(),
  images: z
    .array(
      z.object({
        url: z.string().min(1).max(500),
        alt: z.string().max(1000).nullable(),
      }),
    )
    .min(1)
    .max(MAX_POST_IMAGES),
});

type PostResult =
  | { ok: true; value: EventPost }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Publication d'un post (ADR 0029 du backend), pour les membres de la page
 * organisatrice : l'API vérifie l'appartenance et que l'événement n'est ni
 * passé ni annulé.
 */
export async function publishPostAction(
  pageId: string,
  eventId: string,
  payload: PostPayload,
): Promise<PostResult> {
  const f = publishSchema.safeParse({ pageId, eventId, ...payload });
  if (!f.success) return { ok: false, error: "invalidInput" };
  if (!(await getCurrentUser())) return { ok: false, error: "loginRequired" };
  const { caption, images } = f.data;
  const result = await catchApiError(() =>
    publishPost(f.data.pageId, f.data.eventId, { caption, images }),
  );
  if (!result.ok)
    return {
      ok: false,
      error: result.state.error ?? "unknown",
      fieldErrors: result.state.fieldErrors,
    };
  return { ok: true, value: result.value };
}

const deleteSchema = z.object({
  pageId: z.uuid(),
  eventId: idField,
  postId: z.uuid(),
});

/** Suppression d'un post et de ses images, par un membre de la page. */
export async function deletePostAction(
  pageId: string,
  eventId: string,
  postId: string,
): Promise<{ error?: string }> {
  const f = deleteSchema.safeParse({ pageId, eventId, postId });
  if (!f.success) return { error: "invalidInput" };
  if (!(await getCurrentUser())) return { error: "loginRequired" };
  const result = await catchApiError(() =>
    deletePost(f.data.pageId, f.data.eventId, f.data.postId),
  );
  return result.ok ? {} : { error: result.state.error ?? "unknown" };
}
