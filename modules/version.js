const APP_VERSION = "1.0.0";

async function checkVersion() {

    try {

        if (typeof getDoc !== "function" || typeof doc !== "function") {
            return;
        }

        const snap = await getDoc(
            doc(db, "live_data", "settings")
        );

        if (!snap.exists()) return;

        const data = snap.data();

        if (!data.version) return;

        if (data.version !== APP_VERSION) {

           if (confirm(
    "Yeni Marigold HMS sürümü bulundu.\n\n" +
    "Şimdi güncellemek ister misiniz?"
)) {
    location.reload(true);
}

        }

    } catch (err) {

        console.log("Version kontrol hatası:", err);

    }

}
window.checkVersion = checkVersion;