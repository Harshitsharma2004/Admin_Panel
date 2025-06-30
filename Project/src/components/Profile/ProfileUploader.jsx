import { Upload, Button, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ProfileUploader = ({ value, onChange }) => {
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
    setPreviewTitle(
      file.name || file.url?.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    const fileObj = newFileList[0]?.originFileObj || null;
    onChange(fileObj);

    // if (fileObj) {
    //   console.log("✅ Selected image name:", fileObj.name);
    // } else {
    //   console.log("❌ No file selected");
    // }
  };

  useEffect(() => {
  if (!value) {
    setFileList([]);
  }
}, [value]);


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
        maxCount={1}
        beforeUpload={(file) => {
          const isImage = file.type.startsWith("image/");
          const isLt2M = file.size / 1024 / 1024 < 2;

          if (!isImage) {
            toast.error("Only image files (jpg, png, etc.) are allowed.");
            return Upload.LIST_IGNORE;
          }

          if (!isLt2M) {
            toast.error("Image must be smaller than 2MB.");
            return Upload.LIST_IGNORE;
          }

          return false;
        }}
        onPreview={handlePreview}
        onChange={handleChange}
      >
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload>

      {fileList.length === 0 && (
        <div style={{ marginTop: 8, color: "#888", fontSize: 13 }}>
          Please upload an image (JPG/PNG) under 2MB.
        </div>
      )}

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};

export default ProfileUploader;
