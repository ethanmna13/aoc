import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { AppThunk } from '../../app/store';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  token: string | null;
  error: string | null;
}

interface CustomJwtPayload {
  id: number;
  role: string;
  name: string;
}

const initialState: AuthState = {
  token: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.token = null;
      state.error = action.payload;
    },
    logout(state) {
      state.token = null;
      state.error = null;
    },
  },
});

export const { loginSuccess, loginFailure, logout } = authSlice.actions;

export default authSlice.reducer;

export const login = (email: string, password: string): AppThunk<Promise<string | void>> => async (dispatch) => {
  try {
    const response = await axios.post('http://localhost:3000/api/v1/users/sign_in', {
      user: {
        email,
        password,
      },
    }, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    if (response.status === 200) {
      const { token } = response.data;
      localStorage.setItem('authToken', token);
      dispatch(loginSuccess(token));

      const decoded = jwtDecode<CustomJwtPayload>(token);
      return decoded.role.trim().toLowerCase();
    }
  } catch {
    dispatch(loginFailure("There was an error logging you in. Please try again."));
  }
};