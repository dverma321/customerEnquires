import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'material-design-iconic-font/dist/css/material-design-iconic-font.min.css';
import '../pages/Registration.css';
import registrationImage from '../images/gif/registration_gif.gif';
import { userContext } from '../App'; // Import userContext

export const Registration = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(userContext); // Use userContext here
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const { name, email, password, confirmPassword } = user;

    if (!name || !email || !password || !confirmPassword) {
      return window.alert("Please fill all the fields...");
    }

    try {
      const VITE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;
      const VITE_PROD_API_URL = import.meta.env.VITE_PROD_API_URL;
      const apiUrl = import.meta.env.DEV ? VITE_LOCAL_API_URL : VITE_PROD_API_URL;

      const response = await fetch(`${apiUrl}/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user }),
      });

      const data = await response.json();
      console.log("Data : ", data);

      if (data.status === "400") {
        window.alert("Please fill all the details...");
      } else if (data.status === "402") {
        window.alert("Email Already Exits...");
      } else if (data.status === "403") {
        window.alert("Password doesn't match...");
      } else if (data.status === "500") {
        window.alert("Email is not Registered, please register first...");
      } else {
        window.alert('Registration Successful');

        // Save complete user object (including JWT token) in localStorage
        localStorage.setItem('userData', JSON.stringify(data)); // Assuming your backend sends back the complete user object

        // Save JWT token in cookies
        document.cookie = `jwtoken=${data.token}; path=/; Secure; SameSite=None`;

        // Dispatch the user data to the context
        dispatch({ type: "USER", payload: data });

        // Navigate to home page
        navigate('/');
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  }

  return (
    <>
      <div className="container-fluid">
        <div className="row justify-content-center align-items-center mt-5">
          <div className="col-12 col-md-6 col-lg-4 mb-5 d-flex justify-content-center">
            <img src={registrationImage} alt="Description" className="img-fluid" />
          </div>
          <div className="col-12 col-md-6 col-lg-3 mb-5">
            <div className="card shadow-lg">
              <div className="card-body">
                <form method='POST' className='register-form' id='register-form' onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-section mb-4">
                        <h3 className="text-center mb-4" style={{ color: 'lightcoral', textTransform: 'uppercase' }}>Registration Form</h3>
                        <div className="form-outline mb-4">
                          <label className="form-label" htmlFor='name'>
                            <i className="zmdi zmdi-account material-icons-name"></i> Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="formyourname"
                            className="form-control"
                            placeholder='Enter your name'
                            autoComplete='off'
                            value={user.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="form-outline mb-4">
                          <label className="form-label" htmlFor="labelemail">
                            <i className="zmdi zmdi-email"></i> Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="formyouremail"
                            className="form-control"
                            placeholder='Enter your email'
                            autoComplete='off'
                            value={user.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="form-outline mb-4">
                          <label className="form-label" htmlFor="labelyourpassword">
                            <i className="zmdi zmdi-lock"></i> Password
                          </label>
                          <input
                            type="password"
                            name="password"
                            id="formyourpassword"
                            className="form-control"
                            placeholder='Enter password'
                            autoComplete='off'
                            value={user.password}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="form-outline mb-4">
                          <label className="form-label" htmlFor="labelconfirmpassword">
                            <i className="zmdi zmdi-lock"></i> Repeat your password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            id="formconfirmpassword"
                            className="form-control"
                            placeholder='Repeat password'
                            autoComplete='off'
                            value={user.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-outline form-group form-button text-center mb-4">
                    <input type='submit' name='registration' id="registration" className='btn btn-primary btn-lg' value="Register" />
                  </div>
                </form>
                <div className="form-outline text-center">
                  <NavLink to="/login" className="navlink_login">
                    <i className="zmdi zmdi-tag"></i> I am Already Registered User
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
