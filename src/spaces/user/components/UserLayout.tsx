import { type ReactNode, Suspense } from "react";
import { Logo } from "@/shared/components/layout/Logo";
import { Skeleton } from "@/shared/ui/skeleton";
import { BottomNav } from "@/spaces/user/components/BottomNav";
import { MobileHeader } from "@/spaces/user/components/MobileHeader";
import { PushSyncForAccount } from "@/spaces/user/components/PushSyncForAccount";
import { Sidebar } from "@/spaces/user/components/Sidebar";
import { SidebarFrame } from "@/spaces/user/components/SidebarFrame";

/**
 * Mise en page de l'application utilisateurs, inspirée d'Instagram : barre
 * latérale sur ordinateur, en-tête et barre de navigation basse sur
 * téléphone. Le cadre est statique ; ce qui dépend de la session arrive
 * derrière des Suspense (Cache Components, ADR 0004).
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
      <MobileHeader />
      <main className="pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-10">
        {children}
      </main>
      <Suspense>
        <BottomNav />
      </Suspense>
      <Suspense>
        <PushSyncForAccount />
      </Suspense>
    </SidebarFrame>
  );
}
