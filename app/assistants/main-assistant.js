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
				{},
				{command: "refresh", icon: "refresh"}
			]
		});
		this.handleCheck = this.handleCheck.bind(this);
		Mojo.Event.listen(this.$.readingList.node, Mojo.Event.propertyChange, this.handleCheck);

    // bind helpers
		this.getList = getList.bind(this);
		this.markRead = markRead.bind(this);
		
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