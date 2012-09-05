function Util() {

}

/**
 * Check the connection state
 * return true if we're online
 **/
Util.checkConnection = function() {
  console.log("Util.checkConnection");
  if(FAKE_OFFLINE){
    return false;
  }
  
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
 * load all records from all pages for the specified cursor into the specified array
 **/
Util.LoadAllRecords = function(cursor,records){
  console.log('Util.LoadAllRecords');
  //add the first page of results to records
  var that = this;
  records = Util.AddEntriesFromCursorTo(cursor,records);

  //loop through available pages, populating records
  while(cursor.currentPageIndex < cursor.totalPages - 1) {
    navigator.smartstore.moveCursorToNextPage(cursor, function(){
      records = Util.AddEntriesFromCursorTo(cursor,records);
    });
  }
  return records;
}

/**
 * define handler for paging from SmartStore query
 **/
Util.AddEntriesFromCursorTo = function(cursor,records) {
  console.log('Util.addEntriesFromCursorTo');
  var curPageEntries = cursor.currentPageOrderedEntries;
  $j.each(curPageEntries, function(i,entry) {
    records.push(entry);
  });
  return records;
}