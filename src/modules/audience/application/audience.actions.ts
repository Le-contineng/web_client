"use server";

import { trackView, currentVisitor } from "@/modules/audience/server";
import { trackInstall, trackShare, trackVisit } from "@/modules/metrics/server";
import { z } from "zod";
import { idField } from "@/shared/lib/form";

/**
 * Ouverture d'une fiche : vue unique (US-39) et métriques « fiche consultée »
 * et « arrivée par lien partagé », prises par l'API.
 */
export async function trackEventViewAction(
  eventId: string,
  fromShareLink: boolean,
): Promise<void> {
  const id = idField.safeParse(eventId);
  if (!id.success) return;
  await trackView(id.data, fromShareLink === true).catch(() => {
    // Une mesure perdue ne doit jamais gêner la lecture de la fiche.
  });
}

/** Au plus, par envoi : une story ne montre que les nouveautés de deux jours. */
const VIEWS_MAX = 50;

/**
 * Écrans vus pendant une story (ADR 0025 du client) : envoyés en une seule
 * fois à sa fermeture, au lieu d'une action par écran. Chacun compte comme
 * l'ouverture de sa fiche.
 */
export async function trackEventViewsAction(eventIds: string[]): Promise<void> {
  const ids = z.array(idField).max(VIEWS_MAX).safeParse(eventIds);
  if (!ids.success) return;
  await Promise.all(
    [...new Set(ids.data)].map((id) =>
      trackView(id, false).catch(() => {
        // Une mesure perdue ne doit jamais gêner la lecture.
      }),
    ),
  );
}

export async function trackShareClickAction(eventId: string): Promise<void> {
  const id = idField.safeParse(eventId);
  if (!id.success) return;
  await trackShare(id.data, await currentVisitor()).catch(() => {});
}

/**
 * Visite du jour (activité des visiteurs, sans compte) : l'API garde une
 * ligne par visiteur et par jour, et retient l'usage de l'application installée.
 */
export async function trackVisitAction(installedApp: boolean): Promise<void> {
  const input = z.boolean().safeParse(installedApp);
  if (!input.success) return;
  await trackVisit(await currentVisitor(), input.data).catch(() => {});
}

/** Installation de l'application, signalée par le navigateur (appinstalled). */
export async function trackInstallAction(): Promise<void> {
  await trackInstall(await currentVisitor()).catch(() => {});
}
