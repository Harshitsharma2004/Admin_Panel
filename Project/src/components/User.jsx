import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Table, Card, Space, Select, Button, Form } from "antd";
import { IoSearch } from "react-icons/io5";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "antd";

import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { Input } from "antd";
const { Search } = Input;

import { Spin, Empty } from "antd";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";
import Breadcrumb from "./BreadCrumb";

import ProfileUploader from "./Profile/ProfileUploader";

function User() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);

  const [showSearch, setShowSearch] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState([]);

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sorter, setSorter] = useState({});

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "User",
    profile: null,
  });

  const [errors, setErrors] = useState({
    email: "",
    confirmPassword: "",
  });

  const [touchedFields, setTouchedFields] = useState({
    confirmPassword: false,
  });

  const [filters, setFilters] = useState({
    query: "",
    status: null,
    dateRange: null, // 🆕 instead of dateFrom/dateTo
  });

  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newStatusText, setNewStatusText] = useState(""); // For display

  useEffect(() => {
    fetchUsers(currentPage, pageSize, sorter);
  }, [location.pathname, currentPage, pageSize, sorter]);

  useEffect(() => {
    if (location.pathname === "/dashboard/users") {
      setShowAddUser(false);
      setIsEditMode(false);
      setEditingUserId(null);
    }
  }, [location.pathname]);

  const fetchUsers = async (page = 1, pageSize = 10, sort = {}) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setIsLoading(true); //Start loading

    const sortField = sort?.field || "createdAt"; // fallback
    const sortOrder = sort?.order === "ascend" ? "asc" : "desc";

    try {
      const res = await axios.get("http://localhost:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: pageSize,
          sortField,
          sortOrder,
        },
      });

      setUsers(res.data.users || []);
      setTotalUsers(res.data.total); // For AntD pagination
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users.");
    } finally {
      setIsLoading(false); //Stop loading
    }
  };

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updated = { ...prev, [name]: value };
      triggerLiveSearch(updated);
      return updated;
    });
  };

  const handleClearSearch = () => {
    setFilters({
      query: "",
      status: "",
      dateRange: null,
    });
    setSorter({});
    setIsSearchActive(false);
    fetchUsers(currentPage, pageSize, sorter); // 👈 re-fetch default user list
  };

  const handleAddUserInputChange = (e) => {
    const { name, value, files } = e.target;

    const updatedUser = {
      ...newUser,
      [name]: name === "profile" ? files[0] : value,
    };

    let updatedErrors = { ...errors };

    // Email validation
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      updatedErrors.email = emailRegex.test(value)
        ? ""
        : "Invalid email format";
    }

    // Always validate password match if either field is updated
    if (
      name === "password" ||
      name === "confirmPassword" ||
      touchedFields.confirmPassword
    ) {
      updatedErrors.confirmPassword =
        updatedUser.password !== updatedUser.confirmPassword
          ? "Passwords do not match"
          : "";
    }

    setNewUser(updatedUser);
    setErrors(updatedErrors);
  };

  const handleSubmitUser = async (e) => {
    setIsSubmitting(true); //Start submit lock

    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast.info("First name, last name, and email are required!");
      setIsSubmitting(false);
      return;
    }
    if (!isEditMode && newUser.password !== newUser.confirmPassword) {
      toast.error("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) return;

    const formData = new FormData();
    formData.append("firstName", newUser.firstName);
    formData.append("lastName", newUser.lastName);
    formData.append("email", newUser.email);
    formData.append("role", newUser.role);
    if (newUser.profile) formData.append("profile", newUser.profile);

    if (isEditMode) {
      // Edit mode
      // console.log("User ID: ", editingUserId);
      try {
        const res = await axios.put(
          `http://localhost:5000/users/${editingUserId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updatedUser = res.data.user;
        setUsers(
          users.map((u) => (u._id === updatedUser._id ? updatedUser : u))
        );
        toast.success("User updated successfully");
      } catch (err) {
        console.error("Error updating user:", err);
        toast.error("Failed to update user");
      }
    } else {
      // Add mode
      // if (!newUser.password || newUser.password !== newUser.confirmPassword) {
      //   toast.error("Passwords are required and must match!");
      //   return;
      // }

      const validatePassword = (password) => {
        // At least 8 characters, one uppercase, one lowercase, one digit
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return regex.test(password);
      };

      if (!validatePassword(newUser.password)) {
        toast.error(
          "Password must be at least 8 characters, include 1 uppercase letter, 1 lowercase letter, and 1 number."
        );
        setIsSubmitting(false);
        return;
      }

      formData.append("password", newUser.password);
      formData.append("confirmPassword", newUser.confirmPassword);

      try {
        const res = await axios.post(
          "http://localhost:5000/addUser",
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers([...users, res.data.user]);
        toast.success("User added successfully");
      } catch (err) {
        console.error("Error adding user:", err);
        toast.error("Failed to add user");
      } finally {
        setIsSubmitting(false); //stop submit lock
      }
    }

    // Reset form
    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      profile: null,
    });
    setShowAddUser(false);
    setIsEditMode(false);
    setEditingUserId(null);
  };

  const confirmToggleStatus = async () => {
    if (!selectedUserId) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/users/${selectedUserId}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = res.data.user;

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );

      setIsStatusModalVisible(false);
    } catch (err) {
      console.error("Toggle status error:", err);
      Modal.error({
        title: "Error",
        content: "Failed to update status",
      });
      setIsStatusModalVisible(false);
    }
  };

  const columns = [
    {
      title: "Profile Picture",
      dataIndex: "profile",
      key: "profile",
      render: (profile) => (
        <img
          src={profile ? `http://localhost:5000/${profile}` : "/default.png"}
          alt="Profile"
          width="40"
          style={{ borderRadius: "4px", objectFit: "cover" }}
        />
      ),
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      sorter: (a, b) => (a?.firstName || "").localeCompare(b.firstName || ""),
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      sorter: (a, b) => (a.lastName || "").localeCompare(b.lastName || ""),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => (a.email || "").localeCompare(b.email || ""),
    },
    {
      title: "Registered On",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <button
          className={`btn toggle ${
            record.status === "Active" ? "deactivate" : "activate"
          }`}
          onClick={() => {
            setSelectedUserId(record._id);
            setNewStatusText(
              record.status === "Active" ? "Inactive" : "Active"
            );
            setIsStatusModalVisible(true);
          }}
        >
          {record.status === "Active" ? (
            <>
              <FaToggleOn style={{ color: "green", fontSize: "20px" }} /> Active
            </>
          ) : (
            <>
              <FaToggleOff style={{ color: "red", fontSize: "20px" }} />{" "}
              Inactive
            </>
          )}
        </button>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setNewUser({
                firstName: record.firstName || "",
                lastName: record.lastName || "",
                email: record.email || "",
                password: "",
                confirmPassword: "",
                profile: null,
              });
              setIsEditMode(true);
              setEditingUserId(record._id);
              setShowAddUser(true);
              setShowSearch(false);
              form.setFieldsValue({
                firstName: record.firstName || "",
                lastName: record.lastName || "",
                email: record.email || "",
              });
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              showDeleteConfirm(record._id);
            }}
          />
        </Space>
      ),
    },
  ];

  const handleSearch = async (customFilters = filters) => {
    setCurrentPage(1);
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const dateFrom = customFilters.dateRange?.[0]?.format("YYYY-MM-DD");
    const dateTo = customFilters.dateRange?.[1]?.format("YYYY-MM-DD");

    try {
      const response = await axios.get("http://localhost:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          query: customFilters.query,
          status: customFilters.status,
          dateFrom,
          dateTo,
          page: currentPage,
          limit: pageSize,
          sortField: sorter.field || "createdAt",
          sortOrder: sorter.order === "ascend" ? "asc" : "desc",
        },
      });

      setUsers(response.data.users);
      setTotalUsers(response.data.total);
      setIsSearchActive(true);
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Search failed");
    }
  };

  // Trigger the modal with user ID
  const showDeleteConfirm = (userId) => {
    setUserIdToDelete(userId);
    setIsDeleteModalVisible(true);
  };

  // Actually delete the user
  const confirmDeleteUser = async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !userIdToDelete) return;

    try {
      await axios.put(
        `http://localhost:5000/users/${userIdToDelete}/delete`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.filter((u) => u._id !== userIdToDelete)
      );
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user");
    }

    setIsDeleteModalVisible(false);
    setUserIdToDelete(null);
  };

  let debounceTimeout;
  const triggerLiveSearch = (updatedFilters) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      handleSearch(updatedFilters);
    }, 500); // Adjust debounce delay if needed
  };

  const isFormValid =
    newUser.firstName &&
    newUser.lastName &&
    newUser.email &&
    (!isEditMode ? newUser.password && newUser.confirmPassword : true) &&
    !errors.email &&
    !errors.confirmPassword;

  return (
    <div className="user-container">
      <Breadcrumb />

      <Card
        title={<h2 className="users-heading">All Users</h2>}
        extra={
          <>
            <Space wrap size="middle" className="subcategory-controls">
              <Input
                placeholder="Search by name or email"
                name="query"
                value={filters.query}
                onChange={handleSearchInputChange}
                onPressEnter={handleSearch}
                allowClear
                style={{ width: 200 }}
                suffix={
                  <IoSearch
                    onClick={handleSearch}
                    style={{ cursor: "pointer" }}
                  />
                }
              />

              <Select
                placeholder="Filter by status"
                onChange={(value) => {
                  const updated = { ...filters, status: value };
                  setFilters(updated);
                  triggerLiveSearch(updated);
                }}
                value={filters.status}
                style={{ width: 180 }}
                allowClear
              >
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Inactive">Inactive</Select.Option>
              </Select>

              <RangePicker
                onChange={(dates) => {
                  setSelectedDateRange(dates);
                  const updated = { ...filters, dateRange: dates };
                  setFilters(updated);
                  triggerLiveSearch(updated);
                }}
                value={selectedDateRange}
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
              />

              <Button
                danger
                onClick={() => {
                  setFilters({
                    query: "",
                    status: "",
                    dateRange: null,
                  });
                  setSelectedDateRange([]);
                  setCurrentPage(1);
                  fetchUsers(1, pageSize, sorter);
                }}
              >
                Reset
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsEditMode(false);
                  setEditingUserId(null);
                  setNewUser({
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "User",
                    profile: null,
                  });
                  setShowAddUser(true);
                }}
              >
                Add User
              </Button>
            </Space>
          </>
        }
      >
        <Spin spinning={isLoading} tip="Loading users...">
          {users.length === 0 && !isLoading ? (
            <Empty description="No users found" />
          ) : (
            <Table
              columns={columns}
              dataSource={users.map((u, i) => ({ ...u, key: i }))}
              scroll={{ x: "max-content" }}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalUsers,
                showQuickJumper: true,
                showSizeChanger: true,
                onChange: (page, pageSize) => {
                  setCurrentPage(page);
                  setPageSize(pageSize);
                },
              }}
              onChange={(pagination, filters, sorter) => {
                setCurrentPage(pagination.current);
                setPageSize(pagination.pageSize);
                setSorter(sorter);
              }}
              bordered
            />
          )}
        </Spin>
      </Card>

      <Modal
        title="Confirm Delete"
        open={isDeleteModalVisible}
        onOk={confirmDeleteUser}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete this user? This action cannot be
          undone.
        </p>
      </Modal>
      <Modal
        title="Confirm Status Change"
        open={isStatusModalVisible}
        onOk={confirmToggleStatus}
        onCancel={() => setIsStatusModalVisible(false)}
        okText={`Yes, Set ${newStatusText}`}
        cancelText="Cancel"
      >
        <p>
          Are you sure you want to set this user to{" "}
          <strong>{newStatusText}</strong>?
        </p>
      </Modal>
      <Modal
        title={isEditMode ? "Edit User" : "Add New User"}
        open={showAddUser}
        onCancel={() => {
          setShowAddUser(false);
          setIsEditMode(false);
          setEditingUserId(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={isEditMode ? "Update" : "Create"}
        confirmLoading={isSubmitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitUser}>
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          {!isEditMode && (
            <>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter password" },
                  {
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/,
                    message:
                      "Password must contain upper, lower, number & special char",
                  },
                ]}
                hasFeedback
              >
                <Input.Password placeholder="Password" />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "Please confirm password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject("Passwords do not match");
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm Password" />
              </Form.Item>
            </>
          )}

          <ProfileUploader
            value={newUser.profile}
            onChange={(file) =>
              setNewUser((prev) => ({ ...prev, profile: file }))
            }
          />
        </Form>
      </Modal>
    </div>
  );
}

export default User;
