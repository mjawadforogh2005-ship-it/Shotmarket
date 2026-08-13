/* =========================================================
   SHOTMARKET GALLERY SYSTEM
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    // =====================================================
    // ELEMENTS
    // =====================================================

    const photoGrid =
        document.getElementById("photoGrid");

    const emptyState =
        document.getElementById("emptyState");

    const errorState =
        document.getElementById("errorState");

    const albumTitle =
        document.getElementById("albumTitle");

    const albumDate =
        document.getElementById("albumDate");

    const albumLocation =
        document.getElementById("albumLocation");

    const albumPhotoCount =
        document.getElementById("albumPhotoCount");

    const selectedCounter =
        document.getElementById("selectedCounter");

    const purchaseBar =
        document.getElementById("purchaseBar");

    const purchaseCount =
        document.getElementById("purchaseCount");

    const selectAllBtn =
        document.getElementById("selectAllBtn");

    const continuePaymentBtn =
        document.getElementById("continuePaymentBtn");


    // =====================================================
    // STATE
    // =====================================================

    let currentAlbum = null;

    let selectedPhotos = [];

    let currentLightboxIndex = 0;


    // =====================================================
    // GET ALBUM ID FROM URL
    // =====================================================

    const urlParams =
        new URLSearchParams(window.location.search);

    const albumId =
        urlParams.get("album");


    // =====================================================
    // LOAD ALBUM
    // =====================================================

    function loadAlbum() {

        let albums = [];


        try {

                // Try the canonical storage key used by the upload/storage modules
                albums =
                    JSON.parse(
                        localStorage.getItem(
                            "shotmarket_albums"
                        )
                    ) || [];

        } catch (error) {

            console.error(
                "Could not read albums:",
                error
            );

            showError();

            return;
        }


        // -------------------------------------------------
        // If no album ID was provided
        // -------------------------------------------------

        if (!albumId) {

            // Try latest album

            try {
                // The upload flow saves the latest album ID as a plain string
                // under the key `shotmarket_current_album`. Read that first
                // and locate the album by id in the albums array.

                const latestId =
                    localStorage.getItem(
                        "shotmarket_current_album"
                    ) || localStorage.getItem("shotmarketCurrentAlbum");

                if (latestId) {

                    currentAlbum = albums.find(
                        album => album.id === latestId
                    );

                } else {

                    currentAlbum = null;

                }

            } catch (error) {

                console.error("Could not read current album:", error);

                currentAlbum = null;

            }


            if (!currentAlbum) {

                showError();

                return;

            }

        } else {

            // -------------------------------------------------
            // Find requested album
            // -------------------------------------------------

            currentAlbum =
                albums.find(
                    album => album.id === albumId
                );


            if (!currentAlbum) {

                showError();

                return;

            }

        }


        renderAlbum();

        renderPhotos();

        updateSelection();

    }


    // =====================================================
    // RENDER ALBUM INFORMATION
    // =====================================================

    function renderAlbum() {

        albumTitle.textContent =
            currentAlbum.name ||
            "Untitled Album";


        // Date

        if (currentAlbum.date) {

            const date =
                new Date(currentAlbum.date);


            if (!isNaN(date)) {

                albumDate.textContent =
                    date.toLocaleDateString(
                        "en-US",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }
                    );

            } else {

                albumDate.textContent =
                    currentAlbum.date;

            }

        } else {

            albumDate.textContent =
                "Date unavailable";

        }


        // Location

        albumLocation.textContent =
            currentAlbum.location ||
            "Location unavailable";


        // Photo count

        const photos =
            currentAlbum.photos || [];


        albumPhotoCount.textContent =
            `${photos.length} photo${photos.length === 1 ? "" : "s"}`;

    }


    // =====================================================
    // RENDER PHOTOS
    // =====================================================

    function renderPhotos() {

        const photos =
            currentAlbum.photos || [];


        photoGrid.innerHTML = "";


        if (photos.length === 0) {

            photoGrid.style.display =
                "none";

            emptyState.style.display =
                "flex";

            return;

        }


        photoGrid.style.display =
            "grid";

        emptyState.style.display =
            "none";


        photos.forEach((photo, index) => {

            const card =
                document.createElement("article");


            card.className =
                "photo-card";


            card.dataset.index =
                index;


            card.innerHTML = `

                <div class="photo-image-wrapper">

                    <img
                        src="${photo.data}"
                        alt="${escapeHTML(photo.name || "Photo")}"
                        class="gallery-photo"
                        loading="lazy"
                    >


                    <div class="photo-overlay">

                        <button
                            type="button"
                            class="preview-photo"
                            data-index="${index}"
                            title="Preview"
                        >

                            <i class="fa-solid fa-expand"></i>

                        </button>

                    </div>


                    <label class="photo-checkbox">

                        <input
                            type="checkbox"
                            class="photo-select"
                            data-index="${index}"
                        >

                        <span class="custom-checkbox">

                            <i class="fa-solid fa-check"></i>

                        </span>

                    </label>

                </div>


                <div class="photo-card-info">

                    <span class="photo-number">
                        Photo ${index + 1}
                    </span>

                    <span class="photo-filename">
                        ${escapeHTML(photo.name || "Untitled")}
                    </span>

                </div>

            `;


            photoGrid.appendChild(card);

        });


        attachPhotoEvents();

    }


    // =====================================================
    // PHOTO EVENTS
    // =====================================================

    function attachPhotoEvents() {

        // ---------------------------------------------
        // CHECKBOXES
        // ---------------------------------------------

        const checkboxes =
            document.querySelectorAll(
                ".photo-select"
            );


        checkboxes.forEach(checkbox => {

            checkbox.addEventListener(
                "change",
                () => {

                    const index =
                        Number(
                            checkbox.dataset.index
                        );


                    if (checkbox.checked) {

                        if (
                            !selectedPhotos.includes(index)
                        ) {

                            selectedPhotos.push(index);

                        }

                    } else {

                        selectedPhotos =
                            selectedPhotos.filter(
                                item => item !== index
                            );

                    }


                    updateSelection();

                }
            );

        });


        // ---------------------------------------------
        // PREVIEW BUTTONS
        // ---------------------------------------------

        const previewButtons =
            document.querySelectorAll(
                ".preview-photo"
            );


        previewButtons.forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    const index =
                        Number(
                            button.dataset.index
                        );


                    openLightbox(index);

                }
            );

        });


        // ---------------------------------------------
        // CLICK IMAGE TO PREVIEW
        // ---------------------------------------------

        const images =
            document.querySelectorAll(
                ".gallery-photo"
            );


        images.forEach(image => {

            image.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    const card =
                        image.closest(".photo-card");


                    const index =
                        Number(
                            card.dataset.index
                        );


                    openLightbox(index);

                }
            );

        });

    }


    // =====================================================
    // UPDATE SELECTION
    // =====================================================

    function updateSelection() {

        const count =
            selectedPhotos.length;


        selectedCounter.textContent =
            `${count} selected`;


        purchaseCount.textContent =
            count;


        // Enable/disable payment button

        continuePaymentBtn.disabled =
            count === 0;


        // Update button appearance

        if (count > 0) {

            purchaseBar.classList.add(
                "active"
            );

        } else {

            purchaseBar.classList.remove(
                "active"
            );

        }


        // Update checkboxes

        document
            .querySelectorAll(".photo-select")
            .forEach(checkbox => {

                const index =
                    Number(
                        checkbox.dataset.index
                    );


                checkbox.checked =
                    selectedPhotos.includes(index);


                const card =
                    checkbox.closest(".photo-card");


                if (card) {

                    card.classList.toggle(
                        "selected",
                        checkbox.checked
                    );

                }

            });


        // Select all button

        const total =
            currentAlbum?.photos?.length || 0;


        if (
            total > 0 &&
            count === total
        ) {

            selectAllBtn.innerHTML = `
                <i class="fa-solid fa-square-minus"></i>
                Clear Selection
            `;

        } else {

            selectAllBtn.innerHTML = `
                <i class="fa-regular fa-square-check"></i>
                Select All
            `;

        }

    }


    // =====================================================
    // SELECT ALL
    // =====================================================

    selectAllBtn.addEventListener(
        "click",
        () => {

            const total =
                currentAlbum?.photos?.length || 0;


            if (selectedPhotos.length === total) {

                selectedPhotos = [];

            } else {

                selectedPhotos =
                    Array.from(
                        { length: total },
                        (_, index) => index
                    );

            }


            updateSelection();

        }
    );


    // =====================================================
    // CONTINUE TO PAYMENT
    // =====================================================

    continuePaymentBtn.addEventListener(
        "click",
        () => {

            if (selectedPhotos.length === 0) {

                return;

            }


            // -----------------------------------------
            // Get selected photo objects
            // -----------------------------------------

            const photos =
                selectedPhotos.map(
                    index =>
                        currentAlbum.photos[index]
                );


            // -----------------------------------------
            // Save purchase information
            // -----------------------------------------

            const purchase = {

                albumId:
                    currentAlbum.id,

                albumName:
                    currentAlbum.name,

                photos:
                    photos,

                photoCount:
                    photos.length,

                createdAt:
                    new Date().toISOString()

            };


            localStorage.setItem(

                "shotmarketCurrentPurchase",

                JSON.stringify(purchase)

            );


            // -----------------------------------------
            // Go to payment
            // -----------------------------------------

            window.location.href =
                `payment.html?album=${encodeURIComponent(
                    currentAlbum.id
                )}`;

        }
    );


    // =====================================================
    // LIGHTBOX
    // =====================================================

    const lightbox =
        document.getElementById("lightbox");

    const lightboxImage =
        document.getElementById("lightboxImage");

    const lightboxCounter =
        document.getElementById("lightboxCounter");

    const closeLightbox =
        document.getElementById("closeLightbox");

    const previousPhoto =
        document.getElementById("previousPhoto");

    const nextPhoto =
        document.getElementById("nextPhoto");


    function openLightbox(index) {

        const photos =
            currentAlbum?.photos || [];


        if (!photos[index]) {

            return;

        }


        currentLightboxIndex =
            index;


        lightboxImage.src =
            photos[index].data;


        lightboxImage.alt =
            photos[index].name || "Photo";


        lightboxCounter.textContent =
            `${index + 1} / ${photos.length}`;


        lightbox.classList.add(
            "open"
        );


        document.body.classList.add(
            "lightbox-open"
        );

    }


    function closeLightboxWindow() {

        lightbox.classList.remove(
            "open"
        );


        document.body.classList.remove(
            "lightbox-open"
        );

    }


    function showPreviousPhoto() {

        const photos =
            currentAlbum?.photos || [];


        if (photos.length === 0) {

            return;

        }


        currentLightboxIndex--;

        if (currentLightboxIndex < 0) {

            currentLightboxIndex =
                photos.length - 1;

        }


        updateLightbox();

    }


    function showNextPhoto() {

        const photos =
            currentAlbum?.photos || [];


        if (photos.length === 0) {

            return;

        }


        currentLightboxIndex++;

        if (
            currentLightboxIndex >=
            photos.length
        ) {

            currentLightboxIndex = 0;

        }


        updateLightbox();

    }


    function updateLightbox() {

        const photos =
            currentAlbum?.photos || [];


        const photo =
            photos[currentLightboxIndex];


        if (!photo) {

            return;

        }


        lightboxImage.src =
            photo.data;


        lightboxImage.alt =
            photo.name || "Photo";


        lightboxCounter.textContent =
            `${currentLightboxIndex + 1} / ${photos.length}`;

    }


    closeLightbox.addEventListener(
        "click",
        closeLightboxWindow
    );


    previousPhoto.addEventListener(
        "click",
        showPreviousPhoto
    );


    nextPhoto.addEventListener(
        "click",
        showNextPhoto
    );


    // Click outside image

    lightbox.addEventListener(
        "click",
        event => {

            if (
                event.target === lightbox
            ) {

                closeLightboxWindow();

            }

        }
    );


    // Keyboard controls

    document.addEventListener(
        "keydown",
        event => {

            if (
                !lightbox.classList.contains("open")
            ) {

                return;

            }


            if (event.key === "Escape") {

                closeLightboxWindow();

            }


            if (event.key === "ArrowLeft") {

                showPreviousPhoto();

            }


            if (event.key === "ArrowRight") {

                showNextPhoto();

            }

        }
    );


    // =====================================================
    // ERROR
    // =====================================================

    function showError() {

        photoGrid.style.display =
            "none";

        emptyState.style.display =
            "none";

        errorState.style.display =
            "flex";

        albumTitle.textContent =
            "Gallery Not Found";

    }


    // =====================================================
    // SECURITY
    // =====================================================

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


    // =====================================================
    // START
    // =====================================================

    loadAlbum();


    console.log(
        "ShotMarket Gallery initialized successfully."
    );

});