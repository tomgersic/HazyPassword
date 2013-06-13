/**
 * Password.js
 * Manages the handling of Password records, both in Salesforce, and in Smartstore.
 * You’ll notice that the loadRecords method checks to see if the Soup exists 
 * (as shown in the Flow above), and if it does, loads records from it. If it 
 * doesn’t, SFDC is queried instead, and the records are stored in Smartstore 
 * using OfflineQueue.StoreRecords prior populating the listview. This class
 * also includes methods to register the Password Soup to begin with, and upsert
 * records changed by the user in the UI.
 **/

function Password () {

}

/**
 * load records for the app
 **/
Password.prototype.loadRecords = function(error) {
	console.log("Password.prototype.loadRecords");
	var that = this;
    //SFDEMO X -- DECIDE WHETHER TO QUERY SFDC OR SMARTSTORE
	//check if we have local records -- if we do, just load those
	navigator.smartstore.soupExists('Password__c',function(param){
		if(param){
			that.loadRecordsFromSmartstore(error);
		}
		else {
			that.loadRecordsFromSalesforce(false,error);
		}
	},error);
}

/**
 * load records from salesforce
 **/
Password.prototype.loadRecordsFromSalesforce = function(soupExists,error) {
	console.log("Password.prototype.loadRecordsFromSalesforce");
	var that = this;
	//check if we're online
	if(Util.checkConnection()){
		console.log('We are online...');
		console.log('Upload any queued records from offline first');
        //SFDEMO 14 -- PUSH QUEUE TO SFDC
		OfflineQueue.UploadQueue(function(){
			console.log('We are online... querying SFDC');
            //SFDEMO 4 -- QUERY FROM SALESFORCE USING FORCETK
			forcetkClient.query("SELECT Id, Name, Username__c, Password__c, URL__c FROM Password__c", function(response){
                that.registerPasswordSoup(function(){
					OfflineQueue.StoreRecords(response.records,error);
				},error);
				that.populateListview(response.records);
			}, error); 
		},onError);
	}
	else {
		console.log('We are not online... querying SmartStore');
		if(soupExists) {
	  		that.loadRecordsFromSmartstore();
		}
		else {
	  		alert('ERROR: Not online and no local records exist');
		}
	}
}

/**
 * Load records from Smartstore
 **/
Password.prototype.loadRecordsFromSmartstore = function(error){
	console.log("Password.prototype.loadRecordsFromSmartstore");
	var that=this;
    //SFDEMO 2 QUERY SMARTSTORE
    var querySpec = navigator.smartstore.buildAllQuerySpec("Id", null, 2000);
        
    navigator.smartstore.querySoup('Password__c',querySpec,
                                  function(cursor) { that.onSuccessQuerySoup(cursor); },
                                  error);
}

/**
 * Load record with Id from Smartstore
 **/
Password.prototype.loadRecordWithIdFromSmartstore = function(Id,callback,error){
  	console.log("Password.prototype.loadRecordWithIdFromSmartstore");
	var that = this;
	var querySpec = navigator.smartstore.buildExactQuerySpec("Id", Id, 2000);
    navigator.smartstore.querySoup('Password__c',querySpec,
                                  function(cursor) { 
                                      var records = [];
                                      records = Util.LoadAllRecords(cursor,records);
                                      callback(records);
                                  },
                                  error);
}

/**
 * Update an entry changed by the user
 **/
Password.prototype.updateRecord = function(fieldData,error) {
	console.log('Password.prototype.updateRecord');
	var that=this;
    //SFDEMO 10 -- UPDATE SMARTSTORE RECORD
	that.loadRecordWithIdFromSmartstore(fieldData.id,function(records){
		console.log('Smartstore record loaded');
		//upate username/password
		records[0].Username__c = fieldData.username;
		records[0].Password__c = fieldData.password;
		records[0].URL__c = fieldData.url;
		records[0].Name = fieldData.name;
        //GOTO DEMO 18
		OfflineQueue.StoreRecords(records,error);
		that.loadRecords(error);
	},error);

    //SFDEMO 13 -- SAVE TO SALESFORCE IF ONLINE
	if(Util.checkConnection()) {
		forcetkClient.update('Password__c',fieldData.id,{"Username__c":fieldData.username,"Password__c":fieldData.password,"URL__c":fieldData.url,"Name":fieldData.name},function(){
			console.log('SFDC Update Success!');
		},error);
	}
}

/**
 * Register the Password__c soup if it doesn't already exist
 **/
Password.prototype.registerPasswordSoup = function(callback,error){
	console.log('Password.prototype.registerPasswordSoup');
	//check if the Password__c soup exists
	navigator.smartstore.soupExists('Password__c',function(param){
		if(!param){
            //SFDEMO 1 -- REGISTER THE SOUP
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
 * Take an array of records, and populate the list view
 **/
Password.prototype.populateListview = function(records){
	console.log('Password.prototype.populateListview');
	
    //SFDEMO 7 -- POPULATE THE LIST VIEW WITH PASSWORD RECORDS
    var passwordList = $( "#home" ).find( ".passwordList" );
	passwordList.empty();
	$( "#passwordItem" ).tmpl( records ).appendTo( passwordList );
	passwordList.listview( "refresh" );    
}


/**
 * Soup Successfully Queried
 **/
Password.prototype.onSuccessQuerySoup = function(cursor) {
	console.log('Password.prototype.onSuccessQuerySoup');
	var that = this;
	var records = [];

    //Load Records
	records = Util.LoadAllRecords(cursor,records);

	//close the query cursor
	navigator.smartstore.closeCursor(cursor);

    //CALL POPULATELISTVIEW -- SAME METHOD TO POPULATE
	that.populateListview(records);    
}