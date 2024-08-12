// SmilePage.jsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SmilePage.css';

const smilies = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
  '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗',
  '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥',
  '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜',
  '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️',
  '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨',
  '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵',
  '😡', '😠', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇',
  '🥳', '🥺', '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈',
  '👿', '👹', '👺', '💀', '👻', '👽', '🤖', '💩', '😺', '😸'
];

const SmilePage = ({ onSelectSmiley }) => {
  return (
    <div className="smile-page container">
      <h1 className="text-center my-4">Select a Smiley</h1>
      <div className="row">
        {smilies.map((smiley, index) => (
          <div key={index} className="col-2 text-center mb-3">
            <span
              className="smile"
              onClick={() => onSelectSmiley(smiley)}
              style={{ cursor: 'pointer', fontSize: '2em' }}
            >
              {smiley}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmilePage;
