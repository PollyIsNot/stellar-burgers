import { expect, test, type Locator, type Page } from '@playwright/test';
import path from 'node:path';

const HARS_DIR = path.join(import.meta.dirname, 'hars');
const INGREDIENTS_HAR = path.join(HARS_DIR, 'ingredients.har');
const USER_HAR = path.join(HARS_DIR, 'user.har');
const ORDER_HAR = path.join(HARS_DIR, 'order.har');

const INGREDIENTS_URL = '**/api/ingredients';
const USER_URL = '**/api/auth/user';
const ORDERS_URL = '**/api/orders';

const TEST_ID = {
  burgerConstructor: 'burger-constructor',
  bunTop: 'constructor-bun-top',
  bunBottom: 'constructor-bun-bottom',
  bunPlaceholder: 'constructor-bun-placeholder',
  ingredient: 'constructor-ingredient',
  ingredientsPlaceholder: 'constructor-ingredients-placeholder',
  modalOverlay: 'modal-overlay',
};

const BUN_NAME = 'Краторная булка N-200i';
const MAIN = {
  id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  calories: '4242',
  proteins: '420',
  fat: '142',
  carbohydrates: '242',
};
const SAUCE_NAME = 'Соус Spicy-X';

const TEST_ACCESS_TOKEN = 'Bearer%20test-access-token';
const TEST_REFRESH_TOKEN = 'test-refresh-token';
const TEST_USER_NAME = 'Тестовый пользователь';
const ORDER_NUMBER = '98765';

const getIngredientCard = (page: Page, name: string): Locator =>
  page
    .getByRole('listitem')
    .filter({ hasText: name })
    .filter({ has: page.getByRole('button', { name: 'Добавить' }) });

const getIngredientCounter = (page: Page, name: string, count: string): Locator =>
  getIngredientCard(page, name).getByText(count, { exact: true });

const getBurgerConstructor = (page: Page): Locator =>
  page.getByTestId(TEST_ID.burgerConstructor);

const getModal = (page: Page): Locator => page.locator('#modals');

const addIngredient = async (page: Page, name: string): Promise<void> => {
  await getIngredientCard(page, name).getByRole('button', { name: 'Добавить' }).click();
};

const openConstructorPage = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(getIngredientCard(page, BUN_NAME)).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.routeFromHAR(INGREDIENTS_HAR, { url: INGREDIENTS_URL });
});

test.describe('Добавление ингредиентов в конструктор', () => {
  test.beforeEach(async ({ page }) => {
    await openConstructorPage(page);
  });

  test('булка добавляется в верх и низ конструктора', async ({ page }) => {
    const burgerConstructor = getBurgerConstructor(page);

    await expect(burgerConstructor.getByTestId(TEST_ID.bunPlaceholder)).toHaveCount(2);
    await expect(burgerConstructor.getByTestId(TEST_ID.bunTop)).toHaveCount(0);
    await expect(burgerConstructor.getByTestId(TEST_ID.bunBottom)).toHaveCount(0);

    await addIngredient(page, BUN_NAME);

    await expect(burgerConstructor.getByTestId(TEST_ID.bunTop)).toContainText(
      `${BUN_NAME} (верх)`
    );
    await expect(burgerConstructor.getByTestId(TEST_ID.bunBottom)).toContainText(
      `${BUN_NAME} (низ)`
    );
    await expect(burgerConstructor.getByTestId(TEST_ID.bunPlaceholder)).toHaveCount(0);
    await expect(getIngredientCounter(page, BUN_NAME, '2')).toBeVisible();
  });

  test('начинка и соус добавляются в середину конструктора', async ({ page }) => {
    const burgerConstructor = getBurgerConstructor(page);
    const constructorIngredients = burgerConstructor.getByTestId(TEST_ID.ingredient);

    await expect(
      burgerConstructor.getByTestId(TEST_ID.ingredientsPlaceholder)
    ).toHaveText('Выберите начинку');
    await expect(constructorIngredients).toHaveCount(0);

    await addIngredient(page, MAIN.name);
    await addIngredient(page, SAUCE_NAME);

    await expect(constructorIngredients).toHaveCount(2);
    await expect(constructorIngredients.nth(0)).toContainText(MAIN.name);
    await expect(constructorIngredients.nth(1)).toContainText(SAUCE_NAME);
    await expect(
      burgerConstructor.getByTestId(TEST_ID.ingredientsPlaceholder)
    ).toHaveCount(0);
    await expect(getIngredientCounter(page, MAIN.name, '1')).toBeVisible();
    await expect(getIngredientCounter(page, SAUCE_NAME, '1')).toBeVisible();
  });
});

