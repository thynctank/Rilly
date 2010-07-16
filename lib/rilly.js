// TODO merge other table creation from stage controller into here, pass in callback option to load the first scene, etc

// all functionality which deals with storage of lists and interaction with RIL services

// for reference, an item looks like:
// {
//   item_id: 1234,
//   url: "asdasdasd",
//   title: "asdasdasd",
//   tags: "one, two, three",
//   state: 0,
//   text: "asdasdasd",
//   saved: 0
// }
// 
// text is rich text from service
// saved is a flag indicating an item has been successfully pushed to server
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

	this.store = options.store;
	this.store.createTable("pages", {
  	  item_id: "text", 
  	  url: "text", 
  	  title: "text", 
  	  time_updated: "text",
  	  time_added: "text",
  	  tags: "text", 
  	  state: "text", 
  	  text: "text", 
  	  saved: "text"
	  }, 
	  function(){
  	  this.store.read("pages", {state: "0"}, {order: "time_added"}, function(rows){
  	    if(rows.length)
  	      this.unreadList = rows.clone();
  	    this.store.read("pages", {state: "1"}, {order: "time_added"}, function(rows) {
  	      this.readList = rows.clone();
  	    }.bind(this));
	  }.bind(this));
	}.bind(this));
}

Rilly.prototype = {
  // need to start storing these lists
  authParams: {},
  since: null,
  unreadList: [],
  readList: [],
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
    	since: opts.since || this.since || 0
    });
    Object.extend(params, this.authParams);
    
    new Ajax.Request(this.getURL, {
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
  	if(this.readList.length) {
  		var readObj = {},
  		    params = {};
  		//go through read items and add nested objects to readObj
  		this.readList.each(function(item) {
  			readObj[item.item_id] = {url: item.url};
  		}.bind(this));
  		
  		Object.extend(params, {
				read: Object.toJSON(readObj)
			});
			Object.extend(params, this.authParams);

  		//make service call to update server with items' statuses
  		new Ajax.Request(this.sendURL, {
  			parameters: params,
  			onSuccess: function(response) {
  				this.readingItems = this.readingItems.reject(function(item) {
  					return this.readList.any(function(innerItem) {
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
    Object.extend(params, this.authParams);
    Object.extend(params, opts.params);
    params.apikey = this.apikey;
    delete params.onSuccess;
    delete params.onFailure;
    delete params.onComplete;
    delete params.onCreate;
    delete opts.params;

    new Ajax.Request(opts.url, {
      parameters: params,
			onSuccess: function(response) {
			  if(opts.onSuccess)
			    opts.onSuccess(response);
			},
			onFailure: function(response) {
			  if(opts.onFailure)
			    opts.onFailure(response);
			},
			onComplete: function(response) {
			  if(opts.onComplete)
			    opts.onComplete(response);
			},
			onCreate: function() {
			  if(opts.onCreate)
			    opts.onCreate();
			}
    });
  },
  // verify user signup data is correct, must pass in onSuccess/onFailure at a minimum
  authUser: function(opts) {
    var oldOnSuccess = opts.onSuccess || function(){},
        username = this.authParams.username,
        password = this.authParams.password;
    opts = {params: opts};
    opts.onSuccess = function(response) {
      this.store.write("accountInfo", {username: username, password: password}, function() {
				oldOnSuccess(response);
			}.bind(this));
    }.bind(this);
    //store in Rilly.store if service auths username/password
    opts.url = this.authURL;
    this.request(opts);
  },
  // set up new RIL acct for user, takes username/password (have user enter twice?)
  // must be 1-20 chars for username, 1-20 for password
  // returns 401 if username taken
  signUp: function(opts) {
    opts = {params: opts};
    opts.url = this.signUpURL;
    this.request(opts);
  },
  // fetch text-only page for an item, store it in the object for that item in the db
  getText: function(opts) {
    opts = {params: opts};
    opts.url = this.textURL;
    this.request(opts);
  },
  // cycle through all items that don't have text, call getText for them. Only if user enables in prefs. Run in background, 
  // maybe show a "we have text" icon/shade items differently in list
  lazyGetAllText: function(opts) {
    
  },
  // send items to server
  sendItems: function(opts) {
    var newItems = {},
        readItems = {},
        newCount = 0,
        oldOnSuccess = opts.onSuccess || function(){};
    opts = {params: opts};
    opts.url = this.sendURL;
    this.readList.each(function(item) {
      if(!item.saved) {
        readItems[item.item_id] = {url: item.url};
      }
    }.bind(this));
    this.unreadList.each(function(item) {
      if(!item.saved) {
        newItems[newCount++] = {url: item.url, title: item.title};
      }
    }.bind(this));
    opts.params["new"] = Object.toJSON(newItems);
    opts.params.read = Object.toJSON(readItems);
    this.request(opts);
  },
  // get items from server
  getItems: function(opts) {
    var oldOnSuccess = opts.onSuccess || function(){},
        list,
        oldSince;
    opts.onSuccess = function(response) {
      oldSince = this.since || 0;
  		this.since = response.responseJSON.since;

  		//update lists, save all, callback onSuccess
  		if(!Object.isArray(response.responseJSON.list))
  		  list = $H(response.responseJSON.list).values();
  		else
  		  list = Object.clone(response.responseJSON.list);
  		  
  		list.sort(function(a, b) {
  		  if(a.time_added < b.time_added)
  		    return -1;
  		  if(a.time_added == b.time_added)
  		    return 0;
  		    
  		  return 1;
  		});

			for(var i = 0, j = list.length; i < j; i++) {
			  var page = list[i],
			      listInMemory = (page.state == "0") ? this.unreadList : this.readList;
        // if time_added after oldSince
        if(page.time_added > oldSince) {
          // insert and push onto appropriate list
          this.store.write("pages", page, function() {
            listInMemory.push(Object.clone(page));
            oldOnSuccess();
          }.bind(this), function(err) {
            Mojo.log.error(err);
          });
        }
        else {
          // check for existing record in db
  			  this.store.read("pages", {item_id: page.item_id}, {limit: 1}, function(rows) {
  			    if(rows.length) {
  			      var savedPage = rows[0];
              // if exists and is different, update/reassign in appropriate list
  			      if(page.time_updated > savedPage.time_updated) {
  			        page.id = savedPage.id;
  			        this.store.update("pages", page, {}, function() {
  			          var index = listInMemory.find(function(p) {
  			            return p.item_id == page.item_id;
  			          });
  			          listInMemory[index] = Object.clone(page);
			            oldOnSuccess();
  			        }.bind(this), function(err) {
  			          Mojo.log.error(err);
  			        });
  			      }
  			    }
  			  }.bind(this));
        }
			}

  	}.bind(this);
    opts.url = this.getURL;
    opts.params = {since: this.since || 0};
    this.request(opts);
  },
  // flip item's unread flag, UI should immediately update to indicate change
  toggleItem: function(opts) {
    
  },
  // add item to local list, push to server if available
  addItem: function(opts) {
    var oldOnComplete = opts.onComplete || function(){},
        url = opts.params.url,
        title = opts.params.title || "Page added by Rilly";
    opts.onComplete = function(response) {
      this.unreadList.push({url: url, title: title});
      var saved = (response.status == "200") ? 1 : 0;
      this.store.write("pages", {
        url: url,
        title: title,
        saved: saved,
        state: 0
      }, function() {
        oldOnComplete(response);
      });
    }.bind(this);
    opts.url = this.addURL;
    this.request(opts);
  },
  // replace getList with this, it will call pushItems and update the full read/unread lists from server and store them
  sync: function(opts) {
    this.getItems(opts);
  },
  // remove's user data, nukes all item data from app
  clearData: function(opts) {
    
  }
};