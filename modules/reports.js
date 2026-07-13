function updateDashboardSummary() {
    const today = new Date().toLocaleDateString("tr-TR");

    let todayQty = 0;
    let todayRevenue = 0;

    const productStats = {};
    const roomStats = {};

    (loadData("marigold_sales_history") || []).forEach(record => {
        if (!record.approvedDate?.startsWith(today) || !record.soldItemsList) {
            return;
        }

        record.soldItemsList.forEach(item => {
            const product = productsBase.find(
                p => p.id === item.productId
            );

            const price = product ? product.price : 0;

            todayQty += item.soldQty;
            todayRevenue += price * item.soldQty;

            productStats[item.productId] =
                (productStats[item.productId] || 0) + item.soldQty;

            roomStats[record.room] =
                (roomStats[record.room] || 0) + (price * item.soldQty);
        });
    });

let waitingReplenish = 0;

approvedRecords.forEach(record => {
    const room = roomMemory[record.room];

    if (
        room &&
        room.usagePhoto &&
        room.usagePhoto !== ""
    ) {
        waitingReplenish++;
    }
});

    let topRoom = "-";

    if (Object.keys(roomStats).length) {
        const bestRoom = Object.keys(roomStats).reduce((a, b) =>
            roomStats[a] > roomStats[b] ? a : b
        );

        topRoom =
            `${bestRoom} (${roomStats[bestRoom].toFixed(2)} TL)`;
    }

    const qtyEl = document.getElementById("todayTotalQty");
    const revEl = document.getElementById("todayTotalRevenue");
    const topEl = document.getElementById("waitingReplenish");
    const roomEl = document.getElementById("topRoomSales");

    if (qtyEl) qtyEl.innerText = todayQty;
    if (revEl) revEl.innerText = `${todayRevenue} TL`;
    if (topEl) {
    topEl.innerText = `${waitingReplenish} Oda`;
}
    if (roomEl) roomEl.innerText = topRoom;
}

function checkStockLevels() {
    const alertBox = document.getElementById("stockAlertBox");
    const fifoSummary = document.getElementById("fifoSummary");

    const criticalLevel = 5;
    const lowStockItems = [];

    const stockMap = {};

    depotParties.forEach(p => {
        stockMap[p.productId] =
            (stockMap[p.productId] || 0) + (Number(p.qty) || 0);
    });

    productsBase.forEach(product => {
        const totalStock = stockMap[product.id] || 0;

        if (totalStock <= criticalLevel) {
            lowStockItems.push(
                `${product.name} (${totalStock} adet)`
            );
        }
    });

    if (alertBox) {
        if (lowStockItems.length > 0) {
            alertBox.style.display = "block";
            alertBox.innerHTML =
                `⚠️ DİKKAT: Kritik stok seviyesi: ${lowStockItems.join(", ")}`;
        } else {
            alertBox.style.display = "none";
        }
    }

    if (fifoSummary) {
        const criticalStockCount =
            lowStockItems.length;

        const criticalSktCount =
            depotParties.filter(p => {
                if (!p.expiry || p.qty <= 0) return false;

                const diffDays = Math.ceil(
                    (new Date(p.expiry) - new Date()) /
                    (1000 * 60 * 60 * 24)
                );

              return diffDays >= 0 && diffDays <= 30;
            }).length;

        fifoSummary.innerHTML =
            `⚠️ ${criticalSktCount} Kritik SKT | 🚨 ${criticalStockCount} Kritik Stok`;
    }
}
