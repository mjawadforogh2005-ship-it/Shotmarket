/* =========================================================
   SHOTMARKET - MAIN INTERACTIVE ENGINE
   Authentication + General UI
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "ShotMarket Interactive Engine Loaded 🚀"
        );


        /* =====================================================
           PASSWORD VISIBILITY TOGGLE
        ===================================================== */

        function setupPasswordToggle(
            inputId,
            buttonId
        ) {

            const input =
                document.getElementById(inputId);

            const button =
                document.getElementById(buttonId);


            if (!input || !button) {
                return;
            }


            button.addEventListener(
                "click",
                function () {

                    const isPassword =
                        input.type === "password";


                    input.type =
                        isPassword
                            ? "text"
                            : "password";


                    this.innerHTML =
                        isPassword
                            ? '<i class="fa-regular fa-eye-slash"></i>'
                            : '<i class="fa-regular fa-eye"></i>';

                }
            );

        }


        /* =====================================================
           REGISTER PASSWORD TOGGLES
        ===================================================== */

        setupPasswordToggle(
            "registerPassword",
            "toggleRegisterPassword"
        );


        setupPasswordToggle(
            "confirmPassword",
            "toggleConfirmPassword"
        );


        /* =====================================================
           LOGIN PASSWORD TOGGLE
        ===================================================== */

        setupPasswordToggle(
            "loginPassword",
            "toggleLoginPassword"
        );



        /* =====================================================
           REGISTER FORM
        ===================================================== */

        const registerForm =
            document.getElementById(
                "registerForm"
            );


        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                async function (e) {

                    e.preventDefault();


                    const fullName =
                        document
                            .getElementById(
                                "fullName"
                            )
                            ?.value
                            .trim();


                    const email =
                        document
                            .getElementById(
                                "registerEmail"
                            )
                            ?.value
                            .trim();


                    const password =
                        document
                            .getElementById(
                                "registerPassword"
                            )
                            ?.value;


                    const confirmPassword =
                        document
                            .getElementById(
                                "confirmPassword"
                            )
                            ?.value;


                    const submitBtn =
                        registerForm.querySelector(
                            ".auth-submit"
                        );

                    if (!fullName) {

                        alert(
                            "Please enter your full name."
                        );

                        return;
                    }


                    if (!email) {

                        alert(
                            "Please enter your email."
                        );

                        return;
                    }


                    if (!password) {

                        alert(
                            "Please enter a password."
                        );

                        return;
                    }


                    if (
                        password !==
                        confirmPassword
                    ) {

                        alert(
                            "Passwords do not match."
                        );

                        return;
                    }


                    if (
                        password.length < 8
                    ) {

                        alert(
                            "Password must be at least 8 characters long."
                        );

                        return;
                    }
                    if (submitBtn) {

                        submitBtn.disabled =
                            true;

                        submitBtn.innerHTML =
                            'Creating Account... <i class="fa-solid fa-spinner fa-spin"></i>';

                    }
                    try {

                        const {
                            data,
                            error
                        } =
                            await registerUser(
                                fullName,
                                email,
                                password
                            );


                        if (error || !data) {

                            throw new Error(
                                error ||
                                "Registration failed."
                            );

                        }



                        console.log(
                            "Registration response:",
                            data
                        );



                        /* =====================================
                           EMAIL CONFIRMATION REQUIRED
                        ===================================== */

                        if (
                            data.user &&
                            !data.session
                        ) {

                            alert(
                                "Account created successfully! Please check your email and confirm your account before logging in."
                            );


                            window.location.href =
                                "login.html";


                            return;

                        }
                        if (
                            data.user &&
                            data.session
                        ) {
                            alert(
                                "Account created successfully!"
                            );
                            window.location.href =
                                "dashboard.html";
                            return;
                        }
                        throw new Error(
                            "Account creation returned an unexpected response."
                        );
                    } catch (err) {
                        console.error(
                            "Registration error:",
                            err
                        );
                        alert(
                            "Registration failed: " +
                            err.message
                        );
                    } finally {
                        if (submitBtn) {
                            submitBtn.disabled =
                                false;
                            submitBtn.innerHTML =
                                'Create Account <i class="fa-solid fa-arrow-right"></i>';
                       }

                    }

                }
            );

        }
        const loginForm =
            document.getElementById(
                "loginForm"
            );
        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                async function (e) {

                    e.preventDefault();


                    const email =
                        document
                            .getElementById(
                                "loginEmail"
                            )
                            ?.value
                            .trim();


                    const password =
                        document
                            .getElementById(
                                "loginPassword"
                            )
                            ?.value;


                    const submitBtn =
                        loginForm.querySelector(
                            ".auth-submit"
                        );



                    /* =========================================
                       VALIDATION
                    ========================================= */

                    if (!email) {

                        alert(
                            "Please enter your email."
                        );

                        return;
                    }


                    if (!password) {

                        alert(
                            "Please enter your password."
                        );

                        return;
                    }



                    /* =========================================
                       BUTTON LOADING
                    ========================================= */

                    if (submitBtn) {

                        submitBtn.disabled =
                            true;

                        submitBtn.innerHTML =
                            'Signing In... <i class="fa-solid fa-spinner fa-spin"></i>';

                    }



                    try {
                        const {
                            data,
                            error
                        } =
                            await loginUser(
                                email,
                                password
                            );


                        if (error) {

                            throw new Error(
                                error
                            );

                        }


                        if (
                            !data ||
                            !data.user
                        ) {

                            throw new Error(
                                "Login succeeded but no user was returned."
                            );

                        }



                        console.log(
                            "Login successful:",
                            data.user
                        );
                        window.location.href =
                            "dashboard.html";
                    } catch (err) {

                        console.error(
                            "Login error:",
                            err
                        );
                        alert(
                            "Login failed: " +
                            err.message
                        );
                    } finally {

                        if (submitBtn) {

                            submitBtn.disabled =
                                false;

                            submitBtn.innerHTML =
                                'Login <i class="fa-solid fa-arrow-right"></i>';

                        }

                    }

                }
            );

        }



        /* =====================================================
           LOGOUT BUTTONS
        ===================================================== */

        const logoutButtons =
            document.querySelectorAll(
                "[data-logout]"
            );


        logoutButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    async function (e) {

                        e.preventDefault();

                        await logoutUser();

                    }
                );

            }
        );


        console.log(
            "ShotMarket authentication handlers ready."
        );

    }
);