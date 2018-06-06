setInterval(updateLatestOrg, 10000);

var currentOrg = "";
updateLatestOrg();
checkLogin();

function updateLatestOrg(){
	fetch('/api/latestorganization')
		.then(response => response.json())
		.then(data => {
			currentOrg = data;

		})

	if(currentOrg != "undefined" && currentOrg != ""){
		var orgText = "<strong>" + currentOrg.name + "</strong> " + currentOrg.description;
		document.getElementById('currentorganization').innerHTML=orgText;

	}
}

function checkLogin(){
	fetch('/isloggedin', {method:'GET', credentials: 'include'})
		.then(function(response){

			var loggedIn = document.getElementsByClassName("loggedIn");
			var notLoggedIn = document.getElementsByClassName("notLoggedIn");
			var i;

			//Change the elements in the top bar if the user is logged in or out
			if(response.ok){
				for(i = 0; i < loggedIn.length; i++){

					loggedIn[i].style.display = "inline";

				}

				for(i = 0; i < notLoggedIn.length; i++){
					notLoggedIn[i].style.display = "none";
				}

			} else {
				for(i = 0; i < loggedIn.length; i++){
					loggedIn[i].style.display = "none";
				}
				for(i = 0; i < notLoggedIn.length; i++){
					notLoggedIn[i].style.display = "inline";
				}
			}
		});
}

function addOrg(iname, idescription, iaddress, icreator, ipostcode, iphone, iemail){
	var orgObj = {name:iname, description:idescription, address:iaddress, creator:icreator, postcode:ipostcode, phone:iphone, email:iemail};

	fetch('/api/organization', {
		method: 'post',
		credentials: 'include',
		body: JSON.stringify(orgObj),
		headers: {
			'content-type': 'application/json'
		}
	})
}

