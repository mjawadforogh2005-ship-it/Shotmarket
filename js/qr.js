/* =========================================================
   SHOTMARKET - QR CODE SYSTEM
   Module 7
   Front-end QR integration
========================================================= */

/**
 * Generate a customer gallery URL
 */
function generateGalleryURL(albumId, galleryToken) {

    if (!albumId) {
        console.error("No album ID provided.");
        return "";
    }

    if (!galleryToken) {
        console.error("No gallery token provided.");
        return "";
    }

    const baseURL = window.location.origin + window.location.pathname
        .split("/")
        .slice(0, -1)
        .join("/");

    return `${baseURL}/gallery.html?album=${encodeURIComponent(albumId)}&token=${encodeURIComponent(galleryToken)}`;
}


/**
 * Generate QR Code
 */
function generateAlbumQRCode(albumId, elementId = "qr-code", galleryToken = null) {

    const qrContainer = document.getElementById(elementId);

    if (!qrContainer) {
        console.error("QR container not found:", elementId);
        return;
    }

    if (!albumId) {
        console.error("Cannot generate QR without album ID.");
        return;
    }

    if (!galleryToken) {
        console.error("Cannot generate QR without gallery token.");
        return;
    }

    const galleryURL = generateGalleryURL(albumId, galleryToken);

    qrContainer.innerHTML = "";

    new QRCode(qrContainer, {
        text: galleryURL,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    console.log("QR Code generated:", galleryURL);

    return galleryURL;
}


/**
 * Download QR Code as PNG
 */
function downloadQRCode(filename = "shotmarket-qr-code.png") {

    const qrContainer = document.getElementById("qr-code");

    if (!qrContainer) {
        console.error("QR container not found.");
        return;
    }

    const canvas = qrContainer.querySelector("canvas");

    if (!canvas) {
        alert("Please generate the QR code first.");
        return;
    }

    const link = document.createElement("a");

    link.download = filename;

    link.href = canvas.toDataURL("image/png");

    link.click();
}


/**
 * Copy gallery URL
 */
function copyGalleryURL(albumId, galleryToken) {

    const galleryURL = generateGalleryURL(albumId, galleryToken);

    if (!galleryURL) {
        return;
    }

    navigator.clipboard.writeText(galleryURL)
        .then(() => {

            alert("Gallery link copied successfully!");

        })
        .catch(error => {

            console.error("Could not copy gallery URL:", error);

        });
}