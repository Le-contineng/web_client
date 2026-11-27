import { act, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import messages from "@/shared/i18n/messages/fr.json";
import { SuggestionBadge } from "@/modules/suggestions/presentation/components/SuggestionBadge";

const push = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => "/p/club-echecs",
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/modules/suggestions/application/suggestions.actions", () => ({
  submitSuggestionAction: vi.fn().mockResolvedValue({ sent: true }),
}));

function renderBadge(props: { signedIn: boolean; autoOpen?: boolean }) {
  render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <SuggestionBadge pageId="p1" pageName="Club échecs" {...props} />
    </NextIntlClientProvider>,
  );
}

describe("SuggestionBadge", () => {
  beforeEach(() => {
    localStorage.clear();
    push.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it("se nomme « Faire une suggestion » pour les lecteurs d'écran", () => {
    renderBadge({ signedIn: true });
    expect(
      screen.getByRole("button", { name: "Faire une suggestion" }),
    ).toBeInTheDocument();
  });

  it("sans session, passe par la connexion et revient formulaire ouvert", () => {
    renderBadge({ signedIn: false });
    fireEvent.click(
      screen.getByRole("button", { name: "Faire une suggestion" }),
    );
    expect(push).toHaveBeenCalledWith(
      `/login?returnTo=${encodeURIComponent("/p/club-echecs?suggest=1")}`,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("connecté, ouvre le formulaire dans un dialogue", async () => {
    renderBadge({ signedIn: true });
    fireEvent.click(
      screen.getByRole("button", { name: "Faire une suggestion" }),
    );
    expect(
      await screen.findByRole("dialog", {
        name: "Une suggestion pour Club échecs",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Votre suggestion")).toBeInTheDocument();
  });

  it("au retour de la connexion, le formulaire est déjà ouvert", async () => {
    renderBadge({ signedIn: true, autoOpen: true });
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("montre « Une idée pour nous ? » à la première visite seulement, quelques secondes", () => {
    vi.useFakeTimers();
    renderBadge({ signedIn: true });
    expect(screen.getByText("Une idée pour nous ?")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.queryByText("Une idée pour nous ?")).not.toBeInTheDocument();
    expect(localStorage.getItem("lc:suggestion-hint-seen")).toBe("1");
  });
});
