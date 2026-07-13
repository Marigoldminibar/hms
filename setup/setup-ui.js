window.showSetupWizard = function () {

    document.body.innerHTML = `
    <div style="
        max-width:420px;
        margin:40px auto;
        padding:25px;
        background:#fff;
        border-radius:12px;
        box-shadow:0 0 20px rgba(0,0,0,.15);
        font-family:Arial,sans-serif;
    ">

        <h2 style="text-align:center;color:#b08b2d;">
            Marigold HMS
        </h2>

        <h3 style="text-align:center;">
            İlk Kurulum
        </h3>

        <input id="setupHotelName"
               placeholder="Otel Adı"
               style="width:100%;padding:10px;margin-top:10px;">

        <input id="setupAdminPass"
               type="password"
               placeholder="Yönetici Şifresi"
               style="width:100%;padding:10px;margin-top:10px;">

        <input id="setupReceptionPass"
               type="password"
               placeholder="Resepsiyon Şifresi"
               style="width:100%;padding:10px;margin-top:10px;">

        <input id="setupPin"
               placeholder="Personel PIN"
               style="width:100%;padding:10px;margin-top:10px;">

        <button
            onclick="completeFirstSetup()"
            style="
                width:100%;
                margin-top:20px;
                padding:12px;
                background:#c8a33b;
                color:white;
                border:none;
                border-radius:6px;
                cursor:pointer;
            ">
            Kurulumu Tamamla
        </button>

    </div>`;
};
