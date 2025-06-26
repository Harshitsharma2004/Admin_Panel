import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Checkbox,
  message,
  Space,
  Card,
  Select,
  DatePicker,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { IoSearch } from "react-icons/io5";
import { toast } from "react-toastify";
import axios from "axios";
import dayjs from "dayjs";
import Breadcrumb from "../BreadCrumb";

const { RangePicker } = DatePicker;

const permissionsList = [
  { label: "Dashboard", value: "dashboard" },
  { label: "User Management", value: "user_management" },
  {
    label: "Service Provider Management",
    value: "service_provider_management",
  },
  { label: "Category Management", value: "category_management" },
  { label: "Sub Category Management", value: "sub_category_management" },
  { label: "Service Management", value: "service_management" },
  { label: "Attribute Management", value: "attribute_management" },
];

const RoleManagement = () => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [filters, setFilters] = useState({
    query: "",
    permission: undefined,
    dateRange: null,
  });

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/roles");
      setRoles(res.data.data);
    } catch (err) {
      message.error("Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      await axios.post("http://localhost:5000/roles/create", values);
      toast.success("Role created successfully.");
      form.resetFields();
      setShowModal(false);
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create role.");
    }
  };

  const handleEditRole = (record) => {
    form.setFieldsValue({
      roleName: record.roleName,
      permissions: record.permissions,
    });
    setEditingRoleId(record._id);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleUpdateRole = async (values) => {
    try {
      await axios.put(
        `http://localhost:5000/roles/update/${editingRoleId}`,
        values
      );
      toast.success("Role updated successfully.");
      form.resetFields();
      setEditingRoleId(null);
      setIsEditMode(false);
      setShowModal(false);
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role.");
    }
  };

  const showDeleteConfirm = (id) => {
    setSelectedRoleId(id);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteRole = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(
        `http://localhost:5000/roles/delete/${selectedRoleId}`
      );
      fetchRoles();
      setIsDeleteModalVisible(false);
      toast.success("Role deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredRoles = roles.filter((role) => {
    const { query, permission, dateRange } = filters;

    const matchesQuery = query
      ? role.roleName.toLowerCase().includes(query.toLowerCase())
      : true;

    const matchesPermission = permission
      ? role.permissions.includes(permission)
      : true;

    const matchesDate = dateRange
      ? dayjs(role.createdAt).isAfter(dayjs(dateRange[0])) &&
        dayjs(role.createdAt).isBefore(dayjs(dateRange[1]).endOf("day"))
      : true;

    return matchesQuery && matchesPermission && matchesDate;
  });

  return (
    <div>
      <Breadcrumb />
      <Card
        title={<h2 className="users-heading">Roles Management</h2>}
        extra={
          <Space wrap size="middle">
            <Input
              placeholder="Search by role"
              value={filters.query}
              onChange={(e) =>
                setFilters({ ...filters, query: e.target.value })
              }
              allowClear
              style={{ width: 200 }}
              suffix={<IoSearch style={{ cursor: "pointer" }} />}
            />

            <Select
              placeholder="Filter by Permission"
              value={filters.permission}
              onChange={(value) =>
                setFilters({ ...filters, permission: value })
              }
              style={{ width: 220 }}
              allowClear
            >
              {permissionsList.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>

            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />

            <Button
              danger
              onClick={() =>
                setFilters({
                  query: "",
                  permission: undefined,
                  dateRange: null,
                })
              }
            >
              Reset
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsEditMode(false);
                setEditingRoleId(null);
                form.resetFields();
                setShowModal(true);
              }}
            >
              Add Role
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={filteredRoles.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )}
          rowKey="_id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredRoles.length,
            showQuickJumper: true,
            showSizeChanger: true,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          onChange={(pagination) => {
            setCurrentPage(pagination.current);
            setPageSize(pagination.pageSize);
          }}
          columns={[
            {
              title: "ID",
              render: (text, record, index) =>
                (currentPage - 1) * pageSize + index + 1, // global index
            },
            {
              title: "Role Name",
              dataIndex: "roleName",
            },
            {
              title: "Created At",
              dataIndex: "createdAt",
              render: (date) => dayjs(date).format("YYYY-MM-DD"),
            },
            {
              title: "Action",
              key: "action",
              render: (_, record) => (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEditRole(record)}
                  />
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => showDeleteConfirm(record._id)}
                  />
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* Create/Edit Role Modal */}
      <Modal
        title={isEditMode ? "Edit Role" : "Create Role"}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          setIsEditMode(false);
          setEditingRoleId(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (isEditMode) {
              handleUpdateRole(values);
            } else {
              onFinish(values);
            }
          }}
        >
          <Form.Item
            label="Role Name"
            name="roleName"
            rules={[{ required: true, message: "Please enter role name" }]}
          >
            <Input placeholder="e.g. Admin, Editor, Viewer" />
          </Form.Item>

          <Form.Item
            label="Permissions"
            name="permissions"
            rules={[{ required: true, message: "Please select permissions" }]}
          >
            <Checkbox.Group options={permissionsList} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {isEditMode ? "Update Role" : "Save Role"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={isDeleteModalVisible}
        onOk={handleDeleteRole}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteLoading }}
      >
        <p>Are you sure you want to delete this role?</p>
      </Modal>
    </div>
  );
};

export default RoleManagement;
