import { create } from "zustand";
import { type UIState, type Notification } from "@/lib/types";

export const useUIStore = create<UIState & {
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "default" | "alireza" | "neda") => void;
  setDarkMode: (darkMode: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}>((set) => ({
  sidebarOpen: false,
  currentTheme: "default",
  darkMode: false,
  activeModal: null,
  notifications: [],
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ currentTheme: theme }),
  setDarkMode: (darkMode) => set({ darkMode }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  
  addNotification: (notification) => 
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: crypto.randomUUID(), ...notification }
      ]
    })),
    
  removeNotification: (id) => 
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
}));