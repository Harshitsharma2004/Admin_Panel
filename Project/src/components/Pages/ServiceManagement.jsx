import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Modal,
  Button,
  Input,
  Select,
  Upload,
  Space,
  message,
  DatePicker,
  Skeleton,
  Card,
  Form,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Breadcrumb from "../BreadCrumb";
import { debounce } from "lodash";

import ProfileUploader from "../Profile/ProfileUploader";

const { Option } = Select;
const { RangePicker } = DatePicker;

const ServiceManagement = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState();
  const [currentService, setCurrentService] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState(null);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("descend");
  const [filters, setFilters] = useState({
    query: "", // Search query
    selectedCategory: null, // Selected category
    selectedSubCategory: null, // Selected subcategory
    dateRange: [], // Date range
  });

  const debouncedSearch = useCallback(
    debounce((val) => {
      fetchServices({ query: val }); // your fetch function
    }, 500),
    []
  );

  const [formData, setFormData] = useState({
    name: "",
    category: null,
    subCategories: [],
    sort_order: "",
    min_price: "",
    max_price: "",
    profile: null,
  });

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [page, pageSize, sortField, sortOrder, filters]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { query, selectedCategory, selectedSubCategory, dateRange } =
        filters;

      const params = {
        query: query || undefined, // Only include query if it is not empty
        category: selectedCategory || undefined, // Only include category if it is selected
        subCategory: selectedSubCategory || undefined, // Only include subCategory if it is selected
        dateFrom: dateRange?.[0]?.startOf("day").toISOString() || undefined,
        dateTo: dateRange?.[1]?.endOf("day").toISOString() || undefined,
        page,
        limit: pageSize,
        sortField,
        sortOrder: sortOrder === "ascend" ? "asc" : "desc",
      };

      const res = await axios.get("http://localhost:5000/service", { params });
      setServices(res.data.services);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Error fetching services", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:5000/category");
    setCategories(res.data.categories);
  };

  const fetchSubCategories = async () => {
    const res = await axios.get("http://localhost:5000/subcategory");
    setSubCategories(res.data.subcategories);
    // console.log("Fetched SubCategories:", res.data);
  };

  //search change handler
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setFilters((prev) => ({ ...prev, query }));
  };

  //category change handler
  const handleCategoryChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      selectedCategory: value,
      selectedSubCategory: null, // Reset subcategory
    }));
  };

  //sub category change handler
  const handleSubCategoryChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      selectedSubCategory: value,
    }));
  };

  //date range change handler
  const handleDateRangeChange = (dates) => {
    setFilters((prev) => ({ ...prev, dateRange: dates }));
  };

  const handleSave = async (values) => {
    setFormLoading(true);
    const payload = new FormData();

    const fullFormData = {
      ...values, // contains all validated form values
      profile: formData.profile, // the uploaded image file from state
    };

    // 🛠️ Append fields to FormData
    Object.entries(fullFormData).forEach(([key, value]) => {
      if (key === "subCategories" && Array.isArray(value)) {
        value.forEach((id) => payload.append("subCategories[]", id));
      } else if (key === "profile" && value instanceof File) {
        payload.append("profile", value); // 👈 this name MUST match multer.single("image")
      } else {
        payload.append(key, value);
      }
    });

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:5000/service/update/${currentService._id}`,
          payload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Service updated successfully");
      } else {
        await axios.post("http://localhost:5000/service/create", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Service created successfully");
      }

      fetchServices();
      setIsModalVisible(false);
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Failed to add or update service";

      if (error.response?.status === 409) {
        toast.error("Sort order already exists.");
      } else {
        toast.error(errMsg);
        console.error("Service error:", error);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/service/delete/${deleteServiceId}`
      );
      toast.success("Service deleted successfully");
      fetchServices();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleteModalVisible(false);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "profile",
      render: (img) => (
        <img
          src={img ? `http://localhost:5000${img}` : "/default.png"}
          alt="img"
          width={50}
          height={50}
          style={{ borderRadius: "4px", objectFit: "cover" }}
        />
      ),
    },
    { title: "Service Name", dataIndex: "name", sorter: true },
    { title: "Category", dataIndex: ["category", "name"], sorter: true },
    {
      title: "Subcategories",
      dataIndex: "subCategories",
      sorter: true,
      render: (subs) => subs.map((s) => s.name).join(", "),
    },
    { title: "Sort Order", dataIndex: "sort_order", sorter: true },
    {
      title: "Min Price",
      dataIndex: "min_price",
      sorter: true,
      render: (price) => `₹${price}`,
    },
    {
      title: "Max Price",
      dataIndex: "max_price",
      sorter: true,
      render: (price) => `₹${price}`,
    },
    {
      title: "Created On",
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
              const updatedFormData = {
                name: record.name,
                category: record.category?._id,
                subCategories: record.subCategories?.map((s) => s._id),
                sort_order: record.sort_order,
                min_price: record.min_price,
                max_price: record.max_price,
                profile: null,
              };

              setIsEdit(true);
              setCurrentService(record);
              setFormData(updatedFormData);
              form.setFieldsValue(updatedFormData); // ✅ This forces update in form
              setSelected(record);
              setIsModalVisible(true);
              navigate(`/dashboard/services`);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              setDeleteServiceId(record._id);
              setDeleteModalVisible(true);
              navigate(`/dashboard/services`);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="service-management">
      <div className="service-header"></div>

      <Breadcrumb />

      <Card
        title={<h2 className="service-title">Service Management</h2>}
        extra={
          <>
            <div className="service-outer">
              <div className="serviceOne">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setIsEdit(false);
                    setFormData({
                      name: "",
                      category: null,
                      subCategories: [],
                      sort_order: "",
                      min_price: "",
                      max_price: "",
                      profile: null,
                    });
                    setIsModalVisible(true);
                    navigate("/dashboard/services");
                  }}
                >
                  Add Service
                </Button>
              </div>
              <div className="serviceTwo">
                <Space className="service-controls">
                  <Input
                    placeholder="Search service"
                    prefix={<SearchOutlined />}
                    allowClear
                    onChange={handleSearchChange}
                    value={filters.query} // Controlled input for search
                    style={{ width: 200 }}
                  />

                  <Select
                    showSearch
                    allowClear
                    placeholder="Filter by Category"
                    style={{ width: 180 }}
                    value={filters.selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    {categories.map((cat) => (
                      <Option key={cat._id} value={cat._id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>

                  {filters.selectedCategory && (
                    <Select
                      showSearch
                      allowClear
                      placeholder="Filter by SubCategory"
                      style={{ width: 180 }}
                      value={filters.selectedSubCategory}
                      onChange={handleSubCategoryChange}
                    >
                      {subCategories
                        .filter(
                          (sub) =>
                            sub.category?._id === filters.selectedCategory
                        ) // Only show subcategories for the selected category
                        .map((sub) => (
                          <Option key={sub._id} value={sub._id}>
                            {sub.name}
                          </Option>
                        ))}
                    </Select>
                  )}

                  <RangePicker
                    onChange={handleDateRangeChange}
                    value={filters.dateRange}
                    disabledDate={(current) =>
                      current && current > dayjs().endOf("day")
                    }
                  />
                  <Button
                    danger
                    onClick={() => {
                      setFilters({
                        query: "",
                        selectedCategory: null,
                        selectedSubCategory: null,
                        dateRange: [],
                      });
                    }}
                  >
                    Reset
                  </Button>
                </Space>
              </div>
            </div>
          </>
        }
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <Table
            dataSource={services}
            columns={columns}
            rowKey="_id"
            scroll={{ x: "max-content" }}
            pagination={{
              current: page,
              pageSize,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["5", "10", "20", "50", "100"],
              total,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
            onChange={(pagination, filters, sorter) => {
              setSortField(sorter.field || "createdAt");
              setSortOrder(sorter.order || "descend");
              setPage(pagination.current);
              setPageSize(pagination.pageSize);
            }}
          />
        )}
      </Card>

      <Modal
        title={isEdit ? "Edit Service" : "Add Service"}
        open={isModalVisible}
        onCancel={() => {
          if (!formLoading) {
            form.resetFields(); // ✅ Clear form on close
            setIsModalVisible(false);
            navigate("/dashboard/services");
          }
        }}
        onOk={() => form.submit()}
        okButtonProps={{
          loading: formLoading,
        }}
        cancelButtonProps={{
          disabled: formLoading,
        }}
        maskClosable={!formLoading}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={formData}
          onFinish={handleSave}
        >
          <Form.Item
            label="Service Name"
            name="name"
            rules={[{ required: true, message: "Please enter service name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select placeholder="Select Category">
              {categories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Subcategories"
            name="subCategories"
            rules={[{ required: true, message: "Please select sub category" }]}
          >
            <Select
              mode="tags"
              placeholder="Select Subcategories"
              options={subCategories
                .filter(
                  (sub) =>
                    !form.getFieldValue("category") ||
                    sub.category?._id === form.getFieldValue("category")
                )
                .map((sub) => ({
                  label: sub.name,
                  value: sub._id,
                }))}
            />
          </Form.Item>

          <Form.Item
            label="Sort Order"
            name="sort_order"
            rules={[{ required: true, message: "Please enter sort order" }]}
          >
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            label="Min Price"
            name="min_price"
            rules={[{ required: true, message: "Please enter minimum price" }]}
          >
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            label="Max Price"
            name="max_price"
            rules={[{ required: true, message: "Please enter maximum price" }]}
          >
            <Input type="number" min={0} />
          </Form.Item>

          <ProfileUploader
            value={formData.profile}
            onChange={(file) =>
              setFormData((prev) => ({ ...prev, profile: file }))
            }
            existingImage={isEdit ? currentService?.image : null}
          />
        </Form>
      </Modal>

      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          navigate("/dashboard/services");
        }}
        onOk={handleDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        Are you sure you want to delete this service?
      </Modal>
    </div>
  );
};

export default ServiceManagement;
