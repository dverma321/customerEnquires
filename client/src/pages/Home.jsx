import React, { useState, useEffect, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import homelogo from '../images/flower_logo/f2.png';
import { userContext } from '../App'; // Import the userContext
import '../pages/Home.css';
import Loading from './Loading';

export const Home = () => {
  const { state } = useContext(userContext); // Get the login state from context
  const [user, setUser] = useState(null);
  const [previousMessages, setPreviousMessages] = useState(null);

  // Fetch user data
  const callGetData = async () => {
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

      const data = await res.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetch previous messages
  const getCustomerPreviousMessages = async () => {
    if (!user) return; // Ensure user is available

    try {
      const token = localStorage.getItem('jwtoken');
      const senderEmail = user.email; // Use the sender's email from user data

      const VITE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;
      const VITE_PROD_API_URL = import.meta.env.VITE_PROD_API_URL;
      const apiUrl = import.meta.env.DEV ? VITE_LOCAL_API_URL : VITE_PROD_API_URL;

      const encodedSenderEmail = encodeURIComponent(senderEmail); // Ensure proper encoding

      console.log('Fetching messages for:', senderEmail); // Log sender email for debugging

      const res = await fetch(`${apiUrl}/customer_message/customer_previous_messages?senderEmail=${encodedSenderEmail}`, {
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
        console.log('Fetched messages:', data); // Log the fetched messages
        setPreviousMessages(data);
      } else {
        console.error('Failed to fetch messages:', await res.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (state.isAuthenticated) {
      callGetData();
    }
  }, [state.isAuthenticated]);

  useEffect(() => {
    if (user) {
      getCustomerPreviousMessages();
    }
  }, [user]);

  return (
    <div className="container-fluid video_bg">
      <div className="container">
        <div className="row homecontainer">
          <div className="col-12 col-md-12">
            {state.isAuthenticated ? (
              user ? (
                user.isAdmin ? (
                  <div className="mt-3">
                    <h3 className="welcome_name">Welcome - {user.name}!</h3>
                  </div>
                ) : (
                  <div className="mt-3">
                    <div className="">
                      <h3 className="welcome_name">Welcome - {user.name}!</h3>
                    </div>

                    <div className='container-name-work-info p-2 m-2'>
                    
                      <div className='scrollable-container'>
                        {previousMessages ? (
                          <ul>
                            {previousMessages.slice().reverse().map((msg) => (
                              <li key={msg._id} className="message-item">
                                <p><strong>Message:</strong> {msg.content}</p>
                                <p><strong>Platform:</strong> {msg.platform}</p>
                                <p><strong>OrderID:</strong> {msg.orderId}</p>
                                <p><strong>Date:</strong> {new Date(msg.createdAt).toLocaleString()}</p>
                                <hr />
                                {msg.responses && msg.responses.length > 0 && (
                                  <div className="admin-responses">
                                    <h6>Admin Responses:</h6>
                                    {msg.responses.slice().reverse().map((response) => (
                                      <p key={response._id}><strong>Response:</strong> {response.message}</p>
                                    ))}
                                  </div>
                                )}
                                <hr />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No previous messages found.</p>
                        )}
                      </div>
                    </div>

                  </div>
                )
              ) : (
                <Loading />
              )
            ) : (
              <div className='row justify-content-center'>
                <div className='col-12 col-md-12 col-lg-5 col-xl-5 justify-content-center mt-2 homeUserImageInitial'>
                  <div className='d-flex'>
                    <img className='img-fluid' src={homelogo} alt="home_logo" />
                  </div>
                </div>
                <div className='col-12 text-center'>
                  <h1 className="initial_home_user">Please Login to resolve your question <br /> Simple Registration </h1>
                  <p className="description">Ask any question related to your purchase here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="row">
          <div className='col-12'>
            <p>Thank you for purchasing from Verma Enterprises <br /> &copy; customerenquires.com 2024</p>
          </div>
        </div>
      </footer>
    </div>

  );
};

export default Home;
