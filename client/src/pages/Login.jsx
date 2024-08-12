import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { userContext } from '../App';
import '../pages/Login.css';
import 'material-design-iconic-font/dist/css/material-design-iconic-font.min.css';
import loginImage from '../images/png/login.jpg';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { state, dispatch } = useContext(userContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home if user is already logged in
    if (state?.isAuthenticated) {
      navigate('/');
    }
  }, [state, navigate]);

  const loginUser = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      return window.alert("Please fill all the details...");
    }

    const apiUrl = import.meta.env.DEV ? import.meta.env.VITE_LOCAL_API_URL : import.meta.env.VITE_PROD_API_URL;

    try {
      const res = await fetch(`${apiUrl}/user/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.status === 200 && data.status === "SUCCESS") {
        const { token } = data;

        localStorage.setItem('jwtoken', token);
        dispatch({ type: "USER", payload: true });

        navigate('/');

        window.alert("Login Successful");
      } else {
        window.alert(data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className='container-fluid video_bg'>
      <div className="row justify-content-center align-items-center mt-5 ">
        <div className="col-12 col-md-6 col-lg-4 mb-5 d-flex justify-content-center">
          <img src={loginImage} alt="Description" className="img-fluid" />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-5">
          <div className="card">
            <div className="card-body p-5">
              <h3 className="text-center mb-4" style={{color:'lightcoral', textTransform:'uppercase'}}>Login Page</h3>
              <form method='POST' className='signin-form' id='signin-form'>
                <div className="mb-4 form-outline">
                  <label className="form-label" htmlFor="username"><i className="zmdi zmdi-email"></i> Email</label>
                  <input type="text" name='username' id="username" className="form-control form-control-lg" placeholder='Enter your email' autoComplete='off'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="mb-4 form-outline">
                  <label className="form-label" htmlFor="signinformyourpassword"><i className="zmdi zmdi-lock"></i> Password</label>
                  <input type="password" name='password' id="signinformyourpassword" className="form-control form-control-lg" placeholder='Enter password' autoComplete='off'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="form-group form-button">
                  <input type='submit' name='signin' id="signin" className='form-submit button-color btn btn-primary btn-lg' value="Login" onClick={loginUser} />
                </div>
              </form>
              <div className="form-outline">
                <NavLink to="/register" className="navlink_login"><i className="zmdi zmdi-label-alt"></i> Register account for free</NavLink>
              </div>
              <div className="form-outline">
                <NavLink to="/forgot-password" className="navlink_login"><i className="zmdi zmdi-whatsapp"></i> Forgot password</NavLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
