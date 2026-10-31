import { type ReactNode, Suspense } from "react";
import { VisitTracker } from "@/modules/audience";
import {
  trackInstallAction,
  trackVisitAction,
} from "@/modules/audience/application/audience.actions";
import { Logo } from "@/shared/components/layout/Logo";
import { Skeleton } from "@/shared/ui/skeleton";
import { BottomNav } from "@/spaces/user/components/BottomNav";
import { CampaignBanner } from "@/spaces/user/components/CampaignBanner";
import { ShowOnMainTabs } from "@/spaces/user/components/ShowOnMainTabs";
import { EmailVerificationForAccount } from "@/spaces/user/components/EmailVerificationForAccount";
import { MobileHeader } from "@/spaces/user/components/MobileHeader";
import { PushSyncForAccount } from "@/spaces/user/components/PushSyncForAccount";
import { Sidebar } from "@/spaces/user/components/Sidebar";
import { SidebarFrame } from "@/spaces/user/components/SidebarFrame";

/**
 * Mise en page de l'application utilisateurs, inspirée d'Instagram : barre
 * latérale sur ordinateur ; sur téléphone, un en-tête sur l'accueil
 * seulement et la barre de navigation basse sur les écrans principaux. Le
 * cadre est statique ; ce qui dépend de la session arrive derrière des
 * Suspense (Cache Components, ADR 0004).
 */
export function UserLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarFrame
      logo={<Logo />}
      compactLogo={<Logo compact />}
      sidebar={
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <Sidebar />
        </Suspense>
      }
    >
      {/* En-tête sur l'accueil seulement (voir AutoHideHeader) */}
      <MobileHeader />
      <Suspense>
        <EmailVerificationForAccount />
      </Suspense>
      <main className="pb-20 md:pb-10">{children}</main>
      <ShowOnMainTabs>
        <Suspense>
          <CampaignBanner />
        </Suspense>
        <Suspense>
          <BottomNav />
        </Suspense>
      </ShowOnMainTabs>
      <Suspense>
        <PushSyncForAccount />
      </Suspense>
      {/* Activité des visiteurs, sans compte : une visite par jour, application installée */}
      <VisitTracker visit={trackVisitAction} install={trackInstallAction} />
    </SidebarFrame>
  );
}
