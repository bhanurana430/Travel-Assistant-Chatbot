import React, { useEffect, useRef } from "react";

const ChatWindow = ({ messages, serverResponse }) => { // Accept serverResponse as prop
  const chatWindowRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
  };

  return (
    <div id="chatwin" className="chatwindow " ref={chatWindowRef}>
      {messages.map((message, index) => (
        <React.Fragment key={index}>
          {message.type === 'human' ? (
            <div className="automsg human">
              <pre className="humantext">{message.text}</pre>
              <div className="humanavatar"><img src="" alt="" /></div>
            </div>
          ) : (
            <div className="automsg">
              <div className="roboavatar"></div>
              <div><pre className="robotext">{message.text}</pre></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ChatWindow;
