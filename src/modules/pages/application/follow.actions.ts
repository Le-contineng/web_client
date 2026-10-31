"use server";

import { z } from "zod";
import { getCurrentAccount } from "@/modules/authentication/server";
import type { FollowState } from "@/modules/pages/domain/page.types";
import { setFollow } from "@/modules/pages/server";
import { catchApiError } from "@/shared/api/errors";
import { idField } from "@/shared/lib/form";

const followSchema = z.object({ slug: idField, following: z.boolean() });

/**
 * Suivre une page ou ne plus la suivre (ADR 0019), pour tout compte connecté.
 * Renvoie le nouvel état et le nombre d'abonnés, ou le code d'erreur à
 * afficher (`emailNotVerified` : suivre exige une adresse confirmée).
 */
export async function setFollowAction(
  slug: string,
  following: boolean,
): Promise<{ ok: true; value: FollowState } | { ok: false; error: string }> {
  const f = followSchema.safeParse({ slug, following });
  if (!f.success) return { ok: false, error: "invalidInput" };
  if (!(await getCurrentAccount()))
    return { ok: false, error: "loginRequired" };
  const result = await catchApiError(() =>
    setFollow(f.data.slug, f.data.following),
  );
  if (!result.ok) return { ok: false, error: result.state.error ?? "unknown" };
  return { ok: true, value: result.value };
}
