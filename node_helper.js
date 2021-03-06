/* Magic Mirror
 * Module: MMM-Instagram
 *
 * By Jim Kapsalis https://github.com/kapsolas
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var rp = require("request-promise-native");

module.exports = NodeHelper.create({

	start: function() {
		console.log("Starting node_helper for module [" + this.name + "]");
	},

	socketNotificationReceived: function(notification, apiUrls){
		if (notification === "INSTAGRAM_GET") {
			this.fetchImages(apiUrls);
		}
	},

	fetchImages: function(apiUrls) {
		var self = this;
		var promises = apiUrls.map(url => {
			return rp({
				uri: url,
				method: "GET",
				json: true
			}).then(items => {
				var media = items.data.map(item => {
					return {
						"media_type": item.media_type,
						"media_url": item.media_url
					};
				});
				return media;
			}).catch(error => {
				console.log("Error requesting " + url + ": ", error);
			});
		});
		Promise.all(promises)
			.then(results => {
				self.sendSocketNotification("INSTAGRAM_IMAGE_LIST",
					results.reduce((acc, item) => {
						return acc.concat(item);
					}, [])
				);
			}).catch(error => {
				console.log("Error: ", error);
			});
	}
});
