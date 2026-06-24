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
window.saveSettingsToFirebase = async function () {

    if (!window.db) return;

    const {
        doc,
        setDoc
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    await setDoc(
        doc(db, "live_data", "settings"),
        {
            pin: loadData("marigold_pin") || "1453",
            adminPass: loadData("marigold_admin_pass") || "marigold16",
            updatedAt: new Date().toISOString()
        }
    );

    console.log("Settings Firebase güncellendi.");
};
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

            const data = snapshot.data();

            if (data.pin) {
                saveData(
                    "marigold_pin",
                    data.pin
                );
            }

            if (data.adminPass) {
                saveData(
                    "marigold_admin_pass",
                    data.adminPass
                );
            }

            console.log(
                "Canlı settings güncellendi."
            );
        }
    );
};

window.saveApprovedRecordToFirebase = async function (record) {

    if (!window.db) return;

    const {
        addDoc,
        collection
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    await addDoc(
        collection(db, "approved_records"),
        record
    );

    console.log(
        "Approved Record Collection Kaydedildi."
    );
};
window.saveApprovedRecordsToFirebase = async function () {

    if (!window.db) return;

    console.log(
        "Approved Records Sayısı:",
        approvedRecords.length
    );

    const {
        doc,
        setDoc
    } = await import(
        "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
    );

    await setDoc(
        doc(db, "live_data", "approved_records"),
        {
            data: approvedRecords,
            updatedAt: new Date().toISOString()
        }
    );

    console.log(
        "Approved Records Firebase güncellendi."
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
