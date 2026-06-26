window.migratePasswordsToHash = async function () {

    try {

        const adminPass = loadData("marigold_admin_pass");
        const receptionPass = loadData("marigold_reception_pass");
        const pin = loadData("marigold_pin");

        if (!adminPass || !receptionPass || !pin) {
            alert("Şifreler bulunamadı.");
            return;
        }

        if (
            isHash(adminPass) &&
            isHash(receptionPass) &&
            isHash(pin)
        ) {
            alert("Sistem zaten SHA-256 güvenliğinde.");
            return;
        }

        const hashedAdmin =
            await hashPassword(adminPass);

        const hashedReception =
            await hashPassword(receptionPass);

        const hashedPin =
            await hashPassword(pin);

        saveData("marigold_admin_pass", hashedAdmin);
        saveData("marigold_reception_pass", hashedReception);
        saveData("marigold_pin", hashedPin);

        if (typeof saveSettingsToFirebase === "function") {
            await saveSettingsToFirebase();
        }

        alert(
            "✅ Sistem başarıyla SHA-256 güvenliğine geçirildi.\n\nLütfen tekrar giriş yapınız."
        );

        logout();

    } catch (err) {

        console.error(err);

        alert("Güvenliğe yükseltme sırasında hata oluştu.");

    }

};
window.hideSecurityUpgradeButton = function () {

    const btn = document.getElementById("upgradeSecurityBtn");
    if (!btn) return;

    const adminPass = loadData("marigold_admin_pass");
    const receptionPass = loadData("marigold_reception_pass");
    const pin = loadData("marigold_pin");

    if (
        isHash(adminPass) &&
        isHash(receptionPass) &&
        isHash(pin)
    ) {
        btn.style.display = "none";
       } else {
        btn.style.display = "";
    }
};