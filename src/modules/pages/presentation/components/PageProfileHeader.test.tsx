import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeAll, describe, expect, it } from "vitest";
import messages from "@/shared/i18n/messages/fr.json";
import type { Page } from "@/modules/pages/domain/page.types";
import { PageProfileHeader } from "@/modules/pages/presentation/components/PageProfileHeader";

const page: Page = {
  id: "p1",
  slug: "club-echecs",
  name: "Club échecs",
  description: "Échecs le jeudi.",
  type: "club",
  photoUrl: null,
  createdAt: "2026-11-01T10:00:00Z",
};

beforeAll(() => {
  // La bio repliable mesure sa hauteur ; jsdom n'a pas ResizeObserver
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

describe("PageProfileHeader", () => {
  it("montre le nom, les publications et les abonnés, jamais les membres", () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <PageProfileHeader
          page={page}
          eventCount={186}
          followerCount={556}
          avatarBadge={<button type="button">Faire une suggestion</button>}
        />
      </NextIntlClientProvider>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Club échecs" }),
    ).toBeInTheDocument();
    const stats = screen.getByRole("list");
    expect(within(stats).getAllByRole("listitem")).toHaveLength(2);
    expect(stats).toHaveTextContent("186publications");
    expect(stats).toHaveTextContent("556abonnés");
    expect(screen.queryByText(/membre/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Faire une suggestion" }),
    ).toBeInTheDocument();
  });
});
