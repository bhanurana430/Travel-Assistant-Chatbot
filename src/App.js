import React, { useEffect, useState } from "react";
import Header from "./MyComponents/Header";
import ChatWindow from "./MyComponents/ChatWindow";
import InputBar from "./MyComponents/InputBar";
import ReactSwitch from "react-switch";
import { createContext } from "react";
import "./App.css";
import { io } from "socket.io-client";

const socket = io();

export const ThemeContext = createContext(null);

socket.on("connect", () => {
  console.log("Connected to server");
});

const App = () => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((curr) => (curr === "light" ? "dark" : "light"));
  };

  const [messages, setMessages] = useState([
    {
      type: "robot",
      text: "Hi, I am your travel mate! Please greet me and I will tell you what I can do!",
    },
  ]);

  useEffect(() => {
    socket.on("server-response", (data) => {
      data=data.replaceAll('\"',' ');
      console.log("Received message from server: ", data);
      setMessages([...messages, { type: "robot", text: data }]);
    });
  }, [messages]);

  const handleUserInput = (humanmsg) => {
    setMessages([...messages, { type: "human", text: humanmsg }]);
    console.log("Sending message to server: ", humanmsg);
    const messageObject = { message: humanmsg };
    console.log("Sending object to server: ", messageObject);
    const messageJson = JSON.stringify(messageObject);
    console.log("Sending JSON to server: ", messageJson);
    socket.emit("client-message", messageJson);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div id={theme}>
        <div className="background">
          <div className="hotellogo">
            <img
              src="https://png.pngtree.com/png-vector/20190521/ourmid/pngtree-hotel-icon-for-personal-and-commercial-use-png-image_1044892.jpg"
              alt=""
            />
          </div>
          <Header
            title="Travel Mate"
            subtitle="-- By Digital architechts --"
            undertitle="Your Assistant for finding best Hotel / Flight Deals"
          />
          <div className="flightlogo">
            <img
              src="https://i.pinimg.com/564x/ab/78/8a/ab788aba6e81e4b630bc96eb40f6d79b.jpg"
              alt=""
            />
          </div>
        </div>
        <div className="mainbody">
          <ChatWindow messages={messages} />
          <div className="bottom">
            <InputBar onSubmit={handleUserInput} />
          </div>
          <div className="togglebutton">
            <ReactSwitch onChange={toggleTheme} checked={theme === "dark"} />
            <label style={{ marginLeft: "10px" }}>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </label>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
