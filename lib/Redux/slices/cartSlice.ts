import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number;
  thumbnail: string;
  qty: number;
  selectedColor?: string;
  selectedSize?: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => 
          item._id === action.payload._id && 
          item.selectedColor === action.payload.selectedColor && 
          item.selectedSize === action.payload.selectedSize
      );

      if (existingItem) {
        if (existingItem.qty + action.payload.qty <= existingItem.stock) {
          existingItem.qty += action.payload.qty;
        }
      } else {
        state.items.push(action.payload);
      }
      state.isOpen = true; // Automatically open cart when item is added
    },
    removeFromCart: (state, action: PayloadAction<{ _id: string, color?: string, size?: string }>) => {
      state.items = state.items.filter(
        (item) => 
          !(item._id === action.payload._id && 
            item.selectedColor === action.payload.color && 
            item.selectedSize === action.payload.size)
      );
    },
    updateQuantity: (state, action: PayloadAction<{ _id: string, qty: number, color?: string, size?: string }>) => {
      const item = state.items.find(
        (item) => 
          item._id === action.payload._id && 
          item.selectedColor === action.payload.color && 
          item.selectedSize === action.payload.size
      );
      if (item && action.payload.qty > 0 && action.payload.qty <= item.stock) {
        item.qty = action.payload.qty;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { 
  toggleCart, 
  openCart, 
  closeCart, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart 
} = cartSlice.actions;

export default cartSlice.reducer;
