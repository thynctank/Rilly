Rilly = {
	apikey: "651gbd43p9cqKne02cT90G0I82A5pdrq",
	authURL: "https://readitlaterlist.com/v2/auth",
	getURL: "https://readitlaterlist.com/v2/get",
	sendURL: "https://readitlaterlist.com/v2/send"
};
Rilly.store = new Storage("rilly");

Rilly.appMenuModel = {
	items: [
		{label: "Help", command: "help"}
	]
};

function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	var stageController = this.controller;
	
	//if no account info stored, go to setup, else go to main
	Rilly.store.createTable("accountInfo", {username: "string", password: "string"}, function() {
		Rilly.store.read("accountInfo", null, null, function(rows) {
			if(rows.length) {
				Rilly.authParams = {username: rows[0].username, password: rows[0].password, apikey: Rilly.apikey};
				stageController.pushScene({name: "main", disableSceneScroller: true});
			}
			else
				stageController.pushScene({name: "setup", disableSceneScroller: true});
		});
	});
	this.controller.setWindowOrientation("free");
};

StageAssistant.prototype.handleCommand = function(event) {
  this.controller=Mojo.Controller.stageController.activeScene();
  if(event.type == Mojo.Event.command) {
  	switch(event.command) {
			case 'help':
    		this.controller.stageController.pushAppSupportInfoScene();
    		break;
		}
	}
};