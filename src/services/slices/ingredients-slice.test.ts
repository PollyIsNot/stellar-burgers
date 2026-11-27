import { bun, main } from './__fixtures__/ingredients';
import { fetchIngredients, ingredientsSlice } from './ingredients-slice';

const ingredientsReducer = ingredientsSlice.reducer;
const initialState = ingredientsSlice.getInitialState();

const REQUEST_ID = 'test-request-id';
const ERROR_MESSAGE = 'Не удалось загрузить ингредиенты';

const ingredients = [bun, main];

describe('Редьюсер слайса ingredients', () => {
  test('возвращает начальное состояние при неизвестном экшене', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
  });

  describe('асинхронный экшен fetchIngredients', () => {
    test('pending включает загрузку и сбрасывает прошлую ошибку', () => {
      const previousState = { ...initialState, error: { message: ERROR_MESSAGE } };

      const state = ingredientsReducer(
        previousState,
        fetchIngredients.pending(REQUEST_ID)
      );

      expect(state).toEqual({ ...initialState, isLoading: true, error: null });
    });

    test('fulfilled сохраняет ингредиенты и выключает загрузку', () => {
      const previousState = { ...initialState, isLoading: true };

      const state = ingredientsReducer(
        previousState,
        fetchIngredients.fulfilled(ingredients, REQUEST_ID)
      );

      expect(state).toEqual({ ...initialState, items: ingredients, isLoading: false });
    });

    test('rejected сохраняет ошибку и выключает загрузку', () => {
      const previousState = { ...initialState, isLoading: true };
      const action = fetchIngredients.rejected(new Error(ERROR_MESSAGE), REQUEST_ID);

      const state = ingredientsReducer(previousState, action);

      expect(state).toEqual({ ...initialState, isLoading: false, error: action.error });
      expect(state.error?.message).toBe(ERROR_MESSAGE);
    });
  });
});
