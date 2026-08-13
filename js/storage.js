/* =========================================================
   SHOTMARKET STORAGE SYSTEM
   Frontend temporary database using localStorage
========================================================= */

const SHOTMARKET_STORAGE_KEY = "shotmarket_albums";

/* =========================================================
   GET ALL ALBUMS
========================================================= */

function getAlbums() {
    try {
        const albums = localStorage.getItem(SHOTMARKET_STORAGE_KEY);

        if (!albums) {
            return [];
        }

        return JSON.parse(albums);

    } catch (error) {
        console.error("Could not load albums:", error);
        return [];
    }
}


/* =========================================================
   SAVE ALL ALBUMS
========================================================= */

function saveAlbums(albums) {
    try {

        localStorage.setItem(
            SHOTMARKET_STORAGE_KEY,
            JSON.stringify(albums)
        );

        return true;

    } catch (error) {

        console.error("Could not save albums:", error);

        return false;
    }
}


/* =========================================================
   CREATE ALBUM
========================================================= */

function createAlbum(album) {

    const albums = getAlbums();

    const newAlbum = {

        id: "album_" + Date.now(),

        name: album.name || "Untitled Album",

        date: album.date || "",

        location: album.location || "",

        description: album.description || "",

        privacy: album.privacy || "private",

        photos: album.photos || [],

        qrCode: album.qrCode || "",

        bankInfo: album.bankInfo || {

            bankName: "Example Bank",

            accountName: "ShotMarket Photographer",

            accountNumber: "0000000000",

            iban: "KZ00 0000 0000 0000 0000"

        },

        price: album.price || 10,

        createdAt: new Date().toISOString()
    };


    albums.push(newAlbum);

    saveAlbums(albums);

    return newAlbum;
}


/* =========================================================
   FIND ALBUM BY ID
========================================================= */

function getAlbumById(id) {

    const albums = getAlbums();

    return albums.find(
        album => album.id === id
    );
}


/* =========================================================
   UPDATE ALBUM
========================================================= */

function updateAlbum(updatedAlbum) {

    const albums = getAlbums();

    const index = albums.findIndex(
        album => album.id === updatedAlbum.id
    );

    if (index === -1) {
        return false;
    }

    albums[index] = updatedAlbum;

    return saveAlbums(albums);
}


/* =========================================================
   DELETE ALBUM
========================================================= */

function deleteAlbum(id) {

    let albums = getAlbums();

    albums = albums.filter(
        album => album.id !== id
    );

    saveAlbums(albums);
}


/* =========================================================
   CLEAR SHOTMARKET DATA
   Development only
========================================================= */

function clearShotMarketData() {

    localStorage.removeItem(
        SHOTMARKET_STORAGE_KEY
    );

    console.log("ShotMarket data cleared.");
}