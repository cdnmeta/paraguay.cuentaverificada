// store/useAuthStore.js
import { create } from "zustand";
import {
  saveEncrypted,
  getEncrypted,
  removeEncrypted,
} from "@/utils/secureStorage";
import axios from "axios";
import { getUserInfo } from "@/apis/auth.api";
import { auth } from "@/firebaseConfig";
import { signOut } from "firebase/auth";

export const useAuthStore = create((set, get) => ({
  user: null,
  timeoutId: null,
  empresaActual: null,
  isHydrated: false, // 👈 agregamos esto
  setUser: async (user) => {
    await saveEncrypted("user", user);
    set({ user });
  },

  fetchUser: async () => {
    try {
      const res = await getUserInfo();
      await get().setUser(res.data); // datos validados desde el backend
    } catch (err) {
      console.error("❌ Error en fetchUser:", err);
      get().logout();
    }
  },

  logout: async () => {
    clearTimeout(get().timeoutId);
    removeEncrypted("user");
    removeEncrypted("empresaActual");
    set({ user: null, timeoutId: null, empresaActual: null });
    await signOut(auth);
  },
  setHydrated: () => set({ isHydrated: true }),

  loadUserFromStorage: async () => {
    const user = await getEncrypted("user");
    if (user) await get().setUser(user);
    set({ isHydrated: true }); // 👈 marcamos como hidratado
  },

  isLoggedIn: () => !!get().user,
}));
