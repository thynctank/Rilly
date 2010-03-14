// always bind functions to assistant

// need to start storing these lists
function getList(opts) {
  if(!opts)
    opts = {};
  var params = Object.extend(Rilly.authParams, {
  	state: opts.list || "unread",
  	since: opts.since || this.since || null
  });
  
  this.$.spinner.node.show();
  this.$.scrim.node.show();

  new Ajax.Request(Rilly.getURL, {
  	parameters: params,
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
  			this.readingItems = changedItems.concat(this.readingItems);

  			this.$.readingList.model.items = this.readingItems.clone();
  			this.controller.modelChanged(this.$.readingList.model);
        this.$.header.node.down(".title").innerHTML = "Your Reading List - <strong>#{count} items</strong>".interpolate({count: this.$.readingList.model.items.length});
  			
  			//handle any read items, remove from readingItems and add to readItems
  		}
  	}.bind(this),
  	onFailure: function(response) {
  		Mojo.Controller.errorDialog("There was a problem fetching your list from the server");
  	},
    onComplete: function() {
		  this.$.spinner.node.hide();
		  this.$.scrim.node.hide();
    }.bind(this)
  });
}

function markRead(callback) {
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
}