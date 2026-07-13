// =====================================================
// Marigold HMS - Security Manager v1.0
// =====================================================

// -------------------------------
// Güvenlik Kontrolü
// -------------------------------
function checkSystemSecurity() {

    // Admin kilidi varsa geri yükle
    const savedLock = loadData("marigold_admin_locked_until");

    if (savedLock) {
        adminLockedUntil = savedLock;
    }

    // Gerekirse eski şifreleri SHA-256'ya dönüştür
    if (!loadData("marigold_password_migrated")) {
        migratePasswordsToHash();
    }
}

// -------------------------------
// Kullanıcı Hareketi
// -------------------------------
function resetIdleTimer() {
    idleTime = 0;
}

/*
setInterval(() => {

    idleTime++;

    if (idleTime >= idleLimit) {

        console.log("Güvenlik: Oturum zaman aşımı.");

        logout();

        idleTime = 0;

    }

}, 60000);
*/

// -------------------------------
// SHA-256 Migration (Bir Kez)
// -------------------------------
async function migratePasswordsToHash() {

    if (loadData("marigold_password_migrated")) {
        return;
    }

    const passwords = [
        "marigold_admin_pass",
        "marigold_reception_pass",
        "marigold_pin"
    ];

    const isHash = value =>
        typeof value === "string" &&
        /^[a-f0-9]{64}$/i.test(value);

    for (const key of passwords) {

        const value = loadData(key);

        if (!value) continue;

        if (isHash(value)) continue;

        saveData(
            key,
            await hashPassword(value)
        );
    }

    saveData("marigold_password_migrated", true);

    console.log("SHA-256 Migration tamamlandı.");
}
