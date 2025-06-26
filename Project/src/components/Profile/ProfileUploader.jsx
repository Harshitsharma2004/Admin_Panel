import { Upload, Button, Modal, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";

const ProfileUploader = () => {
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1));
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // Optional: Save to form state
    // setNewUser((prev) => ({ ...prev, profile: newFileList[0]?.originFileObj || null }));
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  return (
    <>
      <Upload
        listType="picture"
        fileList={fileList}
        beforeUpload={() => false} // Prevent auto-upload
        onPreview={handlePreview}
        onChange={handleChange}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload>

      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
        <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};

export default ProfileUploader;