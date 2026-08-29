import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
    "https://xplcaiygifwnxyevvqsr.supabase.co",
    "sb_publishable_16S4x_HPLxfsUk1RTgR4Qw_gnvlyqD_"
);

document.addEventListener("DOMContentLoaded", () => {

    console.log("ShotMarket Supabase Upload System Loaded 🚀");


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const albumForm =
        document.getElementById("albumForm");

    const albumNameInput =
        document.getElementById("albumName");

    const eventDateInput =
        document.getElementById("eventDate");

    const locationInput =
        document.getElementById("location");

    const descriptionInput =
        document.getElementById("description");

    const fileInput =
        document.getElementById("photoInput");

    const dropzone =
        document.getElementById("dropzone");

    const photoGrid =
        document.getElementById("photoGrid");

    const photoCountLabel =
        document.getElementById("photoCount");

    const qrContainer =
        document.getElementById("qrcode");

    const qrPlaceholder =
        document.getElementById("qrPlaceholder");

    const qrStatus =
        document.getElementById("qrStatus");

    const downloadQrButton =
        document.getElementById("downloadQr");

    const successMessage =
        document.getElementById("successMessage");

    const createButton =
        document.querySelector(".create-album-btn");


    /* =====================================================
       SELECTED PHOTOS
    ===================================================== */

    let selectedPhotos = [];


    /* =====================================================
       GET CURRENT USER
    ===================================================== */

    async function getCurrentUser() {

        const {
            data,
            error
        } = await supabase.auth.getUser();

        if (error) {

            console.error(
                "Could not get current user:",
                error
            );

            return null;
        }

        return data.user;
    }


    /* =====================================================
       HANDLE FILES
    ===================================================== */

    async function handleFiles(files) {

        const imageFiles =
            Array.from(files).filter(file =>
                file.type.startsWith("image/")
            );

        if (!imageFiles.length) {

            alert(
                "Please select JPG, PNG or WEBP images."
            );

            return;
        }


        for (const file of imageFiles) {

            try {

                const preview =
                    await createPreview(file);

                selectedPhotos.push({
                    id: crypto.randomUUID(),
                    file: file,
                    name: file.name,
                    preview: preview
                });

            } catch (error) {

                console.error(
                    "Could not process image:",
                    error
                );
            }
        }


        updatePhotoCount();

        displaySelectedPhotos();
    }


    /* =====================================================
       FILE INPUT
    ===================================================== */

    if (fileInput) {

        fileInput.addEventListener(
            "change",
            async function () {

                await handleFiles(
                    this.files
                );

                /*
                    Allow selecting the same file again
                    later if needed.
                */

                this.value = "";
            }
        );
    }


    /* =====================================================
       DRAG & DROP
    ===================================================== */

    if (dropzone) {

        dropzone.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                dropzone.classList.add(
                    "dragover"
                );
            }
        );


        dropzone.addEventListener(
            "dragleave",
            () => {

                dropzone.classList.remove(
                    "dragover"
                );
            }
        );


        dropzone.addEventListener(
            "drop",
            async event => {

                event.preventDefault();

                dropzone.classList.remove(
                    "dragover"
                );

                const files =
                    event.dataTransfer.files;

                if (files?.length) {

                    await handleFiles(files);
                }
            }
        );


        /*
            Clicking the dropzone opens
            the file picker.

            Do NOT trigger this when clicking
            the Browse label itself.
        */

        dropzone.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        ".browse-btn"
                    )
                ) {
                    return;
                }

                if (fileInput) {

                    fileInput.click();
                }
            }
        );
    }


    /* =====================================================
       UPDATE PHOTO COUNT
    ===================================================== */

    function updatePhotoCount() {

        if (!photoCountLabel) {
            return;
        }

        const count =
            selectedPhotos.length;

        photoCountLabel.textContent =
            `${count} photo${count === 1 ? "" : "s"}`;
    }


    /* =====================================================
       DISPLAY PHOTO PREVIEWS
    ===================================================== */

    function displaySelectedPhotos() {

        if (!photoGrid) {
            return;
        }

        photoGrid.innerHTML = "";


        selectedPhotos.forEach(photo => {

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "photo-preview";


            wrapper.innerHTML = `
                <img
                    src="${photo.preview}"
                    alt="${escapeHTML(photo.name)}"
                >
            `;


            photoGrid.appendChild(wrapper);
        });
    }


    /* =====================================================
       CREATE PREVIEW
    ===================================================== */

    function createPreview(file) {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();


                reader.onload =
                    event => {

                        resolve(
                            event.target.result
                        );
                    };


                reader.onerror =
                    reject;


                reader.readAsDataURL(file);
            }
        );
    }


    /* =====================================================
       CREATE ALBUM
    ===================================================== */

    if (albumForm) {

        albumForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                /*
                    Prevent double clicks.
                */

                if (
                    createButton?.disabled
                ) {
                    return;
                }


                /* -----------------------------------------
                   VALIDATE USER
                ----------------------------------------- */

                const user =
                    await getCurrentUser();


                if (!user) {

                    alert(
                        "Please log in before creating an album."
                    );

                    window.location.href =
                        "login.html";

                    return;
                }


                /* -----------------------------------------
                   GET FORM DATA
                ----------------------------------------- */

                const albumName =
                    albumNameInput.value.trim();

                const eventDate =
                    eventDateInput.value;

                const location =
                    locationInput.value.trim();

                const description =
                    descriptionInput.value.trim();


                const privacyElement =
                    document.querySelector(
                        'input[name="privacy"]:checked'
                    );

                const privacy =
                    privacyElement
                        ? privacyElement.value
                        : "private";


                /* -----------------------------------------
                   VALIDATION
                ----------------------------------------- */

                if (!albumName) {

                    alert(
                        "Please enter an album name."
                    );

                    return;
                }


                if (!eventDate) {

                    alert(
                        "Please select the event date."
                    );

                    return;
                }


                if (!location) {

                    alert(
                        "Please enter the event location."
                    );

                    return;
                }


                if (
                    selectedPhotos.length === 0
                ) {

                    alert(
                        "Please upload at least one photo."
                    );

                    return;
                }


                /* -----------------------------------------
                   LOADING STATE
                ----------------------------------------- */

                if (createButton) {

                    createButton.disabled =
                        true;

                    createButton.innerHTML =
                        `
                        Creating Album...
                        <span>⏳</span>
                        `;
                }


                try {

                    /* =====================================
                       STEP 1
                       CREATE ALBUM IN DATABASE
                    ===================================== */

                    const {
                        data: album,
                        error: albumError
                    } = await supabase
                        .from("albums")
                        .insert({
                            user_id: user.id,
                            name: albumName,
                            event_date: eventDate,
                            location: location,
                            description: description,
                            privacy: privacy
                        })
                        .select()
                        .single();


                    if (albumError) {

                        console.error(
                            "Album creation error:",
                            albumError
                        );

                        throw new Error(
                            "Could not create album: " +
                            albumError.message
                        );
                    }


                    console.log(
                        "Album created:",
                        album
                    );


                    /* =====================================
                       STEP 2
                       UPLOAD PHOTOS TO STORAGE
                    ===================================== */

                    const photoRecords = [];


                    for (
                        const photo
                        of selectedPhotos
                    ) {

                        const safeFileName =
                            photo.file.name
                                .replace(
                                    /[^a-zA-Z0-9._-]/g,
                                    "_"
                                );


                        const storagePath =
                            `${user.id}/${album.id}/${Date.now()}-${safeFileName}`;


                        console.log(
                            "Uploading:",
                            storagePath
                        );


                        const {
                            error: uploadError
                        } = await supabase
.storage
.from("shotmarket-photos")
.upload(
    storagePath,
    photo.file,
    {
        cacheControl: "3600",
        upsert: false,
        contentType: photo.file.type
    }
);


                        if (uploadError) {

                            console.error(
                                "Storage upload error:",
                                uploadError
                            );

                            throw new Error(
                                `Could not upload ${photo.file.name}: ${uploadError.message}`
                            );
                        }


                        /* =================================
                           STEP 3
                           CREATE PHOTO DATABASE RECORD
                        ================================= */

                       const { data: publicUrlData } =
    supabase
        .storage
        .from("shotmarket-photos")
        .getPublicUrl(storagePath);

const fileUrl = publicUrlData.publicUrl;

photoRecords.push({
    album_id: album.id,

    user_id: user.id,

    file_name: photo.file.name,

    storage_path: storagePath,

    file_url: fileUrl,

    price: 0,

    is_available: true
});

                    }


                    /* =====================================
                       STEP 4
                       INSERT PHOTO RECORDS
                    ===================================== */

                    if (
                        photoRecords.length > 0
                    ) {

                        const {
                            error: photoError
                        } = await supabase
                            .from("photos")
                            .insert(
                                photoRecords
                            );


                        if (photoError) {

                            console.error(
                                "Photo database error:",
                                photoError
                            );

                            throw new Error(
                                "Photos uploaded but database records could not be created: " +
                                photoError.message
                            );
                        }
                    }


                    /* =====================================
                       STEP 5
                       GENERATE QR CODE
                    ===================================== */

                    generateQRCode(
                        album.id
                    );


                    /* =====================================
                       STEP 6
                       SAVE QR CODE URL IN DATABASE
                    ===================================== */

                    const galleryURL =
                        getGalleryURL(
                            album.id
                        );


                    const {
                        error: qrError
                    } = await supabase
                        .from("albums")
                        .update({
                            qr_code:
                                galleryURL
                        })
                        .eq(
                            "id",
                            album.id
                        );


                    if (qrError) {

                        console.warn(
                            "QR URL could not be saved:",
                            qrError
                        );
                    }


                    /* =====================================
                       STEP 7
                       SUCCESS MESSAGE
                    ===================================== */

                    if (successMessage) {

                        successMessage.innerHTML = `
                            <strong>
                                ✓ Album created successfully!
                            </strong>

                            <br>

                            ${selectedPhotos.length}
                            photo${selectedPhotos.length === 1 ? "" : "s"}
                            uploaded successfully.

                            <br>

                            Your customers can scan
                            the QR code to access this gallery.
                        `;

                        successMessage.style.display =
                            "block";
                    }


                    /* =====================================
                       STEP 8
                       SAVE CURRENT ALBUM ID
                       TEMPORARY NAVIGATION HELPER
                    ===================================== */

                    sessionStorage.setItem(
                        "shotmarket_current_album",
                        album.id
                    );


                    console.log(
                        "ShotMarket album completed:",
                        album.id
                    );


                    alert(
                        "Album created and photos uploaded successfully!"
                    );


                } catch (error) {

                    console.error(
                        "ShotMarket upload error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Something went wrong while creating the album."
                    );

                } finally {

                    if (createButton) {

                        createButton.disabled =
                            false;

                        createButton.innerHTML =
                            `
                            Create Album & Generate QR
                            <span> →</span>
                            `;
                    }
                }
            }
        );
    }


    /* =====================================================
       GENERATE QR CODE
    ===================================================== */

    function generateQRCode(albumId) {

        if (!qrContainer) {

            console.warn(
                "QR container not found."
            );

            return;
        }


        qrContainer.innerHTML = "";


        const galleryURL =
            getGalleryURL(albumId);


        if (
            typeof QRCode ===
            "undefined"
        ) {

            qrContainer.innerHTML = `
                <p style="color:#e8c547;">
                    QR library not loaded.
                </p>
            `;

            return;
        }


        new QRCode(
            qrContainer,
            {
                text:
                    galleryURL,

                width:
                    180,

                height:
                    180,

                colorDark:
                    "#000000",

                colorLight:
                    "#ffffff",

                correctLevel:
                    QRCode.CorrectLevel.H
            }
        );


        if (qrPlaceholder) {

            qrPlaceholder.style.display =
                "none";
        }


        qrContainer.style.display =
            "block";


        if (qrStatus) {

            qrStatus.textContent =
                "● QR Generated";
        }


        if (downloadQrButton) {

            downloadQrButton.style.display =
                "inline-flex";

            downloadQrButton.onclick =
                downloadQRCode;
        }


        console.log(
            "QR Code URL:",
            galleryURL
        );
    }


    /* =====================================================
       GALLERY URL
    ===================================================== */

    function getGalleryURL(albumId) {

        return (
            window.location.origin +
            window.location.pathname
                .replace(
                    /[^/]+$/,
                    ""
                ) +
            "gallery.html?album=" +
            encodeURIComponent(
                albumId
            )
        );
    }


    /* =====================================================
       DOWNLOAD QR CODE
    ===================================================== */

    function downloadQRCode() {

        const qrImage =
            qrContainer?.querySelector(
                "img"
            );


        if (!qrImage) {

            alert(
                "Please generate the QR code first."
            );

            return;
        }


        const link =
            document.createElement("a");


        link.href =
            qrImage.src;

        link.download =
            "shotmarket-qr-code.png";


        document.body.appendChild(
            link
        );

        link.click();

        link.remove();
    }


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(text) {

        return String(text)
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

});