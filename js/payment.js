/* =========================================================
   SHOTMARKET
   PAYMENT MODULE
   Supabase Connected Version
========================================================= */

import { supabase } from "./supabaseClient.js";


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


        /* =====================================================
           CHECK USER
        ===================================================== */

        const {
            data: userData,
            error: userError
        } =
            await supabase.auth.getUser();


        if (userError) {

            console.error(
                "Could not get current user:",
                userError
            );
        }


        const currentUser =
            userData?.user || null;


        console.log(
            "Current user:",
            currentUser
        );


        /*
         * Payment creation is protected by RLS.
         * Therefore the customer must be logged in.
         */

        if (!currentUser) {

            alert(
                "Please log in before continuing to payment."
            );

            window.location.href =
                "login.html";

            return;
        }


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

                        /* -------------------------------------
                           CREATE PAYMENT RECORD
                        ------------------------------------- */

                        const paymentRecord = {

                            user_id:
                                currentUser.id,

                            album_id:
                                albumId,

                            amount:
                                totalAmount,

                            currency:
                                "KZT",

                            status:
                                "pending",

                            payment_method:
                                "bank_transfer",

                            selected_photos:
                                selectedPhotoIds,

                            created_at:
                                new Date().toISOString(),

                            updated_at:
                                new Date().toISOString()
                        };


                        console.log(
                            "Creating payment:",
                            paymentRecord
                        );


                        const {
                            data: payment,
                            error: paymentError
                        } =
                            await supabase
                                .from("payments")
                                .insert(
                                    paymentRecord
                                )
                                .select()
                                .single();


                        if (paymentError) {

                            throw paymentError;
                        }


                        console.log(
                            "Payment successfully created:",
                            payment
                        );


                        /* -------------------------------------
                           SAVE PAYMENT ID
                        ------------------------------------- */

                        sessionStorage.setItem(
                            "shotmarket_payment_id",
                            payment.id
                        );


                        sessionStorage.setItem(
                            "shotmarket_current_album",
                            albumId
                        );


                        sessionStorage.setItem(
                            "shotmarket_selected_photos",
                            JSON.stringify(
                                selectedPhotoIds
                            )
                        );


                        sessionStorage.setItem(
                            "shotmarket_payment_status",
                            "pending"
                        );


                        /* -------------------------------------
                           SHOW SUCCESS
                        ------------------------------------- */

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