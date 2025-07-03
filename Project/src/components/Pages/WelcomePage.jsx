// components/Pages/WelcomePage.js
import React from "react";
import { Typography } from "antd";
import logo from '../../assets/logo.png'


const { Title, Paragraph } = Typography;

const WelcomePage = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-box">
        <img
          src={logo}
          alt="Carrier Logo"
          className="carrier-logo"
        />
        <Title level={2} className="welcome-title">
          Welcome to Carrier Admin Portal
        </Title>
        <Paragraph className="welcome-description">
          Delivering Trust in Every Load. <br />
          You're now logged in — explore the menu to manage users, roles, and services.
        </Paragraph>
        <Paragraph className="instruction-note">
          👈 Use the side menu to get started.
        </Paragraph>
      </div>
    </div>
  );
};

export default WelcomePage;
