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
  var data;

  switch(id) { 

    // nudity
    case '1':
      data = search_for("boobies|penis|boobs|dick|vagina|twat|tit|porn|nude|naked|pussy|boner");
      break;

    // profanity
    case '2':
      data = search_for("fuck|ass|shit|bitch");
      break;

    // xenophobia
    case '3':
      data = search_for("fags|niggers|chink|beaner|gay|homo|xenophobia");
      break;

    // misogyny
    case '4':
      data = search_for("bitch|cunt|ho|slut|skank|misogyny");
      break;

    // nsfw & nsfwl
    case '5':
      data = search_for("nsfw | nsfl");
      break;
  }

  console.log(data);
}
