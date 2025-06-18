import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin, message } from "antd";
import axios from "axios";
import {
  UserOutlined,
  AppstoreOutlined,
  TagsOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { PieChart } from "@mui/x-charts/PieChart";

import { AiOutlineContainer } from "react-icons/ai";

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/stats");
      setStats(res.data);
    } catch (err) {
      message.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const statsList = [
    {
      icon: <UserOutlined className="dashboard-icon" />,
      title: "Total Users",
      value: stats.users,
    },
    {
      icon: <AppstoreOutlined className="dashboard-icon" />,
      title: "Categories",
      value: stats.categories,
    },
    {
      icon: <TagsOutlined className="dashboard-icon" />,
      title: "Sub Categories",
      value: stats.subCategories,
    },
    {
      icon: <SettingOutlined className="dashboard-icon" />,
      title: "Services",
      value: stats.services,
    },
    {
      icon: <AiOutlineContainer className="dashboard-icon" />,
      title: "Attributes",
      value: stats.attributes,
    },
  ];

  return (
    <>
      <Row gutter={[24, 24]}>
        {statsList.map((item, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card className="dashboard-card">
              <div className="dashboard-icon-wrapper">{item.icon}</div>
              <h3 className="dashboard-title">{item.title}</h3>
              <p className="dashboard-number">{item.value}</p>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="dashboard-chart-card" style={{ marginTop: 24 }}>
        <h3 className="dashboard-chart-title">Data Overview</h3>

        <PieChart
          series={[
            {
              data: [
                { id: 0, value: stats.users, label: "Users" },
                { id: 1, value: stats.categories, label: "Categories" },
                { id: 3, value: stats.subCategories, label: "Sub Categories" },
                { id: 4, value: stats.services, label: "Services" },
                { id: 5, value: stats.attributes, label: "Attributes" },
              ],
              highlightScope: { fade: "global", highlight: "item" },
              faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
            },
          ]}
          width={200}
          height={200}
        />
      </Card>
    </>
  );
}
