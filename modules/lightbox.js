(function () {

    let overlay = null;
    let image = null;

    function createLightbox() {

        if (overlay) return;

        overlay = document.createElement("div");
        overlay.id = "lightboxOverlay";

        overlay.innerHTML = `
            <span id="lightboxClose">&times;</span>
            <img id="lightboxImage">
        `;

        document.body.appendChild(overlay);

        image = document.getElementById("lightboxImage");

        overlay.addEventListener("click", function (e) {

            if (
                e.target === overlay ||
                e.target.id === "lightboxClose"
            ) {

                closeLightbox();

            }

        });

        document.addEventListener("keydown", function (e) {

            if (e.key === "Escape") {

                closeLightbox();

            }

        });

    }

    function openLightbox(src) {

        createLightbox();

        image.src = src;

        overlay.classList.add("show");

        document.body.style.overflow = "hidden";

    }

    function closeLightbox() {

        if (!overlay) return;

        overlay.classList.remove("show");

        document.body.style.overflow = "";

    }

    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;

})();
