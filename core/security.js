// GÜVENLİK: Şifreleri LocalStorage'a tanımlayan fonksiyon
function checkSystemSecurity() {
    // Eğer şifreler hiç yoksa (ilk kurulum), varsayılanları şifreleyerek kaydet
    if (!localStorage.getItem("marigold_pin")) {
        saveData("marigold_pin", "1453");
    }
    if (!localStorage.getItem("marigold_admin_pass")) {
    saveData("marigold_admin_pass", "marigold16");
}

const savedLock =
    loadData("marigold_admin_locked_until");

if (savedLock) {
    adminLockedUntil = savedLock;
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