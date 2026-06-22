function saveData(key, data) {
    try {
        const jsonString = JSON.stringify(data);
        const encoded = btoa(unescape(encodeURIComponent(jsonString)));

        localStorage.setItem(key, encoded);

        return true;
    } catch (error) {
        console.error("Kayıt Hatası:", key, error);

        alert("Depolama alanı doldu. Lütfen eski fotoğraf kayıtlarını temizleyin.");

        return false;
    }
}

function loadData(key) {
    const encoded = localStorage.getItem(key);

    if (!encoded) return null;

    try {
        const decoded = decodeURIComponent(escape(atob(encoded)));
        return JSON.parse(decoded);

    } catch (e) {
        try {
            return JSON.parse(encoded);

        } catch (e2) {
            console.error("Veri okunamadı:", key);
            return null;
        }
    }
}