function initSystem() {
    checkSystemSecurity();

    globalRoomsPool = loadData("marigold_pool") || [];
    approvedRecords = loadData("marigold_approved") || [];
    depotParties = loadData("marigold_depot_parties_v2");
    roomSktDatabase = loadData("marigold_rooms_skt_db_v2") || {};
    roomMemory = loadData("marigold_room_memory") || {};

    if (!depotParties) {
        depotParties = [
            { id: "p1", productId: "gofret", expiry: "2026-06-29", qty: 5 },
            { id: "p2", productId: "gofret", expiry: "2026-06-30", qty: 24 }
        ];

        productsBase.forEach((p, idx) => {
            if (p.id !== "gofret") {
                depotParties.push({
                    id: `p_auto_${idx}`,
                    productId: p.id,
                    expiry: "2026-08-15",
                    qty: 50
                });
            }
        });

        saveData("marigold_depot_parties_v2", depotParties);
    }

    rooms.forEach(roomNum => {
        const roomKey = `Oda ${roomNum}`;

        if (!roomSktDatabase[roomKey]) {
            roomSktDatabase[roomKey] = {};

            productsBase.forEach(p => {
                roomSktDatabase[roomKey][p.id] = getOldestPartyDate(p.id);
            });
        }
    });

    rooms.forEach(roomNum => {
        const roomKey = `Oda ${roomNum}`;

        if (!roomMemory[roomKey]) {
            roomMemory[roomKey] = {
    fullPhoto: null,
    fullDate: "",
    fullDetails: "",
    fullTotal: 0,

    usagePhoto: null,
    usageDate: "",
    usageDetails: "",
    usageTotal: 0
};
        }
    });

   saveData("marigold_room_memory", roomMemory);
saveData("marigold_rooms_skt_db_v2", roomSktDatabase);

productsBase.forEach(p => {
    quantities[p.id] = 0;
});

filterRoomsByFloor();
loadRoomSpecificProducts();

if (typeof listenDepotParties === "function") {
    listenDepotParties();
}

if (typeof loadFirebasePool === "function") {
    loadFirebasePool();
}

if (typeof listenFirebasePool === "function") {
    listenFirebasePool();
}

if (typeof listenRoomSkt === "function") {
    listenRoomSkt();
}

if (typeof listenRoomMemory === "function") {
    listenRoomMemory();
}

if (typeof listenSettings === "function") {
    listenSettings();
}
/*
if (typeof listenApprovedRecords === "function") {
    listenApprovedRecords();
}
*/
if (typeof listenApprovedRecordsCollection === "function") {
    listenApprovedRecordsCollection();
}
}

