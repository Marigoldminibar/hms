function submitLogin() {
    const savedPin =
        loadData("marigold_pin") || "1453";

    if (currentPin === savedPin) {
    clearPin();

    isStaffLoggedIn = true;

    switchScreen("staffScreen");
    return;
}

    alert("Hatalı PIN!");
    clearPin();
}

    function loginAdmin() {

    if (Date.now() < adminLockedUntil) {
        const remainingMinutes =
            Math.ceil((adminLockedUntil - Date.now()) / 60000);

        alert(
            `Çok fazla hatalı giriş yapıldı.\n\n${remainingMinutes} dakika sonra tekrar deneyin.`
        );

        return;
    }

    const mail =
        document.getElementById("adminEmail").value;

    const pass =
        document.getElementById("adminPass").value;

    const savedPass =
        loadData("marigold_admin_pass") || "marigold16";

    if (
    mail === "minibar@marigold.com" &&
    pass === savedPass
) {
    isAdminLoggedIn = true;
    isReceptionLoggedIn = false;

    adminLoginAttempts = 0;
    adminLockedUntil = 0;

    switchScreen("adminDashboard");
    return;
}

if (
    mail === "reception@marigold.com" &&
    pass === "mari678"
) {
    isReceptionLoggedIn = true;
    isAdminLoggedIn = false;

    adminLoginAttempts = 0;
    adminLockedUntil = 0;

    switchScreen("adminDashboard");
    return;
}

    adminLoginAttempts++;

if (adminLoginAttempts >= 5) {

    adminLockedUntil =
    Date.now() + (15 * 60 * 1000);

adminLoginAttempts = 0;

saveData(
    "marigold_admin_locked_until",
    adminLockedUntil
);

    alert(
        "5 hatalı giriş yapıldı.\n\nYönetici girişi 15 dakika kilitlendi."
    );

    return;
}

alert("Hatalı kullanıcı adı veya şifre!");
}

function logout() {

    isAdminLoggedIn = false;
    isStaffLoggedIn = false;

    productsBase.forEach(p => {
        quantities[p.id] = 0;

        const el = document.getElementById(`${p.id}-qty`);

        if (el) el.innerText = "0";
    });

    const preview =
    document.getElementById("camPreview");

if (preview) {
    preview.style.display = "none";
    preview.src = "";
}

    document.getElementById("floorSelect").value = "all";

    filterRoomsByFloor();

    hasPhoto = false;
    currentPhotoData = "";

    switchScreen("loginScreen");
}

function updateCredentials() {
    const newPin = document.getElementById("newPin").value;
    const newAdminPass = document.getElementById("newAdminPass").value;

  if (newPin && newPin.length > 0) {
    saveData("marigold_pin", newPin);
}

if (newAdminPass && newAdminPass.length > 0) {
    saveData("marigold_admin_pass", newAdminPass);
}

if (typeof saveSettingsToFirebase === "function") {
    saveSettingsToFirebase();
}
    
    if (newPin || newAdminPass) {
        alert("Şifreler başarıyla güncellendi!");
        document.getElementById("newPin").value = "";
        document.getElementById("newAdminPass").value = "";
    } else {
        alert("Lütfen en az bir şifre alanı doldurun.");
    }
}