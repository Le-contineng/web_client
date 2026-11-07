// API factice pour les tests E2E : reproduit, pour un visiteur sans compte,
// le contrat HTTP de l'API Spring (modules events et pages) avec les données
// de démonstration. La CI n'a ni base ni API : Playwright démarre ce serveur
// avant Next (voir playwright.config.ts). Aucune dépendance.
import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 8089);
const HEURE = 3_600_000;
const JOUR = 24 * HEURE;
const maintenant = Date.now();
const minuit = new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime();
const iso = (ms) => new Date(ms).toISOString();

const pages = [
  [
    "10000000-0000-4000-8000-000000000001",
    "bde",
    "BDE",
    "studentUnion",
    "Le bureau des étudiants.",
  ],
  [
    "10000000-0000-4000-8000-000000000002",
    "club-foot",
    "Club Foot",
    "club",
    "Matchs inter-écoles.",
  ],
  [
    "10000000-0000-4000-8000-000000000003",
    "les-planches",
    "Les Planches",
    "association",
    "Troupe de théâtre.",
  ],
  [
    "10000000-0000-4000-8000-000000000004",
    "scolarite",
    "Scolarité",
    "schoolService",
    "Service scolarité.",
  ],
].map(([id, slug, name, type, description], i) => ({
  id,
  slug,
  name,
  description,
  type,
  photoUrl: null,
  createdAt: iso(maintenant - (38 - i) * JOUR),
}));
const page = (id) => pages.find((p) => p.id === id);

const evenement = (
  id,
  pageIndex,
  name,
  startsAt,
  endsAt,
  location,
  categories,
  extra = {},
) => ({
  id,
  organizerPageId: pages[pageIndex].id,
  name,
  startsAt: iso(startsAt),
  endsAt: endsAt === null ? null : iso(endsAt),
  location,
  categories,
  description: null,
  photoUrl: null,
  status: "published",
  latestUpdate: null,
  cancellation: null,
  createdAt: iso(maintenant - 10 * JOUR),
  ...extra,
});

const evenements = [
  evenement(
    "integ2026",
    0,
    "Journée d'intégration",
    maintenant - 2 * HEURE,
    maintenant + 3 * HEURE,
    "Cour principale",
    ["orientation", "campusLife"],
  ),
  evenement(
    "derby4fc",
    1,
    "Derby inter-écoles",
    minuit + JOUR + 15 * HEURE,
    null,
    "Stade municipal",
    ["match", "interClub"],
  ),
  evenement(
    "gala26xx",
    0,
    "Soirée de gala",
    minuit + 3 * JOUR + 19 * HEURE,
    minuit + 4 * JOUR + HEURE,
    "Salle des fêtes",
    ["party"],
    {
      status: "updated",
      latestUpdate: {
        at: iso(maintenant - JOUR),
        changes: [
          {
            field: "location",
            before: "Foyer des étudiants",
            after: "Salle des fêtes",
          },
        ],
      },
    },
  ),
  evenement(
    "moliere7",
    2,
    "Le Malade imaginaire",
    minuit + 5 * JOUR + 18 * HEURE,
    null,
    "Amphi A",
    ["culture"],
  ),
  evenement(
    "tournoi8",
    1,
    "Tournoi de futsal",
    minuit + 8 * JOUR + 14 * HEURE,
    null,
    "Gymnase",
    ["match"],
    {
      status: "cancelled",
      cancellation: {
        reason: "Gymnase indisponible suite à des travaux.",
        at: iso(maintenant - 2 * JOUR),
      },
    },
  ),
  evenement(
    "rentree1",
    0,
    "Soirée de rentrée",
    minuit - 9 * JOUR + 20 * HEURE,
    null,
    "Foyer des étudiants",
    ["party", "orientation"],
  ),
  evenement(
    "amical01",
    1,
    "Match amical",
    minuit - 4 * JOUR + 15 * HEURE,
    null,
    "Stade municipal",
    ["match"],
  ),
];

// Contenus de la Journée d'intégration (ADR 0023 du client) : un sondage en
// direct dont les votes montent à chaque lecture, et quelques statuts simples.
const sondage = {
  id: "ecoles",
  question: "Quelle école partenaire attendez-vous le plus ?",
  opensAt: null,
  closesAt: iso(maintenant + 2 * JOUR),
  options: [
    ["inp", "INP Toulouse", 1079],
    ["skema", "SKEMA Business", 1032],
    ["efrei", "EFREI Paris", 933],
    ["essca", "ESSCA", 925],
    ["estp", "ESTP", 907],
    ["isep", "ISEP", 904],
  ].map(([id, label, votes]) => ({ id, label, imageUrl: null, votes })),
};
const vueSondage = () => ({
  ...sondage,
  totalVotes: sondage.options.reduce((n, o) => n + o.votes, 0),
});
/** Quelques votes arrivent entre deux lectures, sur des options au hasard. */
function voterAuHasard() {
  for (const o of sondage.options)
    if (Math.random() < 0.5) o.votes += Math.floor(Math.random() * 9);
}
const statuts = {
  integ2026: [
    {
      id: "integ-annonce",
      kind: "announcement",
      title: "Rendez-vous à 14 h dans la cour",
      detail: "Pensez à votre carte étudiante pour le parcours.",
      actionUrl: null,
    },
    {
      id: "integ-sondage",
      kind: "poll",
      title: sondage.question,
      detail: null,
      actionUrl: null,
    },
    {
      id: "integ-plan",
      kind: "map",
      title: "Plan du campus",
      detail: "Les stands sont autour de la cour principale.",
      actionUrl: "https://www.openstreetmap.org",
    },
    {
      id: "integ-billets",
      kind: "ticket",
      title: "Soirée de clôture",
      detail: "Places limitées, gratuites pour les nouveaux.",
      actionUrl: "https://example.org/billets",
    },
  ],
};

