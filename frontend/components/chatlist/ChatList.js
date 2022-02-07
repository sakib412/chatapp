/* eslint-disable @next/next/no-img-element */
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axios';

function ChatList({ setConversation, convid, setchatuser, user }) {
    const socket = useRef(null);
    const [users, setUsers] = useState([]);
    const setActive = (user) => {
        if (user.conversation) {
            setConversation(user.conversation.id);
            setchatuser(user)
        }
        else {
            axiosInstance.get(`/conversation/${user.id}/`)
                .then((response) => {

                    setConversation(response.data?.results.id)
                }).catch((error) => {
                    console.log(error);
                    toast.error("try again");
                    setConversation(0);
                });
        }
    }

    useEffect(() => {
        if (!socket.current) {
            socket.current = new WebSocket("ws://localhost:8000/ws/chats/");
        }
        // Connection opened
        socket.current?.addEventListener('open', function (event) {
            // socket.send(JSON.stringify({ message: 'Hello Server!' }));
        });


        // Listen for possible errors
        socket.current?.addEventListener('error', function (event) {
            console.log('WebSocket error: ');
        });



    }, [convid]);


    useEffect(() => {
        if (socket.current) {
            socket.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log(data);
                if (data?.type == 'update') {
                    if (data.result?.initiator == user?.id) {
                        setUsers(users.map((u) => {
                            if (u.id == data?.result.receiver) {
                                u.conversation = data.result;
                                setchatuser(u);
                            }
                            return u;
                        }

                        )
                        )
                    }
                    setUsers(users.map((user) => {
                        if (user.conversation?.id === data.result.id) {
                            user.conversation = data.result;
                        }
                        return user;
                    }))

                }
                if (data?.results) {

                    setUsers(data.results);
                }
            }
        }


    }, [users, convid]);

    useEffect(() => {
        return () => {
            socket.current?.close()
        }
    }, [])

    return (
        <div className="_chat_left_bottom _chat_left_bottom_desktop">

            {users?.sort((a, b) => a.conversation?.last_msg?.timestamp < b.conversation?.last_msg?.timestamp ? 1 : -1).map((user) => (
                <div
                    onClick={() => { setActive(user) }}
                    key={user?.id}
                    className={`_chat_left_inner_box _chat_box  _padd_t24 _padd_b24 _padd_r24 _padd_l24 _mar_b8 ${user.conversation?.id === convid ? " _chat_active _chat_active_inner" : ""
                        }`}
                >
                    <div className="_chat_left_info">
                        <div className="_chat_left_inner_box_image">
                            <img src="assets/images/img4.png" alt="chat" className="_chat_img" />
                        </div>
                        <div className="_chat_left_inner_box_txt">
                            <h4
                                className={`_chat_left_inner_box_txt_title _title4`}>{user.username}</h4>
                            <p
                                className={`_chat_left_inner_box_txt_para`}> {
                                    user.conversation ?
                                        user.conversation?.last_msg?.archived ? 'deleted' : user.conversation?.last_msg?.text
                                        : "Tap here to start conversation"}</p>
                        </div>
                    </div>
                    <div className="_chat_left_inner_box_date">
                        <p className="_chat_left_inner_box_date_para ms-auto">{
                            user.conversation &&
                            moment(user.conversation?.last_msg?.timestamp).calendar()

                        }</p>
                        {
                            user.conversation?.unread?.initiator?.id == user?.id
                                && user.conversation?.unread.initiator?.count
                                ? (<p className="_chat_left_inner_box_date_txt ms-auto me-1">
                                    {user.conversation?.unread.initiator?.count}
                                </p>) :
                                null
                        }
                        {
                            user.conversation?.unread?.receiver?.id == user?.id &&
                                user.conversation?.unread.receiver?.count
                                ? (<p className="_chat_left_inner_box_date_txt ms-auto me-1">
                                    {user.conversation?.unread.receiver?.count}
                                </p>) :
                                null

                        }

                    </div>
                </div>
            ))}

        </div>);
}

export default ChatList;
