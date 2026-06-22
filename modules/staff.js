function loadRoomSpecificProducts() {
    const roomSelect =
        document.getElementById("roomSelect");

    if (!roomSelect) return;

    const selectedRoom =
        roomSelect.value;

    if (!selectedRoom) return;

    const listContainer =
        document.getElementById("htmlProductList");

    if (!listContainer) return;

    listContainer.innerHTML = "";

    productsBase.forEach(p => {

        const currentRoomSkt =
            roomSktDatabase[selectedRoom]?.[p.id] ||
            "2026-06-15";

        const sktBadgeHtml =
            getSktBadge(currentRoomSkt);

        listContainer.innerHTML += `
            <div class="product-item">
                <div class="product-info">

                    <span class="product-name">
                        ${p.name}
                    </span>

                    <span class="product-price">
                        ${p.price.toFixed(2)} TL
                    </span>

                    <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
                        ${sktBadgeHtml}

                        <div class="skt-edit-wrapper">
                            <input
                                type="date"
                                class="staff-skt-input"
                                id="staff-date-${p.id}"
                                value="${currentRoomSkt}"
                            >

                            <button
                                class="skt-save-inline-btn"
                                onclick="saveRoomProductSktClick('${selectedRoom}','${p.id}')"
                                title="Tarihi Kaydet"
                            >
                                ✓ Ok
                            </button>
                        </div>
                    </div>

                </div>

                <div class="product-counter">
                    <button
                        class="count-btn"
                        onclick="changeQty('${p.id}', -1)"
                    >
                        -
                    </button>

                    <span
                        class="count-val"
                        id="${p.id}-qty"
                    >
                        ${quantities[p.id] || 0}
                    </span>

                    <button
                        class="count-btn"
                        onclick="changeQty('${p.id}', 1)"
                    >
                        +
                    </button>
                </div>
            </div>
        `;
    });
}
   function saveRoomProductSktClick(roomKey, productId) {
    const inputEl =
        document.getElementById(`staff-date-${productId}`);

    if (!inputEl) return;

    const newDate = inputEl.value;

    if (!newDate) {
        alert("Lütfen geçerli bir tarih giriniz.");
        return;
    }

    if (!roomSktDatabase[roomKey]) {
        roomSktDatabase[roomKey] = {};
    }

    roomSktDatabase[roomKey][productId] = newDate;

    saveData(
        "marigold_rooms_skt_db_v2",
        roomSktDatabase
    );

    loadRoomSpecificProducts();

    alert(
        `${roomKey} için tarih odabaşlı kaydedildi. Depo stokları etkilenmedi.`
    );
}
function changeQty(itemId, val) {
    quantities[itemId] =
        Math.max(
            0,
            (quantities[itemId] || 0) + val
        );

    const qtyEl =
        document.getElementById(`${itemId}-qty`);

    if (qtyEl) {
        qtyEl.innerText =
            quantities[itemId];
    }
}