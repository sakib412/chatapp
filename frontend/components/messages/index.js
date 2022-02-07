/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-img-element */
import React, { Fragment, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import OutsideClickHandler from 'react-outside-click-handler';
import InputEmoji from "react-input-emoji";
import OwnMessage from './own';
import OtherMessage from './other';


function Messages({ convid, user, chatuser }) {
    let [isMenuShow, setMenuShow] = useState(false);

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [firstRenderDone, setFirstRenderDone] = useState(false);

    const chatBottom = useRef(null);
    let socket = useRef(null);



    useEffect(() => {
        if (socket.current) {

            socket.current.close();
        }
        socket.current = new WebSocket(`ws://localhost:8000/ws/chat/${convid}/`);

        // Connection opened
        socket?.current?.addEventListener('open', function (event) {
            // socket.send(JSON.stringify({ message: 'Hello Server!' }));
        });

        socket.current.onclose = event => {
            console.log("Connection closed");
        }


        // Listen for possible errors
        socket?.current?.addEventListener('error', function (event) {
            console.log('WebSocket error: ');
        });
        setFirstRenderDone(true);

    }, [convid]);



    useEffect(() => {
        if (socket.current) {
            socket.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("message on message");

                if (data?.type == "error") {
                    console.log("error ");
                }

                if (data?.type == "all") {
                    setMessages(data.results)
                    chatBottom?.current?.scrollIntoView({ block: "end" });
                }
                if (data?.type == "individual") {
                    setMessages([...messages, data.results]);
                    // message read.
                    if (user?.id != data.results.sender) {
                        socket.current.send(JSON.stringify({
                            messageID: data.results.id,
                            conv_id: data.results?.conv_id,
                            type: "read",
                        }))
                    }
                }
                if (data?.type == 'delete') {
                    setMessages(messages.map((item) => {
                        return item.id === data.results.id ? data.results : item;
                    }))
                }
                chatBottom?.current?.scrollIntoView({ behavior: 'smooth', block: "end" });

            }
        }

    }, [messages, convid, user?.id]);



    function handleOnEnter(text) {
        if (text) {
            socket?.current.send(JSON.stringify({
                type: "new",
                message: text
            }));
            setText("");
        }
    }

    const onSendMsg = (e) => {
        e.preventDefault();
        if (text) {
            socket?.current.send(JSON.stringify({
                type: "new",
                message: text
            }));
            setText("")
        }

    }
    const onDelete = (id) => {
        socket.current?.send(JSON.stringify({
            messageID: id,
            type: "delete"
        }))

    }

    return (
        <div className="col-xxl-8 col-xl-7 col-lg-6 col-md-12 col-sm-12  _layout_chat">
            <div className="_chat_right">
                <div className="_chat_right_top_inner _padd_b8 _padd_t24 _padd_l24 _padd_r24">
                    <div className="_chat_right_top_inner_box">
                        <div className="_chat_right_top_inner_box_image">
                            <img src="assets/images/chat_profile.png" alt="chat" className="_chat_profile_img" />
                        </div>
                        <div className="_chat_right_top_inner_box_txt">
                            <h4 className="_chat_right_top_inner_box_txt_title _title4">{chatuser?.username}</h4>
                            {/* <p className="_chat_right_top_inner_box_txt_para">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12"><path fill="#0ACF83" stroke="#fff" d="M11.5 6a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"></path></svg> Online
                            </p> */}
                        </div>
                    </div>
                    <div className="_chat_right_top_inner_icon">
                        <div className="_chat_inner_top_icon">
                            <button type="button" className="_chat_inner_top_icon_link">
                                <svg xmlns="http://www.w3.org/2000/svg" width={27} height={16} fill="none" viewBox="0 0 27 16">
                                    <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" d="M20.129 10.802l4.615 3.248A.893.893 0 0026 13.234V2.479a.894.894 0 00-1.256-.816L20.13 4.911a.894.894 0 00-.379.73v4.43a.893.893 0 00.379.73z" />
                                    <path stroke="#1890FF" strokeMiterlimit={10} d="M14.17 15H3.902A2.91 2.91 0 011 12.098V3.616A2.91 2.91 0 013.902.714h10.294a2.884 2.884 0 012.875 2.875v8.51A2.91 2.91 0 0114.17 15z" />
                                </svg>
                            </button>
                            <div className="_chat_card_hover">
                                <a href='/'>start video call</a>
                            </div>
                        </div>
                        <div className="_chat_inner_top_icon">
                            <button type="button" className="_chat_inner_top_icon_link">
                                <svg xmlns="http://www.w3.org/2000/svg" width={17} height={16} fill="none" viewBox="0 0 17 16">
                                    <g clipPath="url(#clip0_174:1173)">
                                        <path fill="#1890FF" d="M13.435 9.911c-.348-.34-.768-.523-1.213-.523-.441 0-.865.179-1.227.52L9.86 10.972c-.093-.048-.186-.091-.276-.135a4.624 4.624 0 01-.355-.18c-1.062-.634-2.028-1.462-2.953-2.532-.449-.534-.75-.983-.969-1.439.294-.253.567-.516.832-.77l.302-.287c.753-.709.753-1.627 0-2.336l-.98-.922a14.503 14.503 0 01-.333-.321 16.5 16.5 0 00-.675-.628C4.106 1.098 3.69.925 3.252.925c-.438 0-.861.173-1.22.497l-.007.007-1.22 1.158c-.46.432-.721.959-.779 1.57-.086.986.223 1.905.46 2.506.581 1.475 1.45 2.843 2.745 4.309a16.78 16.78 0 005.622 4.143c.825.368 1.927.804 3.157.878.076.004.155.007.226.007.83 0 1.525-.28 2.07-.838.004-.006.011-.01.015-.016.187-.213.402-.406.628-.612.154-.138.312-.283.466-.435.356-.348.542-.753.542-1.169 0-.418-.19-.82-.553-1.158l-1.97-1.86zm1.284 3.556c-.003 0-.003.004 0 0-.14.142-.283.27-.438.412a9.17 9.17 0 00-.692.676c-.362.364-.79.537-1.35.537-.053 0-.11 0-.164-.004-1.066-.064-2.056-.456-2.799-.79a15.839 15.839 0 01-5.296-3.904C2.757 9.006 1.94 7.724 1.397 6.345 1.063 5.505.941 4.85.995 4.231c.036-.395.198-.722.495-1.003l1.224-1.151c.176-.155.362-.24.545-.24.226 0 .41.129.524.237l.01.01c.22.192.428.391.647.604.11.108.226.216.34.328l.98.922c.38.358.38.689 0 1.046-.104.098-.204.196-.309.29-.3.291-.588.561-.9.825-.007.007-.014.01-.018.017-.309.29-.251.574-.187.766l.011.03c.255.582.614 1.129 1.16 1.78l.003.004c.99 1.148 2.034 2.043 3.186 2.728.147.088.298.159.441.226.13.061.251.119.355.18.015.006.029.016.043.023a.817.817 0 00.356.085c.297 0 .484-.176.545-.234l1.227-1.154c.122-.115.316-.254.542-.254.222 0 .405.132.517.247l.007.007 1.977 1.86c.37.345.37.7.003 1.057zM9.186 3.806c.94.149 1.794.567 2.476 1.209a4.226 4.226 0 011.284 2.33c.04.223.244.378.477.378.029 0 .054-.003.083-.007a.46.46 0 00.398-.526 5.113 5.113 0 00-1.554-2.82 5.658 5.658 0 00-2.996-1.462c-.265-.04-.513.125-.56.371a.454.454 0 00.392.527zM16.98 7.058c-.32-1.763-1.202-3.367-2.558-4.643A9.309 9.309 0 009.488.007a.48.48 0 00-.556.371c-.043.25.133.483.399.527a8.335 8.335 0 014.41 2.151c1.212 1.142 2.001 2.577 2.285 4.15.04.223.244.379.477.379.029 0 .054-.004.082-.007a.451.451 0 00.395-.52z" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_174:1173">
                                            <path fill="#fff" d="M0 0h17v16H0z" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </button>
                            <div className="_chat_card_hover">
                                <a href='#'>start audio call</a>
                            </div>
                        </div>
                        <OutsideClickHandler
                            onOutsideClick={() => {
                                setMenuShow(isMenuShow = false);
                            }}
                        >
                            <div onClick={() => setMenuShow(!isMenuShow)} className="_chat_inner_top_icon" style={{ position: "relative" }}>
                                <a href="#" className="_chat_top_link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width={4} height={16} fill="none" viewBox="0 0 4 16">
                                        <circle cx={2} cy={2} r={2} fill="#171515" />
                                        <circle cx={2} cy={8} r={2} fill="#171515" />
                                        <circle cx={2} cy={14} r={2} fill="#171515" />
                                    </svg>
                                </a>
                                {isMenuShow &&
                                    <div className="_top_inner_dropdown _nav_profile_dropdown"
                                    >
                                        <ul className="_top_inner_dropdown_list">
                                            <li className="_top_inner_dropdown_item text-center mb-2">
                                                <Link href="/profile" className="_top_inner_dropdown_link btn">

                                                    <a style={{ fontWeight: "600" }}>
                                                        <div className="_chat_right_top_inner_box_image d-flex justify-content-center mb-1">
                                                            <img src="assets/images/chat_profile.png" alt="chat" className="_chat_profile_img" />
                                                        </div>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 22 30" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={8} r={4} /></svg>
                                                        <span >View profile</span>
                                                    </a>
                                                </Link>
                                            </li>
                                            <li className="_top_inner_dropdown_item">
                                                <button type="button" className="_top_inner_dropdown_link btn ">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 22 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-headphones"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg> Audio call
                                                </button>
                                            </li>
                                            <li className="_top_inner_dropdown_item">
                                                <button type="button" className="_top_inner_dropdown_link btn">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 22 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-video"><polygon points="23 7 16 12 23 17 23 7" /><rect x={1} y={5} width={15} height={14} rx={2} ry={2} /></svg> Video call
                                                </button>
                                            </li>
                                            <li className="_top_inner_dropdown_item">
                                                <button type="button" className="_top_inner_dropdown_link btn">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 22 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-user-minus"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy={7} r={4} /><line x1={23} y1={11} x2={17} y2={11} /></svg> Block
                                                </button>
                                            </li>
                                            <li className="_top_inner_dropdown_item">
                                                <button type="button" className="_top_inner_dropdown_link btn">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 22 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-alert-triangle"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1={12} y1={9} x2={12} y2={13} /><line x1={12} y1={17} x2="12.01" y2={17} /></svg> Somethings wrong
                                                </button>
                                            </li>
                                            <li className="_top_inner_dropdown_item">
                                                <button type="button" className="_top_inner_dropdown_link btn">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 22 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1={10} y1={11} x2={10} y2={17} /><line x1={14} y1={11} x2={14} y2={17} /></svg> Delete chat
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                }
                            </div>
                        </OutsideClickHandler>
                    </div>
                </div>
                <hr className="_border1" />
                <div className="_chat_middle_box  _padd_b24 _padd_t24 _padd_l24 _padd_r24">
                    {messages?.map((message) => message.sender == user.id ?
                        (
                            <OwnMessage message={message} key={message.id} ondelete={onDelete} />
                        )

                        : (
                            <OtherMessage message={message} key={message.id} />
                        )
                    )}
                    <div ref={chatBottom} />

                </div>
                <div className="_chat_right_bottom_inner _padd_b24 _padd_t24 _padd_l24 _padd_r24">
                    <form onSubmit={onSendMsg}>
                        <div className="_chat_right_bottom_inner_box">
                            <div className="chat_bottom_textarea">
                                <InputEmoji
                                    value={text}
                                    onChange={setText}
                                    onEnter={handleOnEnter}
                                    placeholder="Type a message"
                                />
                            </div>
                            <div className="_chat_bottom_icon">
                                <div className="_chat_bottom_icon_list">
                                    <button className="_chat_bottom_icon_link" type="button">
                                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={10} fill="none" viewBox="0 0 20 10">
                                            <path stroke="#1890FF" strokeLinecap="round" strokeLinejoin="round" d="M8 9H5a4 4 0 01-4-4v0a4 4 0 014-4h3M14 5H6M12 9h3a4 4 0 004-4v0a4 4 0 00-4-4h-3" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="_chat_bottom_icon_list">
                                    <button className="_chat_bottom_icon_link _chat_bottom_icon_link1" type="submit">Send</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>);
}

export default Messages;
