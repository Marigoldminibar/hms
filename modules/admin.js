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

const memory = roomMemory[item.room];

if (!memory) {
    return;
}

const fullPhoto = memory.fullPhoto;
const usagePhoto = memory.usagePhoto;

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
    ${memory.usageDetails || "-"}
</div>

<div class="log-item"
style="
padding-left:10px;
font-weight:bold;
color:#c9a227;
margin-top:8px;
">
💰 TOPLAM TUTAR:
${Number(memory.usageTotal || 0).toFixed(2)} TL
</div>

${!isReceptionLoggedIn ? `
<div style="margin-top:10px; font-size:11px; background:#f0f0f0; padding:8px; border-radius:5px;">
    <strong>FIFO Stok Planı:</strong>
    ${previewHtml}
</div>
` : ``}

<div style="
display:flex;
justify-content:center;
align-items:flex-start;
gap:12px;
margin-top:12px;
flex-wrap:nowrap;
">

    ${usagePhoto ? `
        <div style="text-align:center; flex:1;">
            <div style="
                font-size:11px;
                font-weight:bold;
                color:#d32f2f;
                margin-bottom:6px;
            ">
                🔴 Son Eksik
            </div>

            <img
               onclick="openLightbox(this.src)"
                src="${usagePhoto}"
                style="
                    width:90px;
                    height:90px;
                    object-fit:cover;
                    border-radius:10px;
                    border:2px solid #ddd;
                    display:block;
                    margin:auto;
                    cursor:zoom-in;
                "
            >
        </div>
    ` : ""}

    ${fullPhoto ? `
        <div style="text-align:center; flex:1;">
            <div style="
                font-size:11px;
                font-weight:bold;
                color:var(--marigold-gold);
                margin-bottom:6px;
            ">
                🟢 Son Dolu
            </div>

            <img
                src="${fullPhoto}"
                onclick="openLightbox(this.src)"
                style="
                    width:90px;
                    height:90px;
                    object-fit:cover;
                    border-radius:10px;
                    border:2px solid var(--marigold-gold);
                    display:block;
                    margin:auto;
                    cursor:zoom-in;
                "
            >
        </div>
    ` : ""}

</div>

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

    // -------------------------------------------------
    // STOK KONTROLÜ
    // -------------------------------------------------

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

    // -------------------------------------------------
    // FIFO
    // -------------------------------------------------

    currentRecord.soldItemsList.forEach(soldItem => {

        const matchingParties = depotParties
            .filter(
                p =>
                    p.productId === soldItem.productId &&
                    p.qty > 0
            )
            .sort(
                (a, b) =>
                    new Date(a.expiry) -
                    new Date(b.expiry)
            );

        let remaining = soldItem.soldQty;

        for (const party of matchingParties) {

            if (remaining <= 0) break;

            if (party.qty >= remaining) {

                party.qty -= remaining;
                remaining = 0;

            } else {

                remaining -= party.qty;
                party.qty = 0;

            }

        }

        const newestParty = depotParties
            .filter(
                p =>
                    p.productId === soldItem.productId &&
                    p.qty > 0
            )
            .sort(
                (a, b) =>
                    new Date(a.expiry) -
                    new Date(b.expiry)
            )[0];

        if (newestParty) {

            if (!roomSktDatabase[currentRecord.room]) {
                roomSktDatabase[currentRecord.room] = {};
            }

            roomSktDatabase[currentRecord.room][soldItem.productId] =
                newestParty.expiry;

        }

    });

    saveData(
        "marigold_depot_parties_v2",
        depotParties
    );

    if (typeof saveDepotPartiesToFirebase === "function") {
        saveDepotPartiesToFirebase();
    }

    saveData(
        "marigold_rooms_skt_db_v2",
        roomSktDatabase
    );

    if (typeof saveRoomSktToFirebase === "function") {
        saveRoomSktToFirebase();
    }

    // -------------------------------------------------
    // SADECE RAPOR KAYDI
    // FOTOĞRAF YOK
    // -------------------------------------------------

    const approvedRecord = {

        id: currentRecord.id,

        room: currentRecord.room,

        details: currentRecord.details,

        soldItemsList: currentRecord.soldItemsList,

        totalCost: currentRecord.totalCost,

        approvedDate: new Date().toLocaleString("tr-TR")

    };

    approvedRecords = approvedRecords.filter(
    r => r.room !== approvedRecord.room
);

approvedRecords.push(approvedRecord);

    saveData(
        "marigold_approved",
        approvedRecords
    );

 if (typeof saveApprovedRecordToFirebase === "function") {
    saveApprovedRecordToFirebase(approvedRecord);
}
if (typeof saveSalesHistoryToFirebase === "function") {
    saveSalesHistoryToFirebase(approvedRecord);
}

    // -------------------------------------------------
    // ODA HAFIZASINA DOKUNMA
    // FOTOĞRAF DEĞİŞTİRME
    // -------------------------------------------------

    globalRoomsPool =
        globalRoomsPool.filter(
            item => item.id !== recordId
        );

    saveData(
        "marigold_pool",
        globalRoomsPool
    );

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
        .catch(console.error);

    }

    renderAdminCards();

    renderApprovedRecords();

    buildSktManagerForAdmin();

    updateDashboardSummary();

    checkStockLevels();

    alert(currentRecord.room + " onaylandı.");

}

