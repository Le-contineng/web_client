import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import messages from "@/shared/i18n/messages/fr.json";
import type { EventView } from "@/modules/events/domain/event-view.types";
import { EventCard } from "@/modules/events/presentation/components/EventCard";

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
  it("affiche le nom, le lieu, la page, les catégories et un lien vers la fiche", () => {
    renderCard({ ...event, status: "published", cancellation: null });
    expect(
      screen.getByRole("heading", { name: "Soirée de gala" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Salle des fêtes")).toBeInTheDocument();
    expect(screen.getByText("BDE")).toBeInTheDocument();
    // Catégorie en pastille teintée de sa couleur (categoryColor)
    const chip = screen.getByText("Soirée / fête");
    expect(chip).toHaveClass("ct-glass-chip");
    expect(chip.style.getPropertyValue("--chip")).toBe("#B0306B");
    for (const link of screen.getAllByRole("link", {
      name: "Soirée de gala",
    })) {
      expect(link).toHaveAttribute("href", "/e/gala26xx");
    }
    expect(
      screen.getByRole("button", { name: "Partager" }),
    ).toBeInTheDocument();
  });

  it("signale l'annulation par un texte, pas seulement une couleur (US-15)", () => {
    renderCard(event);
    expect(screen.getAllByText("Annulé").length).toBeGreaterThan(0);
  });
});
