/*
===========================================================
FMC BROILER MOBILE
RESET APPLICATION DATA UI
File : resetApplicationData.js
Version : V1
===========================================================

Alur:
Hapus Data Aplikasi
  -> Peringatan
  -> Lanjutkan
  -> Kode konfirmasi 123456
  -> Loading
  -> resetApplicationData
  -> Berhasil
  -> OK

Modul ini berdiri sendiri dan TIDAK mengubah sidebar.js.

API:
Modul akan memakai adapter berikut jika tersedia:
window.FMC_RESET_APPLICATION_DATA_API
atau
window.resetApplicationDataAPI
atau
window.requestAPI("resetApplicationData", {})

Jangan melakukan fetch langsung ke GAS 2 di modul ini,
agar session/security layer aplikasi tetap digunakan.
===========================================================
*/

(function () {
    "use strict";

    const RESET_CONFIG = {
        CONFIRM_CODE: "123456",
        CODE_LENGTH: 6
    };

    let resetBusy = false;
    let resetModal = null;

    function injectStyles() {
        if (document.getElementById("fmcResetApplicationStyle")) return;

        const style = document.createElement("style");
        style.id = "fmcResetApplicationStyle";

        style.textContent = `
        .fmc-reset-backdrop{
            position:fixed;
            inset:0;
            z-index:99999;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
            background:rgba(15,23,42,.58);
            backdrop-filter:blur(5px);
            -webkit-backdrop-filter:blur(5px);
            opacity:0;
            pointer-events:none;
            transition:opacity .22s ease;
        }

        .fmc-reset-backdrop.show{
            opacity:1;
            pointer-events:auto;
        }

        .fmc-reset-modal{
            width:min(100%,430px);
            max-height:calc(100vh - 40px);
            overflow:auto;
            box-sizing:border-box;
            background:#fff;
            border-radius:22px;
            box-shadow:0 24px 70px rgba(0,0,0,.28);
            padding:24px;
            transform:translateY(12px) scale(.98);
            transition:transform .22s ease;
            font-family:inherit;
        }

        .fmc-reset-backdrop.show .fmc-reset-modal{
            transform:translateY(0) scale(1);
        }

        .fmc-reset-icon{
            width:82px;
            height:82px;
            margin:0 auto 18px;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            background:#fee2e2;
            color:#dc2626;
            font-size:42px;
            line-height:1;
        }

        .fmc-reset-icon.info{
            background:#dbeafe;
            color:#2563eb;
        }

        .fmc-reset-icon.success{
            background:#dcfce7;
            color:#16a34a;
            font-weight:900;
        }

        .fmc-reset-title{
            margin:0;
            text-align:center;
            color:#0f172a;
            font-size:24px;
            line-height:1.25;
            font-weight:800;
        }

        .fmc-reset-subtitle{
            margin:10px 0 0;
            text-align:center;
            color:#475569;
            font-size:16px;
            line-height:1.5;
        }

        .fmc-reset-danger-box{
            margin-top:20px;
            padding:16px;
            border-radius:14px;
            background:#fff1f2;
            border:1px solid #fecdd3;
        }

        .fmc-reset-danger-title{
            color:#b91c1c;
            font-weight:800;
            font-size:16px;
            margin-bottom:8px;
        }

        .fmc-reset-danger-box ul,
        .fmc-reset-safe-box ul{
            margin:0;
            padding-left:21px;
        }

        .fmc-reset-danger-box li,
        .fmc-reset-safe-box li{
            margin:5px 0;
            color:#334155;
            font-size:14px;
            line-height:1.45;
        }

        .fmc-reset-safe-box{
            margin-top:14px;
            padding:16px;
            border-radius:14px;
            background:#ecfdf5;
            border:1px solid #bbf7d0;
        }

        .fmc-reset-safe-title{
            color:#15803d;
            font-weight:800;
            font-size:16px;
            margin-bottom:8px;
        }

        .fmc-reset-warning{
            margin:17px 0 0;
            text-align:center;
            color:#dc2626;
            font-weight:800;
            font-size:15px;
        }

        .fmc-reset-note{
            margin:6px 0 0;
            text-align:center;
            color:#475569;
            font-size:14px;
            line-height:1.4;
        }

        .fmc-reset-actions{
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:12px;
            margin-top:22px;
        }

        .fmc-reset-actions.single{
            grid-template-columns:1fr;
        }

        .fmc-reset-btn{
            min-height:52px;
            border:0;
            border-radius:13px;
            padding:0 16px;
            font:inherit;
            font-weight:800;
            font-size:16px;
            cursor:pointer;
            transition:transform .12s ease,opacity .12s ease;
        }

        .fmc-reset-btn:active{
            transform:scale(.98);
        }

        .fmc-reset-btn:disabled{
            opacity:.55;
            cursor:not-allowed;
        }

        .fmc-reset-btn.cancel{
            background:#eef2f7;
            color:#334155;
        }

        .fmc-reset-btn.danger{
            background:#dc2626;
            color:#fff;
        }

        .fmc-reset-btn.primary{
            background:#2563eb;
            color:#fff;
        }

        .fmc-reset-code-wrap{
            margin:22px auto 0;
            display:flex;
            justify-content:center;
        }

        .fmc-reset-code{
            width:100%;
            max-width:300px;
            height:58px;
            border:2px solid #cbd5e1;
            border-radius:13px;
            box-sizing:border-box;
            text-align:center;
            letter-spacing:9px;
            font-size:24px;
            font-weight:800;
            color:#0f172a;
            outline:none;
        }

        .fmc-reset-code:focus{
            border-color:#2563eb;
            box-shadow:0 0 0 4px rgba(37,99,235,.12);
        }

        .fmc-reset-helper{
            margin:11px 0 0;
            text-align:center;
            color:#64748b;
            font-size:13px;
        }

        .fmc-reset-error{
            display:none;
            margin-top:12px;
            padding:10px 12px;
            border-radius:10px;
            background:#fee2e2;
            border:1px solid #fecaca;
            color:#b91c1c;
            text-align:center;
            font-size:14px;
            font-weight:700;
        }

        .fmc-reset-loading{
            text-align:center;
        }

        .fmc-reset-spinner{
            width:58px;
            height:58px;
            margin:0 auto 20px;
            border:5px solid #dbeafe;
            border-top-color:#2563eb;
            border-radius:50%;
            animation:fmcResetSpin .8s linear infinite;
        }

        @keyframes fmcResetSpin{
            to{transform:rotate(360deg);}
        }

        .fmc-reset-progress{
            height:8px;
            overflow:hidden;
            border-radius:99px;
            background:#e2e8f0;
            margin-top:22px;
        }

        .fmc-reset-progress::after{
            content:"";
            display:block;
            width:40%;
            height:100%;
            border-radius:99px;
            background:#2563eb;
            animation:fmcResetProgress 1.15s ease-in-out infinite;
        }

        @keyframes fmcResetProgress{
            0%{transform:translateX(-120%);}
            100%{transform:translateX(280%);}
        }

        .fmc-reset-success-text{
            margin:12px 0 0;
            color:#475569;
            text-align:center;
            font-size:16px;
            line-height:1.55;
        }

        .fmc-reset-next{
            margin-top:17px;
            padding:13px 14px;
            border-radius:12px;
            background:#eff6ff;
            color:#1e40af;
            text-align:center;
            font-size:14px;
            line-height:1.45;
        }

        @media(max-width:380px){
            .fmc-reset-modal{
                padding:19px;
                border-radius:18px;
            }

            .fmc-reset-title{
                font-size:21px;
            }

            .fmc-reset-danger-box li,
            .fmc-reset-safe-box li{
                font-size:13px;
            }
        }
        `;

        document.head.appendChild(style);
    }

    function createModal() {
        if (resetModal) return resetModal;

        const backdrop = document.createElement("div");
        backdrop.className = "fmc-reset-backdrop";
        backdrop.id = "fmcResetApplicationModal";

        backdrop.innerHTML = `
            <div class="fmc-reset-modal"
                 role="dialog"
                 aria-modal="true"
                 aria-labelledby="fmcResetTitle">
                <div id="fmcResetContent"></div>
            </div>
        `;

        document.body.appendChild(backdrop);
        resetModal = backdrop;
        return backdrop;
    }

    function setContent(html) {
        const content = document.getElementById("fmcResetContent");
        if (content) content.innerHTML = html;
    }

    function openModal() {
        const modal = createModal();
        requestAnimationFrame(function () {
            modal.classList.add("show");
        });
    }

    function closeModal() {
        if (!resetModal || resetBusy) return;

        resetModal.classList.remove("show");

        setTimeout(function () {
            if (resetModal) {
                resetModal.remove();
                resetModal = null;
            }
        }, 220);
    }

    function showWarning() {
        resetBusy = false;

        setContent(`
            <div class="fmc-reset-icon">⚠️</div>

            <h2 id="fmcResetTitle" class="fmc-reset-title">
                Hapus Data Aplikasi?
            </h2>

            <p class="fmc-reset-subtitle">
                Semua data periode yang telah Anda buat
                akan dihapus secara permanen.
            </p>

            <div class="fmc-reset-danger-box">
                <div class="fmc-reset-danger-title">
                    Data yang akan dihapus:
                </div>

                <ul>
                    <li>Semua periode dan data DOC IN</li>
                    <li>Data input harian dan FLOK</li>
                    <li>Data pakan, operasional, panen, dan terkait</li>
                    <li>Data keuangan, RHPP, serta hasil perhitungan</li>
                </ul>
            </div>

            <div class="fmc-reset-safe-box">
                <div class="fmc-reset-safe-title">
                    ✓ Yang tetap tersimpan:
                </div>

                <ul>
                    <li>Profil akun Anda</li>
                    <li>Konfigurasi jumlah dan nama FLOK</li>
                </ul>
            </div>

            <div class="fmc-reset-warning">
                Tindakan ini tidak dapat dibatalkan.
            </div>

            <div class="fmc-reset-note">
                Pastikan Anda benar-benar ingin melanjutkan.
            </div>

            <div class="fmc-reset-actions">
                <button type="button"
                        class="fmc-reset-btn cancel"
                        id="fmcResetCancel1">
                    Batal
                </button>

                <button type="button"
                        class="fmc-reset-btn danger"
                        id="fmcResetContinue">
                    Lanjutkan
                </button>
            </div>
        `);

        openModal();

        const cancel = document.getElementById("fmcResetCancel1");
        const next = document.getElementById("fmcResetContinue");

        if (cancel) cancel.onclick = closeModal;
        if (next) next.onclick = showCodeConfirmation;
    }

    function showCodeConfirmation() {
        setContent(`
            <div class="fmc-reset-icon info">🔐</div>

            <h2 id="fmcResetTitle" class="fmc-reset-title">
                Konfirmasi Keamanan
            </h2>

            <p class="fmc-reset-subtitle">
                Untuk melanjutkan penghapusan data aplikasi,
                masukkan kode konfirmasi.
            </p>

            <div class="fmc-reset-code-wrap">
                <input
                    id="fmcResetConfirmCode"
                    class="fmc-reset-code"
                    type="password"
                    inputmode="numeric"
                    autocomplete="off"
                    maxlength="6"
                    pattern="[0-9]{6}"
                    aria-label="Kode konfirmasi">
            </div>

            <div class="fmc-reset-helper">
                Masukkan kode konfirmasi 6 digit.
            </div>

            <div id="fmcResetCodeError" class="fmc-reset-error">
                Kode konfirmasi tidak sesuai.
            </div>

            <div class="fmc-reset-actions">
                <button type="button"
                        class="fmc-reset-btn cancel"
                        id="fmcResetCancel2">
                    Batal
                </button>

                <button type="button"
                        class="fmc-reset-btn primary"
                        id="fmcResetConfirm">
                    Konfirmasi
                </button>
            </div>
        `);

        const input = document.getElementById("fmcResetConfirmCode");
        const cancel = document.getElementById("fmcResetCancel2");
        const confirm = document.getElementById("fmcResetConfirm");

        if (cancel) cancel.onclick = closeModal;

        if (input) {
            input.focus();

            input.addEventListener("input", function () {
                this.value = this.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, RESET_CONFIG.CODE_LENGTH);

                const error = document.getElementById("fmcResetCodeError");
                if (error) error.style.display = "none";
            });

            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    if (confirm) confirm.click();
                }
            });
        }

        if (confirm) confirm.onclick = validateResetCode;
    }

    function validateResetCode() {
        const input = document.getElementById("fmcResetConfirmCode");
        const error = document.getElementById("fmcResetCodeError");

        if (!input) return;

        const code = input.value.trim();

        if (code.length !== RESET_CONFIG.CODE_LENGTH) {
            if (error) {
                error.textContent = "Kode harus terdiri dari 6 digit.";
                error.style.display = "block";
            }
            input.focus();
            return;
        }

        if (code !== RESET_CONFIG.CONFIRM_CODE) {
            if (error) {
                error.textContent = "Kode konfirmasi tidak sesuai.";
                error.style.display = "block";
            }
            input.value = "";
            input.focus();
            return;
        }

        executeReset();
    }

    function showLoading() {
        resetBusy = true;

        setContent(`
            <div class="fmc-reset-loading">
                <div class="fmc-reset-spinner"></div>

                <h2 id="fmcResetTitle" class="fmc-reset-title">
                    Membersihkan Data Aplikasi
                </h2>

                <p class="fmc-reset-subtitle">
                    Mohon tunggu. Sistem sedang membersihkan
                    seluruh data periode Anda.
                </p>

                <div class="fmc-reset-progress"></div>

                <p class="fmc-reset-note">
                    Jangan menutup aplikasi selama proses berlangsung.
                </p>
            </div>
        `);
    }

    async function callResetAPI() {
        if (typeof window.FMC_RESET_APPLICATION_DATA_API === "function") {
            return await window.FMC_RESET_APPLICATION_DATA_API({
                action: "resetApplicationData"
            });
        }

        if (typeof window.resetApplicationDataAPI === "function") {
            return await window.resetApplicationDataAPI();
        }

        if (typeof window.requestAPI === "function") {
            return await window.requestAPI(
                "resetApplicationData",
                {}
            );
        }

        throw new Error(
            "API resetApplicationData belum terhubung ke PWA."
        );
    }

    async function executeReset() {
        if (resetBusy) return;

        showLoading();

        try {
            console.log(
                "FMC RESET APPLICATION DATA: mulai..."
            );

            const result = await callResetAPI();

            console.log(
                "FMC RESET APPLICATION DATA RESULT:",
                result
            );

            if (!result || result.success !== true) {
                throw new Error(
                    result && result.message
                        ? result.message
                        : "Reset data gagal."
                );
            }

            /*
             * ==========================================
             * SINKRONISASI RESET -> STATE DOC IN PWA
             * ==========================================
             *
             * Backend sudah berhasil menghapus periode.
             * "Data Yang Disiapkan" berada di memori PWA,
             * sehingga state lama harus ikut dikosongkan.
             *
             * Profil akun dan konfigurasi FLOK tidak disentuh.
             */
            if (Array.isArray(window.fmcDocInDataSesi)) {
                window.fmcDocInDataSesi = [];
            }

            window.fmcDocInLastServerData = null;

            /*
             * Hapus pointer periode aktif lama dari PWA.
             */
            window.fmcD2ActivePeriodId = "";

            try {
                localStorage.removeItem(
                    "fmcD2ActivePeriodId"
                );
            }
            catch (storageError) {
                console.warn(
                    "RESET: gagal membersihkan active period cache.",
                    storageError
                );
            }

            /*
             * Jika DOC IN sedang terbuka, kosongkan
             * tabel "Data Yang Disiapkan" sekarang juga.
             */
            if (
                typeof window.renderDocInTableInPage ===
                "function"
            ) {
                try {
                    window.renderDocInTableInPage();
                }
                catch (renderError) {
                    console.warn(
                        "RESET: gagal refresh tabel DOC IN.",
                        renderError
                    );
                }
            }

            showSuccess(result);

        } catch (error) {
            console.error(
                "FMC RESET APPLICATION DATA ERROR:",
                error
            );

            showError(
                error && error.message
                    ? error.message
                    : "Tidak dapat membersihkan data aplikasi."
            );
        }
    }

    function showSuccess(result) {
        resetBusy = false;

        const deleted = Number(
            result.deleted_periods || 0
        );

        setContent(`
            <div class="fmc-reset-icon success">
                ✓
            </div>

            <h2 id="fmcResetTitle" class="fmc-reset-title">
                Data Berhasil Dibersihkan
            </h2>

            <p class="fmc-reset-success-text">
                Semua data periode yang tersimpan
                telah berhasil dibersihkan.
            </p>

            <div class="fmc-reset-safe-box">
                <div class="fmc-reset-safe-title">
                    ✓ Tetap tersimpan:
                </div>

                <ul>
                    <li>Profil akun Anda</li>
                    <li>Konfigurasi jumlah dan nama FLOK</li>
                </ul>
            </div>

            <div class="fmc-reset-next">
                Anda sekarang dapat memulai periode baru
                melalui menu <strong>DOC IN</strong>.
                ${deleted > 0
                    ? `<br><br>${deleted} periode telah dibersihkan.`
                    : ""}
            </div>

            <div class="fmc-reset-actions single">
                <button type="button"
                        class="fmc-reset-btn primary"
                        id="fmcResetSuccessOK">
                    OK
                </button>
            </div>
        `);

        const ok = document.getElementById("fmcResetSuccessOK");

        if (ok) {
            ok.onclick = function () {
                resetBusy = false;
                closeModal();

                setTimeout(function () {
                    if (typeof window.ambilDataServer === "function") {
                        try {
                            window.ambilDataServer(true);
                        } catch (error) {
                            console.warn(
                                "Refresh server setelah reset gagal:",
                                error
                            );
                        }
                    }
                }, 150);
            };
        }
    }

    function showError(message) {
        resetBusy = false;

        setContent(`
            <div class="fmc-reset-icon">⚠️</div>

            <h2 id="fmcResetTitle" class="fmc-reset-title">
                Reset Tidak Berhasil
            </h2>

            <p class="fmc-reset-success-text">
                ${escapeHtml(message)}
            </p>

            <div class="fmc-reset-next">
                Data belum dinyatakan berhasil dibersihkan.
                Silakan coba kembali setelah memastikan
                koneksi server tersedia.
            </div>

            <div class="fmc-reset-actions">
                <button type="button"
                        class="fmc-reset-btn cancel"
                        id="fmcResetErrorCancel">
                    Tutup
                </button>

                <button type="button"
                        class="fmc-reset-btn primary"
                        id="fmcResetErrorRetry">
                    Coba Lagi
                </button>
            </div>
        `);

        const cancel = document.getElementById("fmcResetErrorCancel");
        const retry = document.getElementById("fmcResetErrorRetry");

        if (cancel) cancel.onclick = closeModal;
        if (retry) retry.onclick = showWarning;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.fmcOpenResetApplicationData = function () {
        injectStyles();
        createModal();
        showWarning();
    };

    window.openResetApplicationData =
        window.fmcOpenResetApplicationData;

    function bindResetButtons() {
        const selectors = [
            '[data-action="resetApplicationData"]',
            "#btnResetApplicationData",
            "#resetApplicationData",
            "#btnHapusDataAplikasi",
            "#hapusDataAplikasi"
        ];

        document.querySelectorAll(selectors.join(","))
            .forEach(function (button) {
                if (button.dataset.fmcResetBound === "1") return;

                button.dataset.fmcResetBound = "1";

                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    window.fmcOpenResetApplicationData();
                });
            });
    }

    document.addEventListener("click", function (event) {
        if (!resetModal) return;

        if (event.target === resetModal && !resetBusy) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            resetModal &&
            !resetBusy
        ) {
            closeModal();
        }
    });

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            bindResetButtons
        );
    } else {
        bindResetButtons();
    }

    window.addEventListener("load", bindResetButtons);

    console.log(
        "FMC RESET APPLICATION DATA UI V1 aktif."
    );

})();
