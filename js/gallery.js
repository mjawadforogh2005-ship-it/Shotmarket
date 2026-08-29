/* =========================================================
   SHOTMARKET - DATABASE GALLERY
   Gallery → Supabase Albums → Photos → Storage
   ========================================================= */

import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://xplcaiygifwnxyevvqsr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_16S4x_HPLxfsUk1RTgR4Qw_gnvlyqD_";

const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   PAGE START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "ShotMarket Gallery System Loaded 🚀"
        );


        /* =================================================
           ELEMENTS
        ================================================= */

        const albumTitle =
            document.getElementById("albumTitle");

        const albumDescription =
            document.getElementById("albumDescription");

        const albumDate =
            document.getElementById("albumDate");

        const albumLocation =
            document.getElementById("albumLocation");

        const albumPhotoCount =
            document.getElementById("albumPhotoCount");

        const photoGrid =
            document.getElementById("photoGrid");

        const emptyState =
            document.getElementById("emptyState");

        const errorState =
            document.getElementById("errorState");

        const selectAllBtn =
            document.getElementById("selectAllBtn");

        const selectedCounter =
            document.getElementById("selectedCounter");

        const purchaseBar =
            document.getElementById("purchaseBar");

        const purchaseCount =
            document.getElementById("purchaseCount");

        const continuePaymentBtn =
            document.getElementById(
                "continuePaymentBtn"
            );


        /* =================================================
           LIGHTBOX ELEMENTS
        ================================================= */

        const lightbox =
            document.getElementById("lightbox");

        const lightboxImage =
            document.getElementById("lightboxImage");

        const closeLightbox =
            document.getElementById("closeLightbox");

        const previousPhoto =
            document.getElementById("previousPhoto");

        const nextPhoto =
            document.getElementById("nextPhoto");

        const lightboxCounter =
            document.getElementById("lightboxCounter");


        /* =================================================
           STATE
        ================================================= */

        let album = null;

        let photos = [];

        let selectedPhotos = [];

        let currentLightboxIndex = 0;


        /* =================================================
           GET ALBUM ID FROM URL
        ================================================= */

        const urlParams =
            new URLSearchParams(
                window.location.search
            );

        let albumId =
            urlParams.get("album");


        if (!albumId) {

            albumId =
                sessionStorage.getItem(
                    "shotmarket_current_album"
                );
        }


        console.log(
            "Gallery Album ID:",
            albumId
        );


        /* =================================================
           VALIDATE ALBUM ID
        ================================================= */

        if (!albumId) {

            showError();

            return;
        }


        /* =================================================
           LOAD GALLERY
        ================================================= */

        await loadGallery();


        /* =================================================
           LOAD GALLERY FUNCTION
        ================================================= */

        async function loadGallery() {

            try {

                /* =========================================
                   STEP 1
                   LOAD ALBUM
                ========================================= */

                const {
                    data: albumData,
                    error: albumError
                } = await supabase
                    .from("albums")
                    .select("*")
                    .eq(
                        "id",
                        albumId
                    )
                    .single();


                if (albumError) {

                    console.error(
                        "Album loading error:",
                        albumError
                    );

                    throw albumError;
                }


                if (!albumData) {

                    showError();

                    return;
                }


                album =
                    albumData;


                console.log(
                    "Album loaded:",
                    album
                );


                /* =========================================
                   STEP 2
                   DISPLAY ALBUM INFORMATION
                ========================================= */

                displayAlbum();


                /* =========================================
                   STEP 3
                   LOAD PHOTOS
                ========================================= */

                const {
                    data: photoData,
                    error: photoError
                } = await supabase
                    .from("photos")
                    .select("*")
                    .eq(
                        "album_id",
                        albumId
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    );


                if (photoError) {

                    console.error(
                        "Photo loading error:",
                        photoError
                    );

                    throw photoError;
                }


                photos =
                    photoData || [];


                console.log(
                    "Photos loaded:",
                    photos
                );


                /* =========================================
                   STEP 4
                   BUILD STORAGE URLS
                ========================================= */

                photos =
                    photos.map(
                        photo => {

                            const {
                                data
                            } =
                                supabase
                                    .storage
                                    .from(
                                        "shotmarket-photos"
                                    )
                                    .getPublicUrl(
                                        photo.storage_path
                                    );


                            return {
                                ...photo,
                                displayUrl:
                                    data.publicUrl
                            };
                        }
                    );


                /* =========================================
                   STEP 5
                   DISPLAY PHOTOS
                ========================================= */

                displayPhotos();


            } catch (error) {

                console.error(
                    "Gallery loading failed:",
                    error
                );

                showError();
            }
        }


        /* =================================================
           DISPLAY ALBUM
        ================================================= */

        function displayAlbum() {

            if (!album) {
                return;
            }


            if (albumTitle) {

                albumTitle.textContent =
                    album.name ||
                    "Untitled Album";
            }


            if (albumDescription) {

                albumDescription.textContent =
                    album.description ||
                    "Your photographer has prepared your private photo gallery.";
            }


            if (albumDate) {

                albumDate.textContent =
                    formatDate(
                        album.event_date
                    );
            }


            if (albumLocation) {

                albumLocation.textContent =
                    album.location ||
                    "—";
            }


            if (albumPhotoCount) {

                albumPhotoCount.textContent =
                    `${photos.length} photo${
                        photos.length === 1
                            ? ""
                            : "s"
                    }`;
            }
        }


        /* =================================================
           DISPLAY PHOTOS
        ================================================= */

        function displayPhotos() {

            if (!photoGrid) {
                return;
            }


            photoGrid.innerHTML = "";


            if (!photos.length) {

                if (emptyState) {

                    emptyState.style.display =
                        "block";
                }

                if (purchaseBar) {

                    purchaseBar.style.display =
                        "none";
                }

                return;
            }


            if (emptyState) {

                emptyState.style.display =
                    "none";
            }


            if (purchaseBar) {

                purchaseBar.style.display =
                    "flex";
                purchaseBar.classList.toggle(
                    "active",
                    selectedPhotos.length > 0
                );
            }


            photos.forEach(
                (photo, index) => {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "photo-card";


                    card.dataset.photoId =
                        photo.id;


                    card.innerHTML = `

                        <div class="photo-image-wrapper">

                            <img
                                src="${escapeHTML(
                                    photo.displayUrl
                                )}"
                                alt="${escapeHTML(
                                    photo.file_name ||
                                    "ShotMarket Photo"
                                )}"
                                loading="lazy"
                            >

                            <div class="photo-overlay">

                                <button
                                    type="button"
                                    class="preview-photo-btn"
                                    data-index="${index}"
                                    aria-label="Preview photo"
                                >
                                    <i class="fa-solid fa-expand"></i>
                                </button>

                            </div>

                            <label class="photo-select">

                                <input
                                    type="checkbox"
                                    class="photo-checkbox"
                                    data-photo-id="${photo.id}"
                                >

                                <span>
                                    <i class="fa-solid fa-check"></i>
                                </span>

                            </label>

                        </div>

                    `;


                    photoGrid.appendChild(
                        card
                    );
                }
            );


            attachPhotoEvents();


            updateSelection();
        }


        /* =================================================
           PHOTO EVENTS
        ================================================= */

        function attachPhotoEvents() {

            const checkboxes =
                photoGrid.querySelectorAll(
                    ".photo-checkbox"
                );


            checkboxes.forEach(
                checkbox => {

                    checkbox.addEventListener(
                        "change",
                        function () {

                            const photoId =
                                this.dataset.photoId;


                            if (
                                this.checked
                            ) {

                                if (
                                    !selectedPhotos.includes(
                                        photoId
                                    )
                                ) {

                                    selectedPhotos.push(
                                        photoId
                                    );
                                }

                            } else {

                                selectedPhotos =
                                    selectedPhotos.filter(
                                        id =>
                                            id !== photoId
                                    );
                            }


                            updateSelection();
                        }
                    );
                }
            );


            const previewButtons =
                photoGrid.querySelectorAll(
                    ".preview-photo-btn"
                );


            previewButtons.forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function (event) {

                            event.stopPropagation();

                            const index =
                                Number(
                                    this.dataset.index
                                );

                            openLightbox(
                                index
                            );
                        }
                    );
                }
            );


            const imageWrappers =
                photoGrid.querySelectorAll(
                    ".photo-image-wrapper"
                );


            imageWrappers.forEach(
                wrapper => {

                    wrapper.addEventListener(
                        "dblclick",
                        function () {

                            const card =
                                this.closest(
                                    ".photo-card"
                                );

                            if (!card) {
                                return;
                            }


                            const photoId =
                                card.dataset.photoId;


                            const checkbox =
                                card.querySelector(
                                    ".photo-checkbox"
                                );


                            if (checkbox) {

                                checkbox.checked =
                                    !checkbox.checked;


                                checkbox.dispatchEvent(
                                    new Event(
                                        "change"
                                    )
                                );
                            }
                        }
                    );
                }
            );
        }


        /* =================================================
           UPDATE SELECTION
        ================================================= */

        function updateSelection() {

            const count =
                selectedPhotos.length;


            if (selectedCounter) {

                selectedCounter.textContent =
                    `${count} selected`;
            }


            if (purchaseCount) {

                purchaseCount.textContent =
                    count;
            }


            if (purchaseBar) {

                purchaseBar.classList.toggle(
                    "active",
                    count > 0
                );
            }


            if (continuePaymentBtn) {

                continuePaymentBtn.disabled =
                    count === 0;
            }


            /* =============================================
               HIGHLIGHT SELECTED CARDS
            ============================================= */

            const cards =
                photoGrid.querySelectorAll(
                    ".photo-card"
                );


            cards.forEach(
                card => {

                    const photoId =
                        card.dataset.photoId;


                    if (
                        selectedPhotos.includes(
                            photoId
                        )
                    ) {

                        card.classList.add(
                            "selected"
                        );

                    } else {

                        card.classList.remove(
                            "selected"
                        );
                    }
                }
            );
        }


        /* =================================================
           SELECT ALL
        ================================================= */

        if (selectAllBtn) {

            selectAllBtn.addEventListener(
                "click",
                () => {

                    if (
                        selectedPhotos.length ===
                        photos.length
                    ) {

                        /* UNSELECT ALL */

                        selectedPhotos = [];


                        const checkboxes =
                            photoGrid.querySelectorAll(
                                ".photo-checkbox"
                            );


                        checkboxes.forEach(
                            checkbox => {

                                checkbox.checked =
                                    false;
                            }
                        );


                        selectAllBtn.innerHTML = `
                            <i class="fa-regular fa-square-check"></i>
                            Select All
                        `;

                    } else {

                        /* SELECT ALL */

                        selectedPhotos =
                            photos.map(
                                photo =>
                                    photo.id
                            );


                        const checkboxes =
                            photoGrid.querySelectorAll(
                                ".photo-checkbox"
                            );


                        checkboxes.forEach(
                            checkbox => {

                                checkbox.checked =
                                    true;
                            }
                        );


                        selectAllBtn.innerHTML = `
                            <i class="fa-solid fa-square-check"></i>
                            Unselect All
                        `;
                    }


                    updateSelection();
                }
            );
        }


        /* =================================================
           CONTINUE TO PAYMENT
        ================================================= */

        if (continuePaymentBtn) {

            continuePaymentBtn.addEventListener(
                "click",
                () => {

                    if (
                        selectedPhotos.length ===
                        0
                    ) {

                        alert(
                            "Please select at least one photo."
                        );

                        return;
                    }


                    /* =====================================
                       SAVE SELECTION
                    ===================================== */

                    sessionStorage.setItem(
                        "shotmarket_selected_photos",
                        JSON.stringify(
                            selectedPhotos
                        )
                    );


                    sessionStorage.setItem(
                        "shotmarket_current_album",
                        albumId
                    );


                    /* =====================================
                       GO TO PAYMENT
                    ===================================== */

                    window.location.href =
                        "payment.html?album=" +
                        encodeURIComponent(
                            albumId
                        );
                }
            );
        }


        /* =================================================
           LIGHTBOX
        ================================================= */

        function openLightbox(index) {

            if (
                !photos.length ||
                index < 0 ||
                index >= photos.length
            ) {
                return;
            }


            currentLightboxIndex =
                index;


            updateLightbox();


            if (lightbox) {

                lightbox.classList.add(
                    "active"
                );
            }
        }


        function updateLightbox() {

            const photo =
                photos[
                    currentLightboxIndex
                ];


            if (!photo) {
                return;
            }


            if (lightboxImage) {

                lightboxImage.src =
                    photo.displayUrl;

                lightboxImage.alt =
                    photo.file_name ||
                    "ShotMarket Photo";
            }


            if (lightboxCounter) {

                lightboxCounter.textContent =
                    `${currentLightboxIndex + 1} / ${photos.length}`;
            }
        }


        /* =================================================
           CLOSE LIGHTBOX
        ================================================= */

        if (closeLightbox) {

            closeLightbox.addEventListener(
                "click",
                () => {

                    if (lightbox) {

                        lightbox.classList.remove(
                            "active"
                        );
                    }
                }
            );
        }


        /* =================================================
           PREVIOUS PHOTO
        ================================================= */

        if (previousPhoto) {

            previousPhoto.addEventListener(
                "click",
                () => {

                    if (!photos.length) {
                        return;
                    }


                    currentLightboxIndex =
                        (
                            currentLightboxIndex -
                            1 +
                            photos.length
                        ) %
                        photos.length;


                    updateLightbox();
                }
            );
        }


        /* =================================================
           NEXT PHOTO
        ================================================= */

        if (nextPhoto) {

            nextPhoto.addEventListener(
                "click",
                () => {

                    if (!photos.length) {
                        return;
                    }


                    currentLightboxIndex =
                        (
                            currentLightboxIndex +
                            1
                        ) %
                        photos.length;


                    updateLightbox();
                }
            );
        }


        /* =================================================
           CLOSE LIGHTBOX ON BACKDROP
        ================================================= */

        if (lightbox) {

            lightbox.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        lightbox
                    ) {

                        lightbox.classList.remove(
                            "active"
                        );
                    }
                }
            );
        }


        /* =================================================
           KEYBOARD LIGHTBOX CONTROLS
        ================================================= */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    !lightbox ||
                    !lightbox.classList.contains(
                        "active"
                    )
                ) {
                    return;
                }


                if (
                    event.key ===
                    "Escape"
                ) {

                    lightbox.classList.remove(
                        "active"
                    );
                }


                if (
                    event.key ===
                    "ArrowLeft"
                ) {

                    previousPhoto?.click();
                }


                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    nextPhoto?.click();
                }
            }
        );


        /* =================================================
           FORMAT DATE
        ================================================= */

        function formatDate(dateString) {

            if (!dateString) {
                return "—";
            }


            const date =
                new Date(
                    dateString +
                    "T00:00:00"
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return dateString;
            }


            return date.toLocaleDateString(
                undefined,
                {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );
        }


        /* =================================================
           SHOW ERROR
        ================================================= */

        function showError() {

            if (photoGrid) {

                photoGrid.innerHTML = "";
            }
            if (emptyState) {
                emptyState.style.display =
                    "none";
            }
            if (errorState) {

                errorState.style.display =
                    "block";
            }
            if (purchaseBar) {

                purchaseBar.style.display =
                    "none";
                purchaseBar.classList.remove(
                    "active"
                );
            }
        }


        /* =================================================
           ESCAPE HTML
        ================================================= */

        function escapeHTML(value) {

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

    }
);