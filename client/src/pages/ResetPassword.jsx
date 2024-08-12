import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { userContext } from '../App';
import '../pages/Login.css';
import loginImage from '../images/png/login.jpg'
import 'material-design-iconic-font/dist/css/material-design-iconic-font.min.css';

export const ResetPassword = () => {

  const [password, setPassword] = useState('');
  const { state, dispatch } = useContext(userContext);
  const navigation = useNavigate();
  const { id, token } = useParams(); // getting id and token from the url

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long.";
    }
    if (!hasUppercase) {
      return "Password must include at least one uppercase letter.";
    }
    if (!hasNumber) {
      return "Password must include at least one number.";
    }
    if (!hasSpecialChar) {
      return "Password must include at least one special character.";
    }
    return null;
  };

  const updatePassword = async (e) => {
    e.preventDefault();

    const validationError = validatePassword(password);
    if (validationError) {
      return window.alert(validationError);
    }

    const VITE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;
    const VITE_PROD_API_URL = import.meta.env.VITE_PROD_API_URL;

    const apiUrl = import.meta.env.DEV ? VITE_LOCAL_API_URL : VITE_PROD_API_URL;

    console.log("Server is running on : ", apiUrl);

    try {
      const res = await fetch(`${apiUrl}/user/reset-password/${id}/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
        credentials: 'include', // Include this line  
      });

      const data = await res.json();

      if (res.status === 200 || data.status === "Success") {
        const { token } = data;

        // Redirect to user's profile or another authenticated route
        navigation('/login'); // navigating to Home Page

        window.alert("Password Updated Successfully");
      } else {
        window.alert("Password wasn't updated...");
      }
    } catch (error) {
      console.error("Error during reset password:", error);
      // Handle other errors as needed
    }
  };

  return (
    <div className='container-fluid'>
      <div className="mask d-flex align-items-center h-100 gradient-custom-3 mt-5">
        <div className="container h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-12 col-md-9 col-lg-7 col-xl-12">
              <div className="card">
                <div className="card-body p-5">
                  <h2 className="text-uppercase text-center mb-5">Update your password</h2>

                  <form method='POST' className='signin-form' id='resetpassword-form'>
                    <div className="mb-4 input-container">
                      <label className="form-label" htmlFor="resetpassword"><i className="zmdi zmdi-password"></i> Update password</label>
                      <input type="password" name='password' id="resetpassword1" className="form-control form-control-lg" placeholder='Enter your new password' autoComplete='off'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <div className="form-group form-button">
                      <input type='submit' name='signin' id="signin" className='form-submit button-color btn btn-primary btn-lg' value="Update Password" onClick={updatePassword} />
                    </div>
                  </form>

                  <div className="form-outline">
                    <NavLink to="/login" className="navlink_login"><i className="zmdi zmdi-whatsapp"></i> Login here</NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
