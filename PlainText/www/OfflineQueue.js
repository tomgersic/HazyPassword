function OfflineQueue() {

}

/**
 * Store Records
 **/
OfflineQueue.StoreRecords = function(records,error){
	console.log('OfflineQueue.prototype.storeRecords');
	navigator.smartstore.upsertSoupEntriesWithExternalId('Password__c',records, 'Id', function(){
		console.log("Soup Upsert Success");        
	}, error);
}