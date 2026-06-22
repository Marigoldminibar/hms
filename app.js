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
                usagePhoto: null,
                usageDate: "",
                usageDetails: ""
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
}
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
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
   if(screenId === 'adminDashboard') {

    if (!isAdminLoggedIn) {
        alert("Lütfen önce yönetici girişi yapın.");
        return;
    }

    renderAdminCards();
    renderApprovedRecords();
    buildSktManagerForAdmin();
    updateDashboardSummary();
    checkStockLevels();
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
    
   function sendToAdmin() {
    if (typeof currentAction !== 'undefined' && currentAction === "replenish") {
        currentAction = ""; 
        switchScreen('adminDashboard');
        return;
    }

    let hasSelection = false;
    let totalCost = 0;
    let detailsHtml = "";
    let itemsSold = [];

    productsBase.forEach(p => {
        let qty = quantities[p.id];
        if(qty > 0) {
            hasSelection = true;
            let itemTotal = qty * p.price;
            totalCost += itemTotal;
            detailsHtml += `• ${qty} Adet ${p.name} (${itemTotal.toFixed(2)} TL)<br>`;
            itemsSold.push({ productId: p.id, soldQty: qty });
        }
    });

    if(!hasSelection) { alert("Lütfen önce odada eksilen ürünleri giriniz."); return; }
    
   let newRecord = {
    id: Date.now(),
    room: document.getElementById("roomSelect").value,
    details: detailsHtml + `<br><strong style="color:var(--marigold-gold); font-size:14px;">Toplam Tutar: ${totalCost.toFixed(2)} TL</strong>`,
    photo: hasPhoto ? currentPhotoData : null,
    soldItemsList: itemsSold
};

globalRoomsPool.push(newRecord);

saveData("marigold_pool", globalRoomsPool);

alert(newRecord.room + " verileri onay havuzuna gönderildi!");
logout();
}

// --- SİSTEMİ BAŞLAT VE GÜVENLİK BEKÇİSİNİ AKTİF ET ---
window.onload = function() { 
    initSystem(); 
    
    document.onmousemove = resetIdleTimer;
    document.onkeypress = resetIdleTimer;
    document.onclick = resetIdleTimer;
    document.onscroll = resetIdleTimer;
};

// --- GÜVENLİK: OTOMATİK OTURUM KAPATMA (5 DAKİKA) ---
let idleTime = 0;
const idleLimit = 5; // Dakika


