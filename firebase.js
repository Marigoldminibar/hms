const firebaseConfig = {
  apiKey: "AIzaSyAUTY6bi41XUxs_nartcjj7risgGj1e8o0",
  authDomain: "marigold-hms.firebaseapp.com",
  projectId: "marigold-hms",
  storageBucket: "marigold-hms.firebasestorage.app",
  messagingSenderId: "1097644002740",
  appId: "1:1097644002740:web:8dd4085fb67fc5e9e5f6e1"
};

window.firebaseConfig = firebaseConfig;

window.loadFirebasePool = async function () {

    const {
        getDocs,
        collection
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    const snapshot =
        await getDocs(
            collection(db, "minibar_records")
        );

    globalRoomsPool = [];

    snapshot.forEach(doc => {

        globalRoomsPool.push({
            firebaseId: doc.id,
            ...doc.data()
        });

    });

    renderAdminCards();

    console.log(
        "Firebase Havuzu Yüklendi:",
        globalRoomsPool.length
    );
};
window.saveDepotPartiesToFirebase = async function () {

    if (!window.db) return;

    const {
        doc,
        setDoc
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    await setDoc(
        doc(db, "live_data", "depot_parties"),
        {
            data: depotParties,
            updatedAt: new Date().toISOString()
        }
    );

    console.log("Firebase canlı stok güncellendi.");
};
window.listenDepotParties = async function () {

    if (!window.db) return;

    const {
        doc,
        onSnapshot
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    onSnapshot(
        doc(db, "live_data", "depot_parties"),
        (snapshot) => {

            if (!snapshot.exists()) return;

            const firebaseData =
                snapshot.data();

            if (!firebaseData.data) return;

            depotParties =
                firebaseData.data;

            saveData(
                "marigold_depot_parties_v2",
                depotParties
            );

            buildSktManagerForAdmin();
            checkStockLevels();

            console.log(
                "Canlı stok güncellendi."
            );
        }
    );
};
window.listenFirebasePool = async function () {

    if (!window.db) return;

    const {
        collection,
        onSnapshot
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    onSnapshot(
        collection(db, "minibar_records"),
        (snapshot) => {

            globalRoomsPool = [];

            snapshot.forEach(doc => {

                globalRoomsPool.push({
                    firebaseId: doc.id,
                    ...doc.data()
                });

            });

            renderAdminCards();

            console.log(
                "Canlı Havuz Güncellendi:",
                globalRoomsPool.length
            );
        }
    );
};
window.saveRoomMemoryToFirebase = async function () {

    console.log(
        "Room Memory Oda Sayısı:",
        Object.keys(roomMemory).length
    );

    if (!window.db) return;

    const {
        doc,
        setDoc
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    await setDoc(
        doc(db, "live_data", "room_memory"),
        {
            data: roomMemory,
            updatedAt: new Date().toISOString()
        }
    );

    console.log("Room Memory Firebase güncellendi.");
};
window.saveRoomSktToFirebase = async function () {

    if (!window.db) return;

    const {
        doc,
        setDoc
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    await setDoc(
        doc(db, "live_data", "room_skt"),
        {
            data: roomSktDatabase,
            updatedAt: new Date().toISOString()
        }
    );

    console.log("Room SKT Firebase güncellendi.");
};
window.listenRoomSkt = async function () {

    if (!window.db) return;

    const {
        doc,
        onSnapshot
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    onSnapshot(
        doc(db, "live_data", "room_skt"),
        (snapshot) => {

            if (!snapshot.exists()) return;

            const firebaseData =
                snapshot.data();

            if (!firebaseData.data) return;

            roomSktDatabase =
                firebaseData.data;

            saveData(
                "marigold_rooms_skt_db_v2",
                roomSktDatabase
            );

            if (typeof loadRoomSpecificProducts === "function") {
                loadRoomSpecificProducts();
            }

            console.log(
                "Canlı SKT güncellendi."
            );
        }
    );
};

window.listenRoomMemory = async function () {

    if (!window.db) return;

    const {
        doc,
        onSnapshot
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    onSnapshot(
        doc(db, "live_data", "room_memory"),
        (snapshot) => {

            if (!snapshot.exists()) return;

            const firebaseData = snapshot.data();

            if (!firebaseData.data) return;

            roomMemory = firebaseData.data;

            saveData(
                "marigold_room_memory",
                roomMemory
            );

            renderApprovedRecords();
            updateDashboardSummary();

            console.log("Canlı Room Memory güncellendi.");
        }
    );
};

window.saveSettingsToFirebase = async function () {

    if (!window.db) return;

    const {
        doc,
        getDoc,
        setDoc
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    const settingsRef =
        doc(db, "live_data", "settings");

    let currentSettings = {};

    const snapshot =
        await getDoc(settingsRef);

    if (snapshot.exists()) {
        currentSettings = snapshot.data();
    }

    await setDoc(settingsRef, {

        ...currentSettings,

        pin:
            loadData("marigold_pin") || "",

        receptionPass:
            loadData("marigold_reception_pass") || "",

        adminPass:
            loadData("marigold_admin_pass") || "",

        updatedAt:
            new Date().toISOString()

    });

    console.log("Settings Firebase güncellendi.");

};

window.saveApprovedRecordToFirebase = async function (record) {

    if (!window.db) return;

    const {
    doc,
    setDoc
} = await import(
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
);

await setDoc(
    doc(db, "approved_records", record.room),
    record
);

    console.log(
        "Approved Record Collection Kaydedildi."
    );
};


window.listenApprovedRecordsCollection = async function () {

    if (!window.db) return;

    const {
        collection,
        onSnapshot
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    onSnapshot(
        collection(db, "approved_records"),
        (snapshot) => {

            approvedRecords = [];

            snapshot.forEach(doc => {

                approvedRecords.push({
                    firebaseId: doc.id,
                    ...doc.data()
                });

            });

            saveData(
                "marigold_approved",
                approvedRecords
            );

            renderApprovedRecords();
            updateDashboardSummary();

            console.log(
                "Approved Records Collection Güncellendi:",
                approvedRecords.length
            );
        }
    );
};

window.listenSalesHistory = async function () {

    if (!window.db) return;

    const {
        collection,
        onSnapshot
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    onSnapshot(
        collection(db, "sales_history"),
        (snapshot) => {

            const salesHistory = [];

            snapshot.forEach(doc => {
                salesHistory.push({
                    firebaseId: doc.id,
                    ...doc.data()
                });
            });

            saveData(
                "marigold_sales_history",
                salesHistory
            );

            updateDashboardSummary();

            console.log(
                "Sales History Güncellendi:",
                salesHistory.length
            );
        }
    );

};

window.clearApprovedRecordsFirebase = async function () {

    if (!window.db) return;

    const {
        collection,
        getDocs,
        deleteDoc,
        doc
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    async function clearCollection(collectionName) {

        const snapshot = await getDocs(
            collection(db, collectionName)
        );

        const promises = [];

        snapshot.forEach(item => {
            promises.push(
                deleteDoc(
                    doc(db, collectionName, item.id)
                )
            );
        });

        await Promise.all(promises);
    }

    await clearCollection("approved_records");
    await clearCollection("sales_history");

    console.log("Approved Records ve Sales History temizlendi.");
};

window.clearRoomMemoryFirebase = async function () {

    if (!window.db) return;

    const {
        doc,
        setDoc
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    await setDoc(
        doc(db, "live_data", "room_memory"),
        {
            data: {},
            updatedAt: new Date().toISOString()
        }
    );

    console.log("Room Memory Firebase temizlendi.");
};

window.clearPoolFirebase = async function () {

    if (!window.db) return;

    const {
        collection,
        getDocs,
        deleteDoc,
        doc
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    const snapshot = await getDocs(
        collection(db, "minibar_records")
    );

    const promises = [];

    snapshot.forEach(item => {
        promises.push(
            deleteDoc(
                doc(db, "minibar_records", item.id)
            )
        );
    });

    await Promise.all(promises);

    console.log("Firebase Havuz temizlendi.");

};

// ----------------------------------------------------
// Firebase Settings Listener
// ----------------------------------------------------
window.listenSettings = async function () {

    if (!window.db) return;

    const {
        doc,
        onSnapshot
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    onSnapshot(
        doc(db, "live_data", "settings"),
        (snapshot) => {

            if (!snapshot.exists()) return;

            const settings = snapshot.data();

            if (settings.adminPass) {
                saveData("marigold_admin_pass", settings.adminPass);
            }

            if (settings.receptionPass) {
                saveData("marigold_reception_pass", settings.receptionPass);
            }

            if (settings.pin) {
                saveData("marigold_pin", settings.pin);
            }

            console.log("Firebase Settings Güncellendi.");

        }
    );

};

window.saveSalesHistoryToFirebase = async function(record) {

    if (!window.db) return;

    const {
        addDoc,
        collection
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    await addDoc(
        collection(db, "sales_history"),
        record
    );

    console.log("Sales History Kaydedildi.");

};
