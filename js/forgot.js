/* =====================================================
   FMC BROILER MOBILE
   FORGOT.JS
   Version : 1.0.0
===================================================== */

/* =====================================================
   SHOW PAGE
===================================================== */

function showForgotPin() {

    document.getElementById("loginPage").style.display = "none";

    document.getElementById("forgotPage").style.display = "block";

    document.getElementById("resetEmail").focus();

}

/* =====================================================
   CLOSE PAGE
===================================================== */

function closeForgotPin() {

    document.getElementById("forgotPage").style.display = "none";

    document.getElementById("loginPage").style.display = "flex";

    resetForgotForm();

}

/* =====================================================
   RESET FORM
===================================================== */

function resetForgotForm() {

    document.getElementById("resetEmail").value = "";

    document.getElementById("resetOTP").value = "";

    document.getElementById("resetPIN").value = "";

    document.getElementById("resetConfirmPIN").value = "";

    document.getElementById("otpArea").style.display = "none";

    document.getElementById("btnSendResetOTP").style.display = "flex";

    document.getElementById("btnResetPIN").style.display = "none";

    const msg = document.getElementById("forgotMessage");

    msg.style.display = "none";

    msg.innerHTML = "";

}
/* =====================================================
   SHOW MESSAGE
===================================================== */

function showForgotMessage(message, success = false) {

    const box = document.getElementById("forgotMessage");

    box.style.display = "block";

    box.innerHTML = message;

    box.className =
        success
        ? "loginMessage success"
        : "loginMessage error";

}

/* =====================================================
   SEND RESET OTP
===================================================== */

async function kirimResetOTP() {

    const email =
        document
        .getElementById("resetEmail")
        .value
        .trim();

    if (!email) {

        showForgotMessage(
            "Email wajib diisi."
        );

        return;

    }

    const result =
        await sendResetOTPAPI(email);

    if (!result.success) {

        showForgotMessage(
            result.message
        );

        return;

    }

    showForgotMessage(

        "OTP berhasil dikirim ke Email.",

        true

    );

    document
        .getElementById("otpArea")
        .style.display = "block";

    document
        .getElementById("btnSendResetOTP")
        .style.display = "none";

    document
        .getElementById("btnResetPIN")
        .style.display = "flex";

}
/* =====================================================
   RESET PIN
===================================================== */

async function simpanResetPIN() {

    const email =
        document
        .getElementById("resetEmail")
        .value
        .trim();

    const otp =
        document
        .getElementById("resetOTP")
        .value
        .trim();

    const pin =
        document
        .getElementById("resetPIN")
        .value
        .trim();

    const confirm =
        document
        .getElementById("resetConfirmPIN")
        .value
        .trim();

    if (!otp) {

        showForgotMessage(
            "Kode OTP wajib diisi."
        );

        return;

    }

    if (pin.length !== 6) {

        showForgotMessage(
            "PIN harus 6 digit."
        );

        return;

    }

    if (pin !== confirm) {

        showForgotMessage(
            "Konfirmasi PIN tidak sama."
        );

        return;

    }

    const verify =
        await verifyResetOTPAPI(
            email,
            otp
        );

    if (!verify.success) {

        showForgotMessage(
            verify.message
        );

        return;

    }

    const save =
        await resetPINAPI(
            email,
            pin
        );

    if (!save.success) {

        showForgotMessage(
            save.message
        );

        return;

    }

    showForgotMessage(

        "PIN berhasil diubah.",

        true

    );

    setTimeout(function(){

        closeForgotPin();

    },1500);

}
/* =====================================================
   INITIALIZE
===================================================== */

window.addEventListener(

    "load",

    function(){

        document
            .getElementById(
                "btnSendResetOTP"
            )
            .onclick =
            kirimResetOTP;

        document
            .getElementById(
                "btnResetPIN"
            )
            .onclick =
            simpanResetPIN;

    }

);