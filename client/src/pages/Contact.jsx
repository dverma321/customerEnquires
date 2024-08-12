import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { userContext } from '../App';
import '../pages/Contact.css';

import '../../src/index.css';


export const ContactUs = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [platform, setplatform] = useState('');
  const [orderid, setorderid] = useState('');
  const [message, setMessage] = useState('');
  const { state } = useContext(userContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const VITE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;
        const VITE_PROD_API_URL = import.meta.env.VITE_PROD_API_URL;

        const apiUrl = import.meta.env.DEV ? VITE_LOCAL_API_URL : VITE_PROD_API_URL;

        console.log("Fetching data from : ", apiUrl);

        const token = localStorage.getItem('jwtoken');

        const res = await fetch(`${apiUrl}/user/getData`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            'Access-Control-Allow-Origin': 'https://findyourperfectmatch.netlify.app',
          },
          credentials: 'include',
        });

        const data = await res.json();

        if (res.status === 200 || data.status === "SUCCESS") {
          setEmail(data.email);
          setName(data.name);
        } else {
          window.alert("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleMessageSend = async (e) => {
    e.preventDefault();

    if (!orderid) {
      return window.alert("Please enter the order id.");
    }

    if (!platform) {
      return window.alert("Please enter the platform for the particular order id");
    }

    if (!message) {
      return window.alert("Message can not be  left blank");
    }

    const VITE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;
    const VITE_PROD_API_URL = import.meta.env.VITE_PROD_API_URL;

    const apiUrl = import.meta.env.DEV ? VITE_LOCAL_API_URL : VITE_PROD_API_URL;

    console.log("Sending message to : ", apiUrl);

    try {
      const res = await fetch(`${apiUrl}/customer_message/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          name: name,
          message: message,
          orderId: orderid,
          platform
        }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.status === 200) {
        window.alert("Message sent successfully!");
        setMessage('');
      }
      else if (res.status === 402) {
        window.alert("Select the platform!");

      }
      else if (res.status === 401) {
        window.alert("Order ID is required!");

      }


      else {
        window.alert("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className='container-fluid contact_bg'>
      <div className="row justify-content-center align-items-start">
        {/* Form for sending message */}
        <div className="col-lg-5 mt-5 mb-5">
          <div className="card">
            <div className="card-body p-5">
              <h2 className="text-uppercase text-center mb-5 fw-bold " style={{color:'lightcoral', textTransform:'uppercase'}}>Contact Us</h2>
              <form method='POST' className='contact-form' id='contact-form'>
                
                <div className="mb-4 form-outline">
                  <label className="form-label" htmlFor="contactformname"><i className="zmdi zmdi-account"></i> Name</label>
                  <input type="text" name='name' id="contactformname" className="form-control form-control-lg" placeholder='Enter your name' autoComplete='off'
                    value={name}
                    readOnly />
                </div>

                <div className="mb-4 form-outline">
                  <label className="form-label" htmlFor="contactformemail"><i className="zmdi zmdi-email"></i> Email</label>
                  <input type="email" name='email' id="contactformemail" className="form-control form-control-lg" placeholder='Enter your email' autoComplete='off'
                    value={email}
                    readOnly />
                </div>

                <div className="mb-4 form-outline">
                  <label className="form-label" htmlFor="contactformplatform"> <i className="zmdi zmdi-collection-text"></i> Platform</label>
                  <select
                    name='platform'
                    id="contactformplatform"
                    className="form-control form-control-lg"
                    value={platform}
                    onChange={(e) => setplatform(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select your platform</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Meesho">Meesho</option>
                    <option value="Shopsy">Shopsy</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>



                <div className="mb-4 form-outline">
                  <label className="form-label" htmlFor="contactformorderid"> <i className="zmdi zmdi-file"></i> OrderID</label>
                  <input type="text" name='orderid' id="contactformorderid" className="form-control form-control-lg" placeholder='Enter your order-id' autoComplete='off'
                    value={orderid}
                    onChange={(e) => setorderid(e.target.value)} required />
                </div>

                <div className="mb-4 form-outline">
                  <label className="form-label" htmlFor="contactformmessage"><i className="zmdi zmdi-whatsapp"></i> Message</label>
                  <textarea name='message' id="contactformmessage" className="form-control form-control-lg" placeholder='Enter your message'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)} required />
                </div>

                <div className="form-group form-button">
                  <input type='submit' name='send' id="send" className='form-submit button-color btn btn-primary btn-lg' value="Send Message" onClick={handleMessageSend} />
                </div>
              </form>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};
