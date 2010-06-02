ril = new Rilly({
  apikey: "651gbd43p9cqKne02cT90G0I82A5pdrq",
  store: new Storage("rilly")
});

util = new Utilly();

function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	var stageController = this.controller;
	
	//if no account info stored, go to setup, else go to main
	ril.store.createTable("accountInfo", {username: "string", password: "string"}, function() {
		ril.store.read("accountInfo", null, null, function(rows) {
			if(rows.length) {
				ril.authParams = {username: rows[0].username, password: rows[0].password, apikey: ril.apikey};
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