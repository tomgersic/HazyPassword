//Sample code for Hybrid REST Explorer

function init() {
  forcetkClient.query("SELECT Id, Name, Username__c, Password__c, URL__c FROM Password__c", function(response){
    console.log(response);
    //showRecordList('#home',response.records)
    var passwordList = $( "#home" ).find( ".passwordList" );
    passwordList.empty();
    $( "#passwordItem" ).tmpl( response.records ).appendTo( passwordList );
    passwordList.listview( "refresh" );        
  }, onError); 

  $(document).bind("pagebeforechange",function(event,data) {
    if (typeof data.toPage === "string") {
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
                var header = page.children(":jqmData(role=header)");
                header.html("<h1>"+name+"</h1>");
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
 * Handle Errors
 **/
function onError(error) {
    console.log("onErrorSfdc: " + JSON.stringify(error));
    alert('Application Error');
}