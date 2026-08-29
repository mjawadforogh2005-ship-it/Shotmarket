/* =========================================================
   SHOTMARKET
   REAL PHOTOGRAPHER DASHBOARD
   Supabase Version
========================================================= */

const dashboardSupabase = supabaseClient;


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "ShotMarket Dashboard Loaded 🚀"
        );


        /* =====================================================
           1. CHECK LOGIN
        ===================================================== */

        const {
            data: sessionData,
            error: sessionError
        } =
            await dashboardSupabase.auth.getSession();


        if (sessionError) {

            console.error(
                "Session error:",
                sessionError
            );

            window.location.href =
                "login.html";

            return;
        }


        const session =
            sessionData?.session;


        if (!session) {

            window.location.href =
                "login.html";

            return;
        }


        const user =
            session.user;


        console.log(
            "Logged in photographer:",
            user
        );


        /* =====================================================
           2. LOAD PROFILE
        ===================================================== */

        await loadProfile(user.id);


        /* =====================================================
           3. LOAD DASHBOARD DATA
        ===================================================== */

        await loadDashboardData(
            user.id
        );


        /* =====================================================
           4. LOGOUT
        ===================================================== */

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async function () {

                    const {
                        error
                    } =
                        await dashboardSupabase.auth.signOut();


                    if (error) {

                        console.error(
                            "Logout error:",
                            error
                        );

                        alert(
                            "Could not log out."
                        );

                        return;
                    }


                    window.location.href =
                        "login.html";
                }
            );
        }


        /* =====================================================
           5. CREATE NEW ALBUM
        ===================================================== */

        const createAlbumButton =
            document.getElementById(
                "createAlbumButton"
            );


        if (createAlbumButton) {

            createAlbumButton.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "upload.html";
                }
            );
        }

    }
);


/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadProfile(
    userId
) {

    try {

        const {
            data,
            error
        } =
            await dashboardSupabase
                .from("profiles")
                .select(
                    "full_name, avatar_url"
                )
                .eq(
                    "id",
                    userId
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Profile loading error:",
                error
            );

            return;
        }


        const fullName =
            data?.full_name ||
            "Photographer";


        /* ---------------------------------------------
           Welcome heading
        --------------------------------------------- */

        const welcomeName =
            document.getElementById(
                "welcomeName"
            );


        if (welcomeName) {

            welcomeName.textContent =
                fullName;
        }


        /* ---------------------------------------------
           Navbar name
        --------------------------------------------- */

        const navUserName =
            document.getElementById(
                "navUserName"
            );


        if (navUserName) {

            navUserName.textContent =
                fullName;
        }


        /* ---------------------------------------------
           Avatar
        --------------------------------------------- */

        const avatar =
            document.getElementById(
                "userAvatar"
            );


        if (avatar) {

            if (data?.avatar_url) {

                avatar.src =
                    data.avatar_url;

            } else {

                avatar.textContent =
                    getInitials(
                        fullName
                    );
            }
        }


    } catch (error) {

        console.error(
            "Profile error:",
            error
        );
    }
}


/* =========================================================
   LOAD DASHBOARD DATA
========================================================= */

