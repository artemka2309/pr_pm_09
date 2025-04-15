import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useNotificationStore = create(
    persist(
        (set) => ({
            notifications: [],
            addNotification: (notification) => set((state) => ({
                notifications: [...state.notifications, { ...notification, displayed: false }],
            })),
            markNotificationAsDisplayed: (index) => set((state) => ({
                notifications: state.notifications.map((notification, i) =>
                    i === index ? { ...notification, displayed: true } : notification
                ),
            })),
            clearNotifications: () => set({ notifications: [] }),
        }),
        {
            name: 'notification-storage', // имя ключа в localStorage
        }
    )
);

export default useNotificationStore;