import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { userContext } from '../App';
import './Navbar.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const Navbar = () => {
  const { state } = useContext(userContext);
  const [isAuthenticated, setIsAuthenticated] = useState(state?.isAuthenticated || false); // Handle initial null case
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem('jwtoken');
          const VITE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;
          const VITE_PROD_API_URL = import.meta.env.VITE_PROD_API_URL;
          const apiUrl = import.meta.env.DEV ? VITE_LOCAL_API_URL : VITE_PROD_API_URL;

          const res = await fetch(`${apiUrl}/user/getData`, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
          });

          if (res.ok) {
            const data = await res.json();
            setIsAdmin(data?.isAdmin || false); // Check if the user is an admin
          } else {
            console.error('Failed to fetch user data:', await res.json());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (state) {
      setIsAuthenticated(state.isAuthenticated); // Safely update state
    }
  }, [state]);

  const RenderMenu = () => {
    if (!isAuthenticated) {
      return (
        <>
          <li className="nav-item">
            <NavLink className="nav-link" to="/">
              <i className="fas fa-home"></i> Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/login">
              <i className="fas fa-sign-in-alt"></i> Login
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/register">
              <i className="fas fa-user-plus"></i> Registration
            </NavLink>
          </li>
        </>
      );
    } else {
      return (
        <>
          <li className="nav-item">
            <NavLink className="nav-link" to="/">
              <i className="fas fa-home"></i> Home
            </NavLink>
          </li>
          {isAdmin && (
            <li className="nav-item">
              <NavLink className="nav-link" to="/allusers">
                <i className="fas fa-users"></i> All Users
              </NavLink>
            </li>
          )}
          <li className="nav-item">
            <NavLink className="nav-link" to="/contact">
              <i className="fas fa-envelope"></i> Contact us
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/logout">
              <i className="fas fa-sign-out-alt"></i> Logout
            </NavLink>
          </li>
        </>
      );
    }
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Customer Enquiries...</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <RenderMenu />
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};
