import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FavoriteState {
  items: string[]; // product IDs
}

const initialState: FavoriteState = {
  items: [],
};

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
    },
    addFavorite: (state, action: PayloadAction<string>) => {
      if (!state.items.includes(action.payload)) {
        state.items.push(action.payload);
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((id) => id !== action.payload);
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite } = favoriteSlice.actions;
export default favoriteSlice.reducer;
