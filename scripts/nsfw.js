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

  var presentation;
  if(presentation) { 
    switch(id) { 
      // nudity
      case '1':
        console.log(nudity_boobies);
        console.log(nudity_dick);
        console.log(nudity_pussy);
        break;

      // profanity
      case '2':
        console.log(profanity_fuck);
        console.log(profanity_shit);
        console.log(profanity_ass);
        break;

      // xenophobia
      case '3':
        console.log(xeno_faggot);
        console.log(xeno_nigger);
        break;

      // misogyny
      case '4':
        console.log(misogyny_cunt);
        console.log(misogyny_slut);
        console.log(misogyny_bitch);
        break;

      // nsfw & nsfl
      case '5':
        console.log(nsf_nsfw);
        console.log(nsf_nsfl);
        break;
    }
  }
  else { 
    switch(id) { 

      // nudity
      case '1':
        querystring = "boobies|penis|boobs|dick|vagina|twat|tit|porn|nude|naked|pussy|boner";
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
}
