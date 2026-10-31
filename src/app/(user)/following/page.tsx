import { permanentRedirect } from "next/navigation";

/**
 * L'onglet « Abonnements » est retiré : suivre une page sert aux
 * notifications et aux statistiques, pas à un fil à part. Les anciens liens
 * mènent à l'accueil.
 */
export default function Page() {
  permanentRedirect("/");
}
