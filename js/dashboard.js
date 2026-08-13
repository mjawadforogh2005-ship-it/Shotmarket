/* =========================================
   SHOTMARKET DASHBOARD JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("ShotMarket Dashboard Loaded");


    /* =====================================
       QR DOWNLOAD & COPY LINK
    ===================================== */

    const qrButton = document.getElementById("downloadQR");
    const copyButton = document.getElementById("copyGalleryBtn");

    const albums =
        typeof getAlbums === "function"
            ? getAlbums()
            : [];

    const latestAlbum =
        albums.length > 0
            ? albums[albums.length - 1]
            : null;

    if (latestAlbum && latestAlbum.id) {

        if (typeof generateAlbumQRCode === "function") {
            generateAlbumQRCode(latestAlbum.id);
        }

    } else {

        if (qrButton) {
            qrButton.disabled = true;
        }

        if (copyButton) {
            copyButton.disabled = true;
        }

    }

    if (qrButton) {

        qrButton.addEventListener("click", event => {

            event.preventDefault();

            if (!latestAlbum || !latestAlbum.id) {
                alert("Please create an album first to generate a QR code.");
                return;
            }

            downloadQRCode(
                `shotmarket-${latestAlbum.name || "album"}-qr.png`
            );

        });

    }

    if (copyButton) {

        copyButton.addEventListener("click", event => {

            event.preventDefault();

            if (!latestAlbum || !latestAlbum.id) {
                alert("Please create an album first to copy the gallery link.");
                return;
            }

            copyGalleryURL(latestAlbum.id);

        });

    }


    /* =====================================
       USER MENU
    ===================================== */

    const userMenu = document.querySelector(".user-menu");

    if (userMenu) {

        userMenu.addEventListener("click", () => {

            alert(
                "Account menu\n\n" +
                "Profile\n" +
                "Payment Settings\n" +
                "Logout"
            );

        });

    }


    /* =====================================
       ALBUM MORE BUTTONS
    ===================================== */

    const moreButtons =
        document.querySelectorAll(".more-button");

    moreButtons.forEach(button => {

        button.addEventListener("click", () => {

            alert(
                "Album options\n\n" +
                "• Edit Album\n" +
                "• View Gallery\n" +
                "• Generate QR\n" +
                "• Delete Album"
            );

        });

    });

});