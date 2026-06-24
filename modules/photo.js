function previewImage(event) {
    const file = event.target.files[0];

    if (!file) return;

    hasPhoto = true;

    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();

        img.onload = function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) return;

            const MAX_WIDTH = 600;
            const ratio = img.width / img.height;

            canvas.width = Math.min(MAX_WIDTH, img.width);
            canvas.height = canvas.width / ratio;

            ctx.drawImage(
                img,
                0,
                0,
                canvas.width,
                canvas.height
            );

            currentPhotoData =
                canvas.toDataURL(
                    "image/jpeg",
                    0.5
                );

            const preview =
                document.getElementById("camPreview");

            if (preview) {
                preview.src = currentPhotoData;
                preview.style.display = "block";
            }
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function takeReplenishPhoto(roomNumber, recordId) {
    currentAction = "replenish";
    targetRoom = roomNumber;
    targetRecordId = recordId;

    switchScreen("cameraScreen");
}

function saveReplenishPhoto(photoData, roomNumber) {
    if (!roomMemory[roomNumber]) {
        roomMemory[roomNumber] = {};
    }

    roomMemory[roomNumber].fullPhoto = photoData;
    roomMemory[roomNumber].fullDate =
        new Date().toLocaleString("tr-TR");

    saveData(
    "marigold_room_memory",
    roomMemory
);


alert(
    `${roomNumber} nolu oda için ikmal fotoğrafı başarıyla kaydedildi!`
);

    renderAdminCards();
    renderApprovedRecords();
}
function handleFileSelect(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();

        img.onload = function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) return;

            const MAX_WIDTH = 600;
            const ratio = img.width / img.height;

            canvas.width = Math.min(MAX_WIDTH, img.width);
            canvas.height = canvas.width / ratio;

            ctx.drawImage(
                img,
                0,
                0,
                canvas.width,
                canvas.height
            );

            const photoData =
                canvas.toDataURL(
                    "image/jpeg",
                    0.5
                );

            if (!targetRoom) {
                alert(
                    "Hata: Kayıt bilgisi eksik. Lütfen önce 'İkmal Fotoğrafı Çek' butonuna basın."
                );
                return;
            }

            saveReplenishPhoto(
                photoData,
                targetRoom
            );

            currentAction = "";
            targetRoom = "";
            targetRecordId = "";

            switchScreen("adminDashboard");
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function showRoomMemory(roomNumber) {
    const roomData = roomMemory[roomNumber];

    if (!roomData) {
        alert("Bu oda için kayıt bulunamadı.");
        return;
    }

    alert(
        `ODA: ${roomNumber}

SON DOLU TARİH:
${roomData.fullDate || "-"}

SON EKSİK TARİH:
${roomData.usageDate || "-"}

SON EKSİK ÜRÜNLER:
${roomData.usageDetails || "-"}`
    );
}
