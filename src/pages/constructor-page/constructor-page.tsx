import { selectIngredientsError, selectIngredientsLoading } from '@selectors';
import { ConstructorPageUI } from '@ui-pages';
import { clsx } from 'clsx';

import { useSelector } from '@services/store';

import styles from './constructor-page.module.css';

export const ConstructorPage = (): React.JSX.Element => {
  const isIngredientsLoading = useSelector(selectIngredientsLoading);
  const ingredientsError = useSelector(selectIngredientsError);

  if (ingredientsError) {
    return (
      <p className={clsx(styles.message, 'text text_type_main-medium')}>
        Не удалось загрузить ингредиенты
        {ingredientsError.message ? `: ${ingredientsError.message}` : '.'}
      </p>
    );
  }

  return <ConstructorPageUI isIngredientsLoading={isIngredientsLoading} />;
};
