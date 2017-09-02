var Q = require('q')
  , request = require('request')
  ;

var data = require('./common/search_result.json')
var results = [];

for (var i=0; i<data.length; i++) {
	var options = {
		url: 'https://openapi.npm.gov.tw/v1/rest/collection/search/' + data[i].Serial_No,
		headers: {
			'apiKey': 'bd7c5038-f23b-4dd9-8bc4-885ba4230773'
		}
	};
	request.get(options)
	.on('response', function(response) {
		console.log(response.status);
		console.log(response.result);
		results.push(response.result);
	})
}