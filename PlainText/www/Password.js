function Password () {

}

/**
 * load records for the app
 **/
Password.prototype.loadRecords = function(error) {
	console.log("Password.prototype.loadRecords");
	var that = this;
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
		console.log('We are online... querying SFDC');
		forcetkClient.query("SELECT Id, Name, Username__c, Password__c, URL__c FROM Password__c", function(response){  
			that.registerPasswordSoup(function(){
				OfflineQueue.StoreRecords(response.records,error);
			},error);
			that.populateListview(response.records);
		}, error); 
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
    var querySpec = navigator.smartstore.buildExactQuerySpec("Id", Id, 2000);
    navigator.smartstore.querySoup('Password__c',querySpec,
                                  function(cursor) { 
                                      var records = [];
                                      records = loadAllRecords(cursor,records);
                                      callback(records);
                                  },
                                  error);
}

/**
 * Update an entry changed by the user
 **/
Password.prototype.updateRecord = function(Id,username,password,error) {
	console.log('Password.prototype.updateRecord');
	var that=this;
	forcetkClient.update('Password__c',Id,{"Username__c":username,"Password__c":password},function(){
		console.log('SFDC Update Success!');
		that.loadRecordWithIdFromSmartstore(Id,function(records){
			console.log('Smartstore record loaded');
			//upate username/password
			records[0].Username__c = username;
			records[0].Password__c = password;
			OfflineQueue.storeRecords(records,error);
			that.loadRecords(error);
		},error);
	},error);
}

/**
 * Register the Password__c soup if it doesn't already exist
 **/
Password.prototype.registerPasswordSoup = function(callback,error){
	console.log('Password.prototype.registerPasswordSoup');
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
 * Take an array of records, and populate the list view
 **/
Password.prototype.populateListview = function(records){
	console.log('Password.prototype.populateListview');
	var passwordList = $( "#home" ).find( ".passwordList" );
	passwordList.empty();
	$( "#passwordItem" ).tmpl( records ).appendTo( passwordList );
	passwordList.listview( "refresh" );    
}

/**
 * define handler for paging from SmartStore query
 **/
Password.prototype.addEntriesFromCursorTo = function(cursor,records) {
	console.log('Password.prototype.addEntriesFromCursorTo');
	var curPageEntries = cursor.currentPageOrderedEntries;
	$j.each(curPageEntries, function(i,entry) {
		records.push(entry);
	});
	return records;
}

/**
 * load all records from all pages for the specified cursor into the specified array
 **/
Password.prototype.loadAllRecords = function(cursor,records){
	console.log('Password.prototype.loadAllRecords');
	//add the first page of results to records
	var that = this;
	records = that.addEntriesFromCursorTo(cursor,records);

	//loop through available pages, populating records
	while(cursor.currentPageIndex < cursor.totalPages - 1) {
		navigator.smartstore.moveCursorToNextPage(cursor, function(){
			records = that.addEntriesFromCursorTo(cursor,records);
		});
	}
	return records;
}

/**
 * Soup Successfully Queried
 **/
Password.prototype.onSuccessQuerySoup = function(cursor) {
	console.log('Password.prototype.onSuccessQuerySoup');
	var that = this;
	var records = [];

	records = that.loadAllRecords(cursor,records);

	//close the query cursor
	navigator.smartstore.closeCursor(cursor);

	that.populateListview(records);    
}