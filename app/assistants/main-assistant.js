function MainAssistant(argFromPusher) {
}

//for now fetch the list fresh every time.
//next step is to store the items and only fetch fresh items as needed
//also pushing read/removed items

MainAssistant.prototype = {
	setup: function() {
		this.controller.setupWidget("check", {}, {value: false,disabled: false});
		Ares.setupSceneAssistant(this);
		this.readItems = [];
		this.getList();
		this.controller.setupWidget(Mojo.Menu.commandMenu,
			this.commandAttributes = {
			spacerHeight: 0,
			menuClass: "no-fade"
		},
		this.commandModel = {
			visible: true,
			items: [
				{},
				{command: "refresh", icon: "refresh"}
			]
		});
		this.handleCheck = this.handleCheck.bind(this);
		this.getList = this.getList.bind(this);
		Mojo.Event.listen(this.$.readingList.node, Mojo.Event.propertyChange, this.handleCheck);
	},
	cleanup: function() {
		Ares.cleanupSceneAssistant(this);
		//remove handlers
	},
	refreshList: function() {
		this.markRead(this.getList);
	},
	getList: function() {
		new Ajax.Request(Rilly.getURL, {
			parameters: Object.extend(Rilly.authParams, {
				state: "unread"
			}),
			onSuccess: function(response) {
				//populate list and update widget
				this.readingItems = $H(response.responseJSON.list).map(function(item) {
					return item.value;
				}).sortBy(function(item) {
					return item.time_added;
				}).reverse();
				this.$.readingList.model.items = this.readingItems.clone();
				this.controller.modelChanged(this.$.readingList.model);

				//try to make scroller snap
				this.$.scroller.model.snapElements = {y: $$(".readingItem"), x: $$(".readingItem")};
				this.controller.modelChanged(this.$.scroller.model);
			}.bind(this),
			onFailure: function(response) {
				Mojo.Controller.errorDialog("There was a problem fetching your list from the server");
			}
		});
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
				return (item.item_id != event.model.item_id)
			});
		}
	},
	markRead: function(callback) {
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
				this.readItems = [];
				//clear any filter
				this.$.filter.node.mojo.close();
				if(callback)
					callback();
			}.bind(this),
			onFailure: function(response) {
				Mojo.Controller.errorDialog("There was a problem updating the read status on the server");
			}
		});
	},
	readItem: function(event) {
		this.controller.stageController.pushScene("read", event.item);
	},
	handleFilter: function(event) {
		this.$.readingList.model.items = this.readingItems.filter(function(item) {
			return item.title.toLowerCase().include(event.filterString.toLowerCase());
		});
		this.$.filter.node.mojo.setCount(this.$.readingList.model.items.length);
		this.controller.modelChanged(this.$.readingList.model);
	},
	handleCommand: function(event) {
		if(event.type === Mojo.Event.command) {
			switch(event.command) {
				case "refresh":
					this.refreshList();
					break;
			}
		}
	}
};