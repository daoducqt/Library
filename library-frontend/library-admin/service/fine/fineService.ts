import { repositoryApi } from "@/src/api/repositories/Repository";
import {
  GetFinesResponse,
  FineResponse,
  ConfirmPayResponse,
  Fine,
} from "@/src/type/fine";

// Lấy tất cả fines (admin)
export const getAllFines = async (): Promise<Fine[] | null> => {
  const res = await repositoryApi.get<GetFinesResponse>(`/fine/all`);
  return res?.data || null;
};

// Xác nhận thanh toán tiền mặt
export const confirmPayFine = async (
  fineId: string,
  note?: string
): Promise<ConfirmPayResponse | null> => {
  const res = await repositoryApi.patch<ConfirmPayResponse>(
    `/fine/confirm-pay/${fineId}`,
    { note }
  );
  return res;
};
