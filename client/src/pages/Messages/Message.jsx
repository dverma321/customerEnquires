// Messages.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Messages/Message.css'; // Import the custom CSS

import SmilePage from './Smile';

const Messages = () => {
  const { friendId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [profilePic, setProfilePic] = useState('');
  const [friendPic, setFriendPic] = useState('');
  const [showSmilePage, setShowSmilePage] = useState(false); // Manage smile page visibility
  const [selectedSmiley, setSelectedSmiley] = useState('');

  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const VITE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL;
    const VITE_PROD_API_URL = import.meta.env.VITE_PROD_API_URL;
    const apiUrl = import.meta.env.DEV ? VITE_LOCAL_API_URL : VITE_PROD_API_URL;

    const token = localStorage.getItem('jwtoken');
    
    // Fetch user data
    fetch(`${apiUrl}/user/getData`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setUserId(data._id);
        setProfilePic(data.imageUrl); // Assuming user data contains profilePic

        // Fetch friend's profile picture
        fetch(`${apiUrl}/friend/friends/${data._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        })
          .then(response => response.json())
          .then(friends => {
            const friend = friends.find(friend => friend._id === friendId);
            if (friend) {
              setFriendPic(friend.imageUrl);
            }
          })
          .catch(error => {
            console.error('Error fetching friend data', error);
          });

        // Initialize socket connection
        const socket = io(apiUrl, {
          withCredentials: true,
        });
        setSocket(socket);

        // Join the socket room
        socket.emit('join', { userId: data._id });

        socket.on('receiveMessage', ({ senderId, message }) => {
          setMessages(prevMessages => [...prevMessages, { senderId, message, timestamp: new Date() }]);
        });

        // Fetch previous messages
        fetch(`${apiUrl}/api/messages/${data._id}/${friendId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        })
          .then(response => response.json())
          .then(previousMessages => {
            setMessages(previousMessages);
          })
          .catch(error => {
            console.error('Error fetching previous messages', error);
          });
      })
      .catch(error => {
        console.error('Error fetching user data', error);
      });
  }, [friendId]);

  const sendMessage = () => {
    if (message.trim() === '') return;

    socket.emit('sendMessage', {
      senderId: userId,
      receiverId: friendId,
      message: message,
    });

    setMessages([...messages, { senderId: userId, message, timestamp: new Date() }]);
    setMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}`;
  };

  const handleSmileySelect = (smiley) => {
    setMessage(prevMessage => prevMessage + smiley);
    setSelectedSmiley(smiley);
    setShowSmilePage(false); // Hide smiley picker after selection
  };

  return (
    <div className="chat-container">
      <button className="btn btn-secondary mb-4" onClick={() => navigate(-1)}>Back</button> 
      <h2 className="text-center mb-4" style={{color:'lightseagreen'}}>Chat with Friend</h2>
      <div className="chat-box">
        {messages.map((msg, index) => {
          const fromMe = msg.senderId === userId;
          const chatClassName = fromMe ? 'chat-end' : 'chat-start';
          const bubbleBgColor = fromMe ? 'chat-bubble-accent' : 'chat-bubble-primary';
          const imageUrl = fromMe ? profilePic : friendPic;
          const formattedTime = formatTime(msg.timestamp);

          return (
            <div key={index} className={`chat ${chatClassName}`}>
              <div className='chat-image avatar'>
                <div className='w-10 rounded-full'>
                  <img alt="Profile Pic" src={imageUrl} />
                </div>
              </div>
              <div className={`chat-bubble text-white ${bubbleBgColor}`}>{msg.message}</div>
              <div className="chat-footer opacity-50 flex gap-1">Sent at {formattedTime}</div>
            </div>
          );
        })}
      </div>
      <div className="input-group mt-3">
        <input
          type="text"
          className="form-control"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button className="btn btn-secondary" onClick={() => setShowSmilePage(!showSmilePage)}>
          😊
        </button>
        {showSmilePage && (
          <div className="smile-page-container">
            <SmilePage onSelectSmiley={handleSmileySelect} />
          </div>
        )}
        <button className="btn btn-primary" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Messages;
