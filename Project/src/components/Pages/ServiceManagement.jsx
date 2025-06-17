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

const { Option } = Select;
const { RangePicker } = DatePicker;

const ServiceManagement = () => {
  const navigate = useNavigate();

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
    category: "",
    subCategories: [],
    sort_order: "",
    min_price: "",
    max_price: "",
    profile: null,
  });

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

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

      console.log("Search Params:", params); // Debugging line for checking parameters

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

  const handleSave = async () => {
    setFormLoading(true);
    setFormError(null);
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "subCategories") {
        value.forEach((id) => payload.append("subCategories[]", id));
      } else {
        payload.append(key, value);
      }
    });

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:5000/service/update/${currentService._id}`,
          payload
        );
        toast.success("Service updated successfully");
      } else {
        await axios.post("http://localhost:5000/service/create", payload);
        toast.success("Service created successfully");
      }
      fetchServices();
      setIsModalVisible(false);
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Failed to add or update service";
      setFormError(errMsg);
      if (error.response?.status === 409) {
        toast.error("Sort order already exists.");
      } else {
        toast.error(errMsg);
        console.error(error);
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
          src={img ? `http://localhost:5000/${img}` : "/default.png"}
          alt="img"
          width={50}
          height={50}
          style={{ borderRadius: "50%", objectFit: "cover" }}
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
              setIsEdit(true);
              setCurrentService(record);
              setFormData({
                name: record.name,
                category: record.category?._id,
                subCategories: record.subCategories?.map((s) => s._id),
                sort_order: record.sort_order,
                min_price: record.min_price,
                max_price: record.max_price,
                profile: null,
              });
              setSelected(record);
              setFormError(null);
              setIsModalVisible(true);
              navigate(`/dashboard/services/edit_service/${record._id}`);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              setDeleteServiceId(record._id);
              setDeleteModalVisible(true);
              navigate(`/dashboard/services/delete_service/${record._id}`);
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
                      (sub) => sub.category?._id === filters.selectedCategory
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
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsEdit(false);
                  setFormData({
                    name: "",
                    category: "",
                    subCategories: [],
                    sort_order: "",
                    min_price: "",
                    max_price: "",
                    profile: null,
                  });
                  setFormError(null);
                  setIsModalVisible(true);
                  navigate("/dashboard/services/add_service");
                }}
              >
                Add Service
              </Button>
            </Space>
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
            setIsModalVisible(false);
            navigate("/dashboard/services");
            setFormError(null);
          }
        }}
        onOk={handleSave}
        okButtonProps={{
          loading: formLoading,
          disabled: !!formError,
        }}
        cancelButtonProps={{
          disabled: formLoading,
        }}
        maskClosable={!formLoading}
      >
        {formError && (
          <div style={{ color: "red", marginBottom: 10 }}>{formError}</div>
        )}

        <Input
          placeholder="Service Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ marginBottom: 10 }}
        />

        <Select
          placeholder="Select Category"
          value={formData.category}
          onChange={(val) =>
            setFormData({ ...formData, category: val, subCategories: [] })
          }
          style={{ width: "100%", marginBottom: 10 }}
        >
          {categories.map((cat) => (
            <Option key={cat._id} value={cat._id}>
              {cat.name}
            </Option>
          ))}
        </Select>

        <Select
          mode="tags"
          placeholder="Select Subcategories"
          value={formData.subCategories}
          onChange={(val) => setFormData({ ...formData, subCategories: val })}
          style={{ width: "100%", marginBottom: 10 }}
        >
          {subCategories
            .filter(
              (sub) =>
                !formData.category || sub.category?._id === formData.category
            )
            .map((sub) => (
              <Option key={sub._id} value={sub._id}>
                {sub.name}
              </Option>
            ))}
        </Select>

        <Input
          type="number"
          placeholder="Sort Order"
          value={formData.sort_order}
          onChange={(e) =>
            setFormData({ ...formData, sort_order: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <Input
          type="number"
          placeholder="Min Price"
          value={formData.min_price}
          onChange={(e) =>
            setFormData({ ...formData, min_price: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <Input
          type="number"
          placeholder="Max Price"
          value={formData.max_price}
          onChange={(e) =>
            setFormData({ ...formData, max_price: e.target.value })
          }
          style={{ marginBottom: 10 }}
        />
        <Upload
          beforeUpload={(file) => {
            setFormData({ ...formData, profile: file });
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Upload Image</Button>
        </Upload>
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
