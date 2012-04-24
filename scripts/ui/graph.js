// Used to provide unique id's to each popup locked in place
var popupGlobalCount = 0;

// Used to keep track of the groups that are shown in the graph
var groupIds;

// Record the mouse location at all times
var mouseX, mouseY;
jQuery(document).ready(function(){
    $(document).mousemove(function(e){
        mouseX = e.pageX;
        mouseY = e.pageY;
    });
});

/**
 * Custom fill using palette for handling certain node types explicitly.
 *
 *  @param  group   The group id
 *
 *      -1: Solution
 *      0+: Student submission
 */
function fillNode(group) {
    if (group < 0) {
        return "#d62728"; // deep pastel red
    } else {
        return nodePalette(group);
    }
}

/**
 * Custom palette for handling node colors
 */
var nodePalette = function () {

    // Adapted from 'd3_category20', but with conflicting colors removed
    return d3.scale.ordinal().range([
        "#1f77b4", "#aec7e8",
        "#ff7f0e", "#ffbb78",
        "#2ca02c", "#98df8a",
        "#9467bd", "#c5b0d5",
        "#8c564b", "#c49c94",
        "#e377c2", "#f7b6d2",
        "#7f7f7f", "#c7c7c7",
        "#bcbd22", "#dbdb8d",
        "#17becf", "#9edae5"
    ]);
}();


/**
 * Render the graph given the graph data structure
 */
function renderGraph(data) {

    // Hide all popups on the graph
    hideAllGraphPopups();
    hideLegend();

    // Resize the content div
    var width = $("#content").width();
    var height = $("#content").height();

    // Attach drag handlers
    var redraw = function() {
        hideAllGraphPopups();
        vis.attr("transform",
            "translate(" + d3.event.translate + ")"
                + " scale(" + d3.event.scale + ")");
    };

    groupIds = {};

    // Create the graph element
    var vis = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("pointer-events", "all")
        .append('svg:g')
        .call(d3.behavior.zoom().on("zoom", redraw))
        .append('svg:g');

    vis.append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'white');

    // Attach listeners to hide other popups on mouseover a popup
    $("#nodePopup").hover(function() {
        $("#edgePopup").hide();
    });
    $("#edgePopup").hover(function() {
        $("#nodePopup").hide();
    });

    // Create the graph
    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(30)
        .nodes(data.nodes)
        .links(data.links)
        .size([width, height])
        .start();

    // Configure links (edges)
    var link = vis.selectAll("line.link")
        .data(data.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function (d) {
            return Math.sqrt(d.value);
        })
        .attr("x1", function (d) {
            return d.source.x;
        })
        .attr("y1", function (d) {
            return d.source.y;
        })
        .attr("x2", function (d) {
            return d.target.x;
        })
        .attr("y2", function (d) {
            return d.target.y;
        })
        .on("mouseover", showMatchPopup)
        .on("mouseout", hideUnlockedGraphPopups)
        .on("mousedown", lockMatchPopup);

    // Configure nodes
    var node = vis.selectAll("circle.node")
        .data(data.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("cx", function (d) {
            return d.x;
        })
        .attr("cy", function (d) {
            return d.y;
        })
        .attr("r", 5)
        .style("fill", function (d) {
            groupIds[d.group] = true;
            return fillNode(d.group);
        })
        .call(d3.behavior.zoom().on("zoom", redraw))
        .on("mouseover", showSubmissionPopup)
        .on("mouseout", hideUnlockedGraphPopups)
        .on("mousedown", lockSubmissionPopup);

    force.on("tick", function () {
        link.attr("x1", function (d) {
            return d.source.x;
        })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        node.attr("cx", function (d) {
            return d.x;
        })
            .attr("cy", function (d) {
                return d.y;
            });
    });

    showLegend();
}

/**
 * Hide all unlocked popups on the screen
 */
function hideUnlockedGraphPopups() {
    $("#nodePopup").hide();
    $("#edgePopup").hide();
}

/**
 * Hide locked and unlocked graph popups
 */
function hideAllGraphPopups() {
    $(".graphPopup").hide();
}

/**
 * Creates a static submission popup, locked in place, that only closes manually
 */
function lockSubmissionPopup(submission) {

    showSubmissionPopup(submission);

    // Create new popup & separate it from old
    var newPopup = $("#nodePopup").clone();
    var newPopupId = 'nodePopupLocked' + popupGlobalCount;
    newPopup.attr({'id' : newPopupId});
    newPopup.css('z-index', 10000);
    newPopup.find('.graphPopupContent').attr({'id' : 'nodePopupContentLocked'});

    // Show the close button & attach behavior
    newPopup.find('.closeButton').text('X');
    newPopup.find('.closeButton').click(function () { $("#" + newPopupId).hide(); });

    newPopup.appendTo('#chart');

    popupGlobalCount++;
}



