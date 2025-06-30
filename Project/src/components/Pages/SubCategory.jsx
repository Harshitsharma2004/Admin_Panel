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
  Form,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { Input } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Breadcrumb from "../BreadCrumb";
import ProfileUploader from "../Profile/ProfileUploader";
const { Search } = Input;

const { RangePicker } = DatePicker;

const SubCategory = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm(); // for Add Modal
  const [editForm] = Form.useForm(); // for Edit Modal

  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [newSubCategory, setNewSubCategory] = useState({
    name: "",
    sort_order: "",
    profile: null,
    categoryId: null,
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

  const [editProfileFile, setEditProfileFile] = useState(null);

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

  const handleAddSubCategory = async (values) => {
    setAddLoading(true);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("sort_order", values.sort_order);
    formData.append("category", values.categoryId);
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
        categoryId: null,
      });
      setIsAddModalVisible(false);
      console.log("👉 File object sent:", newSubCategory.profile);

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

  const handleEditSubCategory = async (values) => {
    if (!editingSubCategory || !editingSubCategory._id) {
      toast.error("Editing subcategory is not set.");
      return;
    }

    setEditLoading(true);
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("sort_order", values.sort_order);
    formData.append("category", values.categoryId);
    if (editProfileFile) {
      formData.append("profile", editProfileFile);
    }

    try {
      await axios.put(
        `http://localhost:5000/subcategory/update/${editingSubCategory._id}`,
        formData
      );
      fetchSubCategories();
      setIsEditModalVisible(false);
      setEditingSubCategory(null);
      toast.success("Subcategory updated", { autoClose: 4000 });
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update subcategory");
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
      render: (img) => {
        return (
          <img
            src={img ? `http://localhost:5000${img}` : "/default.png"}
            width={50}
            height={50}
            style={{ borderRadius: "4px", objectFit: "cover" }}
            alt="img"
          />
        );
      },
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

              // ✅ Set form values for AntD Form
              editForm.setFieldsValue({
                name: record.name,
                sort_order: record.sort_order,
                categoryId: record.category?._id || "",
              });

              // ✅ Set existing image in newSubCategory.profile
              setNewSubCategory({
                name: record.name,
                sort_order: record.sort_order,
                profile: null,
                categoryId: record.category?._id || "",
              });

              setIsEditModalVisible(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              setSelectedSubCategoryId(record._id);
              setIsDeleteModalVisible(true);
            }}
          />
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
                onClick={() => {
                  setNewSubCategory({
                    name: "",
                    sort_order: "",
                    profile: null,
                    categoryId: null,
                  });
                  form.resetFields();
                  setIsAddModalVisible(true);
                }}
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
          scroll={{ x: "max-content" }}
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
        onOk={() => form.submit()}
        onCancel={() => {
          setIsAddModalVisible(false);
          setNewSubCategory({
            name: "",
            sort_order: "",
            profile: null,
            categoryId: null,
          });
          navigate("/dashboard/sub_category");
        }}
        okButtonProps={{ loading: addLoading }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={newSubCategory}
          onFinish={handleAddSubCategory}
        >
          <Form.Item
            label="SubCategory Name"
            name="name"
            rules={[
              { required: true, message: "Please enter subcategory name" },
            ]}
          >
            <Input placeholder="Enter SubCategory Name" />
          </Form.Item>

          <Form.Item
            label="Sort Order"
            name="sort_order"
            rules={[{ required: true, message: "Please enter sort order" }]}
          >
            <Input type="number" min={0} placeholder="Enter Sort Order" />
          </Form.Item>

          <Form.Item
            label="Select Category"
            name="categoryId"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select placeholder="Select Category">
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <ProfileUploader
            value={editingSubCategory?.profile}
            onChange={(file) =>
              setEditingSubCategory((prev) => ({ ...prev, profile: file }))
            }
          />
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit SubCategory"
        open={isEditModalVisible}
        onOk={() => editForm.submit()}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditProfileFile(null);
          navigate("/dashboard/sub_category");
        }}
        okButtonProps={{ loading: editLoading }}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          initialValues={newSubCategory}
          onFinish={handleEditSubCategory}
        >
          <Form.Item
            label="SubCategory Name"
            name="name"
            rules={[
              { required: true, message: "Please enter subcategory name" },
            ]}
          >
            <Input placeholder="Enter SubCategory Name" />
          </Form.Item>

          <Form.Item
            label="Sort Order"
            name="sort_order"
            rules={[{ required: true, message: "Please enter sort order" }]}
          >
            <Input type="number" min={0} placeholder="Enter Sort Order" />
          </Form.Item>

          <Form.Item
            label="Select Category"
            name="categoryId"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select placeholder="Select Category">
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <ProfileUploader
            value={null}
            onChange={(file) => setEditProfileFile(file)}
          />
        </Form>
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
