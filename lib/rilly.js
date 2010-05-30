// TODO store should hold all data and be a Lawnchair-based store, be visible globally in memory
// TODO make this file platform-agnostic
// TODO make Rilly a constructor, allow's different storage adaptors on diff platforms, etc (need to update references to refer to an instance)

var baseURL = "https://readitlaterlist.com/v2/";

Rilly = {
	apikey: "651gbd43p9cqKne02cT90G0I82A5pdrq",
	authURL: baseURL + "auth",
	getURL: baseURL + "get",
	sendURL: baseURL + "send",
	
	readingList: [],
	readList: [],
	
	store: new Storage("rilly"),
	appMenuModel: {
  	items: [
  		{label: "Help", command: "help"}
  	]
  },
  // need to start storing these lists
  getList: function(opts) {
    if(!opts)
      opts = {};
      
    if(!(opts.onComplete))
      opts.onComplete = function() {};
    
    if(!(opts.onCreate))
      opts.onCreate = function() {};
      
    var params = Object.extend(Rilly.authParams, {
    	state: opts.list || "unread",
    	since: opts.since || this.since || null
    });
    
    new Ajax.Request(Rilly.getURL, {
    	parameters: params,
    	onCreate: opts.onCreate.bind(this),
    	onSuccess: function(response) {
    		//store current time
    		this.since = response.responseJSON.since;
    		//populate list and update widget
    		if(!Object.isArray(response.responseJSON.list)) {
    			var changedItems = $H(response.responseJSON.list).map(function(item) {
    				return item.value;
    			}).sortBy(function(item) {
    				return item.time_added;
    			}).reverse();

    			//add to beginning of array
    			this.readingItems = changedItems.concat(opts.listToReplace);

    			//handle any read items, remove from readingItems and add to readItems
    			
    			if(opts.onSuccess)
    			  opts.onSuccess(this.readingItems);
    		}
    	}.bind(this),
    	onFailure: function(response) {
    		Mojo.Controller.errorDialog("There was a problem fetching your list from the server");
    	},
      onComplete: opts.onComplete.bind(this)
    });
  },
  markRead: function(callback) {
  	//remove readItems from this.readingItems
  	if(this.readItems.length) {
  		var readObj = {};
  		//go through read items and add nested objects to readObj
  		this.readItems.each(function(item) {
  			readObj[item.item_id] = {url: item.url};
  		}.bind(this));

  		//make service call to update server with items' statuses
  		new Ajax.Request(Rilly.sendURL, {
  			parameters: Object.extend(Rilly.authParams, {
  				read: Object.toJSON(readObj)
  			}),
  			onSuccess: function(response) {
  				this.readingItems = this.readingItems.reject(function(item) {
  					return this.readItems.any(function(innerItem) {
  						return (innerItem.item_id === item.item_id);
  					});
  				}.bind(this));
  				this.readItems = [];

  				this.$.readingList.model.items = this.readingItems.clone();
  				this.controller.modelChanged(this.$.readingList.model);
  				this.updateHeader();

  				//clear any filter
  				this.$.filter.node.mojo.close();

  				if(callback)
  					callback();
  			}.bind(this),
  			onFailure: function(response) {
  				Mojo.Controller.errorDialog("There was a problem updating the read status on the server");
  			}
  		});
  	}
  	else {
  		//clear any filter
  		this.$.filter.node.mojo.close();
  		if(callback)
  			callback();
  	}
  },

  // TODO fill in stubs below
  
  // add item to local list, push to server if available
  addItem: function(opts) {

  },
  // push items to server
  pushItems: function(opts) {
    
  },
  // set up new RIL acct for user
  signUp: function(opts) {
    
  },
  // fetch text-only page for an item, store it in the object for that item in the db
  getText: function(opts) {
    
  },
  // cycle through all items that don't have text, call getText for them. Only if user enables in prefs. Run in background, 
  // maybe show a "we have text" icon/shade items differently in list
  lazyGetAllText: function(opts) {
    
  },
  // flip item's unread flag, UI should immediately update to indicate change
  toggleItem: function(opts) {
    
  },
  // replace getList with this, it will call pushItems and update the full read/unread lists from server and store them
  sync: function(opts) {
    
  },
  // remove's user data, nukes all item data from app
  clearData: function(opts) {
    
  }
};