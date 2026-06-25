import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./Customize.css";

import defaultWelcomeImage from "/wcchatbot.svg";

const Customize = () => {
  const navigate = useNavigate();
  const adminId = localStorage.getItem("adminId");

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    welcomeImageOpt: "1",
    welcomeHeader: "",
    welcomeMessage: "",
    buttonText: "",
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(defaultWelcomeImage);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // When user switches back to default image
    if (name === "welcomeImageOpt" && value === "1") {
      setImagePreview(defaultWelcomeImage);
      setUploadedFile(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setUploadedFile(file);

      // Show local preview immediately
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = new FormData();

      payload.append("welcomeImageOpt", formData.welcomeImageOpt);
      payload.append("welcomeHeader", formData.welcomeHeader);
      payload.append("welcomeMessage", formData.welcomeMessage);
      payload.append("buttonText", formData.buttonText);

      if (
        formData.welcomeImageOpt === "2" &&
        uploadedFile
      ) {
        payload.append("uploaded_file", uploadedFile);
      }

      const response = await axios.post(
        `https://chatbotapi.scrollosoft.com/users/update-user-setting/${adminId}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status) {
        toast.success(response.data.message);

        const user = response.data.user;

        // Update form with latest values
        setFormData({
          welcomeImageOpt: user?.welcomeImageOpt || "1",
          welcomeHeader: user?.welcomeHeader || "",
          welcomeMessage: user?.welcomeMessage || "",
          buttonText: user?.buttonText || "",
        });

        // If welcomeImage is null then show default image
        if (user?.welcomeImage) {
          setImagePreview(
            `https://chatbotapi.scrollosoft.com/uploads/${user.welcomeImage}`
          );
        } else {
          setImagePreview(defaultWelcomeImage);
        }
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar
        onLogout={() => {
          localStorage.removeItem("isLoggedIn");
          navigate("/login");
        }}
      />

      <div className="account-container">
        <div className="account-card">
          <form onSubmit={handleSubmit}>
            <div className="form-flex">
              <div>
                <div className="form-group">
                  <label>Welcome Image Option</label>

                  <select
                    name="welcomeImageOpt"
                    value={formData.welcomeImageOpt}
                    onChange={handleChange}
                  >
                    <option value="1">
                      Use Default Image
                    </option>
                    <option value="2">
                      Upload Custom Image
                    </option>
                  </select>
                </div>

                {/* Image Preview */}
                <div className="form-group">
                  <img
                    src={imagePreview || defaultWelcomeImage}
                    alt="Welcome Preview"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "contain",
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>

                {/* Upload Image */}
                {formData.welcomeImageOpt === "2" && (
                  <div className="form-group">
                    <label>Upload Image</label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Welcome Header</label>

                <input
                  type="text"
                  name="welcomeHeader"
                  value={formData.welcomeHeader}
                  onChange={handleChange}
                  placeholder="Enter heading"
                />
              </div>
            </div>

            <div className="form-flex">
              <div className="form-group">
                <label>Welcome Message</label>

                <textarea
                  name="welcomeMessage"
                  value={formData.welcomeMessage}
                  onChange={handleChange}
                  placeholder="Enter welcome message"
                />
              </div>

              <div className="form-group">
                <label>Button Text</label>

                <input
                  type="text"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleChange}
                  placeholder="Enter button text"
                />
              </div>
            </div>

            <div className="button-group">
              <button
                type="submit"
                disabled={loading}
                className="edit-btn"
              >
                {loading
                  ? "Updating..."
                  : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Customize;