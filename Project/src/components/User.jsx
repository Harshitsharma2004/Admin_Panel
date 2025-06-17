import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Table, Card } from "antd";
import { IoSearch } from "react-icons/io5";
import { GrUserNew } from "react-icons/gr";
import { FaToggleOn, FaToggleOff, FaUserEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "antd";

import { Spin, Empty } from "antd";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";
import Breadcrumb from "./BreadCrumb";

function User() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
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

  const [filters, setFilters] = useState({
    query: "",
    status: "",
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
      setShowSearch(false);
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
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    if (name === "profile") {
      setNewUser({ ...newUser, profile: files[0] });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
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
        formData.append("_method", "PUT");

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
        <div className="action-buttons">
          {/* Edit */}
          <button
            className="btn edit"
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
            }}
          >
            <FaUserEdit /> Edit
          </button>

          {/* Delete */}
          <button
            className="btn delete"
            onClick={() => {
              showDeleteConfirm(record._id);
            }}
          >
            <MdDeleteForever /> Delete
          </button>
        </div>
      ),
    },
  ];

  const handleSearch = async () => {
    setCurrentPage(1);
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const dateFrom = filters.dateRange?.[0]?.format("YYYY-MM-DD");
    const dateTo = filters.dateRange?.[1]?.format("YYYY-MM-DD");

    // console.log("🚀 Sending status filter to API:", filters.status);

    try {
      const response = await axios.get("http://localhost:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          query: filters.query,
          status: filters.status,
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

  return (
    <div className="user-container">
      <Breadcrumb />

      <Card
        title={<h2 className="users-heading">All Users</h2>}
        extra={
          <>
            <div className="user-top-buttons">
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => {
                    setShowSearch(!showSearch);
                    setShowAddUser(false);
                  }}
                >
                  <IoSearch /> Search
                </button>
                <button
                  onClick={() => {
                    setShowAddUser(!showAddUser);
                    setShowSearch(false);
                    setIsEditMode(false);
                    setNewUser({
                      firstName: "",
                      lastName: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      role: "User",
                      profile: null,
                    });
                  }}
                >
                  <GrUserNew /> Add New User
                </button>
              </div>
            </div>

            {showSearch && (
              <div className="user-search-form">
                <div className="form-row">
                  <input
                    name="query"
                    value={filters.query}
                    onChange={handleSearchInputChange}
                    placeholder="Search by name or email"
                  />
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleSearchInputChange}
                  >
                    <option value="" disabled>
                      Select Status
                    </option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <RangePicker
                    format="YYYY-MM-DD"
                    value={filters.dateRange}
                    disabledDate={(current) =>
                      current && current > dayjs().endOf("day")
                    }
                    onChange={(dates) =>
                      setFilters((prev) => ({ ...prev, dateRange: dates }))
                    }
                  />
                </div>
                <div className="form-actions">
                  <button onClick={handleSearch}>Search</button>
                  <button
                    onClick={() => {
                      handleClearSearch();
                      setIsSearchActive(false);
                    }}
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            )}

            {showAddUser && (
              <form onSubmit={handleSubmitUser} className="user-add-form">
                <h3>{isEditMode ? "Edit User" : "Add New User"}</h3>
                <div className="form-row">
                  <input
                    name="firstName"
                    value={newUser.firstName}
                    onChange={handleAddUserInputChange}
                    placeholder="First Name"
                    required
                  />
                  <input
                    name="lastName"
                    value={newUser.lastName}
                    onChange={handleAddUserInputChange}
                    placeholder="Last Name"
                    required
                  />
                  <input
                    name="email"
                    value={newUser.email}
                    onChange={handleAddUserInputChange}
                    placeholder="Email"
                    required
                  />
                  {!isEditMode && (
                    <>
                      <input
                        type="password"
                        name="password"
                        value={newUser.password}
                        onChange={handleAddUserInputChange}
                        placeholder="Password"
                        required
                      />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={newUser.confirmPassword}
                        onChange={handleAddUserInputChange}
                        placeholder="Confirm Password"
                        required
                      />
                    </>
                  )}
                  <input
                    type="file"
                    name="profile"
                    accept="image/*"
                    onChange={handleAddUserInputChange}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Processing..."
                      : isEditMode
                      ? "Update User"
                      : "Submit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddUser(false);
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
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <hr className="divider" />
          </>
        }
      >
        {!showAddUser && (
          <Spin spinning={isLoading} tip="Loading users...">
            {users.length === 0 && !isLoading ? (
              <Empty description="No users found" />
            ) : (
              <Table
                columns={columns}
                dataSource={users.map((u, i) => ({ ...u, key: i }))}
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
        )}
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
    </div>
  );
}

export default User;
