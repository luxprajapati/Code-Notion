import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
// import logo from "../../assets/Logo/Logo-Full-Light.png";
import logo from "../../assets/Logo/CN-Full-Logo-Light.png";
import { NavbarLinks } from "../../data/navbar-links";
import { matchPath, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineShoppingCart } from "react-icons/ai";
import ProfileDropdown from "../core/Auth/ProfileDropdown";
import { apiConnector } from "../../services/apiconnector";
import { categories } from "../../services/apis";
import { BsChevronDown } from "react-icons/bs";
import { AiOutlineMenu } from "react-icons/ai";

const Navbar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCategory() {
      setLoading(true);
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        setSubLinks(res.data.data);
        // console.log("SubLinks: -", res.data.data);
      } catch (error) {
        console.log("Could not fetch Categories.", error);
      }
      setLoading(false);
    }
    fetchCategory();
  }, []);
  // console.log("SubLinks: -", subLinks);

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  return (
    <div className="flex h-14 items-center justify-center border-b-[1px] border-b-richblack-700">
      <div className="w-11/12 max-w-maxContent flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/">
          <img
            src={logo}
            alt="Logo"
            width={160}
            height={42}
            loading="lazy"
            className="scale-110"
          />
        </NavLink>
        {/*Navbar Links */}
        <nav className="hidden md:block">
          <ul className="flex gap-x-6 text-richblack-25">
            {NavbarLinks.map((link, index) => {
              return (
                <li key={index}>
                  {link.title === "Catalog" ? (
                    <>
                      <div
                        className={`group relative flex cursor-pointer items-center gap-1 ${
                          matchRoute("/catalog/:catalogName")
                            ? "text-yellow-25"
                            : "text-richblack-25"
                        }`}
                      >
                        <p>{link.title}</p>
                        <BsChevronDown />
                        <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[200px] translate-x-[-50%] translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]">
                          <div className="absolute left-[50%] top-0 -z-10 h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                          {loading ? (
                            <p className="text-center">Loading...</p>
                          ) : subLinks && subLinks.length ? (
                            <>
                              {subLinks
                                ?.filter(
                                  (subLink) => subLink?.courses?.length > 0
                                )
                                ?.map((subLink, i) => (
                                  <NavLink
                                    to={`/catalog/${subLink.name
                                      .split(" ")
                                      .join("-")
                                      .toLowerCase()}`}
                                    className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                                    key={i}
                                  >
                                    <p>{subLink.name}</p>
                                  </NavLink>
                                ))}
                            </>
                          ) : (
                            <p className="text-center">No Courses Found</p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <NavLink to={link.path}>
                      <p
                        className={`${matchRoute(link.path) ? "text-yellow-25" : "text-richblack-25"}`}
                      >
                        {link.title}
                      </p>
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* login, sigup, dashboard */}
        {/* Something is pending */}
        <div className="hidden md:flex gap-x-4 items-center">
          {user && user.accountType === "Student" && (
            <NavLink to="/dashboard/cart" className={"relative pr-2"}>
              <AiOutlineShoppingCart className="text-2xl text-richblack-100 " />
              {totalItems > 0 && (
                <span className="absolute -bottom-2 -right-0 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-richblack-600 text-center text-xs font-bold text-yellow-100">
                  {totalItems}
                </span>
              )}
            </NavLink>
          )}
          {token === null && (
            <NavLink to="/login">
              <button className="border  border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md hover:scale-95 transition-all duration-200">
                Log in
              </button>
            </NavLink>
          )}
          {token === null && (
            <NavLink to="/signup">
              <button className="border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100 rounded-md hover:scale-95 transition-all duration-200">
                Sign Up
              </button>
            </NavLink>
          )}
          {token !== null && <ProfileDropdown user={user} />}
        </div>
        {/*  */}
        <button
          className="mr-4 md:hidden"
          onClick={() =>
            alert(
              "We are working on this website to make more user friendly for mobile users. Please visit us on desktop for better experience. Thank you!"
            )
          }
        >
          <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
