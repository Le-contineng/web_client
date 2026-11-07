"use server";

import { z } from "zod";
import type { Poll } from "@/modules/events/domain/event-story";
import { getPoll, votePoll } from "@/modules/events/server";
import { getCurrentUser } from "@/modules/pages/server";
import { catchApiError } from "@/shared/api/errors";
import { idField } from "@/shared/lib/form";

type Result = { ok: true; value: Poll } | { ok: false; error: string };

const pollSchema = z.object({ eventId: idField, pollId: idField });
const voteSchema = pollSchema.extend({ optionId: idField });

/** Votes à l'instant, relus pendant que le statut est ouvert (public). */
export async function refreshPollAction(
  eventId: string,
  pollId: string,
): Promise<Result> {
  const f = pollSchema.safeParse({ eventId, pollId });
  if (!f.success) return { ok: false, error: "invalidInput" };
  const result = await catchApiError(() =>
    getPoll(f.data.eventId, f.data.pollId),
  );
  if (!result.ok) return { ok: false, error: result.state.error ?? "unknown" };
  return { ok: true, value: result.value };
}

/** Vote ou changement d'avis, pour tout compte connecté (ADR 0023). */
export async function votePollAction(
  eventId: string,
  pollId: string,
  optionId: string,
): Promise<Result> {
  const f = voteSchema.safeParse({ eventId, pollId, optionId });
  if (!f.success) return { ok: false, error: "invalidInput" };
  if (!(await getCurrentUser())) return { ok: false, error: "loginRequired" };
  const result = await catchApiError(() =>
    votePoll(f.data.eventId, f.data.pollId, f.data.optionId),
  );
  if (!result.ok) return { ok: false, error: result.state.error ?? "unknown" };
  return { ok: true, value: result.value };
}
