"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { loadMorePostsAction } from "@/modules/events/application/posts.actions";
import type { EventPost, PostPage } from "@/modules/events/domain/event-post";
import type { PageSummary } from "@/modules/events/domain/event-view.types";
import { DeletePostButton } from "@/modules/events/presentation/components/DeletePostButton";
import { PostCarousel } from "@/modules/events/presentation/components/PostCarousel";
import { PublicationDate } from "@/modules/events/presentation/components/PublicationDate";
import { ImagesIcon } from "@/shared/components/icons";
import { ProfileAvatar } from "@/shared/components/ProfileAvatar";
import { Button } from "@/shared/ui/button";

/**
 * Fil d'un événement (ADR 0023) : ses posts du plus récent au plus ancien,
 * chacun avec son carrousel et sa légende, et « Voir plus » pour la suite.
 */
export function EventPostFeed({
  eventId,
  organizer,
  initial,
  manage = false,
}: {
  eventId: string;
  organizer: PageSummary;
  initial: PostPage;
  /** Membre de la page organisatrice : peut supprimer les posts. */
  manage?: boolean;
}) {
  const t = useTranslations("posts");
  const errors = useTranslations("errors");
  const [posts, setPosts] = useState(initial.posts);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [pending, start] = useTransition();

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-20 text-center text-muted-foreground">
        <ImagesIcon className="size-12" />
        <p>{t("empty")}</p>
      </div>
    );
  }

  function loadMore() {
    if (!cursor) return;
    start(async () => {
      const result = await loadMorePostsAction(eventId, cursor);
      if (!result.ok) {
        const code = result.error as "unknown";
        toast.error(errors.has(code) ? errors(code) : errors("unknown"));
        return;
      }
      setPosts((current) => [...current, ...result.value.posts]);
      setCursor(result.value.nextCursor);
    });
  }

  return (
    <div className="grid gap-8">
      {posts.map((post, i) => (
        <PostItem
          key={post.id}
          post={post}
          organizer={organizer}
          priority={i === 0}
          onDelete={
            manage
              ? () =>
                  setPosts((current) => current.filter((p) => p.id !== post.id))
              : undefined
          }
          eventId={eventId}
        />
      ))}
      {cursor && (
        <Button
          variant="outline"
          className="mx-4 sm:mx-0"
          disabled={pending}
          onClick={loadMore}
        >
          {t("loadMore")}
        </Button>
      )}
    </div>
  );
}

function PostItem({
  post,
  organizer,
  priority,
  eventId,
  onDelete,
}: {
  post: EventPost;
  organizer: PageSummary;
  priority: boolean;
  eventId: string;
  /** Présent pour les membres de la page : bouton de suppression. */
  onDelete?: () => void;
}) {
  const t = useTranslations("posts");
  const [expanded, setExpanded] = useState(false);
  const long = (post.caption?.length ?? 0) > 140;
  return (
    <article className="grid gap-2.5 border-b pb-6 sm:border-none sm:pb-0">
      <header className="flex items-center gap-2.5 px-4 sm:px-0">
        <ProfileAvatar
          name={organizer.name}
          photo={organizer.photoUrl}
          size="sm"
        />
        <div className="grid min-w-0 leading-tight">
          <span className="truncate text-sm font-semibold">
            {organizer.name}
          </span>
          <PublicationDate
            iso={post.publishedAt}
            className="truncate text-xs text-muted-foreground"
          />
        </div>
        {onDelete && (
          <DeletePostButton
            pageId={organizer.id}
            eventId={eventId}
            postId={post.id}
            onDeleted={onDelete}
          />
        )}
      </header>
      <PostCarousel images={post.images} priority={priority} />
      {post.caption && (
        <p className="px-4 text-sm whitespace-pre-line sm:px-0">
          <span className="mr-1.5 font-semibold">{organizer.name}</span>
          {long && !expanded ? (
            <>
              {post.caption.slice(0, 140).trimEnd()}…{" "}
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-muted-foreground hover:underline"
              >
                {t("seeMore")}
              </button>
            </>
          ) : (
            post.caption
          )}
        </p>
      )}
    </article>
  );
}
