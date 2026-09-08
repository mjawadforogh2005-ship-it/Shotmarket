import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL =
    "https://xplcaiygifwnxyevvqsr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_16S4x_HPLxfsUk1RTgR4Qw_gnvlyqD_";

const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "ShotMarket Gallery System Loaded 🚀"
        );

        const albumTitle =
            document.getElementById(
                "albumTitle"
            );

        const albumDescription =
            document.getElementById(
                "albumDescription"
            );

        const albumDate =
            document.getElementById(
                "albumDate"
            );

        const albumLocation =
            document.getElementById(
                "albumLocation"
            );

        const albumPhotoCount =
            document.getElementById(
                "albumPhotoCount"
            );

        const photoGrid =
            document.getElementById(
                "photoGrid"
            );

        const emptyState =
            document.getElementById(
                "emptyState"
            );

        const errorState =
            document.getElementById(
                "errorState"
            );

        const selectAllBtn =
            document.getElementById(
                "selectAllBtn"
            );

        const selectedCounter =
            document.getElementById(
                "selectedCounter"
            );

        const purchaseBar =
            document.getElementById(
                "purchaseBar"
            );

        const purchaseCount =
            document.getElementById(
                "purchaseCount"
            );

        const continuePaymentBtn =
            document.getElementById(
                "continuePaymentBtn"
            );

        const downloadPurchasedBtn =
            document.getElementById(
                "downloadPurchasedBtn"
            );

        const lightbox =
            document.getElementById(
                "lightbox"
            );

        const lightboxImage =
            document.getElementById(
                "lightboxImage"
            );

        const closeLightbox =
            document.getElementById(
                "closeLightbox"
            );

        const previousPhoto =
            document.getElementById(
                "previousPhoto"
            );

        const nextPhoto =
            document.getElementById(
                "nextPhoto"
            );

        const lightboxCounter =
            document.getElementById(
                "lightboxCounter"
            );

        let album = null;

        let photos = [];

        let selectedPhotos = [];

        let currentLightboxIndex = 0;

        const urlParams =
            new URLSearchParams(
                window.location.search
            );

        const albumId =
            urlParams.get(
                "album"
            );

        const galleryToken =
            urlParams.get(
                "token"
            );

        console.log(
            "Gallery Album ID:",
            albumId
        );

        console.log(
            "Gallery token present:",
            Boolean(
                galleryToken
            )
        );

        if (
            !albumId ||
            !galleryToken
        ) {

            showError();

            return;
        }

        await loadGallery();

        async function requestPurchasedDownloads() {

            try {

                const sessionResult =
                    await supabase.auth.getSession();

                const session =
                    sessionResult?.data?.session;

                if (!session) {

                    alert(
                        "Please log in to download your purchased photos."
                    );

                    return;
                }

                const response =
                    await fetch(
                        `${SUPABASE_URL}/functions/v1/download-access`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "apikey":
                                    SUPABASE_KEY,

                                "Authorization":
                                    `Bearer ${session.access_token}`
                            },

                            body: JSON.stringify({
                                albumId:
                                    albumId,

                                photoIds:
                                    selectedPhotos
                            })
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Download authorization failed."
                    );
                }

                if (
                    !result.downloads ||
                    result.downloads.length === 0
                ) {

                    throw new Error(
                        "No purchased downloads are available."
                    );
                }

                result.downloads.forEach(
                    (download, index) => {

                        setTimeout(
                            () => {

                                const link =
                                    document.createElement(
                                        "a"
                                    );

                                link.href =
                                    download.downloadUrl;

                                link.download =
                                    download.fileName;

                                link.target =
                                    "_blank";

                                document.body.appendChild(
                                    link
                                );

                                link.click();

                                link.remove();

                            },
                            index * 700
                        );
                    }
                );

            } catch (error) {

                console.error(
                    "Download error:",
                    error
                );

                alert(
                    error.message ||
                    "Could not download your photos."
                );
            }
        }

        async function loadGallery() {

            try {

                const functionUrl =
                    `${SUPABASE_URL}/functions/v1/gallery-access`;

                const response =
                    await fetch(
                        functionUrl,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "apikey":
                                    SUPABASE_KEY
                            },

                            body: JSON.stringify({
                                albumId:
                                    albumId,

                                galleryToken:
                                    galleryToken
                            })
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Could not load gallery."
                    );
                }

                if (
                    !result.album
                ) {

                    throw new Error(
                        "Gallery not found."
                    );
                }

                album =
                    result.album;

                photos =
                    result.photos || [];

                console.log(
                    "Secure gallery loaded:",
                    album
                );

                console.log(
                    "Secure photos loaded:",
                    photos
                );

                displayAlbum();

                displayPhotos();

            } catch (error) {

                console.error(
                    "Gallery loading failed:",
                    error
                );

                showError();
            }
        }

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

        function displayPhotos() {

            if (!photoGrid) {
                return;
            }

            photoGrid.innerHTML =
                "";

            if (!photos.length) {

                if (emptyState) {

                    emptyState.style.display =
                        "block";
                }

                if (purchaseBar) {

                    purchaseBar.style.display =
                        "none";

                    purchaseBar.classList.remove(
                        "active"
                    );
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
                (
                    photo,
                    index
                ) => {

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
                                            id !==
                                            photoId
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
                        function (
                            event
                        ) {

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

        if (selectAllBtn) {

            selectAllBtn.addEventListener(
                "click",
                () => {

                    if (
                        selectedPhotos.length ===
                        photos.length
                    ) {

                        selectedPhotos =
                            [];

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

                        selectAllBtn.innerHTML =
                            `
                            <i class="fa-regular fa-square-check"></i>
                            Select All
                            `;

                    } else {

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

                        selectAllBtn.innerHTML =
                            `
                            <i class="fa-solid fa-square-check"></i>
                            Unselect All
                            `;
                    }

                    updateSelection();
                }
            );
        }

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

                    sessionStorage.setItem(
                        "shotmarket_gallery_token",
                        galleryToken
                    );

                    window.location.href =
                        "payment.html?album=" +
                        encodeURIComponent(
                            albumId
                        ) +
                        "&token=" +
                        encodeURIComponent(
                            galleryToken
                        );
                }
            );
        }

        if (downloadPurchasedBtn) {

            downloadPurchasedBtn.addEventListener(
                "click",
                requestPurchasedDownloads
            );
        }

        function openLightbox(
            index
        ) {

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
                    `${
                        currentLightboxIndex + 1
                    } / ${
                        photos.length
                    }`;
            }
        }

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

        function formatDate(
            dateString
        ) {

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
                    year:
                        "numeric",
                    month:
                        "long",
                    day:
                        "numeric"
                }
            );
        }

        function showError() {

            if (photoGrid) {

                photoGrid.innerHTML =
                    "";
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

        function escapeHTML(
            value
        ) {

            return String(
                value ?? ""
            )
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