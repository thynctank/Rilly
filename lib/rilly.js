// all functionality which deals with storage of lists and interaction with RIL services

// for reference, an item looks like:
// {
//   item_id: 1234,
//   url: "asdasdasd",
//   title: "asdasdasd",
//   tags: "one, two, three",
//   state: 0,
//   text: "asdasdasd",
//   unsaved: 0
// }
// 
// text is rich text from service
// unsaved is a flag indicating an item has not been successfully pushed to server
// state is a flag indicating the item should be placed into the unread list uf 0, read if 1 (all new items should be unread/unsaved)


function Rilly(options) {
  var baseURL = "https://readitlaterlist.com/v2/";
	this.apikey = options.apikey;
	this.authURL = baseURL + "auth";
	this.signUpURL = baseURL + "signup";
	this.getURL = baseURL + "get";
	this.sendURL = baseURL + "send";
	this.addURL = baseURL + "add";
	this.textURL = "https://text.readitlaterlist.com/v2/text";

	this.unreadList = [];
	this.readList = [];

	this.store = options.store;
	this.store.createTable("pages", {
  	  item_id: "integer", 
  	  url: "text", 
  	  title: "text", 
  	  tags: "text", 
  	  state: "integer", 
  	  text: "text", 
  	  unsaved: "integer"
	  }, 
	  function(){
  	  this.store.read("pages", {state: 0}, null, function(rows){
  	    if(rows.length)
  	      this.unreadList = rows.clone();
	  }.bind(this));
	}.bind(this));
}

Rilly.prototype = {
  // need to start storing these lists
  getList: function(opts) {
    if(!opts)
      opts = {};
      
    if(!(opts.onComplete))
      opts.onComplete = function() {};
    
    if(!(opts.onCreate))
      opts.onCreate = function() {};
      
    var params = {};
    Object.extend(params, {
    	state: opts.list || "unread",
    	since: opts.since || this.since || null
    });
    Object.extend(params, ril.authParams);
    
    new Ajax.Request(ril.getURL, {
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
  		var readObj = {},
  		    params = {};
  		//go through read items and add nested objects to readObj
  		this.readItems.each(function(item) {
  			readObj[item.item_id] = {url: item.url};
  		}.bind(this));
  		
  		Object.extend(params, {
				read: Object.toJSON(readObj)
			});
			Object.extend(params, ril.authParams);

  		//make service call to update server with items' statuses
  		new Ajax.Request(this.sendURL, {
  			parameters: params,
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
  
  request: function(opts) {
    if(!opts.url)
      throw "URL is a required option";
    
    var params = {};
    Object.extend(params, ril.authParams);
    Object.extend(params, opts);
    params.apikey = this.apikey;
    delete params.onSuccess;
    delete params.onFailure;

    new Ajax.Request(opts.url, {
      parameters: params,
			onSuccess: function(response) {
			  if(opts.onSuccess)
			    opts.onSuccess(response);
			},
			onFailure: function(response) {
			  if(opts.onFailure)
			    opts.onFailure(response);
			}
    });
  },
  // verify user signup data is correct
  authUser: function(opts) {
    //store in Rilly.store if service auths username/password
    opts.url = this.authURL;
    this.request(opts);
  },
  // set up new RIL acct for user
  signUp: function(opts) {
    opts.url = this.signUpURL;
    this.request(opts);
  },
  // fetch text-only page for an item, store it in the object for that item in the db
  getText: function(opts) {
    opts.url = this.textURL;
    this.request(opts);
  },
  // cycle through all items that don't have text, call getText for them. Only if user enables in prefs. Run in background, 
  // maybe show a "we have text" icon/shade items differently in list
  lazyGetAllText: function(opts) {
    
  },
  // send items to server
  sendItems: function(opts) {
    opts.url = this.sendURL;
    this.request(opts);
  },
  // get items from server
  getItems: function(opts) {
    opts.url = this.getURL;
    this.request(opts);
  },
  // flip item's unread flag, UI should immediately update to indicate change
  toggleItem: function(opts) {
    
  },
  // add item to local list, push to server if available
  addItem: function(opts) {
    
  },
  // replace getList with this, it will call pushItems and update the full read/unread lists from server and store them
  sync: function(opts) {
    
  },
  // remove's user data, nukes all item data from app
  clearData: function(opts) {
    
  }
};