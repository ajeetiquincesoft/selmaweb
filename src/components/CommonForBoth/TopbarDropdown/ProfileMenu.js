import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import withRouter from "components/Common/withRouter";
import axios from "axios"; // ✅ Missing import
import BASE_URL from "path";
import user1 from "../../../assets/images/users/avatar-1.jpg";

const ProfileMenu = (props) => {
  const [menu, setMenu] = useState(false);
  const [username, setUsername] = useState("Admin");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/auth/getauthuser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = response.data;
      setProfileImage(userData.meta.profile_pic);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      const obj = JSON.parse(storedUser);
      if (process.env.REACT_APP_DEFAULTAUTH === "firebase") {
        setUsername(obj.displayName);
      } else if (
        process.env.REACT_APP_DEFAULTAUTH === "fake" ||
        process.env.REACT_APP_DEFAULTAUTH === "jwt"
      ) {
        setUsername(obj.username);
      }
    }
  }, [props.success]);

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item"
          id="page-header-user-dropdown"
          tag="button"
        >
          <img
            className="rounded-circle header-profile-user"
            src={profileImage || user1}
            alt="Header Avatar"
          />
          <span className="d-none d-xl-inline-block ms-2 me-1">
            {username}
          </span>
          <i className="mdi mdi-chevron-down d-none d-xl-inline-block" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem tag="a" href="/profile">
            <i className="bx bx-user font-size-16 align-middle me-1" />
            {props.t("Profile")}
          </DropdownItem>
          <DropdownItem tag="a" href="#">
            <span className="badge bg-success float-end">11</span>
            <i className="bx bx-wrench font-size-16 align-middle me-1" />
            {props.t("Settings")}
          </DropdownItem>
          <div className="dropdown-divider" />
          <Link to="/logout" className="dropdown-item">
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            <span>{props.t("Logout")}</span>
          </Link>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

ProfileMenu.propTypes = {
  success: PropTypes.any,
  t: PropTypes.any,
};

const mapStatetoProps = (state) => {
  const { error, success } = state.Profile;
  return { error, success };
};

export default withRouter(
  connect(mapStatetoProps, {})(withTranslation()(ProfileMenu))
);
