// GÜVENLİK: Şifreleri LocalStorage'a tanımlayan fonksiyon
function checkSystemSecurity() {
    // Eğer şifreler hiç yoksa (ilk kurulum), varsayılanları şifreleyerek kaydet
   // İlk kurulum kontrolü
const hasPin = loadData("marigold_pin");
const hasAdminPass = loadData("marigold_admin_pass");

if (!hasPin || !hasAdminPass) {
    console.warn("İlk kurulum tamamlanmamış. Varsayılan şifre oluşturulmuyor.");
}

const savedLock =
    loadData("marigold_admin_locked_until");

if (savedLock) {
    adminLockedUntil = savedLock;
}
if (!loadData("marigold_password_migrated")) {
    migratePasswordsToHash();
}
}
function resetIdleTimer() {
    idleTime = 0;
}
/*
setInterval(() => {
    idleTime++;
    if (idleTime >= idleLimit) {
        console.log("Güvenlik: Zaman aşımı, oturum kapatılıyor...");
        logout(); 
        idleTime = 0;
    }
}, 60000); // 1 dakikada bir kontrol et
*/

// -------------------------------
// Şifre Migration (Bir Kez Çalışır)
// -------------------------------

async function migratePasswordsToHash() {

    const migrated = loadData("marigold_password_migrated");

    if (migrated) return;

    const adminPass = loadData("marigold_admin_pass");
    const receptionPass = loadData("marigold_reception_pass");
    const staffPin = loadData("marigold_pin");

    function isHash(value) {
        return typeof value === "string" &&
               /^[a-f0-9]{64}$/i.test(value);
    }

    if (adminPass && !isHash(adminPass)) {
        saveData(
            "marigold_admin_pass",
            await hashPassword(adminPass)
        );
    }

    if (receptionPass && !isHash(receptionPass)) {
        saveData(
            "marigold_reception_pass",
            await hashPassword(receptionPass)
        );
    }

    if (staffPin && !isHash(staffPin)) {
        saveData(
            "marigold_pin",
            await hashPassword(staffPin)
        );
    }

    saveData("marigold_password_migrated", true);

    console.log("Şifre Migration Tamamlandı");
}