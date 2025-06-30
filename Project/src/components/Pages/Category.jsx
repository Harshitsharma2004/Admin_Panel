import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Space,
  message,
  DatePicker,
  Input,
  Card,
  Form,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import Breadcrumb from "../BreadCrumb";

import ProfileUploader from "../Profile/ProfileUploader";

const { RangePicker } = DatePicker;

const Category = () => {
  const [form] = Form.useForm();

  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sorter, setSorter] = useState({ field: "createdAt", order: "ascend" });

  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    sort_order: "asc",
    profile: null,
  });

  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const navigate = useNavigate();

  const isFormValid = () => {
    return (
      newCategory.name.trim() !== "" &&
      !isNaN(newCategory.sort_order) &&
      Number(newCategory.sort_order) >= 1
    );
  };

  const fetchCategories = async ({
    current = page,
    limit = pageSize,
    sortField = sorter.field,
    sortOrder = sorter.order,
    search = searchTerm,
    from = dateFrom,
    to = dateTo,
  } = {}) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/category", {
        params: {
          page: current,
          limit,
          sortField,
          sortOrder: sortOrder === "descend" ? "desc" : "asc",
          searchTerm: search,
          dateFrom: from,
          dateTo: to,
        },
      });
      setCategories(res.data.categories);
      setTotal(res.data.total);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, pageSize, sorter, searchTerm, dateFrom, dateTo]);

  const showDeleteConfirm = (id) => {
    setSelectedCategoryId(id);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteCategory = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(
        `http://localhost:5000/category/delete/${selectedCategoryId}`
      );
      fetchCategories();
      setIsDeleteModalVisible(false);
      toast.success("Category deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete");
      console.error("Delete error:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!isFormValid()) return;
    setAddLoading(true);
    const formData = new FormData();
    formData.append("name", newCategory.name);
    formData.append("sort_order", newCategory.sort_order);

    if (newCategory.profile) {
      console.log("Uploading file:", newCategory.profile.name);
      formData.append("profile", newCategory.profile);
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/category/create",
        formData
      );

      // ✅ Update local table state immediately (assumes setCategories is defined)
      setCategories((prev) => [...prev, res.data.category]);

      setIsAddModalVisible(false);
      setNewCategory({ name: "", sort_order: "asc", profile: null });

      toast.success("Category created successfully.");
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(
          "Sort order already exists. Please choose a different number."
        );
      } else {
        console.error("Add error: ", error);
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!isFormValid()) return;
    setEditLoading(true);
    const formData = new FormData();
    formData.append("name", newCategory.name);
    formData.append("sort_order", newCategory.sort_order);
    if (newCategory.profile) {
      // console.log("Uploading file:", newCategory.profile.name);
      formData.append("profile", newCategory.profile);
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/category/update/${editingCategory._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setCategories((prev) =>
        prev.map((c) =>
          c._id === res.data.category._id ? res.data.category : c
        )
      );
      setIsEditModalVisible(false);
      setEditingCategory(null);
      setNewCategory({ name: "", sort_order: "asc", profile: null });
      // console.log("Updated image path:", res.data);
      toast.success("Category updated successfully.");
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(
          "Sort order already exists. Please choose a different number."
        );
      } else {
        console.error("Update error:", error);
      }
    } finally {
      setEditLoading(false);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "profile",
      key: "profile",
      render: (img) => (
        <img
          src={img ? `http://localhost:5000${img}` : "/default.png"}
          alt="category"
          width={50}
          style={{ borderRadius: "4px", objectFit: "cover" }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default.png"; // fallback in case image is broken
          }}
        />
      ),
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Sort Order",
      dataIndex: "sort_order",
      key: "sort_order",
      sorter: true, // changed to backend sorting
    },
    {
      title: "Created On",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCategory(record);
              setNewCategory(record);
              form.setFieldsValue(record);
              setIsEditModalVisible(true);
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

  return (
    <div>
      {/* <div className="category-header">
       
      </div> */}

      <Breadcrumb />
      <Card
        title={<h2 className="category-heading">All Categories</h2>}
        extra={
          <>
            <div
              className="category-controls"
              style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
            >
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                style={{ width: 200 }}
              />

              <RangePicker
                value={
                  dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : null
                }
                onChange={(dates, dateStrings) => {
                  setDateFrom(dateStrings[0] || null);
                  setDateTo(dateStrings[1] || null);
                  setPage(1);
                }}
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
                allowClear
              />
              <Button
                danger
                onClick={() => {
                  setSearchTerm("");
                  setDateFrom(null);
                  setDateTo(null);
                  setPage(1);
                }}
              >
                Reset
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setNewCategory({ name: "", sort_order: "", profile: null });
                  form.resetFields();
                  setIsAddModalVisible(true);
                }}
              >
                Add Category
              </Button>
            </div>
          </>
        }
      >
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="_id"
          bordered
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            onChange: (current, size) => {
              setPage(current);
              setPageSize(size);
            },
          }}
          onChange={(pagination, filters, sorterObj) => {
            if (sorterObj.order) {
              setSorter({
                field: sorterObj.field,
                order: sorterObj.order,
              });
            }
          }}
          locale={{
            emptyText: loading ? "Loading..." : "No categories found.",
          }}
        />
      </Card>

      <Modal
        title="Confirm Delete"
        open={isDeleteModalVisible}
        onOk={handleDeleteCategory}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          navigate("/dashboard/category");
        }}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteLoading }}
      >
        <p>Are you sure you want to delete this category?</p>
      </Modal>

      <Modal
        title="Add Category"
        open={isAddModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
          setNewCategory({ name: "", sort_order: "", profile: null });
          navigate("/dashboard/category");
        }}
        okText="Add"
        cancelText="Cancel"
        okButtonProps={{ loading: addLoading }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={newCategory}
          onFinish={handleAddCategory}
        >
          <Form.Item
            label="Category Name"
            name="name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </Form.Item>

          <Form.Item
            label="Sort Order"
            name="sort_order"
            rules={[{ required: true, message: "Please enter sort order" }]}
          >
            <Input
              type="number"
              min={1}
              onChange={(e) =>
                setNewCategory((prev) => ({
                  ...prev,
                  sort_order:
                    e.target.value === "" ? "" : parseInt(e.target.value),
                }))
              }
            />
          </Form.Item>

          <ProfileUploader
            value={newCategory.profile}
            onChange={(file) =>
              setNewCategory((prev) => ({ ...prev, profile: file }))
            }
          />
        </Form>
      </Modal>

      <Modal
        title="Edit Category"
        open={isEditModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
          setNewCategory({ name: "", sort_order: "", profile: null });
          navigate("/dashboard/category");
        }}
        okText="Update"
        cancelText="Cancel"
        okButtonProps={{ loading: editLoading }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={newCategory}
          onFinish={handleUpdateCategory}
        >
          <Form.Item
            label="Category Name"
            name="name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </Form.Item>

          <Form.Item
            label="Sort Order"
            name="sort_order"
            rules={[{ required: true, message: "Please enter sort order" }]}
          >
            <Input
              type="number"
              min={1}
              onChange={(e) =>
                setNewCategory((prev) => ({
                  ...prev,
                  sort_order:
                    e.target.value === "" ? "" : parseInt(e.target.value),
                }))
              }
            />
          </Form.Item>

          <ProfileUploader
            value={newCategory.profile}
            onChange={(file) =>
              setNewCategory((prev) => ({ ...prev, profile: file }))
            }
          />
        </Form>
      </Modal>
    </div>
  );
};

export default Category;
