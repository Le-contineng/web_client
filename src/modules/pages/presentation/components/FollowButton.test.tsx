import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import messages from "@/shared/i18n/messages/fr.json";
import { setFollowAction } from "@/modules/pages/application/follow.actions";
import { FollowButton } from "@/modules/pages/presentation/components/FollowButton";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  usePathname: () => "/p/bde",
}));
vi.mock("@/modules/pages/application/follow.actions", () => ({
  setFollowAction: vi.fn(),
}));
const toastError = vi.fn();
vi.mock("sonner", () => ({ toast: { error: (m: string) => toastError(m) } }));

// L'état connu de chaque page est partagé dans l'onglet : une page par test
function renderButton(following: boolean | null, slug = "bde") {
  render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <FollowButton slug={slug} following={following} />
    </NextIntlClientProvider>,
  );
}

describe("FollowButton (ADR 0019)", () => {
  afterEach(() => vi.clearAllMocks());

  it("sans session, mène à la connexion puis ramène à la page", () => {
    renderButton(null);
    fireEvent.click(screen.getByRole("button", { name: "Suivre" }));
    expect(push).toHaveBeenCalledWith("/login?returnTo=%2Fp%2Fbde");
    expect(setFollowAction).not.toHaveBeenCalled();
  });

  it("suit la page puis relit la page pour le nombre d'abonnés", async () => {
    vi.mocked(setFollowAction).mockResolvedValue({
      ok: true,
      value: { following: true, followerCount: 3 },
    });
    renderButton(false);
    fireEvent.click(screen.getByRole("button", { name: "Suivre" }));
    expect(setFollowAction).toHaveBeenCalledWith("bde", true);
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Abonné" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("un refus rétablit l'état et explique pourquoi", async () => {
    vi.mocked(setFollowAction).mockResolvedValue({
      ok: false,
      error: "emailNotVerified",
    });
    renderButton(false, "club-photo");
    fireEvent.click(screen.getByRole("button", { name: "Suivre" }));
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(messages.errors.emailNotVerified),
    );
    expect(screen.getByRole("button", { name: "Suivre" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(refresh).not.toHaveBeenCalled();
  });
});
