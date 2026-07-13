function generateExcelReport() {
    const start =
        document.getElementById("startDate").value;

    const end =
        document.getElementById("endDate").value;

    const filtered =
        (loadData("marigold_approved") || []).filter(item => {
            if (!item.approvedDate) return false;

            const parts =
                item.approvedDate.split(" ")[0].split(".");

            const itemDate =
                new Date(
                    parts[2],
                    parts[1] - 1,
                    parts[0]
                );

            if (start && itemDate < new Date(start)) {
                return false;
            }

            if (
                end &&
                itemDate > new Date(end + "T23:59:59")
            ) {
                return false;
            }

            return true;
        });

    if (!filtered.length) {
        alert("Seçilen tarihler arasında veri yok!");
        return;
    }

    let csvContent = "\uFEFF";

    csvContent +=
        "Tarih;Oda;Ürün Adı;Adet;Birim Tutar;Toplam Tutar\n";

    filtered.forEach(item => {
        if (!item.soldItemsList?.length) return;

        item.soldItemsList.forEach(sold => {
            const product =
                productsBase.find(
                    p => p.id === sold.productId
                );

            const pName =
                product
                    ? product.name
                    : sold.productId;

            const pPrice =
                product
                    ? product.price
                    : 0;

            const totalLine =
                pPrice * sold.soldQty;

            csvContent +=
                `${item.approvedDate};${item.room};"${pName}";${sold.soldQty};${pPrice};${totalLine}\n`;
        });
    });

    const blob = new Blob(
        [csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        `Marigold_Detayli_Rapor_${start || "tum"}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
