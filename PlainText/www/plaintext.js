//Sample code for Hybrid REST Explorer
var FAKE_OFFLINE = false;
var fieldsChanged = false;

function init() {
  loadRecords(onError);

  $j('#btnRefresh').click(function() {
    console.log("Refreshing...");
    fieldsChanged=false;
    loadRecordsFromSalesforce();
  });
    
  //Do stuff when the page changes
  $(document).bind("pagebeforechange",function(event,data) {
    if (typeof data.toPage === "string") {
        if(fieldsChanged) {
          console.log('Fields Changed... Saving');
        }
        fieldsChanged=false;

        var url = $.mobile.path.parseUrl(data.toPage);
        var editurl = /^#edit/;
        if (url.hash.search(editurl) !== -1) {
            //url scheme is a bit mucked up, so get rid of the initial "edit?" after the hash so we can parse it like a normal url
            var paramstring = url.hash.replace(/^#edit\?/,"#");
            //get the id, username, and password from the query string
            var id = $.url(paramstring).fparam('Id');
            var username = $.url(paramstring).fparam('Username__c');
            var password = $.url(paramstring).fparam('Password__c');
            var name = $.url(paramstring).fparam('Name');
            var siteUrl = $.url(paramstring).fparam('URL__c');

            var pageSelector = url.hash.replace(/\?.*$/, "");
            if(id) {
                //select the page
                var page = $(pageSelector);
                //put the site name in the header
                var header = page.find('#title');
                header.html(name);
                //select the content element within it
                var content = page.children(":jqmData(role=content)");
                //add the URL
                var urlField = content.find('#siteUrl');
                urlField.html("<a href='"+siteUrl+"' target='_blank'>"+siteUrl+"</a>");

                //fill out the fields
                var idField = content.find('#id');
                idField.val(id);
                var usernameField = content.find('#username');
                usernameField.val(username);
                var passwordField = content.find('#password');
                passwordField.val(password);

                //monitor for changes to fields
                usernameField.change(function(){
                    console.log('username changed');
                    fieldsChanged=true;
                });

                passwordField.change(function(){
                    console.log('password changed');
                    fieldsChanged=true;
                });

                //we're intercepting the page change event, so change the page
                $.mobile.changePage(page);

                //stop the default page change actions from occurring
                event.preventDefault();
            }                  
        }
    }
  });
}

/**
 * load records for the app
 **/
function loadRecords(error) {
  //check if we have local records -- if we do, just load those
  navigator.smartstore.soupExists('Password__c',function(param){
    if(param){
      loadRecordsFromSmartstore();
    }
    else {
      loadRecordsFromSalesforce(false);
    }
  },error);
}

function loadRecordsFromSalesforce(soupExists){
  //check if we're online
  if(checkConnection() && !FAKE_OFFLINE){
    console.log('We are online... querying SFDC');
    forcetkClient.query("SELECT Id, Name, Username__c, Password__c, URL__c FROM Password__c", function(response){
    //console.log(response);
      
    registerPasswordSoup(storeRecords(response.records,onError),onError);

    populateListview(response.records);
  }, onError); 

  }
  else {
    console.log('We are not online... querying SmartStore');
    if(soupExists) {
      loadRecordsFromSmartstore();
    }
    else {
      alert('ERROR: Not online and no local records exist');
    }
  }


}

function loadRecordsFromSmartstore(){
    var querySpec = navigator.smartstore.buildAllQuerySpec("Id", null, 2000);
        
    navigator.smartstore.querySoup('Password__c',querySpec,
                                  function(cursor) { onSuccessQuerySoup(cursor); },
                                  onError);
}
/**
 * Register the Password__c soup if it doesn't already exist
 **/
function registerPasswordSoup(callback,error){
    console.log('registering the password soup');
    //check if the Password__c soup exists
    navigator.smartstore.soupExists('Password__c',function(param){
      if(!param){
        //Password__c soup doesn't exist, so let's register it
        var indexSpec=[{"path":"Id","type":"string"},{"path":"Name","type":"string"}];
        navigator.smartstore.registerSoup('Password__c',indexSpec,function(param){
          console.log('Soup Created: '+param);
          callback();
        },error);
      }
      else {
        callback();
      }
    },error);
}

/**
 * Store Records
 **/
function storeRecords(records,error){
  console.log('storing records');
  navigator.smartstore.upsertSoupEntriesWithExternalId('Password__c',records, 'Id', function(){
                                       SFHybridApp.logToConsole("Soup Upsert Success");        
                                       }, error);
}

/**
 * Check the connection state
 * return true if we're online
 **/
function checkConnection() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    if(states[networkState] == states[Connection.NONE] || states[networkState] == states[Connection.UNKNOWN]){
      return false;
    }
    else {
      return true;
    }
}

/**
 * Take an array of records, and populate the list view
 **/
function populateListview(records){
  var passwordList = $( "#home" ).find( ".passwordList" );
  passwordList.empty();
  $( "#passwordItem" ).tmpl( records ).appendTo( passwordList );
  passwordList.listview( "refresh" );    
}

/**
 * Soup Successfully Queried
 **/
function onSuccessQuerySoup(cursor) {
    console.log("onSuccessQuerySoup()");
    var records = [];
    
    //define handler for paging
    function addEntriesFromCursor() {
        var curPageEntries = cursor.currentPageOrderedEntries;
        $j.each(curPageEntries, function(i,entry) {
                records.push(entry);
        });
    }
    
    //add the first page of results to records
    addEntriesFromCursor();
    
    //loop through available pages, populating records
    while(cursor.currentPageIndex < cursor.totalPages - 1) {
        navigator.smartstore.moveCursorToNextPage(cursor, addEntriesFromCursor);
    }
    
    //close the query cursor
    navigator.smartstore.closeCursor(cursor);
    
    populateListview(records);    

    /*SFHybridApp.logToConsole("***RECORDS***");
    SFHybridApp.logToConsole(JSON.stringify(records,null,'<br>'));
    SFHybridApp.logToConsole(records.length);*/
}

/**
 * Handle Errors
 **/
function onError(error) {
    console.log("onErrorSfdc: " + JSON.stringify(error));
    alert('Application Error');
}