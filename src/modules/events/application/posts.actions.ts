"use server";

import { z } from "zod";
import type { PostPage } from "@/modules/events/domain/event-post";
import { listMorePosts } from "@/modules/events/server";
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
