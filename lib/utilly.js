function Utilly() {}

Utilly.prototype = {
  serviceShare: function(opts) {
    if(!opts.item)
      throw "Item is a required option";
    if(!opts.serviceURL)
      throw "Service URL is a required option";
  },
  message: function(opts) {
    
  },
  email: function(opts) {
    
  },
  twitter: function(opts) {
    
  },
  clipboard: function(opts) {
    
  },
  browser: function(opts) {
    
  },
  appMenuModel: {
  	items: [
  		{label: "Help", command: "help"}
  	]
  }
};