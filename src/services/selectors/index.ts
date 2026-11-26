import type { SerializedError } from '@reduxjs/toolkit';
import type { RootState } from '@services/store';
import type { TIngredient, TOrder, TUser } from '@utils-types';

export const selectIngredients = (state: RootState): TIngredient[] =>
  state.ingredients.items;

export const selectIngredientsLoading = (state: RootState): boolean =>
  state.ingredients.isLoading;

export const selectIngredientsError = (state: RootState): SerializedError | null =>
  state.ingredients.error;

export const selectIngredientById = (
  state: RootState,
  id: string | undefined
): TIngredient | undefined =>
  state.ingredients.items.find((ingredient) => ingredient._id === id);

export const selectConstructorItems = (
  state: RootState
): RootState['burgerConstructor'] => state.burgerConstructor;

export const selectOrderRequest = (state: RootState): boolean =>
  state.order.orderRequest;

export const selectOrderModalData = (state: RootState): TOrder | null =>
  state.order.orderModalData;

export const selectFeed = (state: RootState): RootState['feed'] => state.feed;

export const selectFeedOrders = (state: RootState): TOrder[] => state.feed.orders;

export const selectFeedLoading = (state: RootState): boolean => state.feed.isLoading;

export const selectProfileOrders = (state: RootState): TOrder[] =>
  state.profileOrders.orders;

export const selectOrderByNumber = (
  state: RootState,
  orderNumber: number
): TOrder | null =>
  state.feed.orders.find((order) => order.number === orderNumber) ??
  state.profileOrders.orders.find((order) => order.number === orderNumber) ??
  (state.order.orderData?.number === orderNumber ? state.order.orderData : null);

export const selectUser = (state: RootState): TUser | null => state.user.user;

export const selectIsAuthChecked = (state: RootState): boolean =>
  state.user.isAuthChecked;

export const selectLoginError = (state: RootState): SerializedError | null =>
  state.user.loginError;

export const selectRegisterError = (state: RootState): SerializedError | null =>
  state.user.registerError;

export const selectUpdateUserError = (state: RootState): SerializedError | null =>
  state.user.updateUserError;
