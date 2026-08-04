/* =====================================================
   FMC BROILER MOBILE
   REGISTER MODULE V3
===================================================== */

"use strict";

/* =====================================================
   ELEMENT
===================================================== */

const loginPage =
document.getElementById("loginPage");

const registerPage =
document.getElementById("registerPage");

const registerForm =
document.getElementById("registerForm");

const btnRegister =
document.getElementById("btnRegister");

const registerMessage =
document.getElementById("registerMessage");

/* =====================================================
   INPUT
===================================================== */

const regName =
document.getElementById("regName");

const regEmail =
document.getElementById("regEmail");

const regPhone =
document.getElementById("regPhone");

const regCompany =
document.getElementById("regCompany");

const regAddress =
document.getElementById("regAddress");

const regProvince =
document.getElementById("regProvince");

const regCity =
document.getElementById("regCity");

const regBusiness =
document.getElementById("regBusiness");

const regCage =
document.getElementById("regCage");

const regPin =
document.getElementById("regPin");

const regConfirmPin =
document.getElementById("regConfirmPin");

const agree =
document.getElementById("agree");

/* =====================================================
   REGISTER STATE
===================================================== */

const registerState = {

    loading : false,

    provinceId : "",

    cityId : "",

    mode : "register"

};

/* =====================================================
   INIT
===================================================== */

async function initRegister() {

    clearRegisterMessage();

    await loadProvince();

}

/* =====================================================
   NAVIGATION
===================================================== */

function showRegister() {

    loginPage.style.display =
        "none";

    registerPage.style.display =
        "flex";

    if (typeof clearRegisterMessage === "function") {

        clearRegisterMessage();

    }

}

function showLogin() {

    registerPage.style.display =
        "none";

    loginPage.style.display =
        "flex";

}

/* =====================================================
   SUBMIT
===================================================== */

async function onRegisterSubmit(event) {

    event.preventDefault();

    if (registerState.mode === "otp") {

        await verifyOTP();

        return;

    }

    if (!registerForm.reportValidity()) {

        return;

    }

    if (!validateRegister()) {

        return;

    }

    await processRegister();

}

/* =====================================================
   MESSAGE
===================================================== */

function showMessage(
    message,
    type = "error"
) {

    if (!registerMessage) {

        return;

    }

    registerMessage.style.display =
        "block";

    registerMessage.innerHTML =
        message;

    registerMessage.className =
        "registerMessage " + type;

}

function clearRegisterMessage() {

    if (!registerMessage) {

        return;

    }

    registerMessage.style.display =
        "none";

    registerMessage.innerHTML =
        "";

    registerMessage.className =
        "registerMessage";

}

/* =====================================================
   BUTTON STATE
===================================================== */

function disableRegisterButton() {

    registerState.loading = true;

    btnRegister.disabled = true;

    btnRegister.innerHTML = "MEMPROSES...";

}

function enableRegisterButton() {

    registerState.loading = false;

    btnRegister.disabled = false;

    btnRegister.innerHTML = "DAFTAR SEKARANG";

}

/* =====================================================
   API
===================================================== */

const API_URL =
"https://script.google.com/macros/s/AKfycbzQV6bliXd_BlxOJgtXdacoHhtdbgWfHUV-vhW3DZSyaTWBSTdNuum5UG3YyWqGwUJh/exec";

/* =====================================================
   VALIDATION
===================================================== */

function validateRegister() {

    clearRegisterMessage();

    if (regPin.value.length !== 6) {

        showMessage(
            "PIN harus terdiri dari 6 digit.",
            "error"
        );

        regPin.focus();

        return false;

    }

    if (regPin.value !== regConfirmPin.value) {

        showMessage(
            "Konfirmasi PIN tidak sama.",
            "error"
        );

        regConfirmPin.focus();

        return false;

    }

    if (!agree.checked) {

        showMessage(
            "Silakan setujui Syarat & Ketentuan.",
            "error"
        );

        agree.focus();

        return false;

    }

    return true;

}

