import React, { useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { hasPermission } from "../../helpers/auth";

// //Import Scrollbar
import SimpleBar from "simplebar-react";
// MetisMenu
import MetisMenu from "metismenujs";
import withRouter from "components/Common/withRouter";

//i18n
import { withTranslation } from "react-i18next";

const SidebarContent = props => {
  const ref = useRef();
  const activateParentDropdown = useCallback((item) => {
    item.classList.add("active");
    const parent = item.parentElement;
    const parent2El = parent.childNodes[1];

    if (parent2El && parent2El.id !== "side-menu") {
      parent2El.classList.add("mm-show");
    }

    if (parent) {
      parent.classList.add("mm-active");
      const parent2 = parent.parentElement;

      if (parent2) {
        parent2.classList.add("mm-show"); // ul tag

        const parent3 = parent2.parentElement; // li tag

        if (parent3) {
          parent3.classList.add("mm-active"); // li
          parent3.childNodes[0].classList.add("mm-active"); //a
          const parent4 = parent3.parentElement; // ul
          if (parent4) {
            parent4.classList.add("mm-show"); // ul
            const parent5 = parent4.parentElement;
            if (parent5) {
              parent5.classList.add("mm-show"); // li
              parent5.childNodes[0].classList.add("mm-active"); // a tag
            }
          }
        }
      }
      scrollElement(item);
      return false;
    }
    scrollElement(item);
    return false;
  }, []);

  const removeActivation = (items) => {
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      const parent = items[i].parentElement;

      if (item && item.classList.contains("active")) {
        item.classList.remove("active");
      }
      if (parent) {
        const parent2El =
          parent.childNodes && parent.childNodes.lenght && parent.childNodes[1]
            ? parent.childNodes[1]
            : null;
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.remove("mm-show");
        }

        parent.classList.remove("mm-active");
        const parent2 = parent.parentElement;

        if (parent2) {
          parent2.classList.remove("mm-show");

          const parent3 = parent2.parentElement;
          if (parent3) {
            parent3.classList.remove("mm-active"); // li
            parent3.childNodes[0].classList.remove("mm-active");

            const parent4 = parent3.parentElement; // ul
            if (parent4) {
              parent4.classList.remove("mm-show"); // ul
              const parent5 = parent4.parentElement;
              if (parent5) {
                parent5.classList.remove("mm-show"); // li
                parent5.childNodes[0].classList.remove("mm-active"); // a tag
              }
            }
          }
        }
      }
    }
  };

  const path = useLocation();
  const activeMenu = useCallback(() => {
    const pathName = path.pathname;
    let matchingMenuItem = null;
    const ul = document.getElementById("side-menu");
    const items = ul.getElementsByTagName("a");
    removeActivation(items);

    for (let i = 0; i < items.length; ++i) {
      if (pathName === items[i].pathname) {
        matchingMenuItem = items[i];
        break;
      }
    }
    if (matchingMenuItem) {
      activateParentDropdown(matchingMenuItem);
    }
  }, [path.pathname, activateParentDropdown]);

  useEffect(() => {
    ref.current.recalculate();
  }, []);

  useEffect(() => {
    new MetisMenu("#side-menu");
    activeMenu();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    activeMenu();
  }, [activeMenu]);

  function scrollElement(item) {
    if (item) {
      const currentPosition = item.offsetTop;
      if (currentPosition > window.innerHeight) {
        ref.current.getScrollElement().scrollTop = currentPosition - 300;
      }
    }
  }

  return (
    <React.Fragment>
      <SimpleBar className="h-100" ref={ref}>
        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">

            <li className="menu-title">{props.t("Menu")} </li>
            <li>
              <Link to="/#">
                <i className="bx bx-home-circle"></i>
                <span>{props.t("Dashboards")}</span>
              </Link>
            </li>
            {/* <li>
              <Link to="/blog-grid">
                <i className='bx bx-news'></i>
                <span>{props.t("News Updates")}</span>
              </Link>
            </li> */}
            {(hasPermission("news")) && (
              <li>
                <Link to="/#" className={`has-arrow${path.pathname === "/news-list" ? " active" : ""}`}>
                  <i className="bx  bxs-detail"></i>
                  <span key="t-jobs">{props.t("News")}</span>
                </Link>
                <ul className="sub-menu">
                  <li><Link to="/news-list">{props.t("News List")}</Link></li>
                  <li><Link to="/news-categories">{props.t("News categories")}</Link></li>
                </ul>
              </li>
            )}

            {/* <li>
              <Link to="/#" className={`has-arrow${path.pathname === "/news-list" ? " active" : ""}`}>
                <i className="bx  bxs-detail"></i>
                <span key="t-jobs">{props.t("News")}</span>
              </Link>
              <ul className="sub-menu">
                <li><Link to="/news-list">{props.t("News List")}</Link></li>
                <li><Link to="/news-categories">{props.t("News categories")}</Link></li>
              </ul>
            </li> */}

            {(hasPermission("jobs")) && (
              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-briefcase-alt"></i>
                  <span key="t-jobs">{props.t("Jobs")}</span>
                </Link>
                <ul className="sub-menu">
                  <li><Link to="/job-list">{props.t("Job List")}</Link></li>
                  <li><Link to="/job-categories">{props.t("Jobs Categories")}</Link></li>
                </ul>
              </li>
            )}
            {(hasPermission("event")) && (
              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-calendar-event"></i>
                  <span key="t-jobs">{props.t("Event")}</span>
                </Link>
                <ul className="sub-menu">
                  <li><Link to="/event-list">{props.t("Event List")}</Link></li>
                  <li><Link to="/event-categories">{props.t("Event Categories")}</Link></li>
                </ul>
              </li>
            )}
            {(hasPermission("park")) && (
              <li>
                <Link to="/#" className="has-arrow  ">
                  <i className="bx bxs-parking"></i>
                  <span key="t-Parks">{props.t("Parks & Recreation")}</span>
                </Link>
                <ul className="sub-menu">
                  <li>
                    <Link to="/park-recreation-content">
                      {props.t("Parks & Recreation Content")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/parks-recreation-list">
                      {props.t("Parks & Recreation List")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/parks-recreation-categories">
                      {props.t("Parks & Recreation Categories")}
                    </Link>
                  </li>
                </ul>
              </li>
            )}
            {(hasPermission("recycling")) && (
              <li>
                <Link to="/#" className="has-arrow">
                  <i className="bx bx-recycle"></i>
                  <span>{props.t("Recycling & Garbage")}</span>
                </Link>
                <ul className="sub-menu">
                  <li>
                    <Link to="/recycling-garbage-content">{props.t("Recycling & Garbage Content")}</Link>
                  </li>
                  <li>
                    <Link to="/recycling-garbage-list">
                      {props.t("Recycling & Garbage List")}
                    </Link>
                  </li>
                </ul>
              </li>
            )}

            {(hasPermission("pages")) && (
              <li>
                <Link to="/#" className="has-arrow" >
                  <i className='bx bx-cog'></i>
                  <span>{props.t("Pages")}</span>
                </Link>
                <ul className="sub-menu">
                  <li>
                    <Link to="/page-List">{props.t("Page List")}</Link>
                  </li>
                  <li>
                    <Link to="/page-categories">{props.t("Page Categories")}</Link>
                  </li>
                </ul>
              </li>
            )}
            {(hasPermission("administration")) && (
              <li>
                <Link to="/#" className="has-arrow" >
                  <i className='bx bx-user-circle'></i>
                  <span>{props.t("Administration")}</span>
                </Link>
                <ul className="sub-menu">
                  <li>
                    <Link to="/manage-admin">{props.t("Manage Admin")}</Link>
                  </li>
                  <li>
                    <Link to="/role-category">{props.t("Roles")}</Link>
                  </li>

                </ul>
              </li>
            )}


            {(hasPermission("notification")) && (
              <li>
                <Link to="/push-notification" >
                  <i className="bx bxs-bell"></i>
                  <span>{props.t("Push Notifications")}</span>
                </Link>
              </li>
                 )}
            {/* <li>
              <Link to="/calendar" className="has-arrow" >
                <i className='bx bxs-user-account'></i>
                <span>{props.t("Admin Access")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/blog">{props.t("Blog")}</Link>
                </li>
                <li>
                  <Link to="/dashboard-job">
                    {props.t("Job")}
                  </Link>
                </li>
              </ul>
            </li> */}
            <li>
              <Link to="/calendar" className="has-arrow" >
                <i className='bx bx-cog'></i>
                <span>{props.t("Settings")}</span>
              </Link>
              <ul className="sub-menu">
                <li>
                  <Link to="/profile">{props.t("Profile Update")}</Link>
                </li>
                <li>
                  <Link to="/logout">
                    {props.t("Logout")}
                  </Link>
                </li>
              </ul>
            </li>
          </ul>

        </div>
      </SimpleBar>
    </React.Fragment>
  );
};

SidebarContent.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
};

export default withRouter(withTranslation()(SidebarContent));
