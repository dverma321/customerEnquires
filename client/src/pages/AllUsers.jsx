import React, { useEffect, useState } from 'react';
import './AllUsers.css';

export const AllUsers = () => {
  const [adminMessages, setAdminMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getAdminMessages = async (page = 1) => {
    try {
      const token = localStorage.getItem('jwtoken');
      const VITE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;
      const VITE_PROD_API_URL = import.meta.env.VITE_PROD_API_URL;
      const apiUrl = import.meta.env.DEV ? VITE_LOCAL_API_URL : VITE_PROD_API_URL;

      const res = await fetch(`${apiUrl}/admincontrol/admin_messages?page=${page}&limit=5`, {
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
        setAdminMessages(data.messages);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } else {
        console.error('Failed to fetch admin messages:', await res.json());
      }
    } catch (error) {
      console.error('Error fetching admin messages:', error);
    }
  };

  useEffect(() => {
    getAdminMessages(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getAdminMessages(page);
  };

  const handleSendMessage = async (messageId) => {
    const responseMessage = prompt("Enter your response:");

    if (responseMessage) {
      try {
        const token = localStorage.getItem('jwtoken');
        const VITE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;
        const VITE_PROD_API_URL = import.meta.env.VITE_PROD_API_URL;
        const apiUrl = import.meta.env.DEV ? VITE_LOCAL_API_URL : VITE_PROD_API_URL;

        const res = await fetch(`${apiUrl}/admincontrol/send_response/${messageId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ responseMessage }),
        });

        if (res.ok) {
          alert('Message sent successfully');
          getAdminMessages(currentPage);
        } else {
          console.error('Failed to send message:', await res.json());
          alert('Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message');
      }
    }
  };

  const handleRemoveMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('jwtoken');
      const VITE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;
      const VITE_PROD_API_URL = import.meta.env.VITE_PROD_API_URL;
      const apiUrl = import.meta.env.DEV ? VITE_LOCAL_API_URL : VITE_PROD_API_URL;

      const res = await fetch(`${apiUrl}/admincontrol/remove_message/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('Message removed successfully');
        getAdminMessages(currentPage);
      } else {
        console.error('Failed to remove message:', await res.json());
        alert('Failed to remove message');
      }
    } catch (error) {
      console.error('Error removing message:', error);
      alert('Error removing message');
    }
  };

  return (
    <div className="container mt-4">
      <h2>All Enquires from the customers:</h2>
      {adminMessages.length > 0 ? (
        <div className="messages-list">
          {adminMessages.map((msg) => (
            <div key={msg._id} className="message-item p-3 mb-3 border rounded">
              <p><strong>Name:</strong> {msg.name}</p>
              <p><strong>Email:</strong> {msg.email}</p>
              <p><strong>Order ID:</strong> {msg.orderId}</p>
              <p><strong>Platform:</strong> {msg.platform}</p>
              <p><strong>Date:</strong> {new Date(msg.createdAt).toLocaleString()}</p>
              <p><strong>Message:</strong> {msg.content}</p>

              {msg.responses && msg.responses.length > 0 && (
                <div className="admin-responses mt-3">
                  <h5>Admin Responses:</h5>
                  <ul>
                    {msg.responses.slice().reverse().map((response) => (
                      <li key={response._id}>
                        <p><strong>Response:</strong> {response.message}</p>
                        <p><strong>Sent At:</strong> {new Date(response.sentAt).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button 
                className="btn btn-primary me-2"
                onClick={() => handleSendMessage(msg._id)}
              >
                Send Message
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleRemoveMessage(msg._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No messages found.</p>
      )}

      <div className="pagination mt-4">
        <button 
          className="btn btn-secondary"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>
        <span className="mx-2">Page {currentPage} of {totalPages}</span>
        <button 
          className="btn btn-secondary"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllUsers;
