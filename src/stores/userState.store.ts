import { defineStore } from "pinia";

export interface UserState {
  displayName: string; // may be empty string while editing
  avatarDataUrl: string | null; // data URL preview stored locally
}

export const useUserStateStore = defineStore("userState", {
  state: (): UserState => ({
    displayName: "Creator",
    avatarDataUrl: null,
  }),
  actions: {
    // Allow empty while typing; no auto-fallback here.
    setName(name: string) {
      this.displayName = name;
    },

    setAvatar(dataUrl: string | null) {
      this.avatarDataUrl = dataUrl;
    },
    clearAvatar() {
      this.avatarDataUrl = null;
    },
  },
});
