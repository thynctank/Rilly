// TODO finish new item functionality, properly convert all old helper calls to new Rilly methods

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
		this.controller.setupWidget(Mojo.Menu.commandMenu,
			this.commandAttributes = {
			spacerHeight: 0,
			menuClass: "no-fade"
		},
		this.commandModel = {
			visible: true,
			items: [
        {command: "newItem", icon: "new"},
        {},
				{command: "refresh", icon: "refresh"}
			]
		});
		this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, util.appMenuModel);
		this.handleCheck = this.handleCheck.bind(this);
		Mojo.Event.listen(this.$.readingList.node, Mojo.Event.propertyChange, this.handleCheck);
		this.handleHeaderTap = this.handleHeaderTap.bind(this);
		this.$.header.node.observe("click", this.handleHeaderTap);

    // // bind helpers
    //    this.getList = ril.getList.bind(this, {
    //      onComplete: function() {
    //        this.$.spinner.node.hide();
    //        this.$.scrim.node.hide();
    //      }.bind(this),
    //      onCreate: function() {
    //        this.$.spinner.node.show();
    //         this.$.scrim.node.show();
    //      }.bind(this),
    //      onSuccess: function(updatedReadingItems) {
    //        this.$.readingList.model.items = updatedReadingItems.clone();
    //        this.controller.modelChanged(this.$.readingList.model);
    //        this.updateHeader();
    //      }.bind(this),
    //      listToReplace: this.readingItems
    //    });
    //    this.markRead = ril.markRead.bind(this);
    //    
    //    this.getList();
    //    
	},
	activate: function() {
    this.getList();
	},
	cleanup: function() {
		Ares.cleanupSceneAssistant(this);
		//remove handlers
	},
  handleHeaderTap: function() {
    this.$.scroller.node.mojo.scrollTo(0,0, true);
  },
  //full sync, get latest and display. Even if get failed, show existing stored items
	getList: function() {
	  
    // Before: show spinner, scrim
    // fetch latest, send updates, new items
    // After: hide spinner, scrim
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
    this.controller.showDialog({
	    template: "main/new-item-dialog",
	    assistant: new ItemDialogAssistant(this)
	  });
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

var ItemDialogAssistant = Class.create({
  initialize: function(sceneAssistant) {
    this.sceneAssistant = sceneAssistant;
    this.controller = sceneAssistant.controller;
  },
  setup: function(widget) {
    this.widget = widget;
    
    this.controller.setupWidget("newItemURL", {textCase: Mojo.Widget.steModeLowerCase}, {
      value: ""
    });
    this.controller.setupWidget("newItemTitle", {}, {
      value: ""
    });
    this.controller.setupWidget("saveItemButton", {type: Mojo.Widget.activityButton}, {buttonLabel: "Save"});
    this.saveNewItem = function() {
      var url = this.controller.get("newItemURL").mojo.getValue(),
          title = this.controller.get("newItemTitle").mojo.getValue();
      ril.addItem({
        url: url,
        title: title,
        onComplete: function(response) {
          var unreadListModel = this.sceneAssistant.$.readingList.model;
          unreadListModel.items.push({url: url, title: title});
          this.sceneAssistant.controller.modelChanged(unreadListModel);
          this.widget.mojo.close();
        }.bind(this)
      });
    }.bind(this);
    
    this.controller.listen("saveItemButton", Mojo.Event.tap, this.saveNewItem);
  },
  cleanup: function() {
    // clean up handler for tapping save
  }
});