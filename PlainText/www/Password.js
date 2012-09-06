function Password () {

}

/**
 * load records for the app
 **/
Password.prototype.loadRecords = function(error) {
	console.log("Password.prototype.loadRecords");
	var that = this;
    //DF12 DEMO 6 -- DECIDE WHETHER TO QUERY SFDC OR SMARTSTORE
	//check if we have local records -- if we do, just load those
	navigator.smartstore.soupExists('Password__c',function(param){
		if(param){
            //GOTO DF12 11
			that.loadRecordsFromSmartstore(error);
		}
		else {
            //GOTO DF12 7                        
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
        //DF12 DEMO 21 -- PUSH QUEUE TO SFDC
		OfflineQueue.UploadQueue(function(){
			console.log('We are online... querying SFDC');
            //DF12 DEMO 7 -- QUERY FROM SALESFORCE USING FORCETK
			forcetkClient.query("SELECT Id, Name, Username__c, Password__c, URL__c FROM Password__c", function(response){  
                //GOTO DF12 8
                that.registerPasswordSoup(function(){
                    //GOTO DF12 9
					OfflineQueue.StoreRecords(response.records,error);
				},error);
                //GOTO DF12 10
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
    //DF12 DEMO 11 QUERY SMARTSTORE
    //GOTO DF12 12
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
    //DF12 DEMO 17 -- UPDATE SMARTSTORE RECORD
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

    //DF12 DEMO 20 -- SAVE TO SALESFORCE IF ONLINE
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
            //DF12 DEMO 8 -- REGISTER THE SOUP
            //GOTO DF12 7
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
	
    //DF12 DEMO 10 -- POPULATE THE LIST VIEW WITH PASSWORD RECORDS
    //GOTO DF12 6
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

    //DF12 DEMO 12 -- LOAD RECORDS
	records = Util.LoadAllRecords(cursor,records);

	//close the query cursor
	navigator.smartstore.closeCursor(cursor);

    //DF12 DEMO 13 -- CALL POPULATELISTVIEW -- SAME METHOD TO POPULATE
	that.populateListview(records);    
}