/* eslint-disable @next/next/no-img-element */
import React, { Fragment, useState } from 'react';
import moment from 'moment';


function OtherMessage({ message }) {

    let [visible, setVisible] = useState(false);

    return (
        <Fragment key={message?.id}>
            <div className="_chat_middle_box_sender">
                <div className="chat_middle_box_image">
                    <img src="assets/images/chat_profile.png" alt="chat profile" className="_chat_profile_img" />
                </div>
                <div className="_chat_middle_message">

                    {message.archived ? (
                        <div className='border border-dark px-3 py-2 rounded-pill ms-2'>
                            deleted
                        </div>
                    ) : (
                        <div className="_chat_middle_box_sender_txt">
                            <p className="_chat_middle_box_sender_txt_para">{message?.text}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="_chat_middle_box_time mb-3"> <span className="_chat_middle_box_time_txt"><svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 16 16">
                <circle cx={8} cy={8} r="7.5" stroke="#707584" />
                <path stroke="#707584" strokeLinecap="round" d="M12 9H8.25A.25.25 0 018 8.75V5" />
            </svg>
                {
                    moment(message.timestamp).fromNow()
                }

            </span>
            </div>

        </Fragment>);
}

export default OtherMessage;
