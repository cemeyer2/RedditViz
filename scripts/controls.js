/**
 * Setup the default control values
 */
var graphControls = {

    // Whether not to show matches from past semesters
    includePastSemesters: false,

    // Whether or not to show nodes with no matches
    includeSingletons: false,

    // Whether or not to show edges that are partners
    includePartnerEdges: true,

    // Whether or not to include the solution node
    includeSolution: true,

    // Whether or not to make the graph anonymous
    anonymousGraph: true,

    // The minimum threshold for edges to display
    minimumEdgeWeight: 0
};


/**
 * Triggered when a user selects a minimum edge weight (i.e. *stops* on a certain weight)
 */
function changeMinimumEdgeWeight(event, ui) {
    graphControls.minimumEdgeWeight = ui.value;
    $('#updateGraphButton').attr('disabled', false);
}

/**
 * When one of the checkboxes is toggled, set/unset the corresponding option
 */
function toggleIncludePastSemesters() {
    graphControls.includePastSemesters = this.checked;
    $('#updateGraphButton').attr('disabled', false);
}
function toggleIncludeSingletons() {
    graphControls.includeSingletons = this.checked;
    $('#updateGraphButton').attr('disabled', false);
}
function toggleIncludePartnerEdges() {
    graphControls.includePartnerEdges = this.checked;
    $('#updateGraphButton').attr('disabled', false);
}
function toggleIncludeSolution() {
    graphControls.includeSolution = this.checked;
    $('#updateGraphButton').attr('disabled', false);
}
function toggleAnonymousGraph() {
    graphControls.anonymousGraph = this.checked;
    $('#updateGraphButton').attr('disabled', false);
}

/**
 * Initialize the controls sidebar, creating & binding all inputs to their corresponding actions (everything is disabled by default)
 */
function initializeControls() {

    // Create slider & attach listener
    $("#minimumEdgeWeightSlider").slider({
        min: 0,
        max: 100,
        disabled: true,
        stop: changeMinimumEdgeWeight,
        change: function(event, ui) {
            $("#currentMinimumEdgeWeight").text(ui.value);
        }
    });

    // Attach handlers to checkbox controls
    $("#includePastSemestersCheckbox").change(toggleIncludePastSemesters);
    $("#includeSingletonsCheckbox").change(toggleIncludeSingletons);
    $("#includePartnerEdgesCheckbox").change(toggleIncludePartnerEdges);
    $("#includeSolutionCheckbox").change(toggleIncludeSolution);
    $("#anonymousGraphCheckbox").change(toggleAnonymousGraph);

    // Disable everything in the controls
    $('#right-sidebar *').attr('disabled', true);
}


/**
 * Enable the controls to allow them to be used
 */
function enableControls() {
    $('#right-sidebar *').attr('disabled', false);
    $("#minimumEdgeWeightSlider").slider("option", "disabled", false);
    $('#updateGraphButton').attr('disabled', true);
}

/**
 * Hide the legend
 */
function hideLegend() {
    $("#legend").hide();
}

/**
 * Draw & show the legend
 */
function showLegend() {

    var legendHTML = "<table cellpadding='5'>";
    for(var groupId in groupIds) {

        // Determine the label for this group
        var offeringName;
        if (groupId >= 0) {
            offeringName = offerings[groupId].semester.season + " " + offerings[groupId].semester.year;
        } else {
            offeringName = "Solution";
        }


        legendHTML += "<tr>" +
                "<td><svg height=10 width=10><circle cx='5' cy='5' style='fill: " + fillNode(groupId) + "' r='5'></circle></svg></td>" +
                "<td>" + offeringName + "</td>" +
            "</tr>";
    }
    legendHTML += "</table>";

    $("#legend .post").html(legendHTML);
    $("#legend").fadeIn('fast');
}
