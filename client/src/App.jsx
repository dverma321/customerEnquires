import React, { createContext, useEffect, useReducer, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import Logout from './pages/Logout';
import { Registration } from './pages/Registration';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { ContactUs } from './pages/Contact';
import 'daisyui/dist/full.css';
import { initialState, reducer } from './reducer/useReducer';
import AllUsers from './pages/AllUsers';

export const userContext = createContext();

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwtoken');
    if (token) {
      dispatch({ type: 'USER', payload: true });
    }
    setAuthInitialized(true);
  }, []);

  if (!authInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <userContext.Provider value={{ state, dispatch }}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/allusers" element={<AllUsers />} />
          <Route path="/reset-password/:id/:token" element={<ResetPassword />} />

        </Routes>
      </BrowserRouter>
    </userContext.Provider>
  );
};

export default App;
