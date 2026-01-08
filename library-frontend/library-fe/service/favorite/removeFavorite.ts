import { repositoryApi } from "@/src/api/repositories/Repository";

export interface RemoveFavoriteResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export const removeFavorite = async (
  favoriteId: string
): Promise<RemoveFavoriteResponse | null> => {
  try {
    const res = await repositoryApi.delete<RemoveFavoriteResponse>(
      `/favorite/delete/${favoriteId}`,
      { withCredentials: true }
    );
    return res;
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
};
