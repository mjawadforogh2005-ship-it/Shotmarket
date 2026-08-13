/* =========================================================
   SHOTMARKET
   PAYMENT MODULE
   Frontend demonstration
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    function () {


        console.log(
            "ShotMarket Payment Module Loaded"
        );


        /* =====================================================
           GET ALBUM ID FROM URL
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


        /* =====================================================
           GET ALBUM
        ===================================================== */

        if (!albumId) {

            showError(
                "No album was specified."
            );

            return;

        }


        const album =
            getAlbumById(albumId);


        if (!album) {

            showError(
                "This album could not be found."
            );

            return;

        }


        console.log(
            "Payment album:",
            album
        );


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
                album.name;

        }


        if (albumDetails) {

            const photoCount =
                album.photos
                    ? album.photos.length
                    : 0;


            const date =
                album.date
                    ? formatDate(album.date)
                    : "Event date unavailable";


            albumDetails.textContent =
                `${date} • ${photoCount} photos`;

        }



        /* =====================================================
           PAYMENT INFORMATION
        ===================================================== */

        const payment =
            album.payment || {};


        const amount =
            document.getElementById(
                "paymentAmount"
            );


        const currency =
            document.getElementById(
                "paymentCurrency"
            );


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


        if (amount) {

            amount.textContent =
                formatNumber(
                    payment.amount || 0
                );

        }


        if (currency) {

            currency.textContent =
                payment.currency ||
                "KZT";

        }


        if (bankName) {

            bankName.textContent =
                payment.bankName ||
                "Not provided";

        }


        if (accountName) {

            accountName.textContent =
                payment.accountName ||
                "Not provided";

        }


        if (accountNumber) {

            accountNumber.textContent =
                payment.accountNumber ||
                "Not provided";

        }


        if (iban) {

            iban.textContent =
                payment.iban ||
                "Not provided";

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
                        payment.accountNumber,
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
                        payment.iban,
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
                function () {

                    confirmPayment.disabled =
                        true;


                    confirmPayment.innerHTML = `

                        <i class="fa-solid fa-spinner fa-spin"></i>

                        Confirming...

                    `;


                    /*
                       This is a frontend DEMO.
                       No real bank transaction is
                       being verified.
                    */

                    setTimeout(
                        function () {

                            markPaymentCompleted(
                                albumId
                            );


                            showSuccessModal();

                        },
                        900
                    );

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
   MARK PAYMENT COMPLETED
   ========================================================= */

function markPaymentCompleted(
    albumId
) {

    const albums =
        getAlbums();


    const albumIndex =
        albums.findIndex(
            album =>
                album.id === albumId
        );


    if (albumIndex === -1) {

        console.error(
            "Album not found."
        );

        return false;

    }


    albums[albumIndex]
        .paymentCompleted = true;


    albums[albumIndex]
        .paymentCompletedAt =
        new Date().toISOString();


    saveAlbums(albums);


    /*
       Also remember the current paid album.
    */

    localStorage.setItem(
        "shotmarket_paid_album",
        albumId
    );


    console.log(
        "Payment completed:",
        albumId
    );


    return true;

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
            "Could not copy automatically. Please copy the information manually."
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



/* =========================================================
   ERROR
   ========================================================= */

function showError(
    message
) {

    document.body.innerHTML = `

        <main
            style="
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:30px;
                text-align:center;
                font-family:Arial,sans-serif;
                background:#0b1320;
                color:white;
            "
        >

            <div>

                <div
                    style="
                        font-size:50px;
                        margin-bottom:20px;
                    "
                >
                    ⚠️
                </div>


                <h1>
                    Payment Unavailable
                </h1>


                <p
                    style="
                        color:#9aa8bb;
                        margin:15px 0 25px;
                    "
                >
                    ${escapePaymentHTML(message)}
                </p>


                <a
                    href="gallery.html"
                    style="
                        display:inline-block;
                        padding:12px 20px;
                        border-radius:8px;
                        background:#e8c547;
                        color:#101927;
                        text-decoration:none;
                        font-weight:bold;
                    "
                >
                    Return to Gallery
                </a>

            </div>

        </main>

    `;

}



/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapePaymentHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}