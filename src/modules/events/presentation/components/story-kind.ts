import {
  ChartBarIcon,
  ClipboardTextIcon,
  ImagesIcon,
  ListIcon,
  MapTrifoldIcon,
  MegaphoneIcon,
  TicketIcon,
  TrophyIcon,
  type Icon,
} from "@/shared/components/icons";
import type { StoryKind, StoryTone } from "@/modules/events/domain/event-story";

export const STORY_ICONS: Record<StoryKind, Icon> = {
  poll: ChartBarIcon,
  ticket: TicketIcon,
  registration: ClipboardTextIcon,
  announcement: MegaphoneIcon,
  result: TrophyIcon,
  program: ListIcon,
  map: MapTrifoldIcon,
  photos: ImagesIcon,
};

/** Fond plein écran du statut, aux couleurs de la marque. */
export const TONE_CLASSES: Record<StoryTone, string> = {
  brand: "bg-brand text-white",
  ink: "bg-ink text-ink-foreground",
  deep: "bg-[color-mix(in_oklab,var(--brand)_62%,black)] text-white",
};