/**
 * Show the information for a submission in a popup
 *
 * @param submission    The submission whose data to display
 */
function showSubmissionPopup(submission) {

    hideUnlockedGraphPopups();

    // Check if this submission is a solution
    if(submission.type == 'solutionsubmission') {

        // Create the HTML for the node popup
        $("#nodePopupContent").html("<div><span class='closeButton' style='float:right;'></span><br/>" +
            "<br/><h3 style='color:#CC0001;'>&nbsp;Solution Submission&nbsp;</h3>" +
        "</div>");

    } else {

        // Nicely format the student's academic status
        var studentStatus;
        var studentProgram;
        if (submission.student.left_uiuc == "currently enrolled") {
            studentStatus = submission.student.level_name + " (" + submission.student.left_uiuc + ")";
            studentProgram = submission.student.program_name
        } else {
            studentStatus = "Left UIUC " + submission.student.left_uiuc;
            studentProgram = "N/A";
        }

        if (graphControls.anonymousGraph) {

            // Create the HTML for the node popup
            $("#nodePopupContent").html(
                "<table border='0' cellspacing='0' cellpadding='0' align='center' >" +
                    //TODO: Actually anonymize the students, instead of using the ids from the DB
                    "<tr><td class='titleColumn'>Id:</td><td>" + submission.student.id + "</td><td class='closeButton'>&nbsp;&nbsp;</td></tr>" +
                    "<tr><td class='titleColumn'>History Link:</td><td><a target='_newtab' href='" + submission.student.history_link + "'>"
                    + submission.student.history_link + "</a></td><td></td></tr>" +
                    "</table>"
            );
        } else {

            // Create the HTML for the node popup
            $("#nodePopupContent").html(
                "<table border='0' cellspacing='0' cellpadding='0' align='center' >" +
                    "<tr><td class='titleColumn'>Name:</td><td>" + submission.student.display_name + "</td><td class='closeButton'>&nbsp;&nbsp;</td></tr>" +
                    "<tr><td class='titleColumn'>Netid:</td><td>" + submission.student.netid + "</td><td></td></tr>" +
                    "<tr><td class='titleColumn'>History Link:</td><td><a target='_newtab' href='" + submission.student.history_link + "'>"
                    + submission.student.history_link + "</a></td><td></td></tr>" +
                    "<tr><td class='titleColumn'>Program:</td><td>" + studentProgram + "</td><td></td></tr>" +
                    "<tr><td class='titleColumn'>Status:</td><td>" + studentStatus + "</td><td></td></tr>" +
                    "</table>"
            );
        }
    }

    // Position the node popup
    var nodePopup = $("#nodePopup");
    nodePopup.css({
        left:(mouseX + 5) + 'px',
        top:(mouseY - 5) + 'px'
    });
    nodePopup.show();
}


/**
 * Creates a static match popup, locked in place, that only closes manually
 */
function lockMatchPopup(match) {

    // Show match popup, and clone it
    showMatchPopup(match);

    // Create new popup & separate it from old
    var newPopup = $("#edgePopup").clone();
    var newPopupId = 'edgePopupLocked' + popupGlobalCount;
    newPopup.attr({'id' : newPopupId});
    newPopup.css('z-index', 10000);
    newPopup.find('.graphPopupContent').attr({'id' : 'edgePopupContentLocked'});

    // Show the close button & attach behavior
    newPopup.find('.closeButton').text('X');
    newPopup.find('.closeButton').click(function () { $("#" + newPopupId).hide(); });

    newPopup.appendTo('#chart');

    popupGlobalCount++;
}


/**
 * Show the information for a submission in a popup
 *
 * @param match    The match whose data to display
 */
function showMatchPopup(match) {

    hideUnlockedGraphPopups();

    // Create the HTML for the node popup
    $("#edgePopupContent").html(
        "<table border='0' cellspacing='0' cellpadding='0' align='center' >" +
            "<tr><td class='titleColumn'>Score 1:</td><td>" + match.score1 + "</td><td></td borderspacing=0 class='closeButton'>&nbsp;&nbsp;</tr>" +
            "<tr><td class='titleColumn'>Score 2:</td><td>" + match.score2 + "</td><td></td></tr>" +
            "<tr><td class='titleColumn'>Analysis Link:</td><td><a target='_newtab' href='" + match.link + "'>" + match.link + "</a></td><td></td></tr>" +
            "</table>"
    );

    // Position the node popup
    var edgePopup = $("#edgePopup");
    edgePopup.css({
        left:(mouseX + 5) + 'px',
        top:(mouseY - 5) + 'px'
    });
    edgePopup.show();
}