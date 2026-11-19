import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { NavLink, useMatch } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

const getLinkClassName = (isActive: boolean): string =>
  clsx(styles.link, isActive && styles.link_active);

const getIconType = (isActive: boolean): 'primary' | 'secondary' =>
  isActive ? 'primary' : 'secondary';

export const AppHeaderUI = ({ userName }: TAppHeaderUIProps): React.JSX.Element => {
  const ingredientMatch = useMatch('/ingredients/:id');

  return (
    <header className={styles.header}>
      <nav className={clsx(styles.menu, 'p-4')}>
        <div className={styles.menu_part_left}>
          <NavLink
            to="/"
            className={({ isActive }) => getLinkClassName(isActive || !!ingredientMatch)}
          >
            {({ isActive }) => (
              <>
                <BurgerIcon type={getIconType(isActive || !!ingredientMatch)} />
                <p className="text text_type_main-default ml-2 mr-10">Конструктор</p>
              </>
            )}
          </NavLink>
          <NavLink to="/feed" className={({ isActive }) => getLinkClassName(isActive)}>
            {({ isActive }) => (
              <>
                <ListIcon type={getIconType(isActive)} />
                <p className="text text_type_main-default ml-2">Лента заказов</p>
              </>
            )}
          </NavLink>
        </div>
        <div className={styles.logo}>
          <Logo className="" />
        </div>
        <div className={styles.link_position_last}>
          <NavLink
            to="/profile"
            className={({ isActive }) => getLinkClassName(isActive)}
          >
            {({ isActive }) => (
              <>
                <ProfileIcon type={getIconType(isActive)} />
                <p className="text text_type_main-default ml-2">
                  {userName ?? 'Личный кабинет'}
                </p>
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </header>
  );
};
