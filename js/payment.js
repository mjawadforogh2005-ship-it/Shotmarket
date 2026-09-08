/* =========================================================
   SHOTMARKET
   PAYMENT MODULE
   Supabase Connected Version
========================================================= */

import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


const SUPABASE_URL =
    "https://xplcaiygifwnxyevvqsr.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_16S4x_HPLxfsUk1RTgR4Qw_gnvlyqD_";

const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


async function getCustomerSession() {
    const {
        data: sessionData,
        error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError) {
        throw sessionError;
    }

    if (sessionData?.session) {
        const user = sessionData.session.user;

        if (user?.is_anonymous) {
            return sessionData.session;
        }

        throw new Error(
            "Customer checkout requires an anonymous session."
        );
    }

    const {
        data,
        error
    } = await supabase.auth.signInAnonymously();

    if (error) {
        throw error;
    }

    if (!data?.session) {
        throw new Error(
            "Could not create customer session."
        );
    }

    return data.session;
}


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "ShotMarket Supabase Payment Module Loaded 🚀"
        );


        /* =====================================================
           GET ALBUM ID
        ===================================================== */

        const params =
            new URLSearchParams(
                window.location.search
            );

        const albumId =
            params.get("album");


        console.log(
            "Payment Album ID:",
            albumId
        );


        /*
         * If there is no album ID, stop.
         */

        if (!albumId) {

            showError(
                "No album was specified."
            );

            return;
        }


        /* =====================================================
           GET SELECTED PHOTOS
        ===================================================== */

        const selectedPhotosJSON =
            sessionStorage.getItem(
                "shotmarket_selected_photos"
            );


        let selectedPhotoIds = [];


        try {

            if (selectedPhotosJSON) {

                selectedPhotoIds =
                    JSON.parse(
                        selectedPhotosJSON
                    );
            }

        } catch (error) {

            console.error(
                "Could not read selected photos:",
                error
            );

            selectedPhotoIds = [];
        }


        console.log(
            "Selected photo IDs:",
            selectedPhotoIds
        );


        let customerSession;

        try {
            customerSession = await getCustomerSession();
        } catch (error) {
            console.error("Could not create customer session:", error);
            alert("Could not start the secure customer session. Please try again.");
            return;
        }

        const currentUser = customerSession.user;


        /* =====================================================
           LOAD ALBUM
        ===================================================== */

        let album = null;


        try {

            const {
                data,
                error
            } =
                await supabase
                    .from("albums")
                    .select("*")
                    .eq(
                        "id",
                        albumId
                    )
                    .maybeSingle();


            if (error) {
                throw error;
            }


            if (!data) {

                showError(
                    "This album could not be found."
                );

                return;
            }


            album = data;


            console.log(
                "Supabase album:",
                album
            );


        } catch (error) {

            console.error(
                "Album loading error:",
                error
            );

            showError(
                "Could not load this album."
            );

            return;
        }


        /* =====================================================
           LOAD SELECTED PHOTOS
        ===================================================== */

        let photos = [];


        try {

            if (
                selectedPhotoIds &&
                selectedPhotoIds.length > 0
            ) {

                /*
                 * Customer selected specific photos.
                 */

                const {
                    data,
                    error
                } =
                    await supabase
                        .from("photos")
                        .select("*")
                        .in(
                            "id",
                            selectedPhotoIds
                        );


                if (error) {
                    throw error;
                }


                photos =
                    data || [];


            } else {

                /*
                 * If nothing was selected,
                 * load all photos from the album.
                 */

                const {
                    data,
                    error
                } =
                    await supabase
                        .from("photos")
                        .select("*")
                        .eq(
                            "album_id",
                            albumId
                        );


                if (error) {
                    throw error;
                }


                photos =
                    data || [];
            }


            console.log(
                "Payment photos:",
                photos
            );


        } catch (error) {

            console.error(
                "Photo loading error:",
                error
            );

            showError(
                "Could not load the selected photos."
            );

            return;
        }


        /* =====================================================
           DISPLAY ALBUM
        ===================================================== */

        const albumName =
            document.getElementById(
                "albumName"
            );


        const albumDetails =
            document.getElementById(
                "albumDetails"
            );


        if (albumName) {

            albumName.textContent =
                album.name ||
                "Untitled Album";
        }


        if (albumDetails) {

            const photoCount =
                photos.length;


            const eventDate =
                album.event_date
                    ? formatDate(
                        album.event_date
                    )
                    : "Event date unavailable";


            albumDetails.textContent =
                `${eventDate} • ${photoCount} photo${
                    photoCount === 1
                        ? ""
                        : "s"
                }`;
        }


        /* =====================================================
           CALCULATE TOTAL
        ===================================================== */

        let totalAmount = 0;


        photos.forEach(
            function (photo) {

                totalAmount +=
                    Number(
                        photo.price || 0
                    );
            }
        );


        /*
         * Temporary fallback price.
         *
         * If your photos currently have price = 0,
         * we use 1,000 KZT per photo for testing.
         *
         * Later we can create proper pricing settings.
         */

        if (
            totalAmount === 0 &&
            photos.length > 0
        ) {

            totalAmount =
                photos.length * 1000;
        }


        console.log(
            "Total payment:",
            totalAmount
        );


        /* =====================================================
           DISPLAY PAYMENT AMOUNT
        ===================================================== */

        const paymentAmount =
            document.getElementById(
                "paymentAmount"
            );


        const paymentCurrency =
            document.getElementById(
                "paymentCurrency"
            );


        if (paymentAmount) {

            paymentAmount.textContent =
                formatNumber(
                    totalAmount
                );
        }


        if (paymentCurrency) {

            paymentCurrency.textContent =
                "KZT";
        }


        /* =====================================================
           BANK INFORMATION
        ===================================================== */

        /*
         * Your current profiles table does not contain
         * bank/account columns.
         *
         * Therefore these are temporary testing values.
         *
         * We will move these into a photographer payment
         * settings table later.
         */

        const bankInformation = {

            bankName:
                "Kaspi Bank",

            accountName:
                "ShotMarket Photographer",

            accountNumber:
                "000000000000",

            iban:
                "KZ00 0000 0000 0000 0000"
        };


        const bankName =
            document.getElementById(
                "bankName"
            );


        const accountName =
            document.getElementById(
                "accountName"
            );


        const accountNumber =
            document.getElementById(
                "accountNumber"
            );


        const iban =
            document.getElementById(
                "iban"
            );


        if (bankName) {

            bankName.textContent =
                bankInformation.bankName;
        }


        if (accountName) {

            accountName.textContent =
                bankInformation.accountName;
        }


        if (accountNumber) {

            accountNumber.textContent =
                bankInformation.accountNumber;
        }


        if (iban) {

            iban.textContent =
                bankInformation.iban;
        }


        /* =====================================================
           COPY ACCOUNT NUMBER
        ===================================================== */

        const copyAccount =
            document.getElementById(
                "copyAccount"
            );


        if (copyAccount) {

            copyAccount.addEventListener(
                "click",
                function () {

                    copyText(
                        bankInformation.accountNumber,
                        copyAccount
                    );

                }
            );
        }


        /* =====================================================
           COPY IBAN
        ===================================================== */

        const copyIban =
            document.getElementById(
                "copyIban"
            );


        if (copyIban) {

            copyIban.addEventListener(
                "click",
                function () {

                    copyText(
                        bankInformation.iban,
                        copyIban
                    );

                }
            );
        }


        /* =====================================================
           CONFIRM PAYMENT
        ===================================================== */

        const confirmPayment =
            document.getElementById(
                "confirmPayment"
            );


        if (confirmPayment) {

            confirmPayment.addEventListener(
                "click",
                async function () {

                    /*
                     * Prevent double clicking.
                     */

                    confirmPayment.disabled =
                        true;


                    confirmPayment.innerHTML = `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Recording Payment...
                    `;


                    try {

                        const galleryToken =
                            new URLSearchParams(
                                window.location.search
                            ).get("token") ||
                            sessionStorage.getItem(
                                "shotmarket_gallery_token"
                            );

                        if (!galleryToken) {
                            throw new Error(
                                "Gallery token is missing."
                            );
                        }

                        const {
                            data,
                            error
                        } = await supabase.functions.invoke(
                            "create-payment",
                            {
                                body: {
                                    albumId,
                                    galleryToken,
                                    selectedPhotoIds
                                }
                            }
                        );

                        if (error) {
                            throw error;
                        }

                        if (!data?.success || !data?.payment) {
                            throw new Error(
                                data?.error || "Could not create payment."
                            );
                        }

                        const payment = data.payment;

                        console.log(
                            "Payment successfully created:",
                            payment
                        );


                        sessionStorage.setItem(
                            "shotmarket_payment_id",
                            payment.id
                        );

                        sessionStorage.setItem(
                            "shotmarket_payment_album",
                            payment.album_id
                        );

                        sessionStorage.setItem(
                            "shotmarket_payment_status",
                            payment.status
                        );

                        sessionStorage.setItem(
                            "shotmarket_selected_photos",
                            JSON.stringify(
                                payment.selected_photos
                            )
                        );

                        const confirmedAmount =
                            Number(payment.amount);

                        const paymentAmountElement =
                            document.getElementById(
                                "paymentAmount"
                            );

                        if (paymentAmountElement) {
                            paymentAmountElement.textContent =
                                `${confirmedAmount.toLocaleString()} KZT`;
                        }


                        showSuccessModal();


                    } catch (error) {

                        console.error(
                            "Payment creation failed:",
                            error
                        );


                        alert(
                            "Payment could not be recorded.\n\n" +
                            error.message
                        );


                        confirmPayment.disabled =
                            false;


                        confirmPayment.innerHTML = `
                            <span>
                                I Have Made the Payment
                            </span>

                            <i class="fa-solid fa-arrow-right"></i>
                        `;
                    }

                }
            );
        }


        /* =====================================================
           RETURN TO GALLERY
        ===================================================== */

        const returnToGallery =
            document.getElementById(
                "returnToGallery"
            );


        if (returnToGallery) {

            returnToGallery.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "gallery.html?album=" +
                        encodeURIComponent(
                            albumId
                        );

                }
            );
        }


    }
);


