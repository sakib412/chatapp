/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import OutsideClickHandler from 'react-outside-click-handler';
import { useState } from "react"
import axiosInstance from '../../utils/axios';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

function Topbar(props) {
    // let [visible, setVisible] = useState(false);
    let [isMenuOpen, setIsMenuOpen] = useState(false);
    // let [isOpen, setOpen] = useState(false)
    const router = useRouter();

    const logout = () => {
        axiosInstance.get("/auth/logout/")
            .then((response) => {
                toast.success("Logged out");
                router.push("/login");

            })
            .catch((err) => {
                console.log(err.response);
                toast.error("Failed to logout")
            });
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
            <div className="container _custom_container">
                <ul className="_nav_list">
                    <li className="_nav_form_list">
                        <Link className="_nav_form_list_link" href="/">
                            <a>Chat App</a>
                        </Link>
                    </li>
                </ul>
                <button className="navbar-toggler bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"> <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
                        <li className="nav-item _header_nav_item">
                            <Link href="/">
                                <a className="nav-link _header_nav_link" aria-current="page">
                                    <svg xmlns="http://www.w3.org/2000/svg" width={23} height={22} fill="none" viewBox="0 0 23 22">
                                        <path fill="#000" fillOpacity=".6" fillRule="evenodd" d="M11.43 0c2.96 0 5.743 1.143 7.833 3.22 4.32 4.29 4.32 11.271 0 15.562C17.145 20.886 14.293 22 11.405 22c-1.575 0-3.16-.33-4.643-1.012-.437-.174-.847-.338-1.14-.338-.338.002-.793.158-1.232.308-.9.307-2.022.69-2.852-.131-.826-.822-.445-1.932-.138-2.826.152-.44.307-.895.307-1.239 0-.282-.137-.642-.347-1.161C-.57 11.46.322 6.47 3.596 3.22A11.04 11.04 0 0111.43 0zm0 1.535A9.5 9.5 0 004.69 4.307a9.463 9.463 0 00-1.91 10.686c.241.592.474 1.17.474 1.77 0 .598-.207 1.201-.39 1.733-.15.439-.378 1.1-.231 1.245.143.147.813-.085 1.255-.235.53-.18 1.133-.387 1.73-.391.597 0 1.161.225 1.758.463 3.655 1.679 7.98.915 10.796-1.881 3.716-3.693 3.716-9.7 0-13.391a9.5 9.5 0 00-6.74-2.77zm4.068 8.867c.57 0 1.03.458 1.03 1.024 0 .566-.46 1.023-1.03 1.023a1.023 1.023 0 11-.01-2.047h.01zm-4.131 0c.568 0 1.03.458 1.03 1.024 0 .566-.462 1.023-1.03 1.023a1.03 1.03 0 01-1.035-1.024c0-.566.455-1.023 1.025-1.023h.01zm-4.132 0c.568 0 1.03.458 1.03 1.024 0 .566-.462 1.023-1.03 1.023a1.022 1.022 0 11-.01-2.047h.01z" clipRule="evenodd" />
                                    </svg>
                                    <span className="_counting">2</span>
                                </a>
                            </Link>
                        </li>
                    </ul>
                    <OutsideClickHandler
                        onOutsideClick={() => {
                            setIsMenuOpen(isMenuOpen = false);
                        }}
                    >
                        <div className="_header_nav_profile">
                            <div className="_header_nav_profile_image">
                                <img src="assets/images/profile.png" alt="profile" className="_nav_profile_img" />
                            </div>
                            <div onClick={() => setIsMenuOpen(!isMenuOpen)} className="_header_nav_dropdown">
                                <p className="_header_nav_para">{props?.user?.username}</p>
                                <button id="_profile_drop_show_btn" className="_header_nav_dropdown_btn _dropdown_toggle" type="button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width={10} height={6} fill="none" viewBox="0 0 10 6">
                                        <path fill="#112032" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
                                    </svg>
                                </button>
                            </div>
                            {/* dropdown */}
                            {isMenuOpen && (
                                <div id="_prfoile_drop" className="_nav_profile_dropdown">

                                    <ul className="_nav_dropdown_list pt-2">
                                        <li className="_nav_dropdown_list_item">
                                            <span role="button" className="_nav_dropdown_link" onClick={logout}>
                                                <div className="_nav_drop_info">
                                                    <span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={19} height={19} fill="none" viewBox="0 0 19 19">
                                                            <path stroke="#377DFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.667 18H2.889A1.889 1.889 0 011 16.111V2.89A1.889 1.889 0 012.889 1h3.778M13.277 14.222L18 9.5l-4.723-4.722M18 9.5H6.667" />
                                                        </svg>
                                                    </span>
                                                    Log Out
                                                </div>
                                                <button type="submit" className="_nav_drop_btn_link">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={6} height={10} fill="none" viewBox="0 0 6 10">
                                                        <path fill="#112032" d="M5 5l.354.354L5.707 5l-.353-.354L5 5zM1.354 9.354l4-4-.708-.708-4 4 .708.708zm4-4.708l-4-4-.708.708 4 4 .708-.708z" opacity=".5" />
                                                    </svg>
                                                </button>
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </OutsideClickHandler>
                </div>
            </div>
        </nav>
    )
}
export default Topbar;