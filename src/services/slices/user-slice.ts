import {
  getUserApi,
  loginUserApi,
  logoutApi,
  refreshToken,
  registerUserApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { SerializedError } from '@reduxjs/toolkit';
import type { TUser } from '@utils-types';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  loginError: SerializedError | null;
  registerError: SerializedError | null;
  updateUserError: SerializedError | null;
};

type TAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  loginError: null,
  registerError: null,
  updateUserError: null,
};

const saveTokens = ({ accessToken, refreshToken }: TAuthTokens): void => {
  setCookie(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

const removeTokens = (): void => {
  deleteCookie(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (registerData: TRegisterData) => {
    const data = await registerUserApi(registerData);
    saveTokens(data);
    return data.user;
  }
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (loginData: TLoginData) => {
    const data = await loginUserApi(loginData);
    saveTokens(data);
    return data.user;
  }
);

export const checkUserAuth = createAsyncThunk('user/checkUserAuth', async () => {
  const hasAccessToken = !!getCookie(ACCESS_TOKEN_KEY);
  const hasRefreshToken = !!localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!hasAccessToken && !hasRefreshToken) {
    return null;
  }
  if (!hasAccessToken) {
    await refreshToken();
  }
  const data = await getUserApi();
  return data.user;
});

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (userData: Partial<TRegisterData>) => {
    const data = await updateUserApi(userData);
    return data.user;
  }
);

export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  await logoutApi();
  removeTokens();
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerError = action.error;
      })
      .addCase(loginUser.pending, (state) => {
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginError = action.error;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      })
      .addCase(updateUser.pending, (state) => {
        state.updateUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateUserError = action.error;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});