async function checkPaymentStatus() {
    const paymentId =
        sessionStorage.getItem("shotmarket_payment_id");

    const albumId =
        sessionStorage.getItem("shotmarket_payment_album");

    if (!paymentId || !albumId) {
        return;
    }

    const {
        data: payment,
        error
    } = await supabase
        .from("payments")
        .select(`
            id,
            album_id,
            status,
            selected_photos
        `)
        .eq("id", paymentId)
        .eq("album_id", albumId)
        .single();

    if (error || !payment) {
        console.error(
            "Could not check payment:",
            error
        );
        return;
    }

    sessionStorage.setItem(
        "shotmarket_payment_status",
        payment.status
    );

    updatePaymentStatusUI(payment.status);

    if (payment.status === "paid") {
        showDownloadSection(
            payment.id,
            payment.album_id,
            payment.selected_photos
        );
    }
}


function updatePaymentStatusUI(status) {
    const statusElement =
        document.getElementById("paymentStatus");

    const paymentSection =
        document.querySelector(".payment-status-section");

    if (!statusElement) {
        return;
    }

    if (status === "pending") {
        statusElement.innerHTML = `
            <div class="status-pending">
                <i class="fa-solid fa-clock"></i>
                <div>
                    <strong>Waiting for Verification</strong>
                    <p>Your payment has been submitted. The photographer will verify receipt and approve your download shortly.</p>
                </div>
            </div>
        `;
        
        if (paymentSection) {
            paymentSection.classList.remove("status-paid", "status-failed");
            paymentSection.classList.add("status-pending");
        }
    }

    if (status === "paid") {
        statusElement.innerHTML = `
            <div class="status-approved">
                <i class="fa-solid fa-check-circle"></i>
                <div>
                    <strong>Payment Approved!</strong>
                    <p>Your payment has been verified. Click below to download your photos.</p>
                </div>
            </div>
        `;
        
        if (paymentSection) {
            paymentSection.classList.remove("status-pending", "status-failed");
            paymentSection.classList.add("status-paid");
        }
    }

    if (status === "failed") {
        statusElement.innerHTML = `
            <div class="status-failed">
                <i class="fa-solid fa-exclamation-circle"></i>
                <div>
                    <strong>Payment Rejected</strong>
                    <p>The photographer could not verify this payment. Please contact them to confirm the details.</p>
                </div>
            </div>
        `;
        
        if (paymentSection) {
            paymentSection.classList.remove("status-pending", "status-paid");
            paymentSection.classList.add("status-failed");
        }
    }
}


