import "server-only";
import { api, apiOrNull } from "@/shared/api/client";
import { withTranslatedErrors } from "@/modules/pages/infrastructure/errors";
import type {
  Member,
  Page,
  PageRequest,
  PageProfileBody,
  PageRequestBody,
  Role,
} from "@/modules/pages/domain/page.types";

/**
 * Client du module `pages` de l'API Spring. Les types du front reprennent
 * exactement le contrat de l'API : les réponses sont utilisées telles quelles.
 */
export const pagesApi = {
  /** Liste publique, la même pour tous : demandée sans compte. */
  list: () =>
    withTranslatedErrors(() =>
      api<Page[]>("/api/v1/pages", { anonymous: true }),
    ),
  getBySlug: (slug: string) =>
    withTranslatedErrors(() =>
      apiOrNull<{ page: Page; memberCount: number }>(
        `/api/v1/pages/${encodeURIComponent(slug)}`,
      ),
    ),
  myPages: () =>
    withTranslatedErrors(() =>
      api<{ page: Page; role: Role }[]>("/api/v1/me/pages"),
    ),
  /** Modifier la page (propriétaire seulement) ; le slug ne change pas. */
  update: (pageId: string, body: PageProfileBody) =>
    withTranslatedErrors(() =>
      api<Page>(`/api/v1/pages/${encodeURIComponent(pageId)}`, {
        method: "PUT",
        body,
      }),
    ),
  members: (pageId: string) =>
    withTranslatedErrors(() =>
      api<Member[]>(`/api/v1/pages/${pageId}/members`),
    ),
  latestRequest: () =>
    withTranslatedErrors(
      async () =>
        (await api<PageRequest | undefined>("/api/v1/me/page-request")) ?? null,
    ),
  submitRequest: (body: PageRequestBody) =>
    withTranslatedErrors(() =>
      api<PageRequest>("/api/v1/page-requests", { body }),
    ),
  withdrawRequest: (id: string) =>
    withTranslatedErrors(() =>
      api<void>(`/api/v1/page-requests/${id}`, { method: "DELETE" }),
    ),
  pendingRequests: () =>
    withTranslatedErrors(() =>
      api<PageRequest[]>("/api/v1/admin/page-requests"),
    ),
  getRequest: (id: string) =>
    withTranslatedErrors(() =>
      apiOrNull<PageRequest>(`/api/v1/admin/page-requests/${id}`),
    ),
  acceptRequest: (id: string) =>
    withTranslatedErrors(() =>
      api<Page>(`/api/v1/admin/page-requests/${id}/acceptance`, {
        method: "POST",
      }),
    ),
  rejectRequest: (id: string, reason: string) =>
    withTranslatedErrors(() =>
      api<void>(`/api/v1/admin/page-requests/${id}/rejection`, {
        body: { reason },
      }),
    ),
  grantAccess: (pageId: string, accountId: string) =>
    withTranslatedErrors(() =>
      api<void>(`/api/v1/pages/${pageId}/members`, { body: { accountId } }),
    ),
  revokeAccess: (pageId: string, accountId: string) =>
    withTranslatedErrors(() =>
      api<void>(`/api/v1/pages/${pageId}/members/${accountId}`, {
        method: "DELETE",
      }),
    ),
};
