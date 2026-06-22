function buildSktManagerForAdmin() {
    const tbody =
        document.getElementById("sktAdminTableBody");

    if (!tbody) return;

    tbody.innerHTML = "";

    const totalStocks = {};

    productsBase.forEach(p => {
        totalStocks[p.id] = 0;
    });

    depotParties.forEach(p => {
        if (totalStocks[p.productId] !== undefined) {
            totalStocks[p.productId] += Number(p.qty) || 0;
        }
    });

    depotParties.forEach(party => {
        const isCritical =
            (totalStocks[party.productId] || 0) <= 5;

        tbody.innerHTML += `
            <tr style="${isCritical ? "background-color:#fff0f0;" : ""}">
                <td>
                    <select
                        class="form-control"
                        style="font-size:11px;padding:2px;width:130px;"
                        id="party-prod-${party.id}"
                    >
                        <option value="">Ürün Seç</option>

                        ${productsBase.map(p => `
                            <option
                                value="${p.id}"
                                ${p.id === party.productId ? "selected" : ""}
                            >
                                ${p.name}
                            </option>
                        `).join("")}
                    </select>
                </td>

                <td>
                    <input
                        type="date"
                        class="skt-date-input"
                        id="party-date-${party.id}"
                        value="${party.expiry}"
                    >
                </td>

                <td>
                    <input
                        type="number"
                        class="skt-qty-input"
                        id="party-qty-${party.id}"
                        value="${party.qty}"
                    >
                    ${isCritical
                        ? '<span style="color:red;font-size:10px;">⚠️</span>'
                        : ""}
                </td>

                <td>
                    <button
                        onclick="deletePartyRow('${party.id}')"
                        style="background:red;color:white;border:none;padding:2px 5px;border-radius:3px;cursor:pointer;"
                    >
                        Sil
                    </button>
                </td>
            </tr>
        `;
    });
}

   function addNewPartyRow() {
    const newId =
        `p_new_${Date.now()}`;

    depotParties.push({
        id: newId,
        productId: "",
        expiry: "",
        qty: 0
    });

    buildSktManagerForAdmin();
    checkStockLevels();
}

function deletePartyRow(id) {
    if (
        !confirm(
            "Bu partiyi silmek istediğinize emin misiniz?"
        )
    ) {
        return;
    }

    depotParties = depotParties.filter(
        p => p.id !== id
    );

    buildSktManagerForAdmin();
    checkStockLevels();
}