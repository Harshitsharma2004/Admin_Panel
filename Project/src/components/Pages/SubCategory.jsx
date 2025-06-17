// SubCategory.js
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Space,
  message,
  DatePicker,
  Select,
  Card,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { Input } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Breadcrumb from "../BreadCrumb";
const { Search } = Input;

const { RangePicker } = DatePicker;

const SubCategory = () => {
  const navigate = useNavigate();

  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [newSubCategory, setNewSubCategory] = useState({
    name: "",
    sort_order: "",
    profile: null,
    categoryId: "",
  });

  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0); // will be used to show total items

  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/category");
      setCategories(res.data.categories);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchSubCategories = async ({
    query = "",
    category = "",
    dateFrom = "",
    dateTo = "",
    page = 1,
    limit = 10,
    sortField = "createdAt",
    sortOrder = "desc",
  } = {}) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/subcategory", {
        params: {
          query,
          category,
          dateFrom,
          dateTo,
          page,
          limit,
          sortField,
          sortOrder,
        },
      });
      setSubCategories(res.data.subcategories);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch subcategories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  useEffect(() => {
    const filters = {
      query: searchQuery,
      category: selectedCategory,
      dateFrom: selectedDateRange?.[0]
        ? dayjs(selectedDateRange[0]).toISOString()
        : "",
      dateTo: selectedDateRange?.[1]
        ? dayjs(selectedDateRange[1]).endOf("day").toISOString()
        : "",
      page,
      limit: pageSize,
      sortField,
      sortOrder,
    };
    fetchSubCategories(filters);
  }, [
    searchQuery,
    selectedCategory,
    selectedDateRange,
    page,
    pageSize,
    sortField,
    sortOrder,
  ]);

  const isFormValid = () =>
    newSubCategory.name.trim() &&
    newSubCategory.sort_order &&
    newSubCategory.categoryId;

  const handleAddSubCategory = async () => {
    if (!isFormValid()) return;
    setAddLoading(true);
    const formData = new FormData();
    formData.append("name", newSubCategory.name);
    formData.append("sort_order", newSubCategory.sort_order);
    formData.append("category", newSubCategory.categoryId);
    if (newSubCategory.profile) {
      formData.append("profile", newSubCategory.profile);
    }

    try {
      await axios.post("http://localhost:5000/subcategory/create", formData);
      fetchSubCategories();
      setNewSubCategory({
        name: "",
        sort_order: "",
        profile: null,
        categoryId: "",
      });
      setIsAddModalVisible(false);
      toast.success("Subcategory created successfully", 4);
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(
          "Sort order already exists. Please choose a different number."
        );
      } else {
        toast.error("Failed to add new sub category");
        console.error("Add error: ", error);
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditSubCategory = async () => {
    if (!isFormValid()) return;
    setEditLoading(true);
    const formData = new FormData();
    formData.append("name", newSubCategory.name);
    formData.append("sort_order", newSubCategory.sort_order);
    formData.append("category", newSubCategory.categoryId);
    if (newSubCategory.profile) {
      formData.append("profile", newSubCategory.profile);
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/subcategory/update/${editingSubCategory._id}`,
        formData
      );
      fetchSubCategories();
      setIsEditModalVisible(false);
      setEditingSubCategory(null);
      toast.success("Subcategory updated", 4);
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(
          "Sort order already exists. Please choose a different number."
        );
      } else {
        toast.error("Failed to update");
        console.error("Updae error: ", error);
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSubCategory = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(
        `http://localhost:5000/subcategory/delete/${selectedSubCategoryId}`
      );
      fetchSubCategories();
      setIsDeleteModalVisible(false);
      toast.success("Subcategory deleted", 4);
    } catch (err) {
      toast.error("Failed to delete.", 2);
      console.error("Delete failed", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "profile",
      render: (img) => (
        <img
          src={img ? `http://localhost:5000/${img}` : "/default.png"}
          width={50}
          height={50}
          style={{ objectFit: "cover", borderRadius: 4 }}
          alt="img"
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: true,
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      sorter: true,
      render: (_, record) => record.category?.name || "N/A",
    },
    {
      title: "Sort Order",
      dataIndex: "sort_order",
      sorter: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      sorter: true,
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingSubCategory(record);
              setNewSubCategory({
                name: record.name,
                sort_order: record.sort_order,
                profile: null,
                categoryId: record.category?._id || "",
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
              setSelectedSubCategoryId(record._id);
              setIsDeleteModalVisible(true);
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
      <div className="subcategory-header"></div>

      <Breadcrumb />

      <Card
        title={<h2 className="subcategory-title"> All Sub Categories</h2>}
        extra={
          <>
            <Space wrap size="middle" className="subcategory-controls">
              <Search
                placeholder="Search subcategory"
                onSearch={(value) => setSearchQuery(value)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />

              <Select
                placeholder="Filter by Category"
                onChange={(value) => setSelectedCategory(value)}
                value={selectedCategory}
                style={{ width: 180 }}
                allowClear
              >
                {categories.map((cat) => (
                  <Select.Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>

              <RangePicker
                onChange={(dates) => setSelectedDateRange(dates)}
                value={selectedDateRange}
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
              />

              <Button
                danger
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setSelectedDateRange(null);
                }}
              >
                Reset
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalVisible(true)}
              >
                Add SubCategory
              </Button>
            </Space>
          </>
        }
      >
        <Table
          dataSource={subCategories}
          columns={columns}
          rowKey="_id"
          loading={loading}
          bordered
          onChange={(pagination, filters, sorter) => {
            setPage(pagination.current);
            setPageSize(pagination.pageSize);
            if (sorter?.field) {
              setSortField(sorter.field);
              setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
            }
          }}
          pagination={{
            current: page,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50", "100"],
            showQuickJumper: true,
            total,
          }}
        />
      </Card>

      {/* Add Modal */}
      <Modal
        title="Add SubCategory"
        open={isAddModalVisible}
        onOk={handleAddSubCategory}
        onCancel={() => {
          setIsAddModalVisible(false);
          navigate("/dashboard/sub_category");
        }}
        okButtonProps={{ disabled: !isFormValid(), loading: addLoading }}
      >
        <label>Name:</label>
        <input
          value={newSubCategory.name}
          onChange={(e) =>
            setNewSubCategory({ ...newSubCategory, name: e.target.value })
          }
          style={{ width: "100%", marginBottom: 10 }}
        />
        <label>Sort Order:</label>
        <input
          type="number"
          value={newSubCategory.sort_order}
          onChange={(e) =>
            setNewSubCategory({
              ...newSubCategory,
              sort_order: parseInt(e.target.value),
            })
          }
          style={{ width: "100%", marginBottom: 10 }}
        />
        <label>Category:</label>
        <Select
          value={newSubCategory.categoryId}
          onChange={(val) =>
            setNewSubCategory({ ...newSubCategory, categoryId: val })
          }
          style={{ width: "100%", marginBottom: 10 }}
        >
          {categories.map((cat) => (
            <Select.Option key={cat._id} value={cat._id}>
              {cat.name}
            </Select.Option>
          ))}
        </Select>
        <label>Profile Image:</label>
        <input
          type="file"
          onChange={(e) =>
            setNewSubCategory({
              ...newSubCategory,
              profile: e.target.files[0],
            })
          }
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit SubCategory"
        open={isEditModalVisible}
        onOk={handleEditSubCategory}
        onCancel={() => {
          setIsEditModalVisible(false);
          navigate("/dashboard/sub_category");
        }}
        okButtonProps={{ disabled: !isFormValid(), loading: editLoading }}
      >
        <label>Name:</label>
        <input
          value={newSubCategory.name}
          onChange={(e) =>
            setNewSubCategory({ ...newSubCategory, name: e.target.value })
          }
          style={{ width: "100%", marginBottom: 10 }}
        />
        <label>Sort Order:</label>
        <input
          type="number"
          value={newSubCategory.sort_order}
          onChange={(e) =>
            setNewSubCategory({
              ...newSubCategory,
              sort_order: parseInt(e.target.value),
            })
          }
          style={{ width: "100%", marginBottom: 10 }}
        />
        <label>Category:</label>
        <Select
          value={newSubCategory.categoryId}
          onChange={(val) =>
            setNewSubCategory({ ...newSubCategory, categoryId: val })
          }
          style={{ width: "100%", marginBottom: 10 }}
        >
          {categories.map((cat) => (
            <Select.Option key={cat._id} value={cat._id}>
              {cat.name}
            </Select.Option>
          ))}
        </Select>
        <label>Profile Image:</label>
        <input
          type="file"
          onChange={(e) =>
            setNewSubCategory({
              ...newSubCategory,
              profile: e.target.files[0],
            })
          }
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Confirm Delete"
        open={isDeleteModalVisible}
        onOk={handleDeleteSubCategory}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          navigate("/dashboard/sub_category");
        }}
        okButtonProps={{ danger: true, loading: deleteLoading }}
      >
        Are you sure you want to delete this subcategory?
      </Modal>
    </div>
  );
};

export default SubCategory;
