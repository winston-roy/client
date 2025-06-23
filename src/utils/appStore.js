import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice';
import feedReducer from './feedSlice';
import connectionReducer from './connectionSlice'
import requestReducer from './requestSlice';
import signupReducer from './SignupSlice';

const appStore = configureStore({
    reducer: {
        user: userReducer,
        feed: feedReducer,
        connections: connectionReducer,
        Requests: requestReducer,
        Signup: signupReducer

    }
});

export default appStore;