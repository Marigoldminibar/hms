// =====================================================
// Marigold HMS - SHA-256 Security Upgrade
// =====================================================

const SECURITY_KEYS = [
    "marigold_admin_pass",
    "marigold_reception_pass",
    "marigold_pin"
];

// -----------------------------------------------------
// SHA-256 Güvenlik Yükseltme
// -----------------------------------------------------
window.migratePasswordsToHash = async function () {

    try {

        // Tüm şifreleri oku
        const values = SECURITY_KEYS.map(key => loadData(key));

        if (values.some(value => !value)) {
            alert("Şifreler bulunamadı.");
            return;
        }

        // Hepsi zaten hash ise sessizce çık
if (values.every(isHash)) {
    return;
}

        // Hash'e çevir
        for (let i = 0; i < SECURITY_KEYS.length; i++) {

            saveData(
                SECURITY_KEYS[i],
                await hashPassword(values[i])
            );

        }

        saveData("marigold_password_migrated", true);

        // Firebase'e kaydet
        if (typeof saveSettingsToFirebase === "function") {
            await saveSettingsToFirebase();
        }

        alert(
            "✅ Sistem başarıyla SHA-256 güvenliğine geçirildi.\n\nLütfen tekrar giriş yapınız."
        );

        logout();

    } catch (err) {

        console.error("SHA Upgrade:", err);

        alert("Güvenlik yükseltme sırasında hata oluştu.");

    }

};

// -----------------------------------------------------
// SHA Butonunu Gizle
// -----------------------------------------------------
window.hideSecurityUpgradeButton = function () {

    const btn = document.getElementById("upgradeSecurityBtn");

    if (!btn) return;

    const upgraded = SECURITY_KEYS.every(key =>
        isHash(loadData(key))
    );

    btn.style.display = upgraded ? "none" : "";

};