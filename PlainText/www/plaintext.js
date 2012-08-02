//Sample code for Hybrid REST Explorer

function init() {
  forcetkClient.query("SELECT Name, Password__c, URL__c FROM Password__c", function(response){
    console.log(response);
    showRecordList('#home',response.records)
  }, onError); 

  $("#content li").click(function(){
      console.log('click');
      //console.log($(this));
  });
}

function clickedCell(cell){

}

/**
 * Take the returned JSON and show the record list
 **/

function showRecordList(urlObj,recordData) {
    console.log('Show Record List');

    // The pages we use to display our content are already in
    // the DOM. The id of the page we are going to write our
    // content into is specified in the hash before the '?'.
    pageSelector = urlObj;  

    console.log(pageSelector);

    //get the page from the dom
    var $page = $j( pageSelector );

    
    // Get the header for the page.
    $header = $page.children( ":jqmData(role=header)" );
    
    // Get the content area element for the page.
    $content = $page.children( ":jqmData(role=content)" ),

    // The markup we are going to inject into the content
    // area of the page.
    markup = "<p>Records Returned</p><ul data-role='listview' data-inset='true'>";

    //loop records
    for(record in recordData)
    {
        console.log(recordData[record]);
        var recordFields = "";
        for(key in recordData[record]) {
            if(key != 'Name' && key != 'attributes') {
                recordFields += "<b>"+key+":</b> "+recordData[record][key]+"<br/>";
            }
        }
        markup += "<li class='linkedrecord' id='"+recordData[record].Id+"'><h3 class='ui-li-heading'>"+recordData[record].Name+"</h3><p class='ui-li-desc'>"+recordFields+"</p></li>";

    }

    markup += "</ul>";
    // Find the h1 element in our header and inject the name of
    // the category into it.
    $header.find( "h1" ).html( 'Records' );

    // Inject the category items markup into the content element.
    $content.html( markup );


    // Pages are lazily enhanced. We call page() on the page
    // element to make sure it is always enhanced before we
    // attempt to enhance the listview markup we just injected.
    // Subsequent calls to page() are ignored since a page/widget
    // can only be enhanced once.
    $page.page();

    // Enhance the listview we just injected.
    $content.find( ":jqmData(role=listview)" ).listview();

    // We don't want the data-url of the page we just modified
    // to be the url that shows up in the browser's location field,
    // so set the dataUrl option to the URL for the category
    // we just loaded.
    //options.dataUrl = urlObj.href;

    // Now call changePage() and tell it to switch to
    // the page we just modified.
    $j.mobile.changePage( $page );    
}




/**
 * Handle Errors
 **/
function onError(error) {
    console.log("onErrorSfdc: " + JSON.stringify(error));
    alert('Application Error');
}