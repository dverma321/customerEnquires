import React, { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { userContext } from '../App';
import '../pages/Login.css';
import loginImage from '../images/png/login.jpg'
import 'material-design-iconic-font/dist/css/material-design-iconic-font.min.css';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { state, dispatch } = useContext(userContext);
  const navigation = useNavigate();


  const resetPassword = async (e) => {
    e.preventDefault();

    if (!email ) {
      return window.alert("Please Enter the Email Address...");
    }


    const VITE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;
    const VITE_PROD_API_URL = import.meta.env.VITE_PROD_API_URL;

    const apiUrl = import.meta.env.DEV ? VITE_LOCAL_API_URL : VITE_PROD_API_URL;

    console.log("Server is running on : ",apiUrl);

    try {
      const res = await fetch(`${apiUrl}/user/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email
        }),
        credentials: 'include', // Include this line  
      });


      const data = await res.json();

      if (res.status === 200 || data.status === "Success") {
        const { token } = data;

        // Store the token in localStorage
        localStorage.setItem('jwtoken', token);

        // Dispatch user action to update context
        dispatch({ type: "USER", payload: true });

        // Redirect to user's profile or another authenticated route
        navigation('/login'); // navigating to Home Page

        window.alert("Email sent Successfully");
      }
      else 
       {
        window.alert("Email Invalid Credentials...")

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
                <h2 className="text-uppercase text-center mb-5">Welcome to Forgot password page</h2>

               

                <form method='POST' className='signin-form' id='forgotpassword-form'>
                  <div className="mb-4 input-container">
                    <label className="form-label" htmlFor="signinformyouremail"><i className="zmdi zmdi-email"></i> Email</label>
                    <input type="email" name='email' id="signinformyouremail" className="form-control form-control-lg" placeholder='Enter your email' autoComplete='off'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} required />
                  </div>                 

                  <div className="form-group form-button">
                    <input type='submit' name='signin' id="signin" className='form-submit button-color btn btn-primary btn-lg' value="Get Password" onClick={resetPassword} />
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
