"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { carouselRatio } from "@/modules/events/domain/event-image";
import type { PostImage } from "@/modules/events/domain/event-post";
import { CaretLeftIcon, CaretRightIcon } from "@/shared/components/icons";
import { ProgressiveImage } from "@/shared/components/ProgressiveImage";
import { cn } from "@/shared/lib/utils";

/**
 * Carrousel d'un post : on glisse d'une image à l'autre (défilement aimanté,
 * natif au toucher), avec des flèches sur ordinateur, le compteur « 2/5 » et
 * des points sous les images. Le cadre suit les proportions de la première.
 */
export function PostCarousel({
  images,
  priority = false,
}: {
  images: PostImage[];
  priority?: boolean;
}) {
  const t = useTranslations("posts");
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const many = images.length > 1;

  function go(to: number) {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: to * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={t("carousel", { count: images.length })}
      className="grid gap-2"
    >
      <div className="group relative">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
          }}
          className="flex max-h-[80svh] snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain bg-muted sm:rounded-lg"
          style={{ aspectRatio: carouselRatio(images) }}
        >
          {images.map((image, i) => (
            <div
              key={`${image.url}-${i}`}
              role="group"
              aria-roledescription="slide"
              aria-label={t("imageOf", { index: i + 1, count: images.length })}
              className="relative w-full shrink-0 snap-center"
            >
              <ProgressiveImage
                src={image.url}
                alt={image.alt ?? ""}
                placeholder={image.placeholder}
                fill
                priority={priority && i === 0}
                eager={i === 1}
              />
            </div>
          ))}
        </div>

        {many && (
          <>
            <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-semibold text-white tabular-nums">
              {index + 1}/{images.length}
            </span>
            <CarouselArrow
              side="left"
              label={t("previous")}
              hidden={index === 0}
              onClick={() => go(index - 1)}
            />
            <CarouselArrow
              side="right"
              label={t("next")}
              hidden={index === images.length - 1}
              onClick={() => go(index + 1)}
            />
          </>
        )}
      </div>

      {many && (
        <div aria-hidden className="flex justify-center gap-1">
          {images.map((image, i) => (
            <span
              key={`${image.url}-${i}`}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === index ? "bg-brand" : "bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CarouselArrow({
  side,
  label,
  hidden,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  hidden: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? CaretLeftIcon : CaretRightIcon;
  if (hidden) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        // Au toucher, on glisse : les flèches sont pour la souris et le clavier
        "absolute top-1/2 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:grid",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-4" weight="bold" />
    </button>
  );
}
