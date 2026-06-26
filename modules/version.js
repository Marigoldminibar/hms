// =====================================================
// Marigold HMS - Version Manager v1.0
// =====================================================

window.APP_VERSION = "1.0.0";

let versionChecked = false;

async function checkVersion() {

    if (versionChecked) return;
    versionChecked = true;

    try {

        if (!window.db || typeof getDoc !== "function" || typeof doc !== "function") {
            console.warn("Version kontrolü atlandı.");
            return;
        }

        const snap = await getDoc(
            doc(db, "live_data", "settings")
        );

        if (!snap.exists()) return;

        const data = snap.data();

        if (!data?.version) return;

        if (data.version === APP_VERSION) {
            console.log("Marigold HMS güncel.");
            return;
        }

        console.log(
            `Yeni sürüm bulundu (${data.version})`
        );

        const accepted = confirm(
            "Yeni Marigold HMS sürümü bulundu.\n\n" +
            "Şimdi güncellemek ister misiniz?"
        );

        if (accepted) {

            if ("caches" in window) {
                caches.keys().then(keys => {
                    keys.forEach(key => caches.delete(key));
                });
            }

            location.reload();

        }

    } catch (err) {

        console.error("Version kontrol hatası:", err);

    }

}

window.checkVersion = checkVersion;