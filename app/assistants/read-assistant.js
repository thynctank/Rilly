function ReadAssistant(item) {
	this.item = item;
}

ReadAssistant.prototype = {
	setup: function() {
		Ares.setupSceneAssistant(this);
		
		this.stopModel = {icon: 'load-progress', command: 'stop'};
		this.refreshModel = {command: "refresh", icon: "refresh"};
		this.shareButtonModel = {command: "showShare", label: "Share", submenu: "shareMenu"};
		this.shareMenuModel = {
		  items: [
	      {label: "Messaging", command: "message"},
	      {label: "Email", command: "email"},
	      {label: "Twitter", command: "twitter"},
	      {label: "Copy to Clipboard", command: "clipboard"}
	    ]
		};
     
		this.controller.setupWidget(Mojo.Menu.commandMenu,
			this.commandAttributes = {
			spacerHeight: 0,
			menuClass: "no-fade"
		},
		this.commandModel = {
			visible: true,
			items: [
				this.shareButtonModel,
				{},
				this.refreshModel
			]
		});
		
		this.controller.setupWidget("shareMenu", {}, this.shareMenuModel);
		
		this.controller.useLandscapePageUpDown(true);
		
		//handle pages after first by adding a back button to command items
		this.handleUpdate = this.handleUpdate.bind(this);
		this.handleStart = this.handleStart.bind(this);
		this.handleProgress = this.handleProgress.bind(this);
		this.updateProgress = this.updateProgress.bind(this);
		this.handleStop = this.handleStop.bind(this);

		Mojo.Event.listen(this.$.web.node, Mojo.Event.webViewTitleUrlChanged, this.handleUpdate);
		Mojo.Event.listen(this.$.web.node, Mojo.Event.webViewLoadStarted, this.handleStart);
		Mojo.Event.listen(this.$.web.node, Mojo.Event.webViewLoadProgress, this.handleProgress);
		Mojo.Event.listen(this.$.web.node, Mojo.Event.webViewLoadStopped, this.handleStop);
		Mojo.Event.listen(this.$.web.node, Mojo.Event.webViewLoadFailed, this.handleStop);
		
		this.controller.enableFullScreenMode(true);
		this.$.web.node.mojo.openURL(this.item.url);
	},
	handleStart: function() {
    this.commandModel.items[2] = this.stopModel;
    this.controller.modelChanged(this.commandModel);
    this.progressLoadImage = 0;
	},
	handleStop: function() {
    this.commandModel.items[2] = this.refreshModel;
    this.controller.modelChanged(this.commandModel);
	},
	handleUpdate: function(info) {
		var firstCommand = {};
		if(info.canGoBack) {
			firstCommand = {command: "back", icon: "back"};
		}
		this.commandModel.items[1] = firstCommand;
		this.controller.modelChanged(this.commandModel);
	},
	handleProgress: function() {
		var percent = event.progress;
		if(percent > 100)
		  percent = 100;
		else if(percent < 0)
		  percent = 0;
		this.currentLoadProgressPercentage = percent;
		
		//determine which of 24 images to use (0 thru 23)
		var image = Math.round(percent/4.1);
		if(image > 23)
			image = 23;
		// Ignore this update if the percentage is lower than where we're showing
 		if (image < this.progressLoadImage) {
 			return;
 		}
		
		//if changed, repaint screen
		if(this.progressLoadImage != image) {
			if(this.loadProgressAnimator) {
				this.loadProgressAnimator.cancel();
				delete this.loadProgressAnimator;
			}
			
			var icon = this.controller.select("div.load-progress")[0];
			if(icon) {
				this.loadProgressanimator = Mojo.Animation.animateValue(Mojo.Animation.queueForElement(icon), "linear", this.updateProgress, {
					from: this.progressLoadImage,
					to: image,
					duration: 0.5
				});
			}
		}
	},
	updateProgress: function(image) {
		image = Math.round(image);
		if(this.progressLoadImage == image)
			return;
		var icon = this.controller.select("div.load-progress")[0];
		if(icon) {
			icon.setStyle({"background-position": "0px -" + (image * 48) + "px"});
		}
		this.progressLoadImage = image;
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
				case "stop":
					webMojo.stopLoad();
					break;
			  case "message":
        case "email":
        case "twitter":
        case "clipboard":
          util[event.command](this.item);
          break;
			}
		}
	}
};