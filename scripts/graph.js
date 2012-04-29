// The actual match & submission data
var matches;
var submissions;

/**
 * Initially load the graph
 *
 * @param matchesParam       The match data from CoMoTo
 * @param submissionsParam   The submission data from CoMoTo
 */
function loadGraph(matchesParam, submissionsParam) {

    // Build the spec;ific data structures for the graph & render it
    matches = matchesParam;
    submissions = submissionsParam;
    updateGraph();
}


/**
 * Re-render the graph using the current match & submission data
 */
function updateGraph() {

    // Clear existing graph
    $("#chart svg").remove();

    // Render graph
    var data = buildGraphData();
    renderGraph(data);

    // Disable 'update graph' button
    $('#updateGraphButton').attr('disabled', true);
}


/**
 * Build the graph data structures from the input submission and match data from the API, using the configuration options
 */
function buildGraphData() {

    // Create the restructured matches & submissions to dump to JSON
    var matchEdges = [];
    var submissionNodes = [];

    // Maps submission ids to indices in the list
    var submissionNodesIndexIndex = {};


    // Insert the matches into 'submissionNodes' indexed by submission_id
    var currentIndex = 0;
    for (var submissionIndex in submissions) {

        var submission = submissions[submissionIndex];

        // Check if this submission satisfies all predicates
        if (submissionSatisfiesPredicates(submission)) {

            var groupId = submission['type'] == 'solutionsubmission' ? -1 : submission['offering_id'];

            // Create the new node
            var newSubmissionNode = {

                // Group the nodes for coloring by offering
                group: groupId,

                // Store the index of this node in the list
                index: currentIndex,

                // Auxiliary stored data for this submission
                id: submission['id'],
                offering_id: submission['offering_id'],
                analysis_pseudonym_ids: submission['analysis_pseudonym_ids'],
                submission_file_ids: submission['submission_file_ids'],
                partner_ids: submission['partner_ids'],
                type: submission['type'],
                student: submission['student'],

                // The indices of all adjacent edges
                edges: []
            };

            // Insert this new node into both a list & index
            submissionNodesIndexIndex[newSubmissionNode['id']] = currentIndex;
            submissionNodes.push(newSubmissionNode);
            currentIndex += 1;
        }
    }

    // Keep a set of all submission ids that appear as endpoints of edges (for toggling singletons)
    var matchedSubmissionIds = {};

    // Insert the matches into 'matchEdges'
    currentIndex = 0;
    for (var matchIndex in matches) {

        // Check if this match satisfies all predicates
        var match = matches[matchIndex];
        if (matchSatisfiesPredicates(match, submissionNodesIndexIndex)) {

            // Get the indices the submission ids
            var submission1Index = submissionNodesIndexIndex[match['submission_1_id']];
            var submission2Index = submissionNodesIndexIndex[match['submission_2_id']];

            matchedSubmissionIds[match['submission_1_id']] = true;
            matchedSubmissionIds[match['submission_2_id']] = true;

            // Add this edge to adjacencies of submissions
            submissionNodes[submission1Index].edges.push(currentIndex);
            submissionNodes[submission2Index].edges.push(currentIndex);

            // Add the edges
            matchEdges.push({

                // Submission ids (of graph node endpoints)
                source: submission1Index,
                target: submission2Index,
                value: (match['score1'] + match['score1']) / (2 * 10), // Use average for weight

                // Auxiliary data for this match
                id: match['id'],
                link: match['link'],
                moss_analysis_id: match['moss_analysis_id'],
                score1: match['score1'],
                score2: match['score2']
            });
            currentIndex++;
        }
    }

    if(!graphControls.includeSingletons) {
        var returnData = removeSingletons(submissionNodesIndexIndex, submissionNodes, matchedSubmissionIds, matchEdges);
        submissionNodesIndexIndex = returnData.submissionNodesIndexIndex;
        submissionNodes = returnData.submissionNodes;
    }


    // Resize content
    $("#content").height($("#wrapper").height() - 10);
    $("#content").width(0.65 * $("#wrapper").width());

    return {
        nodes:submissionNodes,
        links:matchEdges
    };
}


/**
 * Helper function to remove all singletons in the graph
 */
function removeSingletons(submissionNodesIndexIndex, submissionNodes, matchedSubmissionIds, matchEdges) {

    var usedSubmissionNodes = [];
    submissionNodesIndexIndex = {};
    var newIndex = 0; // The new index for the submission
    var oldIndex = 0; // The old index for the submission

    for (var nodeIndex in submissionNodes) {

        var submission = submissionNodes[nodeIndex];

        // Insert this new node into both a list & index if this node is used
        if (matchedSubmissionIds[submission.id]) {

            // Update the pointers to this node its adjacent edges
            for (var edgeIndexIndex in submission.edges) {

                var edgeIndex = submission.edges[edgeIndexIndex];
                var edge = matchEdges[edgeIndex];

                if (edge.source == oldIndex) {
                    edge.source = newIndex;
                }
                if (edge.target == oldIndex) {
                    edge.target = newIndex;
                }
            }

            // Update the submission data structures
            submissionNodesIndexIndex[submission.id] = newIndex;
            usedSubmissionNodes.push(submission);
            newIndex += 1;
        }
        oldIndex += 1;
    }
    submissionNodes = usedSubmissionNodes
    return {submissionNodesIndexIndex:submissionNodesIndexIndex, submissionNodes:submissionNodes};
}


/**
 * Function to determine whether or not a submission adheres to the predicates defined by the graph controls.
 *  @param  submission              The submission in question
 *  @return Whether or not all predicates are satisfied
 */
function submissionSatisfiesPredicates(submission) {

    var isSolution = submission['type'] == 'solutionsubmission';

    if (isSolution) {
        return graphControls.includeSolution;
    } else {
        return graphControls.includePastSemesters || submission['offering_id'] == currentOfferingId;
    }
}


/**
 * Function to determine whether or not a match adheres to the predicates defined by the graph controls
 * @param match The match in question
 */
function matchSatisfiesPredicates(match, submissionNodesIndexIndex) {

    // Check if this match's weight is above the minimum edge weight
    var averageWeight = (match['score1'] + match['score1']) / 2; // Use average weight
    var minimumEdgeWeightPredicate = graphControls.minimumEdgeWeight <= averageWeight;

    // Check that the endpoints of this edge are being rendered (ignore if 'submissionNodesIndexIndex' is undefined)
    var endpointsIncluded = true;
    if (submissionNodesIndexIndex) {
        endpointsIncluded = (submissionNodesIndexIndex[match['submission_1_id']] && submissionNodesIndexIndex[match['submission_2_id']]);
    }

    return minimumEdgeWeightPredicate && endpointsIncluded;
}