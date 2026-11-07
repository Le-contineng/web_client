"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { CancelEventDialog } from "@/modules/events";
import { cancelEventAction } from "@/modules/events/application/events.actions";
import {
  DotsThreeIcon,
  EyeIcon,
  ImagesIcon,
  PencilSimpleIcon,
  PlusSquareIcon,
  ProhibitIcon,
} from "@/shared/components/icons";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";

type Action = {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  onSelect?: () => void;
  destructive?: boolean;
};

/**
 * Actions d'un événement dans l'espace organisateur : un menu qui monte du
 * bas de l'écran sur téléphone (cibles larges, au pouce), un menu déroulant
 * sur ordinateur. Modifier, publier un post et annuler n'apparaissent que
 * sur un événement ni passé ni annulé ; l'API revérifie chaque action.
 */
export function EventRowActions({
  eventId,
  name,
  editable,
}: {
  eventId: string;
  name: string;
  editable: boolean;
}) {
  const t = useTranslations("studio.actions");
  const desktop = useMediaQuery("(min-width: 640px)");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  // Sur téléphone, la confirmation attend que le menu du bas soit refermé :
  // deux fenêtres ouvertes en même temps se disputent le focus.
  const [cancelAfterSheet, setCancelAfterSheet] = useState(false);
  const id = encodeURIComponent(eventId);

  const actions: Action[] = [
    { id: "view", label: t("view"), icon: <EyeIcon />, href: `/e/${id}` },
    {
      id: "posts",
      label: t("posts"),
      icon: <ImagesIcon />,
      href: `/e/${id}/posts`,
    },
    ...(editable
      ? [
          {
            id: "edit",
            label: t("edit"),
            icon: <PencilSimpleIcon />,
            href: `/e/${id}/edit`,
          },
          {
            id: "post",
            label: t("newPost"),
            icon: <PlusSquareIcon />,
            href: `/e/${id}/posts/new`,
          },
          {
            id: "cancel",
            label: t("cancel"),
            icon: <ProhibitIcon />,
            destructive: true,
            onSelect: () => {
              if (desktop) {
                setCancelling(true);
              } else {
                setCancelAfterSheet(true);
                setSheetOpen(false);
              }
            },
          },
        ]
      : []),
  ];
  const label = t("menu", { name });
  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      className="size-10 shrink-0 text-muted-foreground"
    />
  );

  return (
    <>
      {desktop ? (
        <DropdownMenu>
          <DropdownMenuTrigger render={trigger}>
            <DotsThreeIcon weight="bold" className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52">
            {actions.map((action) => (
              <MenuEntry key={action.id} action={action} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Sheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          onOpenChangeComplete={(open) => {
            if (open || !cancelAfterSheet) return;
            setCancelAfterSheet(false);
            setCancelling(true);
          }}
        >
          <SheetTrigger render={trigger}>
            <DotsThreeIcon weight="bold" className="size-5" />
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="gap-0 rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <SheetHeader className="pb-2">
              <SheetTitle className="truncate pr-8 text-base">
                {name}
              </SheetTitle>
            </SheetHeader>
            <ul className="grid px-2">
              {actions.map((action) => (
                <li
                  key={action.id}
                  className={cn(action.destructive && "mt-1 border-t pt-1")}
                >
                  <SheetEntry action={action} />
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>
      )}
      {editable && (
        <CancelEventDialog
          eventId={eventId}
          action={cancelEventAction}
          open={cancelling}
          onOpenChange={setCancelling}
        />
      )}
    </>
  );
}

const ROW =
  "flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-[15px] font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-5 [&_svg]:text-muted-foreground";

function SheetEntry({ action }: { action: Action }) {
  const className = cn(
    ROW,
    action.destructive && "text-destructive [&_svg]:text-destructive",
  );
  return action.href ? (
    <Link href={action.href} className={className}>
      {action.icon}
      {action.label}
    </Link>
  ) : (
    <button type="button" onClick={action.onSelect} className={className}>
      {action.icon}
      {action.label}
    </button>
  );
}

function MenuEntry({ action }: { action: Action }) {
  return (
    <>
      {action.destructive && <DropdownMenuSeparator />}
      <DropdownMenuItem
        variant={action.destructive ? "destructive" : "default"}
        render={action.href ? <Link href={action.href} /> : undefined}
        onClick={action.onSelect}
      >
        {action.icon}
        {action.label}
      </DropdownMenuItem>
    </>
  );
}