function showDownloadSection(
    paymentId,
    albumId,
    selectedPhotoIds
) {
    const section =
        document.getElementById("downloadSection");

    if (!section) {
        return;
    }

    section.style.display = "block";

    const downloadList =
        document.getElementById("downloadList");

    if (!downloadList) {
        return;
    }

    downloadList.innerHTML = `
        <button
            id="downloadPhotosBtn"
            class="primary-btn"
        >
            Download My Photos
        </button>

        <div
            id="downloadResults"
            style="margin-top:20px;"
        ></div>
    `;

    document
        .getElementById("downloadPhotosBtn")
        .addEventListener(
            "click",
            () =>
                requestDownloads(
                    paymentId,
                    albumId,
                    selectedPhotoIds
                )
        );
}


async function requestDownloads(
    paymentId,
    albumId,
    selectedPhotoIds
) {
    const button =
        document.getElementById(
            "downloadPhotosBtn"
        );

    const results =
        document.getElementById(
            "downloadResults"
        );

    if (!button || !results) {
        return;
    }

    button.disabled = true;
    button.innerHTML = `
        <span>
            <i class="fa-solid fa-spinner fa-spin"></i>
            Preparing Your Downloads...
        </span>
    `;

    results.innerHTML = "";

    try {
        const {
            data,
            error
        } = await supabase.functions.invoke(
            "download-access",
            {
                body: {
                    paymentId,
                    albumId,
                    photoIds: selectedPhotoIds
                }
            }
        );

        if (error) {
            throw error;
        }

        if (
            !data ||
            !data.success ||
            !Array.isArray(data.downloads)
        ) {
            throw new Error(
                data?.error ||
                "Could not prepare downloads."
            );
        }

        if (data.downloads.length === 0) {
            throw new Error(
                "No photos are available for download."
            );
        }

        results.innerHTML = `
            <div class="download-success">
                <p>Your secure download links are ready. They will expire in 2 hours.</p>
            </div>
            ${data.downloads
            .map((download) => `
                <div class="download-item">
                    <div class="download-info">
                        <i class="fa-solid fa-image"></i>
                        <span>
                            ${escapeHtml(
                            download.file_name
                        )}
                        </span>
                    </div>

                    <a
                        href="${download.downloadUrl}"
                        download
                        class="download-link-btn"
                        rel="noopener noreferrer"
                    >
                        <i class="fa-solid fa-download"></i>
                        Download
                    </a>
                </div>
            `)
            .join("")}
        `;

        button.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Downloads Prepared
        `;
        button.disabled = true;

    } catch (error) {
        console.error(
            "Download error:",
            error
        );

        let errorMessage = "Could not prepare your downloads. Please try again.";
        
        if (error?.message?.includes("Payment has not been approved")) {
            errorMessage = "Your payment is still pending. The photographer will approve it shortly.";
        } else if (error?.message?.includes("Payment not found")) {
            errorMessage = "Payment record not found. Please contact the photographer.";
        } else if (error?.message?.includes("No photos")) {
            errorMessage = "No photos available for download. Please check with the photographer.";
        }

        results.innerHTML = `
            <div class="download-error">
                <i class="fa-solid fa-exclamation-circle"></i>
                <p>${errorMessage}</p>
            </div>
        `;

        button.disabled = false;
        button.innerHTML = `
            <i class="fa-solid fa-redo"></i>
            Try Again
        `;
    }
}


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   SUCCESS MODAL
========================================================= */

function showSuccessModal() {

    const modal =
        document.getElementById(
            "successModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );
    }
}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    console.error(
        "Payment error:",
        message
    );


    const albumName =
        document.getElementById(
            "albumName"
        );


    if (albumName) {

        albumName.textContent =
            "Payment Error";
    }


    alert(
        message
    );
}


/* =========================================================
   COPY TEXT
========================================================= */

async function copyText(
    text,
    button
) {

    if (!text) {
        return;
    }


    try {

        await navigator.clipboard.writeText(
            text
        );


        const original =
            button.innerHTML;


        button.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Copied
        `;


        setTimeout(
            function () {

                button.innerHTML =
                    original;

            },
            1500
        );


    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );


        alert(
            "Could not copy automatically. Please copy it manually."
        );
    }
}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(
    number
) {

    return Number(
        number
    ).toLocaleString(
        "en-US"
    );
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    dateString
) {

    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;
    }


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


checkPaymentStatus();

const paymentStatusInterval =
    setInterval(
        checkPaymentStatus,
        10000
    );