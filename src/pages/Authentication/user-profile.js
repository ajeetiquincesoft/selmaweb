import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Label,
  Input,
  FormFeedback,
  Form,
  FormGroup,
  Alert
} from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import axios from "axios";
import BASE_URL from "path";
import { FaCamera } from "react-icons/fa";
import "../../profile.css";
import Breadcrumbs from "../../components/Common/Breadcrumb"

const ChangePassword = () => {
  const [token, setToken] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(""); // default image

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      console.log(token);
      setToken(token);
      fetchUserData(token)
    }
  }, []);

  const fetchUserData = async (tok) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/auth/getauthuser`, {
        headers: {
          Authorization: `Bearer ${tok}`
        }
      });
      const userData = response.data;
      setProfileImage(userData.meta.profile_pic);
      profileValidation.setValues({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        gender: userData.meta.gender || '',
        profile_image: userData.meta.profile_pic, // We don't set a file input directly. Leave it blank or handle separately.
        address: userData.meta.address, // We don't set a file input directly. Leave it blank or handle separately.
      });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  // 🔐 Change Password Form
  const passwordValidation = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required("Please enter your current password"),
      newPassword: Yup.string().min(6, "Password must be at least 6 characters").required("Please enter your new password"),
      confirmNewPassword: Yup.string()
        .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
        .required("Please confirm your new password"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/auth/updatePassword`, // 👈 yahan use ho gaya
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setAlertMsg({ type: "success", message: "Password changed successfully!" });
        resetForm();
      } catch (error) {
        const message = error.response?.data?.message || error.message;
        setAlertMsg({ type: "danger", message: "Error changing password: " + message });
      }
    }
  });

  // 👤 Profile Update Form
  const profileValidation = useFormik({
    initialValues: {
      name: "",
      address: "",
      phone: "",
      gender: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      address: Yup.string().required("address  is required"),
      phone: Yup.string().required("Phone number is required"),
      gender: Yup.string().required("gender  is required")
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/auth/updateAuthUser`, // 👈 yahan use ho gaya
          values,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setAlertMsg({ type: "success", message: "Profile updated successfully!" });
         fetchUserData(token);
        // resetForm();
      } catch (error) {
        const message = error.response?.data?.message || error.message;
        setAlertMsg({ type: "danger", message: "Error updating profile: " + message });
      }
    }
  });
  const handleImageClick = () => {

    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl); // Show preview

      const formData = new FormData();
      formData.append("profile_pic", file); // ✅ use correct key name

      try {
        const response = await axios.post(
          "https://selmaapi.onrender.com/api/auth/uploadProfilePic",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "Authorization": `Bearer ${token}`, // 👈 yeh zaroori hai
            },
          }
        );
        console.log("Image uploaded successfully", response.data);
      } catch (error) {
        console.error("Error uploading image", error);
      }
    }
  };
  return (
    <div className="page-content">
      <Breadcrumbs title="Forms" breadcrumbItem="Form Elements" />
      <Container fluid>
        <h4 className="card-title mb-4">User Settings</h4>

        {alertMsg.message && (
          <Alert color={alertMsg.type}>{alertMsg.message}</Alert>
        )}
        {/* 👤 Update Profile Form */}
        <Card className="mt-4">
          <CardBody>
            <h5 className="mb-3">Update Profile</h5>
            <Row className="justify-content-center">
              <Col md={4} className="d-flex justify-content-center">
                <div className=" img-circle ">
                  < div className="profile-wrapper">
                    <img src={profileImage} alt="Profile" className="profile-img-round" />
                  </div>
                  <div className="camera-icon" onClick={handleImageClick}>
                    <FaCamera />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </div>
              </Col>
            </Row>
            <Form
              className="form-horizontal"
              onSubmit={(e) => {
                e.preventDefault();
                profileValidation.handleSubmit();
              }}
            >
              <Row>
                {/* Username */}
                <Col md={4}>
                  <FormGroup>
                    <Label>Username</Label>
                    <Input
                      name="name"
                      type="text"
                      placeholder="Username"
                      onChange={profileValidation.handleChange}
                      onBlur={profileValidation.handleBlur}
                      value={profileValidation.values.name}
                      invalid={
                        profileValidation.touched.name &&
                        profileValidation.errors.name
                      }
                    />
                    <FormFeedback>{profileValidation.errors.name}</FormFeedback>
                  </FormGroup>
                </Col>

                {/* Email */}
                <Col md={4}>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      onChange={profileValidation.handleChange}
                      onBlur={profileValidation.handleBlur}
                      value={profileValidation.values.email}
                      invalid={
                        profileValidation.touched.email &&
                        profileValidation.errors.email
                      }
                    />
                    <FormFeedback>{profileValidation.errors.email}</FormFeedback>
                  </FormGroup>
                </Col>

                {/* Phone */}
                <Col md={4}>
                  <FormGroup>
                    <Label>Phone</Label>
                    <Input
                      name="phone"
                      type="text"
                      placeholder="Phone Number"
                      onChange={profileValidation.handleChange}
                      onBlur={profileValidation.handleBlur}
                      value={profileValidation.values.phone}
                      invalid={
                        profileValidation.touched.phone &&
                        profileValidation.errors.phone
                      }
                    />
                    <FormFeedback>{profileValidation.errors.phone}</FormFeedback>
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                {/* Gender */}
                <Col md={4}>
                  <FormGroup>
                    <Label>Gender</Label>
                    <Input
                      type="select"
                      name="gender"
                      onChange={profileValidation.handleChange}
                      onBlur={profileValidation.handleBlur}
                      value={profileValidation.values.gender}
                      invalid={
                        profileValidation.touched.gender &&
                        profileValidation.errors.gender
                      }
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Input>
                    <FormFeedback>{profileValidation.errors.gender}</FormFeedback>
                  </FormGroup>
                </Col>
                <Col md={8}>
                  <FormGroup>
                    <Label>Address</Label>
                    <Input
                      name="address"
                      type="text"
                      placeholder="Address"
                      onChange={profileValidation.handleChange}
                      onBlur={profileValidation.handleBlur}
                      value={profileValidation.values.address}
                      invalid={
                        profileValidation.touched.address &&
                        profileValidation.errors.address
                      }
                    />
                    <FormFeedback>{profileValidation.errors.address}</FormFeedback>
                  </FormGroup>
                </Col>

                {/* Profile Image */}
                {/* <Col md={4}>
                  <FormGroup>
                    <Label>Profile Image</Label>
                    <Input
                      name="profile_image"
                      type="file"
                      onChange={(event) => {
                        profileValidation.setFieldValue("profile_image", event.currentTarget.files[0]);
                      }}
                      invalid={
                        profileValidation.touched.profile_image &&
                        profileValidation.errors.profile_image
                      }
                    />
                    <FormFeedback>{profileValidation.errors.profile_image}</FormFeedback>
                  </FormGroup>
                </Col> */}
              </Row>
              <div className="text-center mt-3">
                <Button type="submit" color="success">Update Profile</Button>
              </div>
            </Form>
          </CardBody>
        </Card>




        {/* 🔐 Change Password Form */}
        <Card>
          <CardBody>
            <h5 className="mb-3">Change Password</h5>
            <Form
              className="form-horizontal"
              onSubmit={(e) => {
                e.preventDefault();
                passwordValidation.handleSubmit();
              }}
            >
              <Row>
                <Col md={4}>
                  <FormGroup>
                    <Label>Current Password</Label>
                    <Input
                      name="currentPassword"
                      type="password"
                      placeholder="Current Password"
                      onChange={passwordValidation.handleChange}
                      onBlur={passwordValidation.handleBlur}
                      value={passwordValidation.values.currentPassword}
                      invalid={
                        passwordValidation.touched.currentPassword &&
                        passwordValidation.errors.currentPassword
                      }
                    />
                    <FormFeedback>{passwordValidation.errors.currentPassword}</FormFeedback>
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup>
                    <Label>New Password</Label>
                    <Input
                      name="newPassword"
                      type="password"
                      placeholder="New Password"
                      onChange={passwordValidation.handleChange}
                      onBlur={passwordValidation.handleBlur}
                      value={passwordValidation.values.newPassword}
                      invalid={
                        passwordValidation.touched.newPassword &&
                        passwordValidation.errors.newPassword
                      }
                    />
                    <FormFeedback>{passwordValidation.errors.newPassword}</FormFeedback>
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup>
                    <Label>Confirm New Password</Label>
                    <Input
                      name="confirmNewPassword"
                      type="password"
                      placeholder="Confirm Password"
                      onChange={passwordValidation.handleChange}
                      onBlur={passwordValidation.handleBlur}
                      value={passwordValidation.values.confirmNewPassword}
                      invalid={
                        passwordValidation.touched.confirmNewPassword &&
                        passwordValidation.errors.confirmNewPassword
                      }
                    />
                    <FormFeedback>{passwordValidation.errors.confirmNewPassword}</FormFeedback>
                  </FormGroup>
                </Col>
              </Row>

              <div className="text-center mt-3">
                <Button type="submit" color="primary">Change Password</Button>
              </div>
            </Form>
          </CardBody>
        </Card>



      </Container>
    </div>
  );
};

export default ChangePassword;
