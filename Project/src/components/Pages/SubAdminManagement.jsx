import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  message,
  Card,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { IoSearch } from "react-icons/io5";
import { toast } from "react-toastify";
import axios from "axios";
import dayjs from "dayjs";
import Breadcrumb from "../BreadCrumb";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import ProfileUploader from "../Profile/ProfileUploader";

const { RangePicker } = DatePicker;

const SubAdminManagement = () => {
  const [form] = Form.useForm();
  const [subAdmins, setSubAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    query: "",
    role: undefined,
    dateRange: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 5,
    total: 0,
  });

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newStatusText, setNewStatusText] = useState("");
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);

  const [isSubmitting,setIsSubmitting]=useState(false);

  useEffect(() => {
    fetchRoles();
    fetchSubAdmins();
  }, [pagination.page, pagination.pageSize, filters]);

  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/roles");
      setRoles(res.data.data);
    } catch {
      toast.error("Failed to fetch roles.");
    }
  };

  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      const { page, pageSize } = pagination;
      const { query, role, dateRange, is_active } = filters;

      const params = {
        page,
        limit: pageSize,
        query,
        role, // <-- This ensures role is sent
        is_active:
          typeof is_active === "boolean" ? is_active.toString() : undefined,
        dateFrom: dateRange?.[0]?.startOf("day").toISOString(),
        dateTo: dateRange?.[1]?.endOf("day").toISOString(), // ensures full day is included
      };

      const res = await axios.get("http://localhost:5000/subadmin", { params });
      setSubAdmins(res.data.data);
      setPagination((prev) => ({
        ...prev,
        total: res.data.total,
      }));
    } catch {
      toast.error("Failed to fetch sub-admins.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (values) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:5000/subadmin/update/${editingId}`,
          values
        );
        toast.success("Sub Admin updated.");
      } else {
        await axios.post("http://localhost:5000/subadmin/create", values);
        toast.success("Sub Admin created.");
      }
      form.resetFields();
      setShowModal(false);
      setIsEditMode(false);
      fetchSubAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }finally{
      setIsSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setEditingId(record._id);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role._id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/subadmin/delete/${id}`);
      toast.success("Sub Admin deleted.");
      fetchSubAdmins();
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const toggleStatus = async () => {
    try {
      await axios.put(
        `http://localhost:5000/subadmin/status/${selectedUserId}`,
        {
          is_active: newStatusText === "Active",
        }
      );
      toast.success(
        `User ${newStatusText === "Active" ? "activated" : "deactivated"}.`
      );
      setIsStatusModalVisible(false);
      fetchSubAdmins();
    } catch {
      toast.error("Failed to change status.");
    }
  };

  const filteredData = subAdmins; // Backend handles filters

  return (
    <div>
      <Breadcrumb />
      <Card
        title="Sub Admin Management"
        extra={
          <div className="service-outer">
            <div className="serviceOne">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setShowModal(true);
                  setIsEditMode(false);
                  form.resetFields();
                }}
              >
                Add Sub Admin
              </Button>
            </div>
            <div className="serviceTwo">
              <Space wrap>
                <Input
                  placeholder="Search by name/email"
                  style={{ width: 200 }}
                  value={filters.query}
                  onChange={(e) =>
                    setFilters({ ...filters, query: e.target.value })
                  }
                  suffix={<IoSearch />}
                />
                <Select
                  placeholder="Filter by Role"
                  style={{ width: 200 }}
                  value={filters.role}
                  allowClear
                  onChange={(value) => setFilters({ ...filters, role: value })}
                >
                  {roles.map((role) => (
                    <Select.Option key={role._id} value={role._id}>
                      {role.roleName}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  placeholder="Filter by status"
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      is_active:
                        value === "Active"
                          ? true
                          : value === "Inactive"
                          ? false
                          : undefined,
                    })
                  }
                  value={
                    filters.is_active === true
                      ? "Active"
                      : filters.is_active === false
                      ? "Inactive"
                      : undefined
                  }
                  style={{ width: 180 }}
                  allowClear
                >
                  <Select.Option value="Active">Active</Select.Option>
                  <Select.Option value="Inactive">Inactive</Select.Option>
                </Select>

                <RangePicker
                  value={filters.dateRange}
                  onChange={(val) => setFilters({ ...filters, dateRange: val })}
                  disabledDate={(current) =>
                    current && current > dayjs().endOf("day")
                  }
                />
                <Button
                  danger
                  onClick={() =>
                    setFilters({
                      query: "",
                      role: undefined,
                      dateRange: null,
                      is_active: undefined,
                    })
                  }
                >
                  Reset
                </Button>
              </Space>
            </div>
          </div>
        }
      >
        <Table
          dataSource={filteredData}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showQuickJumper: true,
            showSizeChanger: true,
            onChange: (page, pageSize) =>
              setPagination({ ...pagination, page, pageSize }),
          }}
          columns={[
            {
              title: "Image",
              dataIndex: "profile",
              key: "profile",
              render: (img) => (
                <img
                  src={img ? `http://localhost:5000/${img}` : "/default.png"}
                  alt="category"
                  width={50}
                  style={{ borderRadius: "4px", objectFit: "cover" }}
                />
              ),
            },

            {
              title: "Name",
              dataIndex: "name",
            },
            {
              title: "Email",
              dataIndex: "email",
            },
            {
              title: "Role",
              dataIndex: "role",
              render: (role) => role?.roleName || "-",
            },
            {
              title: "Registered On",
              dataIndex: "createdAt",
              render: (date) => dayjs(date).format("YYYY-MM-DD"),
            },
            {
              title: "Status",
              key: "status",
              render: (_, record) => (
                <Button
                  style={{ border: "none", background: "none" }}
                  icon={
                    record.is_active ? (
                      <FaToggleOn
                        style={{
                          color: "green",
                          fontSize: "20px",
                          marginTop: "6px",
                        }}
                      />
                    ) : (
                      <FaToggleOff
                        style={{
                          color: "red",
                          fontSize: "20px",
                          marginTop: "6px",
                        }}
                      />
                    )
                  }
                  onClick={() => {
                    setSelectedUserId(record._id);
                    setNewStatusText(record.is_active ? "Inactive" : "Active");
                    setIsStatusModalVisible(true);
                  }}
                >
                  {record.is_active ? "Active" : "Inactive"}
                </Button>
              ),
            },

            {
              title: "Actions",
              render: (_, record) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  />
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDelete(record._id)}
                  />
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={isEditMode ? "Edit Sub Admin" : "Add Sub Admin"}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setIsEditMode(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          {!isEditMode && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select placeholder="Select Role">
              {roles.map((role) => (
                <Select.Option key={role._id} value={role._id}>
                  {role.roleName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <ProfileUploader/>
          <Form.Item>
            <Button htmlType="submit" type="primary" block style={{marginTop:"10px"}} loading={isSubmitting}>
              {isEditMode ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={isStatusModalVisible}
        title="Change Status"
        onOk={toggleStatus}
        onCancel={() => setIsStatusModalVisible(false)}
        okText="Yes"
        cancelText="No"
        destroyOnClose
      >
        <p>
          Are you sure you want to set this user as{" "}
          <strong>{newStatusText}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default SubAdminManagement;
