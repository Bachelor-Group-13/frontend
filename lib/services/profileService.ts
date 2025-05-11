import { api } from "@/lib/api/auth";

export interface ProfileData {
  licensePlate: string;
  secondLicensePlate?: string | null;
  phoneNumber?: string | null;
  password?: string;
}

export const profileService = {
  async fetchUserData(userId: string) {
    const response = await api.get(`/api/auth/${userId}`);
    return response.data;
  },

  async updateProfile(userId: string, data: ProfileData) {
    const response = await api.put(`/api/auth/${userId}`, data);
    return response.data;
  },
};
