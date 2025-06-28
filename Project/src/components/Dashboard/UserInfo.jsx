import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spin, message, DatePicker, Button } from "antd";
import axios from "axios";
import {
  UserOutlined,
  AppstoreOutlined,
  TagsOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { BarChart } from "@mui/x-charts/BarChart";
import { AiOutlineContainer } from "react-icons/ai";








const { RangePicker } = DatePicker;

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [dateRange, setDateRange] = useState(null);

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
      icon: <img src='/dashboard-icons/role.png' alt="Role Icon" className="dashboard-icon"/>,
      title: "Roles",
      value: stats.role,
    },
    {
      icon: <img src='/dashboard-icons/sub_admin.png' alt="Sub Admin Icon" className="dashboard-icon"/>,
      title: "Sub Admins",
      value: stats.subAdmins,
    },
    {
      icon: <img src='/dashboard-icons/user-png.png' alt="User Icon" className="dashboard-icon"/>,
      title: "Total Users",
      value: stats.users,
    },
    {
      icon: <img src='/dashboard-icons/category.png' alt="Category Icon" className="dashboard-icon"/>,
      title: "Categories",
      value: stats.categories,
    },
    {
      icon: <img src='/dashboard-icons/sub_category.png' alt="Sub Category Icon" className="dashboard-icon"/>,
      title: "Sub Categories",
      value: stats.subCategories,
    },
    {
      icon: <img src='/dashboard-icons/services.png' alt="Services Icon" className="dashboard-icon"/>,
      title: "Services",
      value: stats.services,
    },
    {
      icon: <img src='/dashboard-icons/attribute.png' alt="Attribute Icon" className="dashboard-icon"/>,
      title: "Attributes",
      value: stats.attributes,
    },
    
  ];

  const labels = [
    "Users",
    "Sub Admins",
    "Categories",
    "Sub Categories",
    "Services",
    "Attributes",
  ];
  const values = [
    stats.users,
    stats.subAdmins,
    stats.categories,
    stats.subCategories,
    stats.services,
    stats.attributes,
  ];
  const defaultColors = ["#1890ff", "#52c41a", "#faad14", "#eb2f96", "#722ed1"];

  const series = labels.map((label, i) => ({
    data: Array.from({ length: labels.length }, (_, j) =>
      j === i ? values[i] : null
    ),
    label,
    color: selectedMetric === label ? "#f5222d" : defaultColors[i], // highlight selected bar
  }));

  return (
    <>
      <Row gutter={[24, 24]}>
        {statsList.map((item, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card className="dashboard-card">
              <div className="dashboard-card-content">
                <div className="dashboard-card-left">
                  <h3 className="dashboard-value">{item.value}</h3>
                  <p className="dashboard-title">{item.title}</p>
                </div>
                <div className="dashboard-icon-wrapper">{item.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="dashboard-chart-card" style={{ marginTop: 24 }}>
        <h3 className="dashboard-chart-title">Data Overview</h3>

        <BarChart
          xAxis={[
            {
              scaleType: "band",
              data: labels,
            },
          ]}
          series={series}
          onItemClick={(event, dataIndex) => {
            const clicked = labels[dataIndex];
            setSelectedMetric(clicked);
            setDateRange(null); // reset any previous date filter
          }}
          width={600}
          height={300}
        />
      </Card>

      {selectedMetric && (
        <Card style={{ marginTop: 16 }}>
          <h4>
            Filter <span style={{ color: "#f5222d" }}>{selectedMetric}</span> by
            Date:
          </h4>
          <RangePicker
            onChange={(dates) => {
              setDateRange(dates);
              if (dates) {
                message.success(
                  `Filtering ${selectedMetric} from ${dates[0].format(
                    "YYYY-MM-DD"
                  )} to ${dates[1].format("YYYY-MM-DD")}`
                );
              }
            }}
          />
          <Button
            type="default"
            onClick={() => {
              setSelectedMetric(null);
              setDateRange(null);
            }}
            style={{ marginTop: 12 }}
          >
            Clear Filter
          </Button>
        </Card>
      )}
    </>
  );
}
