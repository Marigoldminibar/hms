window.isFirstSetup = async function () {

    if (!window.db) return false;

    const {
        doc,
        getDoc
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    const snapshot =
        await getDoc(
            doc(db, "live_data", "settings")
        );

    if (!snapshot.exists()) {
        return true;
    }

    const settings = snapshot.data();

    return settings.setupCompleted !== true;

};
window.completeFirstSetup = async function () {

    const hotelName =
        document.getElementById("setupHotelName").value.trim();

    const adminPass =
        document.getElementById("setupAdminPass").value.trim();

    const receptionPass =
        document.getElementById("setupReceptionPass").value.trim();

    const pin =
        document.getElementById("setupPin").value.trim();

    if (!hotelName || !adminPass || !receptionPass || !pin) {
        alert("Lütfen tüm alanları doldurun.");
        return;
    }

    saveData(
    "marigold_admin_pass",
    await hashPassword(adminPass)
);

saveData(
    "marigold_reception_pass",
    await hashPassword(receptionPass)
);

saveData(
    "marigold_pin",
    await hashPassword(pin)
);

    const {
        doc,
        setDoc
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    await setDoc(
        doc(db, "live_data", "settings"),
        {
            hotelName: hotelName,
            setupCompleted: true,
            version: "1.0.0",
            installedAt: new Date().toISOString(),
           adminPass: await hashPassword(adminPass),
           receptionPass: await hashPassword(receptionPass),
           pin: await hashPassword(pin),
        }
    );

    alert("Kurulum tamamlandı.\n\nSayfa yeniden yüklenecek.");

    location.reload();

};