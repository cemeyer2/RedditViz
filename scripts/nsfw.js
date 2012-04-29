function search_for(var querystring) {
  var SEARCH_URL = "/search";

  $.ajax({
    url: SEARCH_URL,
    data: {
      query:querystring,
      limit:"10"
    },

    error: function(errorData) {
      alert("error");
      console.log(errorData);
    },

    success: function(data) { 
      alert("success");
      console.log(data);
    }
  });
}
