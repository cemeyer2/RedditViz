var popupStatus = 0;

/**
 * Centers the loading popup
 */
function centerLoadingPopup(){

    // Get the dimensions
    var popupHeight = $("#loadingPopup").height();
    var popupWidth = $("#loadingPopup").width();

    // Center & size popup
    $("#loadingPopup").css({
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
 * Show loading underway
 */
function showLoadingPopup() {

    // Set the popup's text
    centerLoadingPopup();

    // If the popup's not displayed, fade it in
    if(popupStatus == 0) {
        $("#preloadMessage").fadeOut("fast");
        $("#backgroundPopup").fadeIn("fast");
        $("#loadingPopup").fadeIn("fast");
        popupStatus = 1;
    }
}

/**
 * Hide the loading progess display
 */
function hideLoadingPopup() {

    // If the popup's displayed, fade it out
    if(popupStatus == 1) {
        $("#backgroundPopup").fadeOut("fast");
        $("#loadingPopup").fadeOut("fast");
        popupStatus = 0;
    }
}

/**
 * Show the current loading status
 */
function reportLoadingStatus(message) {
    $("#loadingErrorBox").hide();
    $("#okButton").hide();
    $("#loadingStatusBox").show();
    $("#loadingStatus").html(message);
}


/**
 * Handle an error loading
 */
function reportLoadingError(errorData) {

    // Create a nice error message
    var message;
    if (errorData.status == 401 || errorData.status == 403 || errorData.status == 405 || errorData.status == 407) {
        message = "Authorization Error";
    } else if (errorData.status >= 500) {
        message = "Internal Server Error"
    } else {
        message = errorData.status + " '" + errorData.statusText + "'"
    }

    // Show error message
    $("#loadingStatusBox").hide();
    $("#loadingErrorBox").show();
    $("#okButton").show();
    $("#loadingErrorBox").text(message);
}