function ReadAssistant(item) {
	this.item = item;
}

ReadAssistant.prototype = {
	setup: function() {
		Ares.setupSceneAssistant(this);

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
		
		//handle pages after first by adding a back button to command items
		this.handleUpdate = function(info) {
			var firstCommand = {};
			if(info.canGoBack) {
				firstCommand = {command: "back", icon: "back"};
			}
			this.commandModel.items[0] = firstCommand;
			this.controller.modelChanged(this.commandModel);
		}.bind(this);
		Mojo.Event.listen(this.$.web.node, Mojo.Event.webViewTitleUrlChanged, this.handleUpdate);
		this.$.web.node.mojo.openURL(this.item.url);
	},
	cleanup: function() {
		Ares.cleanupSceneAssistant(this);
	},
	handleCommand: function(event) {
		var webMojo = this.controller.get("web").mojo;
		if(event.type === Mojo.Event.command) {
			switch(event.command) {
				case "refresh":
					webMojo.reloadPage();
					break;
				case "back":
					webMojo.goBack();
					break;
			}
		}
	}
};