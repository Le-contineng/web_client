"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { publishPostAction } from "@/modules/events/application/posts.actions";
import {
  MAX_CAPTION,
  MAX_POST_IMAGES,
} from "@/modules/events/domain/event-post";
import { uploadPhoto } from "@/modules/medias";
import {
  ArrowCounterClockwiseIcon,
  CameraIcon,
  CaretLeftIcon,
  CaretRightIcon,
  WarningIcon,
  XIcon,
} from "@/shared/components/icons";
import { ActionBar } from "@/shared/components/ActionBar";
import { FILLED_TEXTAREA, PRIMARY_ACTION } from "@/shared/components/form-kit";
import { useErrorMessages } from "@/shared/i18n/errors";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

type Item = {
  key: string;
  file: File;
  preview: string;
  status: "uploading" | "done" | "error";
  url: string | null;
  error: string | null;
};

/**
 * Publication d'un post (ADR 0023, ADR 0029 du backend) : jusqu'à
 * {@link MAX_POST_IMAGES} photos, envoyées dès qu'elles sont choisies par le
 * circuit du module medias (réduction dans le navigateur, envoi direct au
 * stockage), réordonnables, puis une légende facultative. Une photo dont
 * l'envoi échoue se renvoie seule, sans tout recommencer.
 */
export function PostComposer({
  pageId,
  eventId,
}: {
  pageId: string;
  eventId: string;
}) {
  const t = useTranslations("posts.composer");
  const errors = useErrorMessages();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [caption, setCaption] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  // Aperçus locaux libérés quand le formulaire disparaît
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function update(key: string, patch: Partial<Item>) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  async function send(item: Pick<Item, "key" | "file">) {
    update(item.key, { status: "uploading", error: null });
    const result = await uploadPhoto(item.file);
    update(
      item.key,
      result.ok
        ? { status: "done", url: result.value }
        : { status: "error", error: result.error },
    );
  }

  function add(files: FileList | null) {
    if (!files) return;
    const room = MAX_POST_IMAGES - items.length;
    const chosen = [...files].slice(0, Math.max(0, room));
    if (files.length > room)
      toast.error(t("tooMany", { max: MAX_POST_IMAGES }));
    const added = chosen.map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return {
        key: crypto.randomUUID(),
        file,
        preview,
        status: "uploading" as const,
        url: null,
        error: null,
      };
    });
    setItems((current) => [...current, ...added]);
    setFieldErrors({});
    added.forEach((item) => void send(item));
  }

  function remove(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  function move(index: number, by: -1 | 1) {
    setItems((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item!);
      return next;
    });
  }

  const uploading = items.some((item) => item.status === "uploading");
  const failed = items.some((item) => item.status === "error");
  const ready = items.length > 0 && !uploading && !failed;

  function publish() {
    if (!ready) return;
    start(async () => {
      const result = await publishPostAction(pageId, eventId, {
        caption: caption.trim() || null,
        images: items.map((item) => ({ url: item.url!, alt: null })),
      });
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(errors(result.error));
        return;
      }
      toast.success(t("published"));
      router.push(`/e/${eventId}/posts`);
      router.refresh();
    });
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        publish();
      }}
    >
      <div className="grid gap-2">
        <Label>
          {t("photos", { count: items.length, max: MAX_POST_IMAGES })}
        </Label>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((item, index) => (
            <li
              key={item.key}
              className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:) */}
              <img
                src={item.preview}
                alt={t("photoAlt", { index: index + 1 })}
                className={cn(
                  "size-full object-cover",
                  item.status !== "done" && "opacity-60",
                )}
              />
              {item.status === "uploading" && (
                <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center text-[11px] font-semibold text-white">
                  {t("uploading")}
                </span>
              )}
              {item.status === "error" && (
                <button
                  type="button"
                  onClick={() => void send(item)}
                  title={errors(item.error) ?? undefined}
                  className="absolute inset-0 grid place-items-center content-center gap-1 bg-black/60 p-1 text-center text-[11px] font-semibold text-white"
                >
                  <WarningIcon className="size-5" />
                  <span className="flex items-center gap-1">
                    <ArrowCounterClockwiseIcon className="size-3.5" />
                    {t("retry")}
                  </span>
                </button>
              )}
              <span className="absolute top-1 left-1 grid size-5 place-items-center rounded-full bg-black/60 text-[10px] font-bold text-white">
                {index + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(item.key)}
                aria-label={t("remove", { index: index + 1 })}
                className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
              >
                <XIcon className="size-3.5" weight="bold" />
              </button>
              {items.length > 1 && (
                <span className="absolute right-1 bottom-6 flex gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      aria-label={t("moveBefore", { index: index + 1 })}
                      className="grid size-6 place-items-center rounded-full bg-white/90 text-ink"
                    >
                      <CaretLeftIcon className="size-3.5" weight="bold" />
                    </button>
                  )}
                  {index < items.length - 1 && (
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      aria-label={t("moveAfter", { index: index + 1 })}
                      className="grid size-6 place-items-center rounded-full bg-white/90 text-ink"
                    >
                      <CaretRightIcon className="size-3.5" weight="bold" />
                    </button>
                  )}
                </span>
              )}
            </li>
          ))}
          {items.length < MAX_POST_IMAGES && (
            <li>
              <button
                type="button"
                onClick={() => input.current?.click()}
                className="grid aspect-[4/5] w-full place-items-center content-center gap-1.5 rounded-xl bg-muted text-sm font-semibold text-foreground outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <CameraIcon
                  className="size-7 text-muted-foreground"
                  weight="duotone"
                />
                {t("addPhotos")}
              </button>
            </li>
          )}
        </ul>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
        {fieldErrors.images && (
          <p role="alert" className="text-sm text-destructive">
            {errors(fieldErrors.images)}
          </p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="post-caption">{t("caption")}</Label>
        <Textarea
          id="post-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={MAX_CAPTION}
          rows={4}
          placeholder={t("captionPlaceholder")}
          aria-invalid={!!fieldErrors.caption}
          className={FILLED_TEXTAREA}
        />
        <p className="text-right text-xs text-muted-foreground tabular-nums">
          {caption.length}/{MAX_CAPTION}
        </p>
        {fieldErrors.caption && (
          <p role="alert" className="text-sm text-destructive">
            {errors(fieldErrors.caption)}
          </p>
        )}
      </div>

      <ActionBar>
        <Button
          type="submit"
          size="lg"
          disabled={!ready || pending}
          className={PRIMARY_ACTION}
        >
          {uploading ? t("waitUploads") : t("publish")}
        </Button>
      </ActionBar>
    </form>
  );
}
