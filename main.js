// MODULE PATTERN
//object containing strings to build the query
function WikiViewer() {
  var lang =  (navigator.language || navigator.userLanguage).split('-')[0]; //base user language (e.g. 'en' instead of 'en-US')
  const protocol = 'https://';
  const base = '.wikipedia.org/';
  const api = 'w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=15&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch=';
  const cb = '&callback=?';
  const pageQ = '?curid=';
  const randomQ = 'https://en.wikipedia.org/wiki/Special:Random';
  //public methods 
  return {
    getTitles: function (queryStr)  {  
      var url = protocol + lang + base + api + queryStr + cb;
      $.getJSON(url, function(data) {
        //url to be used for external links to wikipedia
        var link = protocol + lang + base + pageQ;
        //trigger display of results passing API data as argument
        $('#results').trigger('queryResults', [data.query.pages, link]); 
      })
    },
    getRandom: function() {
       window.open( randomQ, '_blank');
    }
  };
};

//build single result html element and returns it
function buildResultElement(el) {
  var result = $('<div id="'+el.pageid+'" class="panel panel-default" />');
  var heading = $('<div class="panel-heading" />');
  var rowHead = $('<div class="row" />');
  
  // result heading, title and wiki link
  var title = $('<div class="col-xs-10" />');
  title.html('<h2 class="panel-title" role="button">'+el.title+'<span class="glyphicon glyphicon-chevron-right"></span></h2>');
  rowHead.append(title);
  var link = $('<div class="col-xs-2" />');
  link.html('<a href="' + el.extLink +  el.pageid + '" target="_blank"><img src="https://upload.wikimedia.org/wikipedia/en/archive/2/28/20150803040129%21WikipediaMobileAppLogo.png" title="Entry on Wikipedia" alt="Wikipedia" width="20px" height="20px" class="wiki_logo img img-responsive"></a>');
  rowHead.append(link);
  heading.append(rowHead);
  result.append(heading);
  
  // result body, thumb and description
  var body = $('<div class="panel-body" />');  
  var rowBody = $('<div class="row" />');
  if (el.hasOwnProperty('pageimage')){
    var image = $('<div class="col-xs-2">');
    var imageName = el.pageimage.split('.')[0];
    image.html('<img src="'+ el.thumbnail.source + '" title="'+ imageName +'" alt="'+imageName+'" class="img img-responsive thumb" width="100%">');
    body.append(image);  
    var extract = $('<div class="col-xs-10">');
    extract.html('<p>'+el.extract+'</p>');
    body.append(extract);
  } else {
    var extract = $('<div class="col-xs-12">');
    extract.html('<p>'+el.extract+'</p>');
    body.append(extract);  
  }
  result.append(body);
  return result;
}

// clears #result section of reluts, used when doing subsequent searches
function clearResultElements() {
  $('#results').empty();
}

// adds animation to chevron icons in result eleemnts
function addToggleEvt(id) {
  return function() {
    $('#' + id + ' .panel-title').on('click', function() { 
          $('#' + id + ' .panel-body').slideToggle();
          $('#' + id + ' .glyphicon-chevron-right').toggleClass('expand'); 
        })
    return;
  }
}

// ON DOCUMENT READY
$(document).ready(function(){
  var wiki = new WikiViewer();
  var results = {}; //API search results
  
  //on click, make API call
  $('#search').on('click', function(){
    var query = $('#query').val();
    wiki.getTitles(query);
  })
  
  // iterate results and append html elements to #results section
  $('#results').on('queryResults', function(evt, data, link) {
    var current;
    results = data;
    clearResultElements();
    for(var key in results) {
      if (results.hasOwnProperty(key)) {
        current = results[key];
        current.extLink = link;
        $('#results').append(buildResultElement(current));
        var evt = addToggleEvt(current.pageid); // create closure with current id
        evt(); // add event listener to new result element
      }
    }
  })
  
  // on click, open new tab with random search result
  $('.glyphicon-random').on('click', function(){
    var rand = wiki.getRandom();
  })
})
