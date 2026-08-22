/* =====================================================
   FMC SIDEBAR V2
   SIDEBAR + FAB SETTING CONTROL
===================================================== */

(function(){

    "use strict";


    /* =================================================
       UPDATE FAB SETTING
       
       ATURAN:
       - Hanya muncul di Dashboard
       - Hilang saat sidebar terbuka
       - Hilang di semua halaman selain Dashboard
    ================================================= */

    function updateFmcSettingFab(pageOverride){

        const fab =
            document.getElementById(
                "fabSetting"
            );

        if(!fab){
            return;
        }


        /*
         * Jika pageOverride diberikan,
         * gunakan itu.
         *
         * Jika tidak, gunakan currentPage.
         */

        const page =
            pageOverride ||
            window.currentPage ||
            "dashboard";


        const sidebarOpen =
            document.body.classList.contains(
                "sidebar-open"
            );


        /*
         * FAB hanya boleh tampil:
         *
         * Dashboard
         * +
         * Sidebar tidak terbuka
         */

        if(
            page === "dashboard" &&
            !sidebarOpen
        ){

            fab.style.display =
                "flex";

        }else{

            fab.style.display =
                "none";

        }

    }


    /*
     * Jadikan fungsi global supaya bisa
     * dipanggil modul FMC lainnya bila diperlukan.
     */

    window.updateFmcSettingFab =
        updateFmcSettingFab;



    /* =================================================
       BUKA SIDEBAR
    ================================================= */

    window.openFmcSidebar = function(){

        document.body.classList.add(
            "sidebar-open"
        );


        /*
         * Saat sidebar terbuka,
         * FAB WAJIB hilang.
         */

        const fab =
            document.getElementById(
                "fabSetting"
            );

        if(fab){

            fab.style.display =
                "none";

        }


        updateSidebarFarm();

    };



    /* =================================================
       TUTUP SIDEBAR
    ================================================= */

    window.closeFmcSidebar = function(){

        document.body.classList.remove(
            "sidebar-open"
        );


        /*
         * Setelah sidebar ditutup, sembunyikan FAB terlebih dahulu.
         * updateFmcSettingFab() kemudian menentukan apakah FAB boleh
         * muncul kembali berdasarkan halaman aktif.
         */
        const fab =
            document.getElementById(
                "fabSetting"
            );

        if(fab){
            fab.style.display = "none";
        }

        updateFmcSettingFab();

    };



    /* =================================================
       TOGGLE SIDEBAR
    ================================================= */

    window.toggleFmcSidebar = function(){

        if(
            document.body.classList.contains(
                "sidebar-open"
            )
        ){

            closeFmcSidebar();

        }else{

            openFmcSidebar();

        }

    };



    /* =================================================
       UPDATE NAMA FARM
    ================================================= */

    function updateSidebarFarm(){

        const source =
            document.getElementById(
                "farmNama"
            );


        const target =
            document.getElementById(
                "sidebarFarmNama"
            );


        if(
            source &&
            target
        ){

            target.textContent =
                source.textContent.trim();

        }

    }



    /* =================================================
       FLOK SUBMENU
    ================================================= */

    window.toggleSidebarFlok = function(){

        const item =
            document.getElementById(
                "sidebarFlok"
            );


        if(!item){
            return;
        }


        item.classList.toggle(
            "open"
        );

    };



// =================================================
// NAVIGASI SIDEBAR
// =================================================

window.sidebarGo = async function(page){

    /*
     * Tutup sidebar SEGERA sebelum navigasi.
     * Jangan menunggu showPage() selesai karena halaman tujuan
     * bisa dirender sementara sidebar masih terlihat.
     */
    closeFmcSidebar();

    /*
     * Sembunyikan FAB lebih dulu.
     * Ini penting agar FAB tidak sempat menutupi tombol
     * pada halaman tujuan seperti RHPP.
     */
    const fab =
        document.getElementById("fabSetting");

    if(fab){
        fab.style.display = "none";
    }

    /*
     * Navigasi ke halaman tujuan.
     */
    if(
        typeof showPage ===
        "function"
    ){

        await showPage(page);

    }

    /*
     * Setelah halaman selesai dirender, sinkronkan kembali
     * status FAB dengan halaman yang benar.
     *
     * Gunakan requestAnimationFrame + setTimeout sebagai
     * pengaman terhadap render/asinkronisasi halaman.
     */
    updateFmcSettingFab(page);

    requestAnimationFrame(function(){

        updateFmcSettingFab(page);

        setTimeout(function(){

            updateFmcSettingFab(page);

        }, 50);

    });

};



    /* =================================================
       MENU YANG BELUM TERSEDIA
    ================================================= */

    window.sidebarComingSoon = function(
        nama
    ){

        closeFmcSidebar();


        if(
            typeof showUpdateToast ===
            "function"
        ){

            showUpdateToast(
                nama +
                " sedang disiapkan."
            );

            return;

        }


        console.log(
            "FMC:",
            nama,
            "sedang disiapkan."
        );

    };



    /* =================================================
       FLOK A / B / C / D
    ================================================= */

    window.sidebarFlok = function(
        flok
    ){

        closeFmcSidebar();


        /*
         * Simpan FLOK yang dipilih.
         */

        window.fmcFlokAktif =
            flok;


        /*
         * Input FLOK bukan Dashboard,
         * jadi FAB tetap hilang.
         */

        updateFmcSettingFab(
            "inputflok"
        );


        /*
         * Buka halaman INPUT FLOK.
         */

        if(
            typeof showPage ===
            "function"
        ){

            showPage(
                "inputflok"
            );

        }

    };



    /* =================================================
       KLIK OVERLAY
    ================================================= */

    document.addEventListener(
        "click",
        function(event){

            const overlay =
                document.getElementById(
                    "fmcSidebarOverlay"
                );


            if(
                event.target ===
                overlay
            ){

                closeFmcSidebar();

            }

        }
    );



    /* =================================================
       ESC KEY
    ================================================= */

    document.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Escape"
            ){

                closeFmcSidebar();

            }

        }
    );



    /* =================================================
       BOTTOM NAVIGATION
       
       Karena tombol bawah menggunakan showPage()
       langsung, kita pantau kliknya di sini.
    ================================================= */

    document.addEventListener(
        "click",
        function(event){

            const tombol =
                event.target.closest(
                    ".bottomNav button"
                );


            if(!tombol){
                return;
            }


            /*
             * Dashboard
             */

            if(
                tombol.id ===
                "btnDashboard"
            ){

                /*
                 * Beri sedikit waktu agar
                 * showPage selesai mengubah halaman.
                 */

                setTimeout(
                    function(){

                        updateFmcSettingFab(
                            "dashboard"
                        );

                    },
                    0
                );

                return;

            }


            /*
             * Semua menu bottom selain Dashboard
             * membuat FAB hilang.
             */

            updateFmcSettingFab(
                "other"
            );

        }
    );



    /* =================================================
       UPDATE SAAT DOM SIAP
    ================================================= */

    document.addEventListener(
        "DOMContentLoaded",
        function(){

            updateSidebarFarm();


            /*
             * Kondisi awal:
             * Dashboard → FAB muncul.
             */

            updateFmcSettingFab(
                "dashboard"
            );

        }
    );



    /* =================================================
       UPDATE SAAT WINDOW LOAD
    ================================================= */

    window.addEventListener(
        "load",
        function(){

            updateSidebarFarm();


            /*
             * Pastikan kondisi FAB benar
             * setelah seluruh JS selesai dimuat.
             */

            updateFmcSettingFab();

        }
    );


})();