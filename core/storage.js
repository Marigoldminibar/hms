async function firebaseBackup(key, data) {

    try {

        if (!window.db) return;

        const {
            doc,
            setDoc
        } = await import(
            "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
        );

        await setDoc(
            doc(window.db, "marigold_backup", key),
            {
                key: key,
                data: data,
                updatedAt: new Date().toISOString()
            }
        );

    } catch (err) {

        console.error(
            "Firebase Yedekleme Hatası:",
            key,
            err
        );
    }
}

function saveData(key, data) {

    try {

        const jsonString =
            JSON.stringify(data);

        const encoded =
            btoa(
                unescape(
                    encodeURIComponent(jsonString)
                )
            );

        localStorage.setItem(
    key,
    encoded
);

if (
    key === "marigold_room_memory" ||
    key === "marigold_approved"
) {
    return true;
}

firebaseBackup(
    key,
    data
);

        return true;

    } catch (error) {

        console.error(
            "Kayıt Hatası:",
            key,
            error
        );

        alert(
            "Depolama alanı doldu. Lütfen eski fotoğraf kayıtlarını temizleyin."
        );

        return false;
    }
}

function loadData(key) {

    const encoded =
        localStorage.getItem(key);

    if (!encoded) return null;

    try {

        const decoded =
            decodeURIComponent(
                escape(
                    atob(encoded)
                )
            );

        return JSON.parse(decoded);

    } catch (e) {

        try {

            return JSON.parse(encoded);

        } catch (e2) {

            console.error(
                "Veri okunamadı:",
                key
            );

            return null;
        }
    }
}
