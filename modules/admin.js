function renderAdminCards() {

    const container = document.getElementById("adminCardsContainer");
    const noDataText = document.getElementById("noDataText");

    container.innerHTML = "";

    if (globalRoomsPool.length === 0) {
        noDataText.style.display = "block";
        return;
    }

    noDataText.style.display = "none";

    globalRoomsPool.sort((a, b) => {
    const roomA = parseInt(String(a.room).replace(/\D/g, ""));
    const roomB = parseInt(String(b.room).replace(/\D/g, ""));
    return roomA - roomB;
});

     globalRoomsPool.forEach(item => {

    const accordionId = `pool-${item.id}`;

    let previewHtml = "<ul>";
let totalPrice = 0;

item.soldItemsList.forEach(soldItem => {

    const product = productsBase.find(
        p => p.id === soldItem.productId
    );

    if(product){
        totalPrice += product.price * soldItem.soldQty;
    }

    previewHtml += `
                <li>
                    <strong>${product ? product.name : soldItem.productId}:</strong>
                    ${soldItem.soldQty} adet düşecek.
                </li>
            `;
        });

        previewHtml += "</ul>";

        container.innerHTML += `
             <div class="notification-card">

<div
onclick="
const panel=document.getElementById('${accordionId}');
const arrow=document.getElementById('arrow-${item.id}');

panel.classList.toggle('hidden');

arrow.innerText =
panel.classList.contains('hidden')
? '▼'
: '▲';
"
style="
cursor:pointer;
font-weight:bold;
padding:8px;
">

📬 ${item.room}<br>

<span
id="arrow-${item.id}"
style="margin-left:18px;"
>
▼
</span>

</div>

<div id="${accordionId}" class="hidden">
                <div style="font-weight:700; color:var(--marigold-gold); margin-bottom:8px; font-size:15px;">
                    ⚠️ ODA BİLDİRİMİ
                </div>

                <div class="log-item">
                    <strong>Oda No:</strong> ${item.room}
                </div>

                <div class="log-item">
                    <strong>Eksilen Ürünler:</strong>
                </div>

               <div class="log-item" style="padding-left:10px; color:#444;">
    ${item.details}
</div>

<div class="log-item"
style="
padding-left:10px;
font-weight:bold;
color:#c9a227;
margin-top:8px;
">
💰 TOPLAM TUTAR: ${totalPrice.toFixed(2)} TL
</div>

${!isReceptionLoggedIn ? `
<div style="margin-top:10px; font-size:11px; background:#f0f0f0; padding:8px; border-radius:5px;">
    <strong>FIFO Stok Planı:</strong>
    ${previewHtml}
</div>
` : ``}

                ${item.photo ? `
                    <img src="${item.photo}" style="width:100%; margin-top:10px; border-radius:10px;">
                ` : ""}

                ${!isReceptionLoggedIn ? `
<div style="display:flex; gap:10px; margin-top:15px;">
    <button class="btn" onclick="approveAction(${item.id})">
        👍 Onayla
    </button>

    <button class="btn btn-outline" onclick="rejectAction(${item.id})">
        ❌ Reddet
    </button>
</div>
` : `

`}
            </div>
        `;
    });
}

