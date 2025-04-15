import { create } from 'zustand';

const useColorStore = create((set) => ({
    selectedColor: null,
    selectedImage: null,
    isChangingColor: false,
    setSelectedColor: (color) => set({
        selectedColor: color,
        isChangingColor: true
    }),
    setSelectedImage: (image) => set((state) => ({
        selectedImage: image,
        isChangingColor: false
    })),
    initializeColor: (defaultColor) => set((state) => {
        if (!state.selectedColor) {
            return {
                selectedColor: defaultColor,
                isChangingColor: false
            };
        }
        return {};
    }),
}));

export default useColorStore;