/*
if (typeof loadFirebasePool === "function") {
    loadFirebasePool();
}
*/
    // YÖNETİCİNİN TÜM LİSTEYİ ELLE DÜZENLEYİP KAYDETMESİ
    function saveAllDepotParties() {
    for (const party of depotParties) {

        const prodSelect =
            document.getElementById(`party-prod-${party.id}`);

        const dateInput =
            document.getElementById(`party-date-${party.id}`);

        const qtyInput =
            document.getElementById(`party-qty-${party.id}`);

        if (!prodSelect || !dateInput || !qtyInput) continue;

        const qty =
            parseInt(qtyInput.value) || 0;

        if (!prodSelect.value) {
            alert("Ürün seçilmeyen parti var.");
            return;
        }

        if (!dateInput.value) {
            alert("SKT girilmeyen parti var.");
            return;
        }

        if (qty < 0) {
            alert("Stok eksi olamaz.");
            return;
        }

        party.productId = prodSelect.value;
        party.expiry = dateInput.value;
        party.qty = qty;
    }

   saveData(
    "marigold_depot_parties_v2",
    depotParties
);

if (typeof saveDepotPartiesToFirebase === "function") {
    saveDepotPartiesToFirebase();
}

buildSktManagerForAdmin();
checkStockLevels();

alert("Depo parti stokları kaydedildi.");
}

    function filterRoomsByFloor() {
        const floorSelect = document.getElementById("floorSelect");
        const roomSelect = document.getElementById("roomSelect");
        const selectedFloor = floorSelect.value;
        roomSelect.innerHTML = "";
        rooms.forEach(room => {
            const roomFloor = Math.floor(room / 100).toString();
            if (selectedFloor === "all" || selectedFloor === roomFloor) {
                let opt = document.createElement("option");
                opt.value = "Oda " + room;
                opt.text = "Oda " + room;
                roomSelect.add(opt);
            }
        });
        loadRoomSpecificProducts();
    }

   function switchScreen(screenId) {

    // Önce yetki kontrolü
    if (
        screenId === "adminDashboard" &&
        !isAdminLoggedIn &&
        !isReceptionLoggedIn
    ) {
        alert("Lütfen önce yönetici girişi yapın.");
        return;
    }

    document.querySelectorAll(".screen").forEach(
        s => s.classList.remove("active")
    );

    document.getElementById(screenId)
        .classList.add("active");

    if (screenId === "adminDashboard") {

        renderAdminCards();
        renderApprovedRecords();
        buildSktManagerForAdmin();
        updateDashboardSummary();
        checkStockLevels();

       if(isReceptionLoggedIn) {
       const adminOnlyArea = document.getElementById("adminOnlyArea");

       if (adminOnlyArea) {
      adminOnlyArea.style.display = "none";
  }

    document.querySelector(".skt-manager-section")
    ?.style.setProperty("display","none");

    const passwordSection =
    document.getElementById("passwordSection");

    if(passwordSection){
        passwordSection.style.display = "none";
    }

    const approvedPanel =
    document.getElementById("approvedPanel");

    if(approvedPanel){
        approvedPanel.style.display = "none";
    }

    const dashboardTools =
    document.getElementById("dashboardTools");

    if(dashboardTools){
        dashboardTools.style.display = "none";
    }

} else {
const adminOnlyArea = document.getElementById("adminOnlyArea");

if (adminOnlyArea) {
    adminOnlyArea.style.display = "block";
}

            document.querySelector(".skt-manager-section")
            ?.style.setProperty("display","block");

            const passwordSection =
            document.getElementById("passwordSection");

            if(passwordSection){
                passwordSection.style.display = "block";
            }
        }
    }

    if(screenId === 'staffScreen') {
        loadRoomSpecificProducts();
    }
}

    function pressPin(num) {
        if(currentPin.length < 4) {
            currentPin += num;
            document.getElementById("pinDisplay").innerText = "*".repeat(currentPin.length);
        }
    }
    function clearPin() { currentPin = ""; document.getElementById("pinDisplay").innerText = ""; }
    
  async function sendToAdmin() {

    if (typeof currentAction !== "undefined" && currentAction === "replenish") {
        currentAction = "";
        switchScreen("adminDashboard");
        return;
    }

    let hasSelection = false;
    let totalCost = 0;
    let detailsHtml = "";
    let itemsSold = [];

    productsBase.forEach(p => {

        const qty = quantities[p.id];

        if (qty > 0) {

            hasSelection = true;

            const itemTotal = qty * p.price;

            totalCost += itemTotal;

            detailsHtml += `• ${qty} Adet ${p.name} (${itemTotal.toFixed(2)} TL)<br>`;

            itemsSold.push({
                productId: p.id,
                soldQty: qty
            });

        }

    });

    if (!hasSelection) {
        alert("Lütfen önce odada eksilen ürünleri giriniz.");
        return;
    }

    const room = document.getElementById("roomSelect").value;

   if (!roomMemory[room]) {

    roomMemory[room] = {};

}

roomMemory[room].fullPhoto ??= null;
roomMemory[room].fullDate ??= "";
roomMemory[room].fullDetails ??= "";
roomMemory[room].fullTotal ??= 0;

roomMemory[room].usagePhoto ??= null;
roomMemory[room].usageDate ??= "";
roomMemory[room].usageDetails ??= "";
roomMemory[room].usageTotal ??= 0;

    roomMemory[room].usagePhoto = hasPhoto ? currentPhotoData : null;
    roomMemory[room].usageDate = new Date().toLocaleString("tr-TR");
    roomMemory[room].usageDetails = detailsHtml;
    roomMemory[room].usageTotal = totalCost;

    saveData("marigold_room_memory", roomMemory);

   if (typeof saveRoomMemoryToFirebase === "function") {
    await saveRoomMemoryToFirebase();
}

    const newRecord = {

        id: Date.now(),

        room: room,

        details: detailsHtml,

        soldItemsList: itemsSold,

        totalCost: totalCost,

        createdAt: new Date().toISOString()

    };

    addDoc(
        collection(db, "minibar_records"),
        newRecord
    )
    .then(() => {

        alert(room + " verileri Firebase'e gönderildi.");

        logout();

    })
    .catch(error => {

        console.error(error);

        alert("Firebase kayıt hatası.");

    });

}

// --- SİSTEMİ BAŞLAT VE GÜVENLİK BEKÇİSİNİ AKTİF ET ---
window.onload = async function () {

    if (await isFirstSetup()) {
        showSetupWizard();
        return;
    }

   initSystem();

setTimeout(() => {

    if (typeof checkVersion === "function") {
        checkVersion();
    }

}, 2000);

    document.onmousemove = resetIdleTimer;
    document.onkeypress = resetIdleTimer;
    document.onclick = resetIdleTimer;
    document.onscroll = resetIdleTimer;

};

// --- GÜVENLİK: OTOMATİK OTURUM KAPATMA (5 DAKİKA) ---
let idleTime = 0;
const idleLimit = 5; // Dakika


