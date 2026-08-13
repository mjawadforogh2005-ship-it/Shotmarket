/* =========================================================
   SHOTMARKET - UPLOAD / CREATE ALBUM
   Frontend prototype using localStorage
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("ShotMarket Upload System Loaded");

    // ---------------------------------------------------------
    // FIND FORM ELEMENTS
    // ---------------------------------------------------------

    const albumNameInput =
        document.getElementById("albumName") ||
        document.querySelector('input[name="albumName"]');

    const eventDateInput =
        document.getElementById("eventDate") ||
        document.querySelector('input[name="eventDate"]');

    const locationInput =
        document.getElementById("location") ||
        document.querySelector('input[name="location"]');

    const descriptionInput =
        document.getElementById("description") ||
        document.querySelector("textarea");

    const fileInput =
        document.getElementById("photoInput") ||
        document.querySelector('input[type="file"]');

    const dropzone =
        document.getElementById("dropzone") ||
        document.querySelector(".dropzone");

    const photoGrid =
        document.getElementById("photoGrid") ||
        document.querySelector(".photo-grid");

    const photoCountLabel =
        document.getElementById("photoCount");

    const createButton =
        document.getElementById("createAlbumBtn") ||
        document.querySelector(".create-album-btn");

    const qrContainer =
        document.getElementById("qrCode") ||
        document.getElementById("qrcode") ||
        document.querySelector(".qr-code");

    const qrPlaceholder =
        document.getElementById("qrPlaceholder");

    const qrStatus =
        document.getElementById("qrStatus");

    const downloadQrButton =
        document.getElementById("downloadQr");

    const successMessage =
        document.getElementById("successMessage");

    // ---------------------------------------------------------
    // STORE SELECTED PHOTOS
    // ---------------------------------------------------------

    let selectedPhotos = [];

    // ---------------------------------------------------------
    // FILE INPUT
    // ---------------------------------------------------------

    async function handleFiles(files) {

        const imageFiles = Array.from(files).filter(file =>
            file.type.startsWith("image/")
        );

        if (!imageFiles.length) return;

        for (const file of imageFiles) {

            const compressedImage =
                await compressImage(file);

            selectedPhotos.push({
                id: crypto.randomUUID(),
                name: file.name,
                data: compressedImage
            });
        }

        console.log(
            `${selectedPhotos.length} photos selected`
        );

        updatePhotoCount();
        displaySelectedPhotos();
    }

    if (fileInput) {

        fileInput.addEventListener("change", async function () {
            await handleFiles(this.files);
        });
    }

    if (dropzone) {

        dropzone.addEventListener("dragover", function (event) {
            event.preventDefault();
            dropzone.classList.add("dragover");
        });

        dropzone.addEventListener("dragleave", function () {
            dropzone.classList.remove("dragover");
        });

        dropzone.addEventListener("drop", async function (event) {
            event.preventDefault();
            dropzone.classList.remove("dragover");

            if (event.dataTransfer?.files) {
                await handleFiles(event.dataTransfer.files);
            }
        });

        dropzone.addEventListener("click", function () {
            if (fileInput) {
                fileInput.click();
            }
        });
    }

    // ---------------------------------------------------------
    // UPDATE PHOTO COUNT
    // ---------------------------------------------------------

    function updatePhotoCount() {
        if (photoCountLabel) {
            photoCountLabel.textContent =
                `${selectedPhotos.length} photo${
                    selectedPhotos.length === 1 ? "" : "s"
                }`;
        }
    }

    // ---------------------------------------------------------
    // DISPLAY SELECTED PHOTOS
    // ---------------------------------------------------------

    function displaySelectedPhotos() {

        if (!photoGrid) return;

        photoGrid.innerHTML = "";

        selectedPhotos.forEach(photo => {

            const wrapper =
                document.createElement("div");

            wrapper.className = "photo-preview";

            wrapper.innerHTML = `
                <img
                    src="${photo.data}"
                    alt="${escapeHTML(photo.name)}"
                >
            `;

            photoGrid.appendChild(wrapper);
        });
    }

    // ---------------------------------------------------------
    // CREATE ALBUM
    // ---------------------------------------------------------

    if (createButton) {

        createButton.addEventListener("click", async function (event) {

            event.preventDefault();

            const albumName =
                albumNameInput?.value.trim() || "Untitled Album";

            const eventDate =
                eventDateInput?.value || "";

            const location =
                locationInput?.value.trim() || "";

            const description =
                descriptionInput?.value.trim() || "";

            // Require at least one photo
            if (selectedPhotos.length === 0) {

                alert(
                    "Please upload at least one photo before creating the album."
                );

                return;
            }

            // -------------------------------------------------
            // CREATE UNIQUE ALBUM ID
            // -------------------------------------------------

            const albumId =
                "album-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 8);

            // -------------------------------------------------
            // ALBUM OBJECT
            // -------------------------------------------------

            const album = {

                id: albumId,

                name: albumName,

                date: eventDate,

                location: location,

                description: description,

                createdAt:
                    new Date().toISOString(),

                photographer: {
                    name: "Mohammad",
                    email: "photographer@shotmarket.com"
                },

                payment: {

                    bankName:
                        "Halyk Bank",

                    accountName:
                        "Mohammad Jawad Frogh",

                    accountNumber:
                        "KZ00 0000 0000 0000 0000",

                    iban:
                        "KZ00 0000 0000 0000 0000",

                    amount:
                        2500,

                    currency:
                        "KZT"
                },

                photos: selectedPhotos,

                paymentCompleted: false

            };

// -------------------------------------------------
// SAVE ALBUM
// -------------------------------------------------

const albums =
    JSON.parse(
        localStorage.getItem("shotmarket_albums")
    ) || [];

albums.push(album);

localStorage.setItem(
    "shotmarket_albums",
    JSON.stringify(albums)
);

            // Save latest album
            localStorage.setItem(
                "shotmarket_current_album",
                albumId
            );

            console.log(
                "Album created:",
                album
            );

            // -------------------------------------------------
            // GENERATE QR CODE
            // -------------------------------------------------

            generateQRCode(albumId);

            // -------------------------------------------------
            // SUCCESS MESSAGE
            // -------------------------------------------------

            if (successMessage) {

                successMessage.innerHTML = `
                    <strong>✓ Album created successfully!</strong>
                    <br>
                    Your customers can scan the QR code
                    to access this gallery.
                `;

                successMessage.style.display = "block";
            }

            // -------------------------------------------------
            // ALERT
            // -------------------------------------------------

            alert(
                "Album created successfully!"
            );

        });
    }

    // ---------------------------------------------------------
    // QR CODE
    // ---------------------------------------------------------

    function generateQRCode(albumId) {

        if (!qrContainer) {

            console.warn(
                "QR container not found."
            );

            return;
        }

        qrContainer.innerHTML = "";

        // URL customer will open
        const galleryURL =
            window.location.origin +
            window.location.pathname
                .replace(
                    /[^/]+$/,
                    ""
                ) +
            "gallery.html?album=" +
            encodeURIComponent(albumId);

        // QRCode.js
        if (typeof QRCode === "undefined") {

            qrContainer.innerHTML = `
                <p style="color:#e8c547;">
                    QR library not loaded.
                </p>
            `;

            console.error(
                "QRCode library is missing."
            );

            return;
        }

        new QRCode(qrContainer, {

            text: galleryURL,

            width: 180,

            height: 180,

            colorDark: "#000000",

            colorLight: "#ffffff",

            correctLevel:
                QRCode.CorrectLevel.H

        });

        if (qrPlaceholder) {
            qrPlaceholder.style.display = "none";
        }

        if (qrContainer.style) {
            qrContainer.style.display = "block";
        }

        if (qrStatus) {
            qrStatus.textContent = "● QR Generated";
        }

        if (downloadQrButton) {
            downloadQrButton.style.display = "inline-flex";
        }

        console.log(
            "QR Code URL:",
            galleryURL
        );
    }

    // ---------------------------------------------------------
    // IMAGE COMPRESSION
    // ---------------------------------------------------------

    function compressImage(file) {

        return new Promise((resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload = function (event) {

                const img =
                    new Image();

                img.onload = function () {

                    const MAX_WIDTH = 1600;

                    let width =
                        img.width;

                    let height =
                        img.height;

                    if (width > MAX_WIDTH) {

                        height =
                            height *
                            (MAX_WIDTH / width);

                        width =
                            MAX_WIDTH;
                    }

                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width =
                        width;

                    canvas.height =
                        height;

                    const ctx =
                        canvas.getContext("2d");

                    ctx.drawImage(
                        img,
                        0,
                        0,
                        width,
                        height
                    );

                    const compressed =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.82
                        );

                    resolve(compressed);
                };

                img.onerror = reject;

                img.src =
                    event.target.result;
            };

            reader.onerror =
                reject;

            reader.readAsDataURL(file);
        });
    }

    // ---------------------------------------------------------
    // SECURITY / HTML ESCAPE
    // ---------------------------------------------------------

    function escapeHTML(text) {

        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

});