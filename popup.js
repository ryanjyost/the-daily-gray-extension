document.addEventListener('DOMContentLoaded', function() {

	//========================================================
	// User authentication and sending link to API
	//========================================================

	//get Chrome user info and use for adding piece of media
	chrome.identity.getProfileUserInfo(function(userInfo) {
	 var xhr = new XMLHttpRequest();
			xhr.open("GET", "https://media-bias-map.herokuapp.com/api/user?google.id="+ userInfo.id , true);

			xhr.onreadystatechange = function() {
		  	if (xhr.readyState == 4) {
			    var resp = JSON.parse(xhr.response);

			    //if Chrome user is not signed in to the browser
			    if(!userInfo.id){
			    	document.getElementById('sign-into-chrome').style.display = 'block';
			    }

			    //if current extension user is not registered on MBM
			    else if (resp.results.length < 1) {
			    	document.getElementById('sign-up').style.display = 'block';
			    }

			    else{
			    	document.getElementById('map-cont').style.display = 'block';

			    	//get all the boxes in the grid
						var boxList = document.getElementsByClassName("box");

						for(var j=0; j < boxList.length; j++){

							boxList[j].addEventListener('click', function() {
							    var id = event.target.id;

							    chrome.tabs.getSelected(null, function(tab) {
							      d = document;

							      //======================================
							      //create form to send to Media Bias Map API
							      var f = d.createElement('form');
							      f.action = 'https://media-bias-map.herokuapp.com/api/post';
							      f.method = 'post';

							      //add current URL to the form
							      var urlInput = d.createElement('input');
									      urlInput.type = 'hidden';
									      urlInput.name = 'url';
									      urlInput.value = tab.url;

								  	//add id / coordinates on grid to form
							      var coordinates = d.createElement('input');
									      coordinates.type = 'hidden';
									      coordinates.name = 'xy';
									      coordinates.value = id;

								  	var addedById = d.createElement('input');
								  			addedById.type = 'hidden';
								  			addedById.name = 'addedById';
								  			addedById.value = userInfo.id

								  	//add inputs to form
							      f.appendChild(urlInput);
							      f.appendChild(coordinates);
							      f.appendChild(addedById);

							      //=========================
							      //Topic Selection
							      document.getElementById('map-cont').style.display = 'none';
							      document.getElementById('topic-list-container').style.display = 'block';


								      //=====================
								      //Add a topic

								      var topicSelectList = document.getElementsByClassName('topic');

								      for(var x = 0; x < topicSelectList.length; x++){
								      	topicSelectList[x].addEventListener('click', function(){

								      		var topic = ''

								      		if(event.target.id=='no-topic'){
								      			topic = 'none'
								      		} else{
								      			topic = event.target.innerHTML
								      		}

								      		var topicInput = d.createElement('input');
									  			topicInput.type = 'hidden';
									  			topicInput.name = 'topic';
									  			topicInput.value = topic;

									  			f.appendChild(topicInput);

										       //SUBMIT THE FORM
											    d.body.appendChild(f);
										      f.submit();

										       document.getElementById('topic-list-container').style.display = 'none';
										       document.getElementById('post-submit-success').style.display = 'block';
								      	})
								      }

							    });
							}, false);
						}

			    } //end else
		  	} //end xhr readyState == 4 conditional
			} //end onreadystatechange

		xhr.send();

	}); // end getProfileUserInfo


	//=====================================================
	//set topic select options to recent topics on Media Bias Map
	var topicsArray = []
	var options = document.getElementsByClassName('topic');

	var xhr = new XMLHttpRequest();

			xhr.open("GET", "https://media-bias-map.herokuapp.com/api/topic", true);
			xhr.onreadystatechange = function() {
		  	if (xhr.readyState == 4) {
			    var resp = JSON.parse(xhr.response);
			    topicsArray = resp.results.reverse();

			    for(var option in topicsArray){
						options[option].innerHTML = topicsArray[option].name
					}
		  	}
			}

	xhr.send();


	//========================================================
	// Map Styling and Animation
	//========================================================

		//colors
    var blue = "#A9D0F5",
    	lightBlue = "#E0ECF8",
    	red = "#F5A9BC",
    	lightRed = "#F8E0E6",
    	white = "#f2f2f2";

    var boxColorArray = ['', blue, lightBlue, white, lightRed, red];

    //=====================================================
    //loop through all boxes (except 5th (top) row), add colors on initial load
    for(let x = 5; x > 0; x--){
    	for(let y = 3; y > 0; y--){
    		let currBox = document.getElementById('x'+x+'y'+y);
    		currBox.style.borderColor = "border-color: #e6e6e6 #f2f2f2 #e6e6e6 #f2f2f2";
    		currBox.style.borderWidth = "border-width: 1px 1px 1px 1px";
    		currBox.style.borderStyle = "border-style: solid";
    		currBox.style.opacity = (1-.30*y);
    		currBox.style.backgroundColor = boxColorArray[x];
    	}
    }


    //get the background image urls for removing on hover and adding back
    //start with blank in 0th index so array posiiton matches row number
    var rowImageURLs = [''];

		//store background image urls from '#row' divs into the array
		for(let y = 1; y < 4; y++){
			 let imageURL = document.getElementById('row'+y).style.backgroundImage;
			 rowImageURLs.push(imageURL);
		}


		//get all the boxes in the grid
		var boxList = document.getElementsByClassName("box");

		for(var j=0; j < boxList.length; j++){


			//=====================================================
			//hover styling

			//fill box on hover, and fill any boxes below and to left of it with same color
			boxList[j].addEventListener('mouseover', function() {

				//loop through boxes, clear styling
			    for(let x = 5; x > 0; x--){
			    	for(let y = 3; y > 0; y--){
			    		if(y != 5){
				    		let currBox = document.getElementById('x'+x+'y'+y);
				    		currBox.style.backgroundColor = "#fff";
				    		currBox.style.opacity = 0;
			    		}
			    	}
			    }

			    //clear out background images
				for(let y = 1; y < 4; y++){
					 document.getElementById('row'+ y).style.backgroundImage = "none";
				}

			    let box = event.target,
			    	boxId = event.target.id,
			    	xPosition = boxId[1],
			    	yPosition = boxId[3],
			    	currBoxColor = boxColorArray[xPosition],
					currOpacity = (1-(.19*yPosition));

		    		//show current row's background image/label
		    		if (yPosition > 0)
					document.getElementById('row' + yPosition).style.backgroundImage = rowImageURLs[yPosition];

			    	//hide left, right labels on hover
			    	document.getElementById('left').style.display = "none";
			    	document.getElementById('right').style.display = "none";

			    //loop through elements below and to left of current hover, excluding top row
			    for(let x = xPosition; x > 0; x--){
			    	for(let y = yPosition; y > 0; y--){
			    		if(yPosition < 4) {
				    		let currBox = document.getElementById('x'+x+'y'+y);

				    		currBox.style.opacity = currOpacity;
				    		currBox.style.backgroundColor = currBoxColor;
			    		}
			    	}
					}
			  }, false);


			//reset styling when moving the pointer out of the box
			boxList[j].addEventListener('mouseout', function() {
				//loop through elements and add back colors
			    for(let x = 5; x > 0; x--){
			    	for(let y = 3; y > 0; y--){
			    		let currBox = document.getElementById('x'+x+'y'+y);

			    		//show left, right labels on mouseout
				    	document.getElementById('left').style.display = "inline";
				    	document.getElementById('right').style.display = "inline";

			    		currBox.style.opacity = (1-.3*y);

			    		let row = document.getElementById('row'+y);
	    				//row.style.backgroundColor = "none";

			    		if(x==1){
			    			currBox.style.backgroundColor = blue;
			    		} else if(x==2){
			    			currBox.style.backgroundColor = lightBlue;
			    		} else if(x==3){
			    			currBox.style.backgroundColor = white;
			    		} else if(x==4){
			    			currBox.style.backgroundColor = lightRed;
			    		} else{
			    			currBox.style.backgroundColor = red;
			    		}

			    		//show current row's background image/label
		    			document.getElementById('row' + y).style.backgroundImage = rowImageURLs[y];
			    	}
			    }
			}, false);

		}//end loop through box list

}, false);

