import { repositoryApi } from "@/src/api/repositories/Repository";

export interface FavoriteItem {
  _id: string;
  userId: string;
  bookId: {
    _id: string;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetFavoritesResponse {
  success: boolean;
  message: string;
  data: {
    favorites: FavoriteItem[];
  };
}

export const getFavorites = async (): Promise<GetFavoritesResponse | null> => {
  try {
    const res = await repositoryApi.get<GetFavoritesResponse>(
      "/favorite/list",
      { withCredentials: true }
    );
    return res;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error;
  }
};