async function loadDashboardData(
    userId
) {

    try {

        /* =================================================
           ALBUMS
        ================================================= */

        const {
            data: albums,
            error: albumsError
        } =
            await dashboardSupabase
                .from("albums")
                .select("*")
                .eq(
                    "user_id",
                    userId
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (albumsError) {

            throw albumsError;
        }


        const albumList =
            albums || [];


        /* =================================================
           PHOTOS
        ================================================= */

        const {
            data: photos,
            error: photosError
        } =
            await dashboardSupabase
                .from("photos")
                .select("*")
                .eq(
                    "user_id",
                    userId
                );


        if (photosError) {

            throw photosError;
        }


        const photoList =
            photos || [];


        /* =================================================
           PAYMENTS
        ================================================= */

        const {
            data: payments,
            error: paymentsError
        } =
            await dashboardSupabase
                .from("payments")
                .select("*")
                .eq(
                    "user_id",
                    userId
                );


        if (paymentsError) {

            console.warn(
                "Payments could not be loaded:",
                paymentsError
            );
        }


        const paymentList =
            payments || [];


        /* =================================================
           CALCULATE STATISTICS
        ================================================= */

        const totalAlbums =
            albumList.length;


        const totalPhotos =
            photoList.length;


        const deliveredPhotos =
            photoList.filter(
                photo =>
                    photo.is_available === false
            ).length;


        const paidPayments =
            paymentList.filter(
                payment =>
                    payment.status === "paid"
            );


        const totalRevenue =
            paidPayments.reduce(
                function (
                    total,
                    payment
                ) {

                    return (
                        total +
                        Number(
                            payment.amount || 0
                        )
                    );

                },
                0
            );


        /* =================================================
           UPDATE STATISTICS
        ================================================= */

        setText(
            "totalAlbums",
            totalAlbums
        );


        setText(
            "totalPhotos",
            totalPhotos
        );


        setText(
            "photosDelivered",
            deliveredPhotos
        );


        setText(
            "totalRevenue",
            formatCurrency(
                totalRevenue
            )
        );


        /* =================================================
           RECENT ALBUMS
        ================================================= */

        renderRecentAlbums(
            albumList,
            photoList
        );


        setupDashboardQRCode(
            albumList[0]
        );


        /* =================================================
           UPDATE EMPTY STATE
        ================================================= */

        const emptyState =
            document.getElementById(
                "emptyAlbums"
            );


        if (emptyState) {

            emptyState.style.display =
                albumList.length === 0
                    ? "block"
                    : "none";
        }


    } catch (error) {

        console.error(
            "Dashboard data error:",
            error
        );


        alert(
            "Could not load dashboard data."
        );
    }
}


/* =========================================================
   RENDER RECENT ALBUMS
========================================================= */

function renderRecentAlbums(
    albums,
    photos
) {

    const container =
        document.getElementById(
            "recentAlbums"
        );


    if (!container) {

        console.warn(
            "recentAlbums element not found."
        );

        return;
    }


    container.innerHTML = "";


    if (albums.length === 0) {

        container.innerHTML = `
            <div class="dashboard-empty">
                <i class="fa-regular fa-images"></i>

                <h3>No albums yet</h3>

                <p>
                    Create your first album
                    to start delivering photos.
                </p>

                <a
                    href="upload.html"
                    class="empty-action"
                >
                    Create Album
                </a>
            </div>
        `;

        return;
    }


    const recentAlbums =
        albums.slice(
            0,
            5
        );


    recentAlbums.forEach(
        function (album) {

            const albumPhotos =
                photos.filter(
                    photo =>
                        photo.album_id ===
                        album.id
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "dashboard-album";


            card.innerHTML = `

                <div class="album-thumbnail">

                    ${
                        albumPhotos.length > 0
                            ? `
                                <div class="album-photo-count">
                                    <i class="fa-solid fa-images"></i>
                                    ${albumPhotos.length}
                                </div>
                              `
                            : `
                                <i class="fa-regular fa-image"></i>
                              `
                    }

                </div>


                <div class="album-main">

                    <h3>
                        ${escapeHTML(
                            album.name ||
                            "Untitled Album"
                        )}
                    </h3>

                    <p>
                        ${
                            album.event_date
                                ? formatDate(
                                    album.event_date
                                )
                                : "No date"
                        }

                        •
                        ${albumPhotos.length}
                        photo${
                            albumPhotos.length === 1
                                ? ""
                                : "s"
                        }
                    </p>

                </div>


                <div class="album-status">

                    <span
                        class="status-badge ${
                            album.privacy ===
                            "private"
                                ? "private"
                                : "public"
                        }"
                    >
                        ${
                            album.privacy ===
                            "private"
                                ? "Private"
                                : "Public"
                        }
                    </span>

                </div>


                <button
                    class="album-open"
                    data-album-id="${album.id}"
                    type="button"
                >
                    Open
                    <i class="fa-solid fa-arrow-right"></i>
                </button>

            `;


            container.appendChild(
                card
            );
        }
    );


    /* =====================================================
       OPEN ALBUM BUTTONS
    ===================================================== */

    const openButtons =
        container.querySelectorAll(
            ".album-open"
        );


    openButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const albumId =
                        button.dataset.albumId;


                    window.location.href =
                        "gallery.html?album=" +
                        encodeURIComponent(
                            albumId
                        );
                }
            );
        }
    );
}


/* =========================================================
   HELPERS
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;
    }
}


function formatCurrency(
    amount
) {

    return (
        Number(amount)
            .toLocaleString(
                "en-US"
            ) +
        " KZT"
    );
}


function formatDate(
    date
) {

    const parsed =
        new Date(
            date
        );


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return date;
    }


    return parsed.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


function getInitials(
    name
) {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            part =>
                part.charAt(0)
                    .toUpperCase()
        )
        .join("");
}


function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   DASHBOARD QR CODE
========================================================= */

function setupDashboardQRCode(
    latestAlbum
) {

    const downloadButton =
        document.getElementById(
            "downloadQR"
        );


    const copyButton =
        document.getElementById(
            "copyGalleryBtn"
        );


    if (!latestAlbum?.id) {

        if (downloadButton) {

            downloadButton.disabled =
                true;
        }


        if (copyButton) {

            copyButton.disabled =
                true;
        }


        return;
    }


    if (typeof generateAlbumQRCode === "function") {

        generateAlbumQRCode(
            latestAlbum.id
        );
    }


    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            function () {

                downloadQRCode(
                    `shotmarket-${latestAlbum.id}-qr.png`
                );
            }
        );
    }


    if (copyButton) {

        copyButton.addEventListener(
            "click",
            function () {

                copyGalleryURL(
                    latestAlbum.id
                );
            }
        );
    }
}