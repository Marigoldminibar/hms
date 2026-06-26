async function submitLogin() {
    const savedPin = loadData("marigold_pin");
    
if (!savedPin) {
    alert("PIN henüz oluşturulmamış.");
    return;
}

    if (await verifyPassword(currentPin, savedPin)) {
    clearPin();

   isStaffLoggedIn = true;
   window.devMode = false;

   switchScreen("staffScreen");
    return;
}

    alert("Hatalı PIN!");
    clearPin();
}

    async function loginAdmin() {

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

    const rememberEmail =
    document.getElementById("rememberEmail").checked;

if (rememberEmail) {
    saveData(
    "marigold_remember_email",
    mail
);
} else {
    saveData(
    "marigold_remember_email",
    ""
);
}

   const savedPass = loadData("marigold_admin_pass");
const receptionPass = loadData("marigold_reception_pass");

if (!savedPass || !receptionPass) {
    alert("Yönetici şifreleri henüz oluşturulmamış.");
    return;
}

    if (
    mail === "minibar@marigold.com" &&
    await verifyPassword(pass, savedPass)
) {
  isAdminLoggedIn = true;
  window.devMode = true;
  isReceptionLoggedIn = false;

adminLoginAttempts = 0;
adminLockedUntil = 0;

switchScreen("adminDashboard");
hideSecurityUpgradeButton();
return;
}

if (
    mail === "reception@marigold.com" &&
    await verifyPassword(pass, receptionPass)
) {
    isReceptionLoggedIn = true;
    window.devMode = false;
    isAdminLoggedIn = false;

    adminLoginAttempts = 0;
    adminLockedUntil = 0;

   switchScreen("adminDashboard");
hideSecurityUpgradeButton();
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

    window.devMode = false;

    isAdminLoggedIn = false;
    isReceptionLoggedIn = false;
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

   async function updateCredentials() {

    const newPin =
        document.getElementById("newPin").value;

    const newReceptionPass =
        document.getElementById("newReceptionPass").value;

    const newAdminPass =
        document.getElementById("newAdminPass").value;

  if (newPin && newPin.length > 0) {
    saveData("marigold_pin", await hashPassword(newPin));
    saveData("marigold_password_migrated", true);
}

if (newReceptionPass && newReceptionPass.length > 0) {
    saveData("marigold_reception_pass", await hashPassword(newReceptionPass));
    saveData("marigold_password_migrated", true);
}

if (newAdminPass && newAdminPass.length > 0) {
    saveData("marigold_admin_pass", await hashPassword(newAdminPass));
    saveData("marigold_password_migrated", true);
}

    if (typeof saveSettingsToFirebase === "function") {
        saveSettingsToFirebase();
    }
    
   if (
    newPin ||
    newReceptionPass ||
    newAdminPass
) {
        alert("Şifreler başarıyla güncellendi!");
        document.getElementById("newPin").value = "";
        document.getElementById("newReceptionPass").value = "";
        document.getElementById("newAdminPass").value = "";
    } else {
        alert("Lütfen en az bir şifre alanı doldurun.");
    }
}

window.addEventListener("load", () => {

   const savedEmail =
    loadData("marigold_remember_email");

    if (savedEmail) {

        document.getElementById("adminEmail").value =
            savedEmail;

        document.getElementById("rememberEmail").checked =
            true;
    }

});
