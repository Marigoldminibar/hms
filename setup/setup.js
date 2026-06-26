// =====================================================
// Marigold HMS - First Setup Manager
// =====================================================

const APP_VERSION = "1.0.0";

// -----------------------------------------------------
// İlk Kurulum Kontrolü
// -----------------------------------------------------
window.isFirstSetup = async function () {

    if (!window.db) return false;

    const { doc, getDoc } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    const snap = await getDoc(
        doc(db, "live_data", "settings")
    );

    if (!snap.exists()) return true;

    const data = snap.data();

    return data.setupCompleted !== true;

};

// -----------------------------------------------------
// İlk Kurulumu Tamamla
// -----------------------------------------------------
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

    // Bir kez hashle
    const hashedAdmin =
        await hashPassword(adminPass);

    const hashedReception =
        await hashPassword(receptionPass);

    const hashedPin =
        await hashPassword(pin);

    // Local Cache
    saveData("marigold_admin_pass", hashedAdmin);
    saveData("marigold_reception_pass", hashedReception);
    saveData("marigold_pin", hashedPin);

    saveData("marigold_password_migrated", true);

    const { doc, setDoc } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    await setDoc(
        doc(db, "live_data", "settings"),
        {

            hotelName,

            setupCompleted: true,

            version: APP_VERSION,

            installedAt: new Date().toISOString(),

            adminPass: hashedAdmin,

            receptionPass: hashedReception,

            pin: hashedPin

        }
    );

    alert(
        "Kurulum tamamlandı.\n\nProgram yeniden başlatılıyor."
    );

    location.reload();

};