import Image from "next/image";
import Link from "next/link";

/**
 * Logo de la charte graphique : le pictogramme à plat, puis le logotype en
 * Space Grotesk 500, « Le Conti » dans la couleur du texte et « neng » en
 * fuchsia. Sur un fond fuchsia, la charte veut « neng » en noir : ce logo
 * n'est pas prévu pour ce fond.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 tracking-tight whitespace-nowrap"
      aria-label="Le Contineng"
    >
      <Image
        src="/brand/nameless-contineng.svg"
        alt=""
        width={32}
        height={32}
        unoptimized
        className="h-8 w-auto"
      />
      {!compact && (
        <span aria-hidden className="text-lg font-medium">
          Le Conti<span className="text-brand">neng</span>
        </span>
      )}
    </Link>
  );
}
