import React, { useState } from "react";
import SendButton from "./SendButton";

const InputBar = ({ onSubmit }) => {
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setMsg(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (msg.trim() === "") {
      alert("Please enter a message");
      return;
    }
    onSubmit(msg);
    setMsg("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        className="inputbar"
        id="userinput"
        placeholder="Ask me about Hotels, Flights, Travelling and Vacations 😁"
        value={msg}
        onChange={handleChange}
      />
      <SendButton />
    </form>
  );
};

export default InputBar;
