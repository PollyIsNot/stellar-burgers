import { anotherBun, anotherMain, bun, main, sauce } from './__fixtures__/ingredients';
import {
  addIngredient,
  burgerConstructorSlice,
  moveIngredient,
  removeIngredient,
} from './burger-constructor-slice';
import { createOrder } from './order-slice';

import type { TConstructorIngredient, TConstructorState, TOrder } from '@utils-types';

const burgerConstructorReducer = burgerConstructorSlice.reducer;
const initialState = burgerConstructorSlice.getInitialState();

const REQUEST_ID = 'test-request-id';

const bunItem: TConstructorIngredient = { ...bun, id: 'bun-item-id' };
const mainItem: TConstructorIngredient = { ...main, id: 'main-item-id' };
const sauceItem: TConstructorIngredient = { ...sauce, id: 'sauce-item-id' };
const anotherMainItem: TConstructorIngredient = {
  ...anotherMain,
  id: 'another-main-item-id',
};

const filledState: TConstructorState = {
  bun: bunItem,
  ingredients: [mainItem, sauceItem, anotherMainItem],
};

const orderIngredientIds = [bun._id, main._id, sauce._id, anotherMain._id, bun._id];

const order: TOrder = {
  _id: '6745a1b2c3d4e5f6a7b8c9d0',
  status: 'done',
  name: 'Краторный spicy био-марсианский бургер',
  createdAt: '2026-11-26T12:00:00.000Z',
  updatedAt: '2026-11-26T12:00:00.000Z',
  number: 98765,
  ingredients: orderIngredientIds,
};

describe('Редьюсер слайса burgerConstructor', () => {
  test('возвращает начальное состояние при неизвестном экшене', () => {
    const state = burgerConstructorReducer(undefined, { type: 'UNKNOWN' });

    expect(state).toEqual(initialState);
  });

  describe('экшен addIngredient', () => {
    test('добавляет булку и присваивает ей id', () => {
      const state = burgerConstructorReducer(initialState, addIngredient(bun));

      expect(state.bun).toMatchObject(bun);
      expect(typeof state.bun?.id).toBe('string');
      expect(state.ingredients).toEqual(initialState.ingredients);
    });

    test('заменяет ранее добавленную булку новой', () => {
      const state = burgerConstructorReducer(filledState, addIngredient(anotherBun));

      expect(state.bun).toMatchObject(anotherBun);
      expect(state.bun?.id).not.toBe(bunItem.id);
      expect(state.ingredients).toEqual(filledState.ingredients);
    });

    test('добавляет начинку в конец списка с новым уникальным id', () => {
      const state = burgerConstructorReducer(filledState, addIngredient(main));
      const addedIngredient = state.ingredients[3];

      expect(state.bun).toEqual(bunItem);
      expect(state.ingredients).toHaveLength(4);
      expect(addedIngredient).toMatchObject(main);
      expect(typeof addedIngredient.id).toBe('string');
      expect(addedIngredient.id).not.toBe(mainItem.id);
    });

    test('добавляет соус в список начинок, а не вместо булки', () => {
      const state = burgerConstructorReducer(initialState, addIngredient(sauce));

      expect(state.bun).toBe(initialState.bun);
      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0]).toMatchObject(sauce);
      expect(typeof state.ingredients[0].id).toBe('string');
    });
  });

  test('экшен removeIngredient удаляет начинку по её id', () => {
    const state = burgerConstructorReducer(filledState, removeIngredient(sauceItem.id));

    expect(state).toEqual({ ...filledState, ingredients: [mainItem, anotherMainItem] });
  });

  describe('экшен moveIngredient', () => {
    test('перемещает начинку вверх', () => {
      const state = burgerConstructorReducer(
        filledState,
        moveIngredient({ from: 2, to: 1 })
      );

      expect(state.ingredients).toEqual([mainItem, anotherMainItem, sauceItem]);
    });

    test('перемещает начинку вниз', () => {
      const state = burgerConstructorReducer(
        filledState,
        moveIngredient({ from: 0, to: 1 })
      );

      expect(state.ingredients).toEqual([sauceItem, mainItem, anotherMainItem]);
    });
  });

  describe('асинхронный экшен createOrder', () => {
    test('pending не изменяет состав конструктора', () => {
      const state = burgerConstructorReducer(
        filledState,
        createOrder.pending(REQUEST_ID, orderIngredientIds)
      );

      expect(state).toEqual(filledState);
    });

    test('fulfilled очищает конструктор после успешного заказа', () => {
      const state = burgerConstructorReducer(
        filledState,
        createOrder.fulfilled(order, REQUEST_ID, orderIngredientIds)
      );

      expect(state).toEqual(initialState);
    });

    test('rejected не очищает конструктор при ошибке заказа', () => {
      const state = burgerConstructorReducer(
        filledState,
        createOrder.rejected(
          new Error('Не удалось оформить заказ'),
          REQUEST_ID,
          orderIngredientIds
        )
      );

      expect(state).toEqual(filledState);
    });
  });
});
