import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Interface en français (D2 : la langue suit le navigateur).
test.use({ locale: "fr-FR" });

test("un visiteur voit les événements à venir sans compte (US-01, US-16)", async ({
  page,
}) => {
  await page.goto("/");

  const cartes = page.getByRole("article");
  await expect(cartes.first()).toBeVisible();
  // Par défaut, seuls les événements en cours et à venir sont listés (D4).
  await expect(
    page.getByRole("heading", { level: 2, name: "Soirée de rentrée" }),
  ).toHaveCount(0);
  // Les filtres sont sur la recherche, ouverte par la loupe.
  await expect(
    page.getByRole("link", { name: "Rechercher" }).first(),
  ).toBeVisible();
});

test("un lien filtré mène à la recherche avec le même filtre (US-17)", async ({
  page,
}) => {
  await page.goto("/?period=past");

  await expect(page).toHaveURL(/\/search\?period=past$/);
  await expect(
    page.getByRole("link", { name: "Passé", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await expect(
    page.getByRole("link", { name: /Soirée de rentrée/ }).first(),
  ).toBeVisible();
});

test("la fiche s'ouvre sans compte et un lien inconnu est expliqué (US-36)", async ({
  page,
}) => {
  await page.goto("/e/gala26xx");
  await expect(
    page.getByRole("heading", { level: 1, name: "Soirée de gala" }),
  ).toBeVisible();
  await expect(page.getByText("Modifié").first()).toBeVisible();
  // Partager est une icône de la ligne d'actions ; le reste est dans « ··· »
  // (sheet sur téléphone, panneau sur ordinateur : ce dernier remplace le
  // premier une fois la page chargée, d'où la répétition)
  await expect(
    page.getByRole("button", { name: "Partager" }).first(),
  ).toBeVisible();
  await expect(async () => {
    await page.getByRole("button", { name: "Plus d'actions" }).click();
    await expect(
      page.getByRole("button", { name: "Copier le lien" }),
    ).toBeVisible({ timeout: 1000 });
  }).toPass();

  await page.goto("/e/inexistant");
  await expect(
    page.getByRole("heading", { name: "Cet événement n'existe pas" }),
  ).toBeVisible();
});

test("l'espace Administration demande une connexion (US-07)", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?returnTo=\/admin/);
});

test("la page d'accueil n'a aucune violation d'accessibilité A/AA", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("article").first()).toBeVisible();

  const resultats = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(resultats.violations).toEqual([]);
});
