/**
 * OfflineQueue.js
 * This class handles the queue functions that are written to any time a record is saved using 
 * OfflineQueue.StoreRecords. The OfflineQueue.UploadQueue method takes care of emptying the
 * queue and upserting the records to SFDC. Delete methods are left as an exercise for the reader.
 **/

function OfflineQueue() {

}

/**
 * Queue for later upload
 **/
OfflineQueue.QueueRecords = function(records,error){
    //SFDEMO 5 -- QUEUE THE RECORDS
	console.log('OfflineQueue.QueueRecords');	
	OfflineQueue.RegisterQueueSoup(function(){
		navigator.smartstore.upsertSoupEntriesWithExternalId('Queue',records, 'Id', function(){
			console.log("Queue Upsert Success");        
		}, error);		
	},error);
}

/**
 * Upload Queue to Salesforce
 **/
OfflineQueue.UploadQueue = function(callback,error) {
	console.log("OfflineQueue.UploadQueue");
	if(Util.checkConnection()) {
      	console.log("OfflineQueue.UploadQueue -- app is online");
        //SFDEMO 6 -- UPLOAD QUEUE TO SFDC (EMPTY IT)
		navigator.smartstore.soupExists('Queue',function(param){
			if(param)
			{
                console.log("OfflineQueue.UploadQueue -- Queue exists");
				OfflineQueue.LoadRecordsFromQueue(function(records) {
					if(records.length==0){
                       	console.log("OfflineQueue.UploadQueue -- no records in queue");
						callback();
					}
					else {				
                        console.log("OfflineQueue.UploadQueue -- iterating records");
						for(i in records){
							forcetkClient.update('Password__c',records[i].Id,{"Username__c":records[i].Username__c,"Password__c":records[i].Password__c,"Name":records[i].Name,"URL__c":records[i].URL__c},function(){
								console.log('QUEUED SFDC Update Success!');
                                //SFDEMO 4 -- ON SUCCESS, REMOVE RECORD FROM QUEUE
								navigator.smartstore.removeFromSoup('Queue',[records[i]._soupEntryId],function(){
									console.log('Removed from Soup');
									if(i == records.length-1) {
										callback();
									}
								},error);
							},error);				
						}
					}
				},error);
			}
			else {
				console.log("Offline queue doesn't exist yet... must not be any records there...")
				callback();
			}
		},error);


	}
	else {
		console.log("We're offline, can't upload queue... ")
		callback();
	}

}

/**
 * Load records from Queue
 **/
OfflineQueue.LoadRecordsFromQueue = function(callback,error){
	console.log("OfflineQueue.loadRecordsFromQueue");
	var that=this;
    var querySpec = navigator.smartstore.buildAllQuerySpec("Id", null, 2000);
        
    navigator.smartstore.querySoup('Queue',querySpec, function(cursor) { 
		var records = [];
		records = Util.LoadAllRecords(cursor,records);
		//close the query cursor
		navigator.smartstore.closeCursor(cursor);
		callback(records);
    },error);
}

/**
 * Store Records
 **/
OfflineQueue.StoreRecords = function(records,error){
	console.log('OfflineQueue.storeRecords');
    //SFDEMO 3 -- SMARTSTORE UPSERT
	navigator.smartstore.upsertSoupEntriesWithExternalId('Password__c',records, 'Id', function(){
		console.log("Soup Upsert Success");        
	}, error);

    //Queue the records
	OfflineQueue.QueueRecords(records,error);
	
    //Try to empty the queue (UploadQueue will worry about connectivity)
    OfflineQueue.UploadQueue(function(param){
                                console.log("upload queue returned");
                             },function(param){
                                console.log("upload error...");
                             });
}

/**
 * Register the Queue soup if it doesn't already exist
 **/
OfflineQueue.RegisterQueueSoup = function(callback,error){
	console.log('OfflineQueue.registerQueueSoup');
	//check if the Password__c soup exists
	navigator.smartstore.soupExists('Queue',function(param){
		if(!param){
			//Password__c soup doesn't exist, so let's register it
			var indexSpec=[{"path":"Id","type":"string"}];
			navigator.smartstore.registerSoup('Queue',indexSpec,function(param){
				console.log('Soup Created: '+param);
				callback();
			},error);
		}
		else {
			callback();
		}
	},error);
}
