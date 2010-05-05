function SetupAssistant(argFromPusher) {
}

SetupAssistant.prototype = {
	setup: function() {
		Ares.setupSceneAssistant(this);
	},
	cleanup: function() {
		Ares.cleanupSceneAssistant(this);
	},
	authUser: function() {
		//disable fields
		this.$.username.model.disabled = true;
		this.$.password.model.disabled = true;
		this.controller.modelChanged(this.$.username.model);
		this.controller.modelChanged(this.$.password.model);
	
		var username = this.$.username.model.value,
				password = this.$.password.model.value,
				stageController = this.controller.stageController;

		//setup authParams hash on Rilly
		Rilly.authParams = {username: username, password: password, apikey: Rilly.apikey};
		//store in Rilly.store if service auths username/password
		new Ajax.Request(Rilly.authURL, {
			parameters: Rilly.authParams, 
			onSuccess: function(response) {
				Rilly.store.write("accountInfo", {username: username, password: password}, function() {
          // TODO: Add call to getList (pulling read and unread both) and populating initial store before pushing main
					stageController.swapScene("main");
				});
			},
			onFailure: function(response) {
				//re-enable fields
				this.$.username.model.disabled = false;
				this.$.password.model.disabled = false;
				this.controller.get("saveButton").mojo.deactivate();
				this.controller.modelChanged(this.$.username.model);
				this.controller.modelChanged(this.$.password.model);

				Mojo.Controller.errorDialog("Username and/or password incorrect. Please try again.");
			}.bind(this)
		});
	}
};