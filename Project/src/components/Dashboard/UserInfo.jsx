// components/DashboardStats.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin } from "antd";
import axios from "axios";
import {
  UserOutlined,
  AppstoreOutlined,
  TagsOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const cardStyle = {
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  textAlign: "center",
};

const iconStyle = {
  fontSize: "28px",
  marginBottom: "10px",
  color: "#1890ff",
};

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/stats")
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stats", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={12} md={6}>
        <Card style={cardStyle}>
          <UserOutlined style={iconStyle} />
          <h3>Total Users</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.users}</p>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={cardStyle}>
          <AppstoreOutlined style={iconStyle} />
          <h3>Categories</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.categories}</p>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={cardStyle}>
          <TagsOutlined style={iconStyle} />
          <h3>Sub Categories</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.subCategories}</p>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card style={cardStyle}>
          <SettingOutlined style={iconStyle} />
          <h3>Services</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.services}</p>
        </Card>
      </Col>
    </Row>
  );
}
