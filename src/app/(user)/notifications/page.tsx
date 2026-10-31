import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentAccount } from "@/modules/authentication/server";
import { NotificationList } from "@/modules/notifications";
import {
  getRecentNotifications,
  markAllRead,
} from "@/modules/notifications/server";
import { ContentSkeleton } from "@/shared/components/layout/ContentSkeleton";
import { PageTitle } from "@/shared/components/layout/PageTitle";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notifications");
  return { title: t("title"), robots: { index: false } };
}

/** Page Notifications (onglet de la barre du bas) : ouvrir la page les marque lues. */
async function Notifications() {
  const account = await getCurrentAccount();
  if (!account) redirect("/login?returnTo=%2Fnotifications");
  const t = await getTranslations("notifications");
  const list = await getRecentNotifications();
  await markAllRead();
  return (
    <div className="mx-auto grid max-w-2xl gap-2 pt-6 md:pt-10">
      <div className="px-4">
        <PageTitle title={t("title")} />
      </div>
      <NotificationList list={list} />
    </div>
  );
}

/** La session est lue dans Notifications, derrière ce Suspense (Cache Components). */
export default function Page() {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <Notifications />
    </Suspense>
  );
}
