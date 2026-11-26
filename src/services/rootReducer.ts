import { combineReducers } from '@reduxjs/toolkit';
import { burgerConstructorSlice } from '@slices/burger-constructor-slice';
import { feedSlice } from '@slices/feed-slice';
import { ingredientsSlice } from '@slices/ingredients-slice';
import { orderSlice } from '@slices/order-slice';
import { profileOrdersSlice } from '@slices/profile-orders-slice';
import { userSlice } from '@slices/user-slice';

export const rootReducer = combineReducers({
  ingredients: ingredientsSlice.reducer,
  burgerConstructor: burgerConstructorSlice.reducer,
  order: orderSlice.reducer,
  feed: feedSlice.reducer,
  profileOrders: profileOrdersSlice.reducer,
  user: userSlice.reducer,
});