async function rejectAction(recordId) {

    if (!confirm("Bu kaydı reddetmek istediğinize emin misiniz?")) {
        return;
    }

    const currentRecord = globalRoomsPool.find(
        item => item.id === recordId
    );

    if (!currentRecord) return;

    if (currentRecord.firebaseId) {

        const {
            deleteDoc,
            doc
        } = await import(
            "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
        );

        await deleteDoc(
            doc(
                db,
                "minibar_records",
                currentRecord.firebaseId
            )
        );

    }

    globalRoomsPool =
        globalRoomsPool.filter(
            item => item.id !== recordId
        );

    saveData(
        "marigold_pool",
        globalRoomsPool
    );

    renderAdminCards();

    alert("İşlem reddedildi.");
}

async function clearApprovedHistory() {
    if (!confirm(
        "Tüm onaylı kayıt geçmişini silmek istediğinize emin misiniz?"
    )) {
        return;
    }

   if (typeof clearApprovedRecordsFirebase === "function") {
    await clearApprovedRecordsFirebase();
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

async function clearPoolHistory() {

    if (!confirm("Onay havuzundaki tüm kayıtları silmek istiyor musunuz?")) {
        return;
    }

    if (typeof clearPoolFirebase === "function") {
        await clearPoolFirebase();
    }

    globalRoomsPool = [];

    saveData(
        "marigold_pool",
        globalRoomsPool
    );

    renderAdminCards();

    alert("Onay havuzu temizlendi.");
}

async function clearRoomMemory() {

    if (!confirm("Tüm oda hafızasını silmek istiyor musunuz?")) {
        return;
    }

    if (typeof clearRoomMemoryFirebase === "function") {
        await clearRoomMemoryFirebase();
    }

    roomMemory = {};

    saveData(
        "marigold_room_memory",
        roomMemory
    );

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

   if (approvedRecords.length === 0) {
    container.innerHTML =
        "<div style='color:#999;padding:10px;'>Henüz onaylanmış kayıt yok.</div>";
    return;
}

    const searchText =
    document.getElementById("roomSearch")
    ?.value
    ?.toLowerCase()
    || "";

approvedRecords
.sort((a, b) => {
    const roomA = parseInt(String(a.room).replace(/\D/g, ""));
    const roomB = parseInt(String(b.room).replace(/\D/g, ""));
    return roomA - roomB;
})
.forEach(record => {

    const roomName = record.room;

    if (
        searchText &&
        !roomName.toLowerCase().includes(searchText)
    ) {
        return;
    }
        const item = roomMemory[roomName] || {};

       if (
    onlyToday &&
    (!record.approvedDate || !record.approvedDate.startsWith(today))
) {
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
                    <strong>📅 Onay Tarihi:</strong><br>
                     ${record.approvedDate || "-"}
                </div>

                <div style="margin-top:8px;font-size:13px;">
                    <strong>📅 Son Dolu:</strong><br>
                    ${item.fullDate || "-"}
                </div>

<div style="margin-top:10px;">
    <strong>📦 Onaylanan Ürünler</strong>
</div>

<div style="margin-top:5px;">
    ${record.details || "-"}
</div>

<div style="
margin-top:6px;
font-weight:bold;
color:#d32f2f;
">
💰 Onay Tutarı:
${Number(record.totalCost || 0).toFixed(2)} TL
</div>

<hr style="margin:10px 0;">

<div style="margin-top:5px;">
    <strong>📦 Son Dolu</strong>
</div>

<div style="margin-top:5px;">
    ${item.fullDetails || "-"}
</div>

<div style="
margin-top:6px;
font-weight:bold;
color:var(--marigold-gold);
">
💰 Toplam:
${(item.fullTotal || 0).toFixed(2)} TL
</div>

               <div style="
display:flex;
justify-content:center;
align-items:flex-start;
gap:12px;
margin-top:12px;
flex-wrap:nowrap;
">

    ${item.fullPhoto ? `
        <div style="text-align:center; flex:1;">
            <div style="
                font-size:11px;
                font-weight:bold;
                margin-bottom:6px;
                color:var(--marigold-gold);
            ">
                🟢 Son Dolu
            </div>

            <img
                src="${item.fullPhoto}"
                onclick="openLightbox(this.src)"
                style="
                    width:90px;
                    height:90px;
                    max-width:90px;
                    max-height:90px;
                    object-fit:cover;
                    border-radius:10px;
                    border:2px solid var(--marigold-gold);
                    display:block;
                    margin:auto;
                    cursor:zoom-in;
                "
            >
        </div>
    ` : ""}

   ${item.usagePhoto ? `
        <div style="text-align:center; flex:1;">
            <div style="
                font-size:11px;
                font-weight:bold;
                margin-bottom:6px;
                color:#d32f2f;
            ">
                🔴 Son Eksik
            </div>

            <img
                src="${item.usagePhoto}"
                onclick="openLightbox(this.src)"
                style="
                    width:90px;
                    height:90px;
                    max-width:90px;
                    max-height:90px;
                    object-fit:cover;
                    border-radius:10px;
                    border:2px solid #ddd;
                    display:block;
                    margin:auto;
                    cursor:zoom-in;
                "
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
