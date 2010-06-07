function Utilly() {}

// all methods take onSuccess/onFailure options
Utilly.prototype = {
  appManURL: "palm://com.palm.applicationManager",
  messagingID: "com.palm.app.messaging",
  emailID: "com.palm.app.email",
  browserID: "com.palm.app.browser",
  twitterURL: "http://twitter.com/home?status=",
  service: function(opts) {
    var sceneController = Mojo.Controller.stageController.activeScene();
    
    opts.onSuccess = opts.onSuccess || function(){};
    opts.onFailure = opts.onFailure || function(){};
    
    sceneController.serviceRequest(this.appManURL, {
      method: opts.method,
      parameters: {
        id: opts.id,
        params: opts.params
      },
      onSuccess: opts.onSuccess,
      onFailure: opts.onFailure
    });
  },
  // takes option messageText
  message: function(opts) {
    opts.method = "launch";
    opts.id = this.messagingID;
    opts.params = {
      messageText: opts.url
    };
    this.service(opts);
  },
  // takes options summary, text
  email: function(opts) {
    opts.method = "open";
    opts.id = this.emailID;
    opts.params = {
      summary: opts.title,
      text: opts.url
    };
    this.service(opts);
  },
  // takes option url
  twitter: function(opts) {
    opts.url = this.twitterURL + encodeURI(opts.url);
    this.browser(opts);
  },
  clipboard: function(opts) {
    Mojo.Controller.stageController.setClipboard(opts.url);
    Mojo.Controller.getAppController().showBanner("Copied URL to clipboard", {source: 'notification'});
  },
  // takes option url
  browser: function(opts) {
    opts.method = "open";
    opts.id = this.browserID;
    opts.params = {
      target: opts.url
    };
    this.service(opts);
  },
  appMenuModel: {
  	items: [
  		{label: "Help", command: "help"}
  	]
  }
};