function approveAction(recordId) {
    const currentRecord = globalRoomsPool.find(
        item => item.id === recordId
    );

    if (!currentRecord) return;

    for (const soldItem of currentRecord.soldItemsList) {
        const totalStock = depotParties
            .filter(p => p.productId === soldItem.productId)
            .reduce((sum, p) => sum + (Number(p.qty) || 0), 0);

        if (totalStock < soldItem.soldQty) {
            const product = productsBase.find(
                p => p.id === soldItem.productId
            );

            alert(
                `❌ Yetersiz stok!\n\n${product ? product.name : soldItem.productId}\n\nDepoda: ${totalStock}\nİstenen: ${soldItem.soldQty}`
            );

            return;
        }
    }

    currentRecord.soldItemsList.forEach(soldItem => {
        const matchingParties = depotParties
            .filter(
                p => p.productId === soldItem.productId && p.qty > 0
            )
            .sort(
                (a, b) => new Date(a.expiry) - new Date(b.expiry)
            );

        let remainingToDeduct = soldItem.soldQty;

        for (const party of matchingParties) {
            if (remainingToDeduct <= 0) break;

            if (party.qty >= remainingToDeduct) {
                party.qty -= remainingToDeduct;
                remainingToDeduct = 0;
            } else {
                remainingToDeduct -= party.qty;
                party.qty = 0;
            }
        }
       const newestParty = depotParties
            .filter(
                    p => p.productId === soldItem.productId && p.qty > 0
              )
               .sort(
                    (a, b) => new Date(a.expiry) - new Date(b.expiry)
            )[0];

        if (newestParty) {
               if (!roomSktDatabase[currentRecord.room]) {
                     roomSktDatabase[currentRecord.room] = {};
               }

               roomSktDatabase[currentRecord.room][soldItem.productId] =
                         newestParty.expiry;
        }
    });
    
   saveData("marigold_depot_parties_v2", depotParties);

if (typeof saveDepotPartiesToFirebase === "function") {
    saveDepotPartiesToFirebase();
}

saveData(
    "marigold_rooms_skt_db_v2",
    roomSktDatabase
);
    const approvedRecord = {
    ...currentRecord,
    photo: currentRecord.photo,
    approvedDate: new Date().toLocaleString("tr-TR")
};

approvedRecords.push(approvedRecord);
    if (
    typeof saveApprovedRecordToFirebase === "function"
) {
    saveApprovedRecordToFirebase(
        approvedRecord
    );
}

    if (!roomMemory[currentRecord.room]) {
        roomMemory[currentRecord.room] = {};
    }

    roomMemory[currentRecord.room].usagePhoto = currentRecord.photo;
    roomMemory[currentRecord.room].usageDate = new Date().toLocaleString("tr-TR");
    roomMemory[currentRecord.room].usageDetails = currentRecord.details;

    saveData("marigold_room_memory", roomMemory);

saveData("marigold_approved", approvedRecords);

if (typeof saveRoomMemoryToFirebase === "function") {
    saveRoomMemoryToFirebase();
}

if (typeof saveRoomSktToFirebase === "function") {
    saveRoomSktToFirebase();
}

    globalRoomsPool = globalRoomsPool.filter(
        item => item.id !== recordId
    );

    saveData("marigold_pool", globalRoomsPool);

if (currentRecord.firebaseId) {

    import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    )
    .then(({ deleteDoc, doc }) => {

        return deleteDoc(
            doc(
                db,
                "minibar_records",
                currentRecord.firebaseId
            )
        );

    })
    .catch(error => {

        console.error(
            "Firebase Silme Hatası:",
            error
        );

    });

}

renderAdminCards();
renderApprovedRecords();
buildSktManagerForAdmin();
updateDashboardSummary();
checkStockLevels();

    alert(`${currentRecord.room} onaylandı, stoklar güncellendi.`);
}

function rejectAction(id) {
    if (!confirm("Bu kaydı reddetmek istediğinize emin misiniz?")) {
        return;
    }

    globalRoomsPool = globalRoomsPool.filter(
        item => item.id !== id
    );

    saveData("marigold_pool", globalRoomsPool);

    renderAdminCards();

    alert("İşlem reddedildi.");
}

function clearApprovedHistory() {
    if (!confirm(
        "Tüm onaylı kayıt geçmişini silmek istediğinize emin misiniz?"
    )) {
        return;
    }

    approvedRecords = [];

    saveData(
        "marigold_approved",
        approvedRecords
    );

    renderApprovedRecords();
    updateDashboardSummary();

    alert("Geçmiş başarıyla temizlendi.");
}

