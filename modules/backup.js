function exportData() {
    // Mevcut tüm verileri tek bir pakette topluyoruz
    const dataToExport = {
    pool: localStorage.getItem("marigold_pool"),
    approved: localStorage.getItem("marigold_approved"),
    depot: localStorage.getItem("marigold_depot_parties_v2"),
    skt: localStorage.getItem("marigold_rooms_skt_db_v2"),
    roomMemory: localStorage.getItem("marigold_room_memory")
};
    
    // Veriyi JSON dosyasına dönüştürüyoruz
    const blob = new Blob([JSON.stringify(dataToExport)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "marigold_yedek_" + new Date().toISOString().split('T')[0] + ".json";
    a.click();
}

function importData(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (data.pool)
                localStorage.setItem("marigold_pool", data.pool);

            if (data.approved)
                localStorage.setItem("marigold_approved", data.approved);

            if (data.depot)
                localStorage.setItem("marigold_depot_parties_v2", data.depot);

            if (data.skt)
                localStorage.setItem("marigold_rooms_skt_db_v2", data.skt);

            if (data.roomMemory)
                localStorage.setItem(
                    "marigold_room_memory",
                    data.roomMemory
                );

            alert("Yedek başarıyla yüklendi! Sayfa yenileniyor...");
            location.reload();

        } catch (err) {
            alert("Hatalı veya bozuk dosya formatı!");
        }
    };

    reader.readAsText(file);
}