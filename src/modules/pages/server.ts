import "server-only";
import { cache } from "react";
import { pagesApi } from "@/modules/pages/infrastructure/pages.api";

export type {
  Member,
  Page,
  PageRequest,
  PageProfileBody,
  PageRequestBody,
  Role,
} from "@/modules/pages/domain/page.types";

// ——— Lecture publique ———
export const getAllPages = cache(() => pagesApi.list());
export const getPageBySlug = cache((slug: string) => pagesApi.getBySlug(slug));

// ——— Personne connectée et ses pages (« Mes pages », choix avant de publier) ———
export {
  getCurrentUser,
  getMyPage,
  getMyPageById,
  getMyPages,
} from "@/modules/pages/infrastructure/my-pages";

// ——— Modifier la page, réservé au propriétaire ———
export const updatePage = pagesApi.update;

// ——— Accès (US-06), réservé aux membres de la page ———
export const getMembers = (pageId: string) => pagesApi.members(pageId);
export const grantAccess = pagesApi.grantAccess;
export const revokeAccess = pagesApi.revokeAccess;

// ——— Demande de page (US-03) ———
export const getLatestPageRequest = () => pagesApi.latestRequest();
export const submitPageRequest = pagesApi.submitRequest;
export const withdrawPageRequest = pagesApi.withdrawRequest;

// ——— Administration des demandes (admins) ———
export const getPendingPageRequests = cache(() => pagesApi.pendingRequests());
export const getPageRequestById = (id: string) => pagesApi.getRequest(id);
export const acceptPageRequest = pagesApi.acceptRequest;
export const rejectPageRequest = pagesApi.rejectRequest;
