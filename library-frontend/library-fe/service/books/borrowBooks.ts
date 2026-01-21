import { repositoryApi } from "@/src/api/repositories/Repository";
import { BorrowResponse } from "@/type/book";

interface ErrorResponse {
  status: number;
  message: string;
}

// Type guard để check error response
function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "status" in response &&
    "message" in response &&
    typeof (response as ErrorResponse).status === "number" &&
    (response as ErrorResponse).status >= 400
  );
}

export const borrowBooks = async (
  bookId: string,
  days: number
): Promise<BorrowResponse> => {
  const response = await repositoryApi.post<BorrowResponse | ErrorResponse>(
    "/loan/borrow",
    { bookId, days },
    { withCredentials: true }
  );

  // Check nếu response là error response (status >= 400)
  if (isErrorResponse(response)) {
    const error = new Error(response.message || "Có lỗi xảy ra") as Error & {
      response: { data: ErrorResponse; status: number };
    };
    error.response = { data: response, status: response.status };
    throw error;
  }

  // Nếu response null
  if (!response) {
    throw new Error("Bạn đã mượn sách này hoặc có lỗi xảy ra");
  }

  return response as BorrowResponse;
};