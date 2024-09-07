import React from "react";
import PropTypes from "prop-types";

const Header = (props) => {
  return (
    <div className="header">
      <div className="headertexts">
        <div className="text">{props.title}</div>
        <div className="undertext">{props.subtitle}</div>
        <div className="centertext">{props.undertitle}</div>
      </div>
    </div>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  undertitle: PropTypes.string,
};

Header.defaultProps = {
  title: "Enter chatbot name",
  subtitle: "Enter group Name",
  undertitle: "Enter under Text",
};

export default Header;
