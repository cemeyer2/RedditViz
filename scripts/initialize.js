var LOGIN_URL = "/login";


/**
 * Submit the user's login credentials to continue
 */
function submitLogin() {

    // Get the user's credentials
    var username = $("#usernameBox").val();
    var password = $("#passwordBox").val();

    // Perform UI effects
    reportLoginStart(username);

    $.ajax({

        // Submit credentials via AJAX
        url:LOGIN_URL,
        data:{
            username:username,
            password:password
        },
        type:'POST',
        dataType:'json',

        // Gracefully handle login failure
        error:function (errorData) {

            // Create a nice error message
            var message;
            if (errorData.status == 401 || errorData.status == 403 || errorData.status == 405 || errorData.status == 407) {
                message = "Authorization Error";
            } else if (errorData.status >= 500) {
                message = "Internal Server Error"
            } else {
                message = errorData.status + " '" + errorData.statusText + "'"
            }

            reportLoginFailure(message);
        },

        // Handle login success, response should be course data
        success:function (data) {
			if(data['result'] == false){
				reportLoginFailure('Invalid Credentials');
			} else {
				hideLoginPopup();
            	loadSidebar();
			}
        }
    });
}


/**
 * Smoothly load the sidebar
 */
function loadSidebar() {

    // Dynamically set the width of the sidebars
    $("#left-sidebar, #right-sidebar").height($("#wrapper").height()-35);
    $("#left-sidebar, #right-sidebar").width(0);
    $("#left-sidebar, #right-sidebar, #content").show();
    $("#left-sidebar, #right-sidebar").animate({
            width: $("#page").width()*0.15
        },
        "slow"
    );

    // Initialize the right sidebar (controls)
    initializeControls();
}