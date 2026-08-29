/* =========================================================
   SHOTMARKET - AUTHENTICATION SYSTEM
   Supabase Authentication
   ========================================================= */


/* =========================================================
   REGISTER
========================================================= */

async function registerUser(
    fullName,
    email,
    password
) {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email: email.trim(),

                password: password,

                options: {

                    data: {
                        full_name:
                            fullName.trim()
                    }

                }

            });


        if (error) {

            console.error(
                "Registration error:",
                error
            );

            return {
                success: false,
                error: error.message
            };
        }


        console.log(
            "Registration successful:",
            data
        );


        return {
            success: true,
            data: data
        };


    } catch (error) {

        console.error(
            "Registration exception:",
            error
        );


        return {
            success: false,
            error: error.message
        };
    }
}



/* =========================================================
   LOGIN
========================================================= */

async function loginUser(
    email,
    password
) {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email: email.trim(),

                    password: password

                });


        if (error) {

            console.error(
                "Login error:",
                error
            );


            return {
                success: false,
                error: error.message
            };
        }


        console.log(
            "Login successful:",
            data
        );


        return {
            success: true,
            data: data
        };


    } catch (error) {

        console.error(
            "Login exception:",
            error
        );


        return {
            success: false,
            error: error.message
        };
    }
}



/* =========================================================
   GET CURRENT USER
========================================================= */

async function getCurrentUser() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();


        if (error) {

            console.error(
                "Could not get current user:",
                error
            );

            return null;
        }


        return data?.user || null;


    } catch (error) {

        console.error(
            "Current user exception:",
            error
        );

        return null;
    }
}



/* =========================================================
   GET CURRENT SESSION
========================================================= */

async function getCurrentSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Could not get session:",
                error
            );

            return null;
        }


        return data?.session || null;


    } catch (error) {

        console.error(
            "Session exception:",
            error
        );

        return null;
    }
}



/* =========================================================
   REQUIRE LOGIN
========================================================= */

async function requireLogin() {

    const session =
        await getCurrentSession();


    if (!session) {

        console.warn(
            "No active session. Redirecting to login."
        );


        window.location.href =
            "login.html";


        return null;
    }


    return session.user;
}



/* =========================================================
   LOGOUT
========================================================= */

async function logoutUser() {

    try {

        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );

            return false;
        }


        console.log(
            "Logged out successfully."
        );


        window.location.href =
            "index.html";


        return true;


    } catch (error) {

        console.error(
            "Logout exception:",
            error
        );

        return false;
    }
}



/* =========================================================
   AUTH STATE LISTENER
========================================================= */

supabaseClient.auth.onAuthStateChange(
    function (
        event,
        session
    ) {

        console.log(
            "Auth state:",
            event
        );


        if (session) {

            console.log(
                "Authenticated user:",
                session.user.email
            );

        } else {

            console.log(
                "No authenticated user."
            );
        }

    }
);