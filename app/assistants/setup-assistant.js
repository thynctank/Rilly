// TODO Add signup capability, reuse form with second password field 
// TODO Add clear data capability
// TODO Once user data stored, no longer show form
// TODO Add setup option to app menu to go to this scene.
// TODO Add user instructions once scene becomes more complex

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
		ril.authParams = {username: username, password: password};
		ril.authUser({
		  onSuccess: function(response) {
		    stageController.swapScene("main");
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