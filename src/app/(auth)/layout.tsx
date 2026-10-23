import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { Logo } from "@/shared/components/layout/Logo";

/**
 * Connexion et inscription : page épurée, sans la navigation du site, toujours
 * sombre (fond encre et grandes formes aux couleurs du logo sous le verre).
 */
export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <div className="dark relative isolate flex min-h-dvh flex-col overflow-hidden bg-[#0a0a0a] text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-28 size-[22rem] rotate-[18deg] rounded-[38%] bg-ct-red sm:size-[30rem]" />
        <div className="absolute top-[30%] -right-32 size-[18rem] -rotate-[24deg] rounded-[42%] bg-ct-blue sm:size-[26rem] lg:top-[22%] lg:right-[calc(50%-30rem)]" />
        <div className="absolute -bottom-20 left-[8%] size-[16rem] rotate-[32deg] rounded-[40%] bg-ct-green sm:size-[22rem]" />
        <div className="absolute right-[12%] -bottom-28 size-[14rem] -rotate-[12deg] rounded-[45%] bg-ct-orange sm:size-[20rem]" />
      </div>
      <header className="flex h-16 items-center justify-between px-4">
        <Logo />
        <LanguageSwitcher />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
