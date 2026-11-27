import { fetchIngredients, ingredientsSlice } from './ingredients-slice';

import type { TIngredient } from '@utils-types';

const ingredientsReducer = ingredientsSlice.reducer;

const REQUEST_ID = 'test-request-id';
const ERROR_MESSAGE = 'Не удалось загрузить ингредиенты';

const ingredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://norma.ffapi.ru/images/bun-02.png',
    image_mobile: 'https://norma.ffapi.ru/images/bun-02-mobile.png',
    image_large: 'https://norma.ffapi.ru/images/bun-02-large.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://norma.ffapi.ru/images/meat-01.png',
    image_mobile: 'https://norma.ffapi.ru/images/meat-01-mobile.png',
    image_large: 'https://norma.ffapi.ru/images/meat-01-large.png',
  },
];

describe('Редьюсер слайса ingredients', () => {
  test('возвращает начальное состояние при неизвестном экшене', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual({ items: [], isLoading: false, error: null });
  });

  describe('асинхронный экшен fetchIngredients', () => {
    test('pending включает загрузку и сбрасывает прошлую ошибку', () => {
      const previousState = {
        ...ingredientsSlice.getInitialState(),
        error: { message: ERROR_MESSAGE },
      };

      const state = ingredientsReducer(
        previousState,
        fetchIngredients.pending(REQUEST_ID)
      );

      expect(state).toEqual({ items: [], isLoading: true, error: null });
    });

    test('fulfilled сохраняет ингредиенты и выключает загрузку', () => {
      const previousState = { ...ingredientsSlice.getInitialState(), isLoading: true };

      const state = ingredientsReducer(
        previousState,
        fetchIngredients.fulfilled(ingredients, REQUEST_ID)
      );

      expect(state).toEqual({ items: ingredients, isLoading: false, error: null });
    });

    test('rejected сохраняет ошибку и выключает загрузку', () => {
      const previousState = { ...ingredientsSlice.getInitialState(), isLoading: true };
      const action = fetchIngredients.rejected(new Error(ERROR_MESSAGE), REQUEST_ID);

      const state = ingredientsReducer(previousState, action);

      expect(state).toEqual({ items: [], isLoading: false, error: action.error });
      expect(state.error?.message).toBe(ERROR_MESSAGE);
    });
  });
});
