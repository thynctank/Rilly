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
  	  this.store.read("pages", {state: "0"}, {order: "time_added DESC"}, function(rows){
  	    if(rows.length)
  	      this.unreadList = rows.clone();
  	    this.store.read("pages", {state: "1"}, {order: "time_added DESC"}, function(rows) {
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
  request: function(opts) {
    if(!opts.url)
      throw "URL is a required option";
    
    var params = {};
    Object.extend(params, this.authParams);
    Object.extend(params, opts.params);
    params.apikey = this.apikey;

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
        readCount = 0,
        oldOnComplete = opts.onComplete || function(){};

    this.readList.each(function(item) {
      if(item.saved != 1) {
        readItems[item.item_id] = {url: item.url};
        readCount++;
      }
    }.bind(this));
    this.unreadList.each(function(item) {
      if(item.saved != 1) {
        newItems[newCount++] = {url: item.url, title: item.title};
      }
    }.bind(this));

    opts.url = this.sendURL;
    opts.params = {
      "new": Object.toJSON(newItems),
      read: Object.toJSON(readItems)
    };
    
    opts.onComplete = function(response) {
      if(response.status == "200")
        oldOnComplete();
    };
    
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
  		this.store.update("accountInfo", {since: this.since});

  		//update lists, save all, callback onSuccess
  		if(!Object.isArray(response.responseJSON.list))
  		  list = $H(response.responseJSON.list).values();
  		else
  		  list = response.responseJSON.list.clone();
  		  
  		if(!Object.isArray(list))
  		  list = [];
  		  
  		if(!list.length) {
  		  oldOnSuccess();
  		  return;
  		}

  		this.sortList(list);
  		
			for(var i = 0, j = list.length; i < j; i++) {
			  var page = list[i],
			      listInMemory = (page.state == "0") ? this.unreadList : this.readList,
			      otherList = (page.state == "1") ? this.unreadList : this.readList;
        // if time_added after oldSince
        if(page.time_added > oldSince) {
          // insert and push onto appropriate list
          (function(listInMemory, page, i, j) {
            page.saved = 1;
            this.store.write("pages", page, function() {
              listInMemory.push(Object.clone(page));
              if(i == (j - 1)) {
                this.sortList(listInMemory);
                oldOnSuccess();
              }
            }.bind(this), function(err) {
              Mojo.log.error(err);
            });
          }.bind(this))(listInMemory, page, i, j);
        }
        else {
          // check for existing record in db
  			  this.store.read("pages", {item_id: page.item_id}, {limit: 1}, function(rows) {
  			    if(rows.length) {
  			      var savedPage = rows[0];
              // if exists and is different, update/reassign in appropriate list
  			      if(page.time_updated > savedPage.time_updated) {
  			        page.id = savedPage.id;
  			        
  			        (function(listInMemory, otherList, page, i, j) {
  			          page.saved = 1;
  			          this.store.update("pages", page, {}, function() {
                    // update listInMemory and otherList
                    var index = listInMemory.indexOf(function(p) {
                      return p.item_id == page.item_id;
                    });
                    
                    var otherIndex = otherList.indexOf(function(p) {
                      return p.item_id == page.item_id;
                    });
                    
                    // push page into listInMemory if not previously in it, else overwrite existing
                    if(index == -1)
                      listInMemory.push(Object.clone(page));
                    else
                      listInMemory[index] = Object.clone(page);
                      
                    // remove from otherList if it exists there
                    if(otherIndex != -1)
                      otherList.splice(otherIndex, 1);

                    // if last item, sort and call success hook
                    if(i == (j - 1)) {
                      this.sortList(listInMemory);
                      oldOnSuccess();
                    }
    			        }.bind(this), function(err) {
    			          Mojo.log.error(err);
    			        });
  			        }.bind(this))(listInMemory, otherList, page, i, j);
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
  sortList: function(list) {
    list.sort(function(a, b) {
      var a_added = parseInt(a.time_added, 10), 
          b_added = parseInt(b.time_added, 10);
		  return b_added - a_added;
		});
  },
  // flip item's unread flag, UI should immediately update to indicate change
  toggleItem: function(opts) {
    var page = opts.page,
        listInMemory,
        otherList,
        oldOnSuccess = opts.onSuccess || function(){};
        
    listInMemory = page.state == "0" ? this.unreadList : this.readList;
    otherList = page.state == "1" ? this.unreadList : this.readList;
    
    page.saved = 0;
    page.state = (page.state == "0") ? "1" : "0";
    // delete extraneous fields
    delete page.value;
    this.store.update("pages", page, {}, function() {
      var index = listInMemory.find(function(p) {
        return p.item_id == page.item_id;
      });

      listInMemory.splice(index, 1);
      otherList.push(Object.clone(page));
      this.sortList(listInMemory);
      oldOnSuccess();
    }.bind(this), function(err) {
      Mojo.log.error(err);
    });

  },
  // add item to local list, push to server if available
  addItem: function(opts) {
    var oldOnComplete = opts.onComplete || function(){},
        existsAlready = false,
        url = opts.params.url,
        title = opts.params.title || "Page added by Rilly";

    // bail if item already in unread list
    if(this.unreadList.any(function(item) {
        return (item.url == url);
      })) {
        oldOnComplete();
        return;
      }
      
    
    opts.onComplete = function(response) {
      var saved = (response.status == "200") ? 1 : 0;
      this.unreadList.push({url: url, title: title, saved: saved});
      this.store.write("pages", {
        url: url,
        title: title,
        saved: saved,
        state: 0
      }, function() {
        this.sortList(this.unreadList);
        oldOnComplete();
      }.bind(this));
    }.bind(this);
    opts.url = this.addURL;
    this.request(opts);
  },
  // replace getList with this, it will call pushItems and update the full read/unread lists from server and store them
  sync: function(opts) {
    this.sendItems({
      onComplete: function() {
        this.getItems(opts);
      }.bind(this)
    });
  },
  // remove's user data, nukes all item data from app
  clearData: function(opts) {
    
  }
};