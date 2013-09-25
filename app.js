(function(window){
	// Creating some shorter local versions of global variables
	var navigator = window.navigator,
			doc = window.document,
			geo = navigator.geolocation;

	// Fetching the div to display the data
	var currPos = doc.querySelector('#currPos');
	var watchId = null;
	var map = doc.getElementById('map');

	// Testing for support and if supported fetch the current position based on user input
	if(geo){
		var optn = {
			enableHighAccuracy: true,
			timeout: Infinity,
			maximumAge: 0
		};
		//geo.getCurrentPosition(showPosition, showError, optn);
		watchId = geo.watchPosition(showPosition, showError, optn);
	} else {
		currPos.innerHTML = 'Geolocation API is not supported';
	}

	doc.querySelector('#stopWatch').addEventListener('click', function(){
		stopWatch();
	}, false);

	String.prototype.capitalize = function capitalize() {
	    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
	}

	function showPosition(position){
		var html = '';
		for(var prop in position.coords){
			var propArr = prop.split('');
			propArr[0].toUpperCase();
			html += '<p><strong>' + prop.capitalize() + ':</strong> ' + position.coords[prop] + '</p>';
		}
		currPos.innerHTML = html;
		plotIntoGoogleMaps(position);
	}

	function plotIntoGoogleMaps(position){
		// Compose the LatLng object from the coords and initialize a map 
		var googlePos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
				mapOptions = {
					zoom: 12,
					center: googlePos,
					mapeTypeId: google.maps.MapTypeId.ROADMAP
				},
				googleMap = new google.maps.Map(map, mapOptions);

		// Add a marker on your current location
		var markerOpts = {
			map: googleMap,
			position: googlePos,
			title: 'Hi, I am here',
			animation: google.maps.Animation.DROP
		},
		googleMarker = new google.maps.Marker(markerOpts);

		// Find the address of your location using reverse geocoding api and show the address obtained when you click on the mnarker
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({
			'latLng': googlePos
		}, function(results, status){
			if(status == google.maps.GeocoderStatus.OK){
				if(results[1]){
					var popOpts = {
						content: results[1].formatted_address,
						position: googlePos
					};
					var popup = new google.maps.InfoWindow(popOpts);
					google.maps.event.addListener(googleMarker, 'click', function(){
						popup.open(googleMap);
					});
				} else {
					alert('No results found');
				}
			} else {
				alert('Geocoder failed due to ' + status);
			}
		});
	}

	function stopWatch(){
		if(watchId){
			geo.clearWatch(watchId);
			watchId = null;
		}
	}

	function showError(error){
		switch(error.code) {
      case error.PERMISSION_DENIED:
        currPos.innerHTML = "<p>User denied the request for Geolocation.</p>";
        break;
      case error.POSITION_UNAVAILABLE:
        currPos.innerHTML = "<p>Location information is unavailable.</p>";
        break;
      case error.TIMEOUT:
        currPos.innerHTML = "<p>The request to get user location timed out.</p>";
        break;
      case error.UNKNOWN_ERROR:
        currPos.innerHTML = "<p>An unknown error occurred.</p>";
        break;
    }
		currPos.innerHTML += "<p>Please try again</p>";
	}

}(this));