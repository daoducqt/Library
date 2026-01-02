import { repositoryApi } from "@/src/api/repositories/Repository";
import { GetBooksResponse } from "@/type/book";
interface GetBooksParams {
  page?: number;
  limit?: number;
  keyword?: string;
  // legacy/alternate param name used by some callers
  search?: string;
  subject?: string;
  category?: string;
  publishedYear?: number;
  available?: boolean;
}
export const getListBooks = async (
  params: GetBooksParams = {}
): Promise<GetBooksResponse | null> => {
  const {
    page = 1,
    limit = 20,
    keyword,
    search,
    subject,
    category,
    publishedYear,
    available,
  } = params;

  // allow callers to pass `search` (homePage uses this) — prefer explicit `keyword`
  const effectiveKeyword = keyword ?? search;

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (effectiveKeyword) query.append("keyword", effectiveKeyword);
  if (subject) query.append("subject", subject);
  if (category) query.append("category", category);
  if (publishedYear) query.append("publishedYear", String(publishedYear));
  if (available !== undefined) query.append("available", String(available));

  const res = await repositoryApi.get<GetBooksResponse>(
    `/book/Filter?${query.toString()}`
  );

  return res;
};