/* =====================================================
   LOAD PROVINCE
===================================================== */

async function loadProvince() {

    try {

        regProvince.disabled = true;

        regProvince.innerHTML =
            '<option value="">Memuat Provinsi...</option>';

        regCity.innerHTML =
            '<option value="">Pilih Kota / Kabupaten</option>';

        regCity.disabled = true;

        const response = await fetch(
            API_URL + "?action=province"
        );

        const result = await response.json();

        if (!result.success) {

            throw new Error(result.message);

        }

        regProvince.innerHTML =
            '<option value="">Pilih Provinsi</option>';

        result.data.forEach(function(item) {

            regProvince.innerHTML +=
            `<option value="${item.id}">
                ${item.name}
            </option>`;

        });

        regProvince.disabled = false;

    }

    catch (error) {

        console.error(error);

        regProvince.innerHTML =
            '<option value="">Gagal Memuat Provinsi</option>';

        showMessage(
            "Gagal memuat data Provinsi.",
            "error"
        );

    }

}

/* =====================================================
   LOAD CITY
===================================================== */

async function loadCity(provinceId) {

    if (!provinceId) {

        regCity.innerHTML =
            '<option value="">Pilih Kota / Kabupaten</option>';

        regCity.disabled = true;

        return;

    }

    try {

        regCity.disabled = true;

        regCity.innerHTML =
            '<option value="">Memuat Kota...</option>';

        const response = await fetch(

            API_URL +
            "?action=city&province=" +
            encodeURIComponent(provinceId)

        );

        const result = await response.json();

        if (!result.success) {

            throw new Error(result.message);

        }

        regCity.innerHTML =
            '<option value="">Pilih Kota / Kabupaten</option>';

        result.data.forEach(function(item) {

            regCity.innerHTML +=
            `<option value="${item.id}">
                ${item.name}
            </option>`;

        });

        regCity.disabled = false;

    }

    catch (error) {

        console.error(error);

        regCity.innerHTML =
            '<option value="">Gagal Memuat Kota</option>';

        showMessage(
            "Gagal memuat data Kota.",
            "error"
        );

    }

}

/* =====================================================
   CHECK EMAIL
===================================================== */

async function checkEmail() {

    try {

        showMessage(
            "Memeriksa Email...",
            "warning"
        );

        const response = await fetch(

            API_URL +
            "?action=checkEmail&email=" +
            encodeURIComponent(
                regEmail.value.trim()
            )

        );

        const result =
            await response.json();

        if (!result.success) {

            showMessage(
                result.message,
                "error"
            );

            regEmail.focus();

            return false;

        }

        return true;

    }

    catch (error) {

        console.error(error);

        showMessage(
            "Gagal memeriksa Email.",
            "error"
        );

        return false;

    }

}

/* =====================================================
   CHECK PHONE
===================================================== */

async function checkPhone() {

    try {

        showMessage(
            "Memeriksa Nomor HP...",
            "warning"
        );

        const response = await fetch(

            API_URL +
            "?action=checkPhone&phone=" +
            encodeURIComponent(
                regPhone.value.trim()
            )

        );

        const result =
            await response.json();

        if (!result.success) {

            showMessage(
                result.message,
                "error"
            );

            regPhone.focus();

            return false;

        }

        return true;

    }

    catch (error) {

        console.error(error);

        showMessage(
            "Gagal memeriksa Nomor HP.",
            "error"
        );

        return false;

    }

}

/* =====================================================
   PROCESS REGISTER
===================================================== */