test.describe('Модальное окно ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await openConstructorPage(page);
    await getIngredientCard(page, MAIN.name).getByRole('link').click();
  });

  test('открывается с данными ингредиента, по которому кликнули', async ({ page }) => {
    const modal = getModal(page);

    await expect(page).toHaveURL(`/ingredients/${MAIN.id}`);
    await expect(
      modal.getByRole('heading', { name: 'Детали ингредиента' })
    ).toBeVisible();
    await expect(modal.getByRole('heading', { name: MAIN.name })).toBeVisible();
    await expect(
      modal.getByRole('listitem').filter({ hasText: 'Калории, ккал' })
    ).toContainText(MAIN.calories);
    await expect(
      modal.getByRole('listitem').filter({ hasText: 'Белки, г' })
    ).toContainText(MAIN.proteins);
    await expect(
      modal.getByRole('listitem').filter({ hasText: 'Жиры, г' })
    ).toContainText(MAIN.fat);
    await expect(
      modal.getByRole('listitem').filter({ hasText: 'Углеводы, г' })
    ).toContainText(MAIN.carbohydrates);
  });

  test('закрывается по клику на крестик', async ({ page }) => {
    const modal = getModal(page);

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal).toBeEmpty();
    await expect(page).toHaveURL('/');
  });

  test('закрывается по клику на оверлей', async ({ page }) => {
    const modal = getModal(page);

    await modal.getByTestId(TEST_ID.modalOverlay).click({
      position: { x: 10, y: 10 },
    });

    await expect(modal).toBeEmpty();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Оформление заказа', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: TEST_ACCESS_TOKEN,
        domain: 'localhost',
        path: '/',
      },
    ]);
    await page.addInitScript((refreshToken) => {
      window.localStorage.setItem('refreshToken', refreshToken);
    }, TEST_REFRESH_TOKEN);
    await page.routeFromHAR(USER_HAR, { url: USER_URL });
    await page.routeFromHAR(ORDER_HAR, { url: ORDERS_URL });

    await openConstructorPage(page);
    await expect(page.getByRole('link', { name: TEST_USER_NAME })).toBeVisible();
  });

  test('после оформления показывается номер заказа и очищается конструктор', async ({
    page,
  }) => {
    const modal = getModal(page);
    const burgerConstructor = getBurgerConstructor(page);

    await addIngredient(page, BUN_NAME);
    await addIngredient(page, MAIN.name);
    await addIngredient(page, SAUCE_NAME);

    await expect(burgerConstructor.getByTestId(TEST_ID.bunTop)).toBeVisible();
    await expect(burgerConstructor.getByTestId(TEST_ID.bunBottom)).toBeVisible();
    await expect(burgerConstructor.getByTestId(TEST_ID.ingredient)).toHaveCount(2);

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    await expect(modal.getByRole('heading', { name: ORDER_NUMBER })).toBeVisible();
    await expect(modal.getByText('идентификатор заказа')).toBeVisible();

    await expect(burgerConstructor.getByTestId(TEST_ID.bunTop)).toHaveCount(0);
    await expect(burgerConstructor.getByTestId(TEST_ID.bunBottom)).toHaveCount(0);
    await expect(burgerConstructor.getByTestId(TEST_ID.ingredient)).toHaveCount(0);
    await expect(burgerConstructor.getByTestId(TEST_ID.bunPlaceholder)).toHaveCount(2);
    await expect(
      burgerConstructor.getByTestId(TEST_ID.ingredientsPlaceholder)
    ).toBeVisible();

    await modal.getByRole('button', { name: 'Закрыть' }).click();

    await expect(modal).toBeEmpty();
  });
});
