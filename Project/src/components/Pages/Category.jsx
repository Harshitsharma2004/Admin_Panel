import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Space, message, DatePicker, Input, Card } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import Breadcrumb from "../BreadCrumb";

const { RangePicker } = DatePicker;

const Category = () => {
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
    if (newCategory.profile) formData.append("profile", newCategory.profile);

    try {
      await axios.post("http://localhost:5000/category/create", formData);
      fetchCategories();
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
    if (newCategory.profile) formData.append("profile", newCategory.profile);

    try {
      const res = await axios.put(
        `http://localhost:5000/category/update/${editingCategory._id}`,
        formData
      );
      setCategories((prev) =>
        prev.map((c) =>
          c._id === res.data.category._id ? res.data.category : c
        )
      );
      setIsEditModalVisible(false);
      setEditingCategory(null);
      setNewCategory({ name: "", sort_order: "asc", profile: null });
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
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCategory(record);
              setNewCategory({
                name: record.name,
                sort_order: record.sort_order,
                profile: null,
              });
              setIsEditModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              showDeleteConfirm(record._id);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* <div className="category-header">
       
      </div> */}

      <Breadcrumb />
        <Card title={        <h2 className="category-heading">All Categories</h2>
}
        extra={<>
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
            value={dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : null}
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
            onClick={() => {
              setSearchTerm("");
              setDateFrom(null);
              setDateTo(null);
              setPage(1);
            }}
          >
            Reset Filters
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsAddModalVisible(true);
            }}
          >
            Add Category
          </Button>
        </div>
        </>}>
         <Table
        columns={columns}
        dataSource={categories}
        rowKey="_id"
        bordered
        loading={loading}
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
        locale={{ emptyText: loading ? "Loading..." : "No categories found." }}
      /></Card>
     

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
        onOk={handleAddCategory}
        onCancel={() => {
          setIsAddModalVisible(false);
          setNewCategory({ name: "", sort_order: "asc", profile: null });
          navigate("/dashboard/category");
        }}
        okText="Add"
        cancelText="Cancel"
        okButtonProps={{ disabled: !isFormValid(), loading: addLoading }}
      >
        <label>Name:</label>
        <Input
          value={newCategory.name}
          onChange={(e) =>
            setNewCategory({ ...newCategory, name: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <label>Sort Order:</label>
        <Input
          type="number"
          value={newCategory.sort_order}
          onChange={(e) =>
            setNewCategory({
              ...newCategory,
              sort_order: e.target.value === "" ? "" : parseInt(e.target.value),
            })
          }
          min={1}
          style={{ marginBottom: 10 }}
        />
        <label>Profile Image:</label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewCategory({ ...newCategory, profile: e.target.files[0] })
          }
        />
      </Modal>

      <Modal
        title="Edit Category"
        open={isEditModalVisible}
        onOk={handleUpdateCategory}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingCategory(null);
          setNewCategory({ name: "", sort_order: "asc", profile: null });
          navigate("/dashboard/category");
        }}
        okText="Update"
        cancelText="Cancel"
        okButtonProps={{ disabled: !isFormValid(), loading: editLoading }}
      >
        <label>Name:</label>
        <Input
          value={newCategory.name}
          onChange={(e) =>
            setNewCategory({ ...newCategory, name: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <label>Sort Order:</label>
        <Input
          type="number"
          value={newCategory.sort_order}
          onChange={(e) =>
            setNewCategory({
              ...newCategory,
              sort_order: e.target.value === "" ? "" : parseInt(e.target.value),
            })
          }
          min={1}
          style={{ marginBottom: 10 }}
        />
        <label>Profile Image (optional):</label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewCategory({ ...newCategory, profile: e.target.files[0] })
          }
        />
        {editingCategory?.profile && (
          <img
            src={`http://localhost:5000/${editingCategory.profile}`}
            alt="Preview"
            width={100}
            style={{ marginTop: 10, borderRadius: 4 }}
          />
        )}
      </Modal>
    </div>
  );
};

export default Category;
