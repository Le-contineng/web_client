import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import messages from "@/shared/i18n/messages/fr.json";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { EventCard } from "@/modules/events/presentation/components/EventCard";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/",
}));
vi.mock("@/modules/events/application/interest.actions", () => ({
  setInterestAction: vi.fn(),
}));

const event: EventView = {
  id: "gala26xx",
  organizerPageId: "bde",
  name: "Soirée de gala",
  startsAt: "2026-11-07T18:30:00Z",
  endsAt: null,
  location: "Salle des fêtes",
  categories: ["party"],
  description: null,
  photoUrl: null,
  status: "cancelled",
  latestUpdate: null,
  cancellation: { reason: "Salle indisponible", at: "2026-11-01T10:00:00Z" },
  createdAt: "2026-10-01T10:00:00Z",
  period: "upcoming",
  organizer: {
    id: "bde",
    name: "BDE",
    slug: "bde",
    photoUrl: null,
  },
};

function renderCard(e: EventView) {
  render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <EventCard event={e} />
    </NextIntlClientProvider>,
  );
}

describe("CarteEvenement (US-01)", () => {
  it("affiche le nom, le lieu, la page et un lien vers la fiche", () => {
    renderCard({ ...event, status: "published", cancellation: null });
    expect(
      screen.getByRole("heading", { name: "Soirée de gala" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Salle des fêtes")).toBeInTheDocument();
    expect(screen.getByText("BDE")).toBeInTheDocument();
    for (const link of screen.getAllByRole("link", {
      name: "Soirée de gala",
    })) {
      expect(link).toHaveAttribute("href", "/e/gala26xx");
    }
  });

  it("propose Partager sur la ligne de la tuile, comme un réseau social", () => {
    renderCard({ ...event, status: "published", cancellation: null });
    expect(
      screen.getByRole("button", { name: "Partager" }),
    ).toBeInTheDocument();
  });

  it("signale l'annulation par un texte, pas seulement une couleur (US-15)", () => {
    renderCard(event);
    expect(screen.getAllByText("Annulé").length).toBeGreaterThan(0);
  });
});

describe("Carte du fil : affichage maîtrisé", () => {
  it("borne la hauteur de l'affiche et recadre une affiche trop haute en 4:5", () => {
    const { container } = render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <EventCard
          event={{
            ...event,
            status: "published",
            cancellation: null,
            photoUrl: "/api/v1/medias/0f8fad5b-d9cb-469f-a165-70867728950e",
            photo: { width: 1000, height: 4000, placeholder: null },
          }}
        />
      </NextIntlClientProvider>,
    );
    const frame = container.querySelector<HTMLElement>(".max-h-\\[70svh\\]");
    expect(frame).not.toBeNull();
    expect(parseFloat(frame!.style.aspectRatio)).toBeCloseTo(0.8);
  });

  it("reste compacte : ni hashtags ni catégories, la fiche les détaille", () => {
    renderCard({ ...event, status: "published", cancellation: null });
    expect(screen.queryByText(/^#/)).toBeNull();
    expect(screen.queryByText("Soirée / fête")).toBeNull();
  });
});

describe("Carte du fil : statut", () => {
  it("ne montre ni « Modifié » ni « En cours », gardés pour la fiche", () => {
    renderCard({
      ...event,
      status: "updated",
      cancellation: null,
      period: "ongoing",
    });
    expect(screen.queryByText("Modifié")).toBeNull();
    expect(screen.queryByText("En cours")).toBeNull();
  });
});

describe("Carte du fil : ouverture", () => {
  const published = {
    ...event,
    status: "published" as const,
    cancellation: null,
  };
  const mobile = (matches: boolean) =>
    vi.stubGlobal("matchMedia", (query: string) => ({ matches, media: query }));
  afterEach(() => vi.unstubAllGlobals());

  function clickTitle(onOpen: (id: string) => void) {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <EventCard event={published} onOpen={onOpen} />
      </NextIntlClientProvider>,
    );
    const link = screen.getAllByRole("link", { name: "Soirée de gala" })[1]!;
    return fireEvent.click(link, { button: 0 });
  }

  it("ouvre l'aperçu sur grand écran, sans quitter le fil", () => {
    mobile(false);
    const onOpen = vi.fn();
    const followed = clickTitle(onOpen);
    expect(onOpen).toHaveBeenCalledWith("gala26xx");
    expect(followed).toBe(false);
  });

  it("suit le lien vers la page sur mobile, pour le retour natif", () => {
    mobile(true);
    const onOpen = vi.fn();
    const followed = clickTitle(onOpen);
    expect(onOpen).not.toHaveBeenCalled();
    expect(followed).toBe(true);
  });

  it("affiche le nombre d'intéressés et envoie vers la connexion sans compte", () => {
    renderCard({ ...event, status: "published", interestCount: 42 });
    const flame = screen.getByRole("button", { name: "Intéressé (42)" });
    expect(flame).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(flame);
    expect(push).toHaveBeenCalledWith("/login?returnTo=%2F");
  });
});