/** Période calculée comme l'API : sans fin, l'événement dure jusqu'à minuit UTC. */
function periode(e, instant = Date.now()) {
  const debut = Date.parse(e.startsAt);
  const fin = e.endsAt
    ? Date.parse(e.endsAt)
    : new Date(debut).setUTCHours(23, 59, 59, 999);
  if (instant < debut) return "upcoming";
  return instant <= fin ? "ongoing" : "past";
}

const reponse = (e) => {
  const p = page(e.organizerPageId);
  return {
    ...e,
    period: periode(e),
    organizer: { id: p.id, slug: p.slug, name: p.name, photoUrl: p.photoUrl },
    stories: (statuts[e.id] ?? []).map((s) =>
      s.kind === "poll" ? { ...s, poll: vueSondage() } : s,
    ),
  };
};

const liste = (valeur) => (valeur ? valeur.split(",").filter(Boolean) : []);

function fil(params) {
  const periodes = liste(params.get("period"));
  const retenues = periodes.length ? periodes : ["ongoing", "upcoming"];
  const categories = liste(params.get("category"));
  const slugs = liste(params.get("page"));
  const mots = (params.get("q") ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const choisis = evenements
    .filter((e) => retenues.includes(periode(e)))
    .filter(
      (e) =>
        !categories.length || e.categories.some((c) => categories.includes(c)),
    )
    .filter(
      (e) => !slugs.length || slugs.includes(page(e.organizerPageId).slug),
    )
    .filter((e) =>
      mots.every((m) =>
        `${e.name} ${e.location} ${page(e.organizerPageId).name}`
          .toLowerCase()
          .includes(m),
      ),
    )
    .sort((a, b) => {
      const passeA = periode(a) === "past";
      const passeB = periode(b) === "past";
      if (passeA !== passeB) return passeA ? 1 : -1;
      const ecart = Date.parse(a.startsAt) - Date.parse(b.startsAt);
      return passeA ? -ecart : ecart;
    });
  const depuis = Number(params.get("offset") ?? 0);
  const limite = Number(params.get("limit") ?? 20);
  const tranche = choisis.slice(depuis, depuis + limite);
  const suivant = depuis + limite < choisis.length ? depuis + limite : null;
  return {
    events: tranche.map(reponse),
    nextOffset: suivant,
    total: choisis.length,
  };
}

function envoyer(res, statut, corps) {
  if (corps === undefined) {
    res.writeHead(statut).end();
    return;
  }
  res
    .writeHead(statut, { "Content-Type": "application/json" })
    .end(JSON.stringify(corps));
}

const probleme = (res, statut, code) =>
  envoyer(res, statut, { status: statut, detail: code, code });

createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);
  const chemin = url.pathname;
  let m;
  if (req.method === "GET" && chemin === "/actuator/health")
    return envoyer(res, 200, { status: "UP" });
  if (req.method === "GET" && chemin === "/api/v1/events")
    return envoyer(res, 200, fil(url.searchParams));
  if (
    req.method === "GET" &&
    (m = chemin.match(/^\/api\/v1\/events\/([^/]+)$/))
  ) {
    const e = evenements.find((x) => x.id === decodeURIComponent(m[1]));
    return e
      ? envoyer(res, 200, reponse(e))
      : probleme(res, 404, "eventNotFound");
  }
  if (
    req.method === "GET" &&
    chemin === `/api/v1/events/integ2026/polls/${sondage.id}`
  ) {
    voterAuHasard();
    return envoyer(res, 200, vueSondage());
  }
  if (req.method === "GET" && chemin === "/api/v1/pages")
    return envoyer(res, 200, pages);
  if (
    req.method === "GET" &&
    (m = chemin.match(/^\/api\/v1\/pages\/([^/]+)\/events$/))
  ) {
    const p = pages.find((x) => x.slug === decodeURIComponent(m[1]));
    if (!p) return probleme(res, 404, "pageNotFound");
    return envoyer(
      res,
      200,
      evenements.filter((e) => e.organizerPageId === p.id).map(reponse),
    );
  }
  if (
    req.method === "GET" &&
    (m = chemin.match(/^\/api\/v1\/pages\/([^/]+)$/))
  ) {
    const p = pages.find((x) => x.slug === decodeURIComponent(m[1]));
    return p
      ? envoyer(res, 200, { page: p, memberCount: 1 })
      : probleme(res, 404, "pageNotFound");
  }
  // Mesures envoyées par les visiteurs : acceptées sans effet.
  if (
    req.method === "POST" &&
    /^\/api\/v1\/evenements\/[^/]+\/(ouvertures|partages)$/.test(chemin)
  ) {
    return envoyer(res, 204);
  }
  // Tout le reste exige un compte, que les tests E2E n'ont pas.
  if (chemin.startsWith("/api/v1/"))
    return probleme(res, 401, "connexionRequise");
  return probleme(res, 404, "introuvable");
}).listen(port, () => {
  console.log(`API factice prête sur http://localhost:${port}`);
});
