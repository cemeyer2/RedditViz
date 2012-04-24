var popupStatus = 0;

/**
 * Centers the popup
 */
function centerLoginPopup(){

    // Get the dimensions
    var popupHeight = $("#loginPopup").height();
    var popupWidth = $("#loginPopup").width();

    // Center & size popup
    $("#loginPopup").css({
        "position": "absolute",
        "top": window.innerHeight/2-popupHeight/2,
        "left": window.innerWidth/2-popupWidth/2
    });
    $("#backgroundPopup").css({
        "width": window.innerWidth,
        "height": window.innerHeight
    });
}

/**
 * Show search underway with a given message displaying.
 */
function showLoginPopup() {

    // Set the popup's text
    centerLoginPopup();

    // If the popup's not displayed, fade it in
    if(popupStatus == 0) {
        $("#backgroundPopup").fadeIn("fast");
        $("#loginPopup").fadeIn("fast");
        popupStatus = 1;
    }
}

/**
 * Hide the progess display
 */
function hideLoginPopup() {

    // If the popup's displayed, fade it out
    if(popupStatus == 1) {
        $("#backgroundPopup").fadeOut("fast");
        $("#loginPopup").fadeOut("fast");
        popupStatus = 0;
    }
}

/**
 * Perform effects to begin login process
 */
function reportLoginStart(netId) {
    $("#loginErrorBox").hide();
    $("#loginButton").attr("disabled", "disabled");
    $("#loginStatus").html("Logging in as '" + netId + "'");
    $("#loginStatusBox").fadeIn("fast");
}

/**
 * Display an login error message for login
 */
function reportLoginFailure(errorMessage) {
    $("#loginButton").removeAttr("disabled");
    $("#loginStatusBox").hide();
    $("#loginErrorBox").show();
    $("#loginError").text(errorMessage);
}