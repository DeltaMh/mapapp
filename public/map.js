var geocoder;
var currentMarkers = [];
var updated = true;
var oldMarkers = [];
var map;
var markersArray = [];

var myMain = setInterval(updateMarkers, 1000);

function search(iQuery, iType, iPostcode) {
	updated = false;
	fetch('/api/organization')
		.then(response => response.json())
		.then(data => {
			var keepElement = true;
			var tempMarkers = [];
			
			data.forEach(function(element){
				keepElement = true;
				if(!element.name.toLowerCase().includes(iQuery.toLowerCase()) && iQuery != ""){
					keepElement = false;
				}
				
				if(element.postcode != iPostcode && iPostcode != ""){
					keepElement = false;
				}

				if(keepElement){
					tempMarkers.push(element);
				}

			})
			currentMarkers = tempMarkers;
			updated = true;
			updateMarkers();
		})
}

function getMarkers() {
	updated = false;
	fetch('/api/organization')
		.then(response => response.json())
		.then(data => {
			currentMarkers = data;
			updated = true;
		})
}

function updateMarkers() {
	if(currentMarkers != oldMarkers){	
		oldMarkers = currentMarkers;
		clearOverlays();
		replaceMarkers();
	}
}

function replaceMarkers(){
	currentMarkers.forEach(function(element){
		if(element.address != null && element.address != ""){
			geocoder = new google.maps.Geocoder();
			codeAddress(geocoder, map, element);
		}
	})
}

function codeAddress(geocoder, map, element) {
	geocoder.geocode({'address': element.address}, function(results, status) {
		if (status === 'OK') {
			map.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location
			});

			var contentString = '<div id="content">'+
				'<div id="siteNotice">'+
				'</div>'+
				'<h1 id="firstHeading" class="firstHeading">' + element.name + '</h1>'+
				'<div id="bodyContent">'+
				'<p>' + element.description + '</p>'+
				'<p>Address: ' + element.address + ' Phone: ' + element.phone + ' Email: ' + element.email +'</p>'+
				'</div>'+
				'</div>';

			var infowindow = new google.maps.InfoWindow({
				content: contentString 
			});
			markersArray.push(marker);
google.maps.event.addListener(marker,'click', function() {
				infowindow.open(map, marker);
			});
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}

function initMap() {

	var Denmark = {lat: 55.676098, lng: 12.568337};
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 7,
		center: Denmark
	});
	//Do a search that returns everything to add all markers to the map
	search("","","");
}

function clearOverlays() {
  for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
  }
  markersArray.length = 0;
}

