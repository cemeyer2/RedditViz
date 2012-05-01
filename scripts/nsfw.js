function search_for(querystring) {
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
      return errorData;
    },

    success: function(data) { 
      alert("success");
      console.log(data);
      return data;
    }
  });
}

function loadMid(id) {
  var querystring = "";

  switch(id) { 

    // nudity
    case '1':
      // querystring = "boobies|penis|boobs|dick|vagina|twat|tit|porn|nude|naked|pussy|boner";
      querystring = "pussy";
      break;

    // profanity
    case '2':
      querystring = "fuck|ass|shit|bitch";
      break;

    // xenophobia
    case '3':
      querystring = "fag|nigger|chink|beaner|gay|homo|xenophobia|terrorist|jap";
      break;

    // misogyny
    case '4':
      querystring = "bitch\|cunt\|ho\|slut\|skank\|misogyny";
      break;

    // nsfw & nsfwl
    case '5':
      querystring = "nsfw | nsfl";
      break;
  }

  var SEARCH_URL = "/search";

  $.ajax({
    url: SEARCH_URL,
    data: {
      query:querystring,
      // limit:"10"
    },
    async: false,

    error: function(errorData) {
      alert("error");
      console.log(errorData);
      return errorData;
    },

    success: function(data) { 
      alert("success");
      console.log(data);
      return data;
    }
  });
}