function clearPoolHistory() {
    if (!confirm("Onay havuzundaki tüm kayıtları silmek istiyor musunuz?")) {
        return;
    }

    globalRoomsPool = [];

    saveData("marigold_pool", globalRoomsPool);

    renderAdminCards();

    alert("Onay havuzu temizlendi.");
}

function clearRoomMemory() {
    if (!confirm("Tüm oda hafızasını silmek istiyor musunuz?")) {
        return;
    }

    roomMemory = {};

    saveData("marigold_room_memory", roomMemory);

    renderApprovedRecords();

    alert("Oda hafızası temizlendi.");
}

     function renderApprovedRecords() {
    const container = document.getElementById("approvedContainer");

    if (!container) return;

    container.innerHTML = "";

    const onlyToday =
        document.getElementById("showTodayOnly")?.checked;

    const today =
        new Date().toLocaleDateString("tr-TR");

    if (Object.keys(roomMemory).length === 0) {
        container.innerHTML =
            "<div style='color:#999;padding:10px;'>Henüz oda hafızası yok.</div>";

        return;
    }

    const searchText =
    document.getElementById("roomSearch")
    ?.value
    ?.toLowerCase()
    || "";

Object.keys(roomMemory)
.sort((a, b) => {
    const roomA = parseInt(a.replace(/\D/g, ""));
    const roomB = parseInt(b.replace(/\D/g, ""));
    return roomA - roomB;
})
.forEach(roomName => {

    if (
        searchText &&
        !roomName.toLowerCase().includes(searchText)
    ) {
        return;
    }
        const item = roomMemory[roomName];

        if (
            onlyToday &&
            (!item.usageDate || !item.usageDate.startsWith(today))
        ) {
            return;
        }

        if (!item.usagePhoto && !item.fullPhoto) {
            return;
        }

        container.innerHTML += `
            <div class="notification-card">

               <div
onclick="
const detail=this.nextElementSibling;
detail.classList.toggle('hidden');
this.querySelector('.roomArrow').innerText=
detail.classList.contains('hidden')
? '▼'
: '▲';
"
style="
    font-weight:700;
    color:var(--marigold-dark);
    margin-bottom:0;
    font-size:14px;
    border-bottom:1px solid #ddd;
    padding-bottom:6px;
    cursor:pointer;
">
🏨 ${roomName}
<br>
<span class='roomArrow'>▼</span>
</div>

<div class="hidden">

                <div style="margin-top:8px;font-size:13px;">
                    <strong>📅 Son Eksik:</strong><br>
                    ${item.usageDate || "-"}
                </div>

                <div style="margin-top:8px;font-size:13px;">
                    <strong>📅 Son Dolu:</strong><br>
                    ${item.fullDate || "-"}
                </div>

                <div style="margin-top:10px;">
                    <strong>📦 Son Eksikler:</strong>
                </div>

                <div style="margin-top:5px;">
                    ${item.usageDetails || "-"}
                </div>

                <div style="display:flex; gap:10px; margin-top:10px;">

                    ${item.usagePhoto ? `
                        <div style="flex:1;">
                            <img
                                src="${item.usagePhoto}"
                                style="width:100%; border-radius:10px; border:2px solid #eee;"
                            >
                        </div>
                    ` : ""}

                    ${item.fullPhoto ? `
                        <div style="flex:1;">
                            <img
                                src="${item.fullPhoto}"
                                style="width:100%; border-radius:10px; border:2px solid var(--marigold-gold);"
                            >
                        </div>
                    ` : ""}

                </div>

                <button
                    onclick="takeReplenishPhoto('${roomName}', '${roomName}')"
                    style="
                        width:100%;
                        margin-top:10px;
                        padding:10px;
                        background:var(--marigold-gold);
                        border:none;
                        color:white;
                        border-radius:5px;
                        cursor:pointer;
                    "
                >
                    ${item.fullPhoto
                        ? "🔄 İkmal Fotoğrafını Güncelle"
                        : "+ İkmal (Dolu) Fotoğrafı Çek"}
               </button>

                </div>

            </div>
        `;
    });
}