async function processRegister() {

    if (registerState.loading) {

        return;

    }

    disableRegisterButton();

    try {

        showMessage(
            "Memproses Registrasi...",
            "warning"
        );

        const formData =
            new URLSearchParams();

        formData.append(
            "action",
            "register"
        );

        formData.append(
            "nama",
            regName.value.trim()
        );

        formData.append(
            "email",
            regEmail.value.trim()
        );

        formData.append(
            "phone",
            regPhone.value.trim()
        );

        formData.append(
            "company",
            regCompany.value.trim()
        );

        formData.append(
            "address",
            regAddress.value.trim()
        );

        formData.append(
            "province_id",
            regProvince.value
        );

        formData.append(
            "city_id",
            regCity.value
        );

        formData.append(
            "business",
            regBusiness.value
        );

        formData.append(
            "cage",
            regCage.value.trim()
        );

        formData.append(
            "password",
            regPin.value
        );

        const response =
            await fetch(
                API_URL,
                {
                    method : "POST",
                    body : formData
                }
            );

        const result =
            await response.json();

        if (!result.success) {

            showMessage(
                result.message,
                "error"
            );

            enableRegisterButton();

            return;

        }

        showMessage(
            result.message,
            "success"
        );

        showOTPVerification();

    }

    catch (error) {

        console.error(error);

        showMessage(
            "Terjadi kesalahan sistem.",
            "error"
        );

        enableRegisterButton();

    }

}

/* =====================================================
   SHOW OTP VERIFICATION
===================================================== */

function showOTPVerification() {

    registerState.mode = "otp";

    clearRegisterMessage();

    registerMessage.style.display = "block";

    registerMessage.className =
        "registerMessage success";

    registerMessage.innerHTML = `

        <h3>Verifikasi Email</h3>

        <p>
            Kode OTP telah dikirim ke:
        </p>

        <b>${regEmail.value.trim()}</b>

        <br><br>

        <label for="otpCode">
            Masukkan Kode OTP
        </label>

        <input
            id="otpCode"
            type="text"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="Masukkan 6 Digit OTP"
            style="margin-top:8px;">

    `;

    btnRegister.disabled = false;

    btnRegister.textContent =
        "KONFIRMASI OTP";

}


/* =====================================================
   VERIFY OTP
===================================================== */

async function verifyOTP() {

    const otpInput =
        document.getElementById("otpCode");

    if (!otpInput) {

        showMessage(
            "Kolom OTP tidak ditemukan.",
            "error"
        );

        return;

    }

    const code =
        otpInput.value.trim();

    if (code.length !== 6) {

        showMessage(
            "Masukkan 6 digit kode OTP.",
            "error"
        );

        otpInput.focus();

        return;

    }

    disableRegisterButton();

    try {

        showMessage(
            "Memverifikasi kode OTP...",
            "warning"
        );

        const formData =
            new URLSearchParams();

        formData.append(
            "action",
            "verifyOTP"
        );

        formData.append(
            "email",
            regEmail.value.trim()
        );

        formData.append(
            "code",
            code
        );

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",
                    body: formData
                }
            );

        const result =
            await response.json();

        if (!result.success) {

            showMessage(
                result.message,
                "error"
            );

            btnRegister.disabled = false;

            btnRegister.textContent =
                "KONFIRMASI OTP";

            return;

        }

        showMessage(
            "Pendaftaran berhasil. Silakan login.",
            "success"
        );

        setTimeout(function () {

            showLogin();

        }, 1500);

    }

    catch (error) {

        console.error(error);

        showMessage(
            "Terjadi kesalahan sistem.",
            "error"
        );

        btnRegister.disabled = false;

        btnRegister.textContent =
            "KONFIRMASI OTP";

    }

}


/* =====================================================
   EVENT
===================================================== */

registerForm.addEventListener(
    "submit",
    onRegisterSubmit
);

regProvince.addEventListener(
    "change",
    async function () {

        registerState.provinceId =
            this.value;

        registerState.cityId = "";

        await loadCity(this.value);

    }
);

regCity.addEventListener(
    "change",
    function () {

        registerState.cityId =
            this.value;

    }
);

/* =====================================================
   START MODULE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initRegister
);