/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form'
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../utils/axios';

function Login() {
    const router = useRouter();
    const { handleSubmit, register, formState: { errors } } = useForm();
    const onSubmit = (data) => {
        axiosInstance.post("/user/login/", data)
            .then(({ data }) => {
                toast.success(data?.message);
                router.push("/");
            })
            .catch(({ response }) => {
                console.log(response);
                toast.error(response?.data?.message || response?.data?.detail);
            })
    }
    useEffect(() => {
        if (errors?.username) {
            toast.error(errors.username?.message)
        }
        else if (errors?.password) {
            toast.error(errors.password?.message)
        }

    }, [errors?.username, errors?.password])

    return (
        <section className="_social_login_wrapper _layout_main_wrapper">
            <ToastContainer />
            <div className="_shape_one">
                <img src="assets/images/shape1.svg" alt="profile" className="_shape_img" />
                <img src="assets/images/dark_shape.svg" alt="profile" className="_dark_shape" />
            </div>
            <div className="_shape_two">
                <img src="assets/images/shape2.svg" alt="profile" className="_shape_img" />
                <img src="assets/images/dark_shape1.svg" alt="profile" className="_dark_shape _dark_shape_opacity" />
            </div>
            <div className="_shape_three">
                <img src="assets/images/shape3.svg" alt="profile" className="_shape_img" />
                <img src="assets/images/dark_shape2.svg" alt="profile" className="_dark_shape _dark_shape_opacity" />
            </div>
            <div className="_social_login_wrap">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
                            <div className="_social_login_content">
                                <p className="_social_login_content_para _mar_b8">Welcome back</p>
                                <h4 className="_social_login_content_title _titl4 _mar_b50">Login to your account</h4>

                                <form className="_social_login_form" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="_social_login_form_input _mar_b14">
                                        <label htmlFor='username' className="_social_login_label _mar_b8">Username</label>
                                        <input
                                            {...register("username", {
                                                required: "Please input your username",
                                            })}

                                            id='username' type="text" className="form-control _social_login_input" />
                                    </div>

                                    <div className="_social_login_form_input _mar_b14">
                                        <label htmlFor='password' className="_social_login_label _mar_b8">Password</label>
                                        <input
                                            {...register("password", {
                                                required: "Please input your password",
                                            })}
                                            id='password' type="password" className="form-control _social_login_input" />
                                    </div>

                                    <div className="form-check _social_login_form_check">
                                        <input className="form-check-input _social_login_form_check_input" type="checkbox" name="flexRadioDefault" id="flexRadioDefault2" defaultChecked />
                                        <label className="form-check-label _social_login_form_check_label" htmlFor="flexRadioDefault2">Remember me</label>
                                    </div>

                                    <div className="_social_login_form_left">
                                        <p className="_social_login_form_left_para">Forgot password?</p>
                                    </div>


                                    <div className="_social_login_form_btn _mar_t40 _mar_b60">
                                        <button type="submit" className="_social_login_form_btn_link _btn1">Login</button>
                                    </div>
                                </form>
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                        <div className="_social_login_bottom_txt">
                                            <p className="_social_login_bottom_txt_para">Dont have an account?
                                                <Link href="/signup">
                                                    <a> Create New Account</a>
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
                            <div className="_social_login_left">
                                <div className="_social_login_left_image">
                                    <img src="assets/images/login.png" alt="Image" className="_left_img" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>

    )
}
export default Login;


export async function getServerSideProps({ req }) {
    // Fetch data from external API
    let data;
    try {
        const res = await axiosInstance.get("/user/me/", {
            headers: {
                Cookie: req.headers.cookie
            }
        });
        data = await res.data
    } catch (e) {
        data = null
    }

    if (data?.user?.username) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }

    }

    return { props: {} }
}