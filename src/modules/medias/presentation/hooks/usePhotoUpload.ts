"use client";

import { useState } from "react";
import { checkSource } from "@/modules/medias/domain/photo";
import {
  confirmPhotoUploadAction,
  reservePhotoUploadAction,
  uploadPhotoAction,
} from "@/modules/medias/application/medias.actions";
import {
  PhotoPreparationError,
  type PreparedPhoto,
  preparePhoto,
} from "@/modules/medias/presentation/compress-photo";

type State =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "done"; url: string }
  | { status: "error"; error: string };

/**
 * Envoi d'une photo dès qu'elle est choisie (ADR 0014 du backend) :
 * conversion et réduction dans le navigateur (avec dimensions et aperçu flou),
 * puis envoi direct au stockage (réservation, envoi, confirmation), ou par
 * l'API si le stockage ne le permet pas. Le formulaire ne transmet ensuite que
 * l'adresse de la photo (`photoUrl`). Chaque échec a son propre message :
 * fichier vide, pas une image, illisible, trop lourd, connexion coupée, refus
 * du serveur.
 */
export function usePhotoUpload() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function upload(file: File): Promise<void> {
    const invalid = checkSource(file);
    if (invalid) {
      setState({ status: "error", error: invalid });
      return;
    }
    setState({ status: "uploading" });
    const result = await uploadPhoto(file);
    setState(
      result.ok
        ? { status: "done", url: result.value }
        : { status: "error", error: result.error },
    );
  }

  return {
    upload,
    reset: () => setState({ status: "idle" }),
    uploading: state.status === "uploading",
    url: state.status === "done" ? state.url : null,
    error: state.status === "error" ? state.error : null,
  };
}

/**
 * Le même envoi, hors d'un hook : pour plusieurs photos à la fois (carrousel
 * d'un post). Renvoie l'adresse de la photo, ou le code de l'échec.
 */
export async function uploadPhoto(
  file: File,
): Promise<{ ok: true; value: string } | { ok: false; error: string }> {
  const invalid = checkSource(file);
  if (invalid) return { ok: false, error: invalid };
  try {
    return await send(await preparePhoto(file));
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof PhotoPreparationError ? error.code : "uploadFailed",
    };
  }
}

async function send(
  photo: PreparedPhoto,
): Promise<{ ok: true; value: string } | { ok: false; error: string }> {
  const { blob } = photo;
  const layout = layoutOf(photo);
  const reserved = await reservePhotoUploadAction(blob.type, blob.size, layout);
  if (!reserved.ok) return reserved;
  if (!reserved.value) {
    // Stockage sur disque : la photo passe par l'API
    const form = new FormData();
    form.append("file", blob, fileName(blob.type));
    if (layout) {
      form.append("width", String(layout.width));
      form.append("height", String(layout.height));
      if (layout.placeholder) form.append("placeholder", layout.placeholder);
    }
    return uploadPhotoAction(form);
  }
  const target = reserved.value;
  const sent = await fetch(target.uploadUrl, {
    method: "PUT",
    headers: target.headers,
    body: blob,
  }).catch(() => null);
  // Pas de réponse : connexion coupée ; une réponse d'erreur : stockage qui refuse
  if (!sent) return { ok: false, error: "uploadFailed" };
  if (!sent.ok) return { ok: false, error: "photoStorageRefused" };
  return confirmPhotoUploadAction(target.id);
}

/** Dimensions et aperçu flou à annoncer, s'ils ont pu être calculés. */
function layoutOf(photo: PreparedPhoto) {
  return photo.width > 0 && photo.height > 0
    ? {
        width: photo.width,
        height: photo.height,
        placeholder: photo.placeholder,
      }
    : null;
}

function fileName(type: string): string {
  return `photo.${type.split("/")[1] ?? "jpg"}`;
}
