/* eslint-disable @next/next/no-img-element */
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from 'react-toastify';
import axiosInstance from '../utils/axios';

function Registration(props) {
    const { register, handleSubmit, getValues, formState: { errors } } = useForm();
    const router = useRouter();
    if (props.user) {
        router.push("/");
    }

    const onSubmit = (data) => {
        console.log(data);
        axiosInstance.post("/user/", { username: data.username, password: data.password })
            .then((response) => {
                toast.success("Registration Successful, you can login now");
                setTimeout(() => {

                    router.push("/login");
                }, 1000);
            })
            .catch((error) => {
                console.log(error.response);
                toast.error(JSON.stringify(error.response.data.message))
            })

    }
    useEffect(() => {
        if (errors?.username) {
            toast.error(errors.username?.message)
        }
        else if (errors?.password) {
            toast.error(errors.password?.message)
        }
        else if (errors?.c_password) {
            toast.error(errors.c_password?.message)
        }
    }, [errors?.username, errors?.password, errors?.c_password]);

    return (
        <section className="_social_registration_wrapper _layout_main_wrapper">
            <ToastContainer />
            <Head>
                <title>Sign Up</title>
            </Head>
            <div className="_shape_one">
                <img src="assets/images/shape1.svg" alt="chobi" className="_shape_img" />
                <img src="assets/images/dark_shape.svg" alt="chobi" className="_dark_shape" />
            </div>
            <div className="_shape_two">
                <img src="assets/images/shape2.svg" alt="chobi" className="_shape_img" />
                <img src="assets/images/dark_shape1.svg" alt="chobi" className="_dark_shape _dark_shape_opacity" />
            </div>
            <div className="_shape_three">
                <img src="assets/images/shape3.svg" alt="chobi" className="_shape_img" />
                <img src="assets/images/dark_shape2.svg" alt="chobi" className="_dark_shape _dark_shape_opacity" />
            </div>
            <div className="_social_registration_wrap">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
                            <div className="_social_registration_content">
                                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                                <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>

                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="_social_registration_form">
                                    <div className="_social_registration_form_input _mar_b14">
                                        <label className="_social_registration_label _mar_b8" htmlFor='username'>Username</label>
                                        <input
                                            {...register("username", {
                                                required: "Please input username",
                                                minLength: { value: 3, message: "Username must be larger than 3 charecters" }
                                            })}
                                            type="text" className="form-control _social_registration_input" id='username' />
                                    </div>

                                    <div className="_social_registration_form_input _mar_b14">
                                        <label htmlFor='password' className="_social_registration_label _mar_b8">Password</label>
                                        <input
                                            {...register("password",
                                                {
                                                    required: "Password is required!",
                                                    minLength: { value: 6, message: "Password must be at least 6" },
                                                    maxLength: { value: 30, message: "Password can not be more than 30" },
                                                })
                                            }
                                            id='password' type="password" className="form-control _social_registration_input" />
                                    </div>
                                    <div className="_social_registration_form_input _mar_b14">
                                        <label htmlFor='c_password' className="_social_registration_label _mar_b8">Repeat Password</label>
                                        <input id='c_password'
                                            {...register("c_password",
                                                {
                                                    required: "Confirm password is required!",
                                                    validate: {
                                                        passwordEqual: value => (value === getValues().password) || "Two password doesn't match",
                                                    }
                                                })
                                            }
                                            type="password" className="form-control _social_registration_input" />
                                    </div>

                                    <div className="form-check _social_registration_form_check">
                                        <input className="form-check-input _social_registration_form_check_input" type="checkbox" name="flexRadioDefault" id="flexRadioDefault2" defaultChecked />
                                        <label className="form-check-label _social_registration_form_check_label" htmlFor="flexRadioDefault2">I agree to terms &amp; conditions</label>
                                    </div>
                                    <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                                        <button type="submit" className="_social_registration_form_btn_link _btn1">
                                            Sign Up
                                        </button>
                                    </div>
                                </form>
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                                        <div className="_social_registration_bottom_txt">
                                            <p className="_social_registration_bottom_txt_para">Already have an account?
                                                <Link href="/login"><a> Login here</a></Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
                            <div className="_social_registration_right">
                                <div className="_social_registration_right_image">
                                    <img src="assets/images/registration.png" alt="Image" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>

    )
}
export default Registration;

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

    return { props: { user: data.user } }
}