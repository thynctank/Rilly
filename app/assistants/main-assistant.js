function MainAssistant(argFromPusher) {
}

//for now fetch the list fresh every time.
//next step is to store the items and only fetch fresh items as needed
//also pushing read/removed items

MainAssistant.prototype = {
  // TODO: load list initially from local store, then call to getList() so UI immediately usable.
	setup: function() {
		this.controller.setupWidget("check", {}, {value: false,disabled: false});
		Ares.setupSceneAssistant(this);
		this.readItems = [];
		this.readingItems = [];
		this.controller.setupWidget(Mojo.Menu.commandMenu,
			this.commandAttributes = {
			spacerHeight: 0,
			menuClass: "no-fade"
		},
		this.commandModel = {
			visible: true,
			items: [
        // {command: "newItem", icon: "plus"},
        {},
				{command: "refresh", icon: "refresh"}
			]
		});
		this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, util.appMenuModel);
		this.handleCheck = this.handleCheck.bind(this);
		Mojo.Event.listen(this.$.readingList.node, Mojo.Event.propertyChange, this.handleCheck);
		this.$.header.node.observe("click", function() {
		  this.$.scroller.node.mojo.scrollTo(0,0, true);
		}.bind(this));

    // bind helpers
		this.getList = ril.getList.bind(this, {
		  onComplete: function() {
  		  this.$.spinner.node.hide();
  		  this.$.scrim.node.hide();
		  }.bind(this),
		  onCreate: function() {
		    this.$.spinner.node.show();
        this.$.scrim.node.show();
		  }.bind(this),
		  onSuccess: function(updatedReadingItems) {
		    this.$.readingList.model.items = updatedReadingItems.clone();
  			this.controller.modelChanged(this.$.readingList.model);
  			this.updateHeader();
		  }.bind(this),
		  listToReplace: this.readingItems
		});
		this.markRead = ril.markRead.bind(this);
		
		this.getList();
	},
	cleanup: function() {
		Ares.cleanupSceneAssistant(this);
		//remove handlers
	},
	refreshList: function() {
		this.markRead(this.getList);
	},
	handleCheck: function(event) {
		if(event.model.value) {
			if(!this.readItems.find(function(item) {
				return (item.item_id === event.model.item_id);
			}))
				this.readItems.push(event.model);
		}
		else {
			//if it exists, remove it from readItems
			this.readItems = this.readItems.filter(function(item) {
				return (item.item_id != event.model.item_id);
			});
		}
	},
	readItem: function(inSender, event) {
		this.controller.stageController.pushScene("read", event.item);
	},
	handleFilter: function(inSender, event) {
		this.$.readingList.model.items = this.readingItems.filter(function(item) {
			return item.title.toLowerCase().include(event.filterString.toLowerCase());
		});
		this.$.filter.node.mojo.setCount(this.$.readingList.model.items.length);
		this.controller.modelChanged(this.$.readingList.model);
	},
	updateHeader: function() {
    this.$.header.node.down(".title").innerHTML = "Your Reading List - <strong>#{count} items</strong>".interpolate({count: this.$.readingList.model.items.length});
	},
	newItem: function() {
    // show dialog with URL/title fields, and a submit button
    // add item to unreadList, try to sync to server
	},
	handleCommand: function(event) {
		if(event.type === Mojo.Event.command) {
			switch(event.command) {
				case "refresh":
					this.refreshList();
					break;
				case "newItem":
				  this.newItem();
				  break;
			}
		}
	}
};