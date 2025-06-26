import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  Space,
  message,
  Card,
  Radio,
  Checkbox,
  InputNumber,
} from "antd";

import { DatePicker } from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import Breadcrumb from "../BreadCrumb";
import { useNavigate } from "react-router-dom";

const AttributeManagement = () => {
  const { RangePicker } = DatePicker;
  const { Search } = Input;

  const navigate = useNavigate();
  const [attributes, setAttributes] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [sorter, setSorter] = useState({
    field: "createdAt",
    order: "descend",
  });

  const [optionFields, setOptionFields] = useState([""]);

  const [categories, setCategories] = useState([]);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedAttributeId, setSelectedAttributeId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState([]);

  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showType, setShowType] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/category");
      setCategories(res.data.categories || []);
    } catch (err) {
      toast.error("Failed to fetch categories");
    }
  };

  const addOptionField = () => {
    setOptionFields((prev) => [...prev, ""]);
  };

  useEffect(() => {
    fetchAttributes();
    fetchServices();
    fetchCategories();
  }, [page, pageSize, sorter]);

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

    // Make sure you're passing the filters properly
    fetchAttributes(filters);
  }, [
    searchQuery,
    selectedCategory,
    selectedDateRange,
    page,
    pageSize,
    sortField,
    sortOrder,
  ]);

  const fetchAttributes = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/attribute", {
        params: {
          query: filters.query,
          category: filters.category,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          page: filters.page,
          limit: filters.limit,
          sortField: filters.sortField,
          sortOrder: filters.sortOrder,
        },
      });
      setAttributes(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch attributes");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/service");
      setServices(res.data.services || []);
    } catch (err) {
      toast.error("Failed to fetch services");
    }
  };

  const openAddModal = () => {
    form.resetFields();
    setEditingAttribute(null);
    setOptionFields([""]);
    setShowType(false);
    setModalVisible(true);
  };

  const openEditModal = (record) => {
    const optionsArray =
      Array.isArray(record.attribute_name) && record.attribute_name.length
        ? record.attribute_name
        : [""];

    // Set option fields before opening modal
    setOptionFields(optionsArray);

    // Set form values
    form.setFieldsValue({
      name: record.name,
      service: record.service?._id,
      sort_order: record.sort_order,
      category: record.category?._id,
      type: record.type,
      is_required: record.is_required,
      is_active: record.is_active,
      options: optionsArray,
    });

    // Now open the modal
    setEditingAttribute(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/attribute/delete/${id}`);
      fetchAttributes();
      setIsDeleteModalVisible(false);
      toast.success("Attribute deleted successfully");
    } catch (err) {
      toast.error("Failed to delete attribute");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (id) => {
    try {
      const values = form.getFieldsValue();

      // Ensure options is an empty array if type requires it but options is undefined
      if (
        (values.type === "Radio" || values.type === "Checkbox") &&
        (!Array.isArray(values.options) || values.options.length === 0)
      ) {
        toast.error("Please enter at least one option.");
        return;
      }

      // Construct clean payload (removes undefined fields)
      const cleanValues = {
        name: values.name?.trim(),
        category: values.category,
        service: values.service,
        sort_order: values.sort_order,
        type: values.type,
        options:
          values.type === "Radio" || values.type === "Checkbox"
            ? values.options
            : undefined,
        is_active: values.is_active,
        is_required: values.is_required,
      };


      if (editingAttribute) {
        await axios.put(
          `http://localhost:5000/attribute/update/${id}`,
          cleanValues
        );
        toast.success("Attribute updated successfully!");
      } else {
        await axios.post("http://localhost:5000/attribute/create", cleanValues);
        toast.success("Attribute created successfully!");
      }

      setModalVisible(false);
      fetchAttributes();
    } catch (err) {
      console.error("Form submission error:", err);
      toast.error(err.response?.data?.message || "Validation or server error");
    }
  };

  const columns = [
    {
      title: "Attribute Name",
      dataIndex: "name",
      sorter: true,
    },
    {
      title: "Category",
      dataIndex: "category",
      render: (cat) => cat?.name || "N/A",
      sorter: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      render: (type) => type?.replace(/_/g, "")?.toUpperCase(),
      sorter: true,
    },
    {
      title: "Service",
      dataIndex: "service",
      render: (s) => s?.name || "N/A",
    },
    {
      title: "Sort Order",
      dataIndex: "sort_order",
      sorter: true,
    },
    // {
    //   title: "Attribute Values",
    //   dataIndex: "options",
    //   render: (opts) => (
    //     <span>
    //       {(opts || []).map((val, idx) => (
    //         <span key={idx} style={{ marginRight: 8, display: "inline-block" }}>
    //           <span
    //             style={{
    //               backgroundColor: "#f5f5f5",
    //               padding: "2px 8px",
    //               borderRadius: "8px",
    //             }}
    //           >
    //             {val}
    //           </span>
    //         </span>
    //       ))}
    //     </span>
    //   ),
    // },

    {
      title: "Created On",
      dataIndex: "createdAt",
      render: (date) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              setIsDeleteModalVisible(true);
              setSelectedAttributeId(record._id);
            }}
          />
        </Space>
      ),
    },
  ];

  const attOptions = ["Radio", "Button", "Checkbox", "Number", "Textbox"];

  const handleTypeChange = (value) => {
    console.log("value---", value);
    if (value === "Radio" || value === "Checkbox") {
      setShowType(true);
    } else {
      setShowType(false);
    }
  };

  return (
    <div>
      <Breadcrumb />
      <Card
        title={<h2>All Attributes</h2>}
        extra={
          <>
            <Space wrap size="middle" className="attribute-controls">
              <Search
                placeholder="Search attribute"
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
                onClick={openAddModal}
              >
                Add Attribute
              </Button>
            </Space>
          </>
        }
      >
        <Table
          columns={columns}
          dataSource={attributes}
          rowKey="_id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ["5", "10", "20"],
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
        />
      </Card>

      <Modal
        title={editingAttribute ? "Edit Attribute" : "Add Attribute"}
        open={modalVisible}
        okText={editingAttribute ? "Update" : "Create"}
        cancelText="Cancel"
        onCancel={() => {
          setModalVisible(false);
          setOptionFields([""]);
          setShowType(false);
        }}
        onOk={() => form.submit()}
        okButtonProps={{ loading: submitting }}
        destroyOnClose
      >
        <Form
          id="attribute-form"
          form={form}
          layout="vertical"
          onFinish={(values) => {
            handleFormSubmit(editingAttribute?._id, values);
          }}
        >
          <Form.Item
            name="category"
            label="Category Name"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select placeholder="Select category">
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="service"
            label="Service Name"
            rules={[{ required: true, message: "Please enter service name" }]}
          >
            <Select placeholder="Select service">
              {services.map((srv) => (
                <Select.Option key={srv._id} value={srv._id}>
                  {srv.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label="Attribute Name"
            rules={[{ required: true, message: "Please enter attribute name" }]}
          >
            <Input placeholder="Enter Attribute Name" />
          </Form.Item>

          <Form.Item
            name="sort_order"
            label="Attribute Sort Order"
            rules={[{ required: true, message: "Please enter sort number" }]}
          >
            <InputNumber
              min={1}
              placeholder="Enter Sort Order"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select
              placeholder="Select type"
              showSearch
              onChange={(val) =>
                setShowType(val === "Radio" || val === "Checkbox")
              }
            >
              {[
                "radio",
                "button",
                "checkbox",
                "number",
                "textbox",
              ].map((type) => (
                <Select.Option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {showType && (
            <Form.List
              name="options"
              rules={[
                { required: true, message: "Please add at least one option." },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Form.Item
                      key={key}
                      label={name === 0 ? "Attribute Option Name" : ""}
                      required
                    >
                      <Input.Group compact>
                        <Form.Item
                          {...restField}
                          name={name}
                          noStyle
                          rules={[
                            { required: true, message: "Enter option name" },
                          ]}
                        >
                          <Input
                            placeholder="Option name"
                            style={{ width: "calc(100% - 32px)" }}
                          />
                        </Form.Item>
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Input.Group>
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Option
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          )}

          <Form.Item
            label="Status"
            name="is_active"
            initialValue={true}
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Radio.Group>
              <Radio value={true}>Active</Radio>
              <Radio value={false}>De-Active</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="is_required"
            valuePropName="checked"
            initialValue={false}
            rules={[{ required: true, message: "Please check this box." }]}
          >
            <Checkbox>I Agree to T & C.</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Confirm Delete"
        open={isDeleteModalVisible}
        onOk={() => handleDelete(selectedAttributeId)}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          navigate("/dashboard/attributes");
        }}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteLoading }}
      >
        <p>Are you sure you want to delete this category?</p>
      </Modal>
    </div>
  );
};

export default AttributeManagement;
