import { repositoryApi } from "@/src/api/repositories/Repository";

export interface AddFavoriteResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export const addFavorite = async (
  bookId: string
): Promise<AddFavoriteResponse | null> => {
  try {
    const res = await repositoryApi.post<AddFavoriteResponse>(
      `/favorite/add/${bookId}`,
      {},
      { withCredentials: true }
    );
    return res;
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
};
