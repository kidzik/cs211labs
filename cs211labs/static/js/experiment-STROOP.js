
//States whether we are in "intro-mode" (explanation and initial user profile questions) or not
var intro = true;
var counters_initialized=false;
var timeshelp = 0; //times the user asked for help
var timetask = 0; // time employed in doing the current task
var timehelp = 0; // time employed in help mode
var task_time = 3; // time to do each task, in seconds
var pause_time = 3; // pause between each task, in seconds
var current_task = 0; //index of the current task
var on_task = false; //denotes whether we are on a task - to capture the keypresses
var on_modal = false; //denotes whether we are on the modal window - to not capture keypresses
var current_task_success = false; //whether the current task has been successfully passed or not
var current_task_timestamp = 0; //timestamp of the start of this task
var current_task_elapsed_time = task_time*1000; //time taken to solve this task (until keypress)
var help_timestamp = 0; //moment in which we accessed the help
var total_help_time = 0; //total time spent in help during this task

//We define the structure of the result object
var data;//This will store the current task's data
var user_profile = {colorblind: false};//This will store the current user profile information, to be set in the intro phase
var results = [];

//These are the STROOP phrases
var phrases = [
{htmlText: "The color of lemons is <span class='yellow'>yellow</span>", correct: true, consistent: true, color_text: "yellow", color_visual: "yellow"},
{htmlText: "The color of blood is <span class='red'>red</span>", correct: true, consistent: true, color_text: "red", color_visual: "red"},
{htmlText: "The color of grass is <span class='green'>green</span>", correct: true, consistent: true, color_text: "green", color_visual: "green"},
{htmlText: "The color of the sky is <span class='blue'>blue</span>", correct: true, consistent: true, color_text: "blue", color_visual: "blue"},
{htmlText: "The color of wood is <span class='brown'>brown</span>", correct: true, consistent: true, color_text: "brown", color_visual: "brown"},

{htmlText: "The color of lemons is <span class='red'>yellow</span>", correct: true, consistent: false, color_text: "yellow", color_visual: "red"},
{htmlText: "The color of blood is <span class='yellow'>red</span>", correct: true, consistent: false, color_text: "red", color_visual: "yellow"},
{htmlText: "The color of grass is <span class='blue'>green</span>", correct: true, consistent: false, color_text: "green", color_visual: "blue"},
{htmlText: "The color of the sky is <span class='brown'>blue</span>", correct: true, consistent: false, color_text: "blue", color_visual: "brown"},
{htmlText: "The color of wood is <span class='green'>brown</span>", correct: true, consistent: false, color_text: "brown", color_visual: "green"},

{htmlText: "The color of lemons is <span class='brown'>brown</span>", correct: false, consistent: true, color_text: "brown", color_visual: "brown"},
{htmlText: "The color of blood is <span class='yellow'>yellow</span>", correct: false, consistent: true, color_text: "yellow", color_visual: "yellow"},
{htmlText: "The color of grass is <span class='red'>red</span>", correct: false, consistent: true, color_text: "red", color_visual: "red"},
{htmlText: "The color of the sky is <span class='green'>green</span>", correct: false, consistent: true, color_text: "green", color_visual: "green"},
{htmlText: "The color of wood is <span class='blue'>blue</span>", correct: false, consistent: true, color_text: "blue", color_visual: "blue"},

{htmlText: "The color of lemons is <span class='brown'>blue</span>", correct: false, consistent: false, color_text: "blue", color_visual: "brown"},
{htmlText: "The color of blood is <span class='blue'>green</span>", correct: false, consistent: false, color_text: "green", color_visual: "blue"},
{htmlText: "The color of grass is <span class='green'>brown</span>", correct: false, consistent: false, color_text: "brown", color_visual: "green"},
{htmlText: "The color of the sky is <span class='yellow'>red</span>", correct: false, consistent: false, color_text: "red", color_visual: "yellow"},
{htmlText: "The color of wood is <span class='red'>yellow</span>", correct: false, consistent: false, color_text: "yellow", color_visual: "red"}
];

var num_tasks = phrases.length;

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}



function showModal(intromode){

	if(intromode){ // It is in intro mode
		$("#introExperimentModal").modal('show');
		$("#modalProfile").css( "visibility", "visible" );
	} else { // It is help mode
		$("#modalProfile").css( "visibility", "hidden" );
		$("#introExperimentModal").modal('show');
	}

}

function init(){
	//We do the initial shuffle of the phrases
	shuffle(phrases);

	//We hide and add behavior to the ending modal window
	$('#endModal').hide();
	$('#endModal').on('hide.bs.modal', function () {
		window.location.href = '/';
	});

	//We start the counters as soon as the modal window is closed
	$('#introExperimentModal').on('hide.bs.modal', function () {
		on_modal=false;
		if(!counters_initialized){
			initCounters();	
			counters_initialized=true;
		}
    	resumeCounters();

    	if(!intro && on_task){//if it is not the intro and we are on task, we are tracking help time
	    	var now = (new Date()).getTime();
	    	total_help_time += (now - help_timestamp);
    	}

   		intro = false; //Next time, the intro will be in help mode
  	});

  	$('#introExperimentModal').on('show.bs.modal', function () {
  		on_modal=true;
    	pauseCounters();
    	if(!intro && on_task){//if it is not the intro and we are on track, we are tracking help time
	    	help_timestamp = (new Date()).getTime();
	    }
  	});

	//We show the intro window
	showModal(intro);

	//for (i=0;i<phrases.length;i++) console.log(phrases[i].htmlText);

	//We add the function to capture keypresses
	$(document).keypress(function(e){
		if(on_task && !on_modal && current_task<num_tasks){
	    	if(e.which == 89 || e.which == 121){// pressed y
	    		if(phrases[current_task].correct) current_task_success=true;
	    		else current_task_success=false;

	    		var time = (new Date()).getTime();
	    		current_task_elapsed_time = time - current_task_timestamp;

	    		endTask();
	    	}else if(e.which == 78 || e.which == 110){// pressed n
	    		if(!phrases[current_task].correct) current_task_success=true;
	    		else current_task_success=false;

	    		var time = (new Date()).getTime();
	    		current_task_elapsed_time = time - current_task_timestamp;

	    		endTask();
	    	}else{//pressed anything else, we give brief visual feedback
	    		var oldcolor=$('#keyInstructions').css( "background-color" );
	    		$('#keyInstructions').css( "background-color" , "red");
				setTimeout(function(){
	    			$('#keyInstructions').css( "background-color" , oldcolor);
	    		}, 300);
	    	}
		}
	});


}

function initCounters(){
	//We display the big dot
	$("#pauseStimulus").show();
	$("#stimulus").hide();

	//We start and display the pause countdown
	$('#initialMessage').hide();
	$('#clocktask').hide();
	$('#clockpauses').show();
	$('#clockpauses').countdown({
			until: '+'+pause_time+'s', 
	    	layout: 'Task will start in {sn}s...',
	    	onExpiry: startTask
    	});

}

function startTask(){
	current_task_success=false;//we reset the success of the task to false
	current_task_elapsed_time = task_time*1000; //we reset the time taken to solve the puzzle
	help_timestamp = 0;
	total_help_time = 0;

	//We display the phrase
	$("#pauseStimulus").hide();
	$("#stimulus").html(phrases[current_task].htmlText);
	$("#stimulus").show();

	//We start and display the task countdown
	$('#initialMessage').hide();
	$('#clocktask').show();
	$('#clockpauses').hide();
	$('#clockpauses').countdown('option',{
			onExpiry: null
		});
	$('#clocktask').countdown({
			until: '+'+task_time+'s', 
	    	layout: '<span class="huge">{sn}</span>s',
	    	onExpiry: endTask 
	    }); //We initialize the clock
	$('#clocktask').countdown('option',{
			until: '+'+task_time+'s', 
	    	layout: '<span class="huge">{sn}</span>s',
	    	onExpiry: endTask 
	    });// In case the clock was already initialized, we restart it

	current_task_timestamp = (new Date()).getTime();

	on_task = true;
}

function endTask(){

	if(current_task<num_tasks){// Just in case, it looks like this is called two times on ending
		//We decide if the task was correct?
		console.log("ended task - correctly? "+current_task_success + " in " + (current_task_elapsed_time - total_help_time) + " ms. BTW, user colorblind " + user_profile.colorblind);
		//We send the data to the database, or store it locally
		var result = {
		  "ordinal": current_task,
		  "correct": phrases[current_task].correct,
		  "consistent": phrases[current_task].consistent,
		  "color_vis": phrases[current_task].color_visual,
		  "color_tex": phrases[current_task].color_text,
		  "outcome_corr": current_task_success,
		  "time": (current_task_elapsed_time - total_help_time)
		};
		results.push(result);

		if(current_task<(phrases.length-1)){
			//We display the big dot
			$("#pauseStimulus").show();
			$("#stimulus").hide();

			//We start and display the pause countdown
			$('#initialMessage').hide();
			$('#clocktask').hide();
			$('#clockpauses').show();
			$('#clocktask').countdown('option',{
				onExpiry: null
			});
			$('#clockpauses').countdown('option',{
					until: '+'+pause_time+'s', 
			    	layout: 'Task will start in {sn}s...',
			    	onExpiry: startTask
		    	});

			current_task++;

			//We update the progress bar
			var progress = Math.floor((current_task / num_tasks)*100);
			//console.log('trying to update progress bar to '+progress);
			$('#taskProgress').attr("aria-valuenow",progress);
			$('#taskProgress').attr("style", "width: "+progress+"%");
			$('#taskProgress').html(progress+" % done");


			on_task = false;

		} else {
			current_task++;

			//We update the progress bar
			var progress = Math.floor((current_task / num_tasks)*100);
			//console.log('trying to update progress bar to '+progress);
			$('#taskProgress').attr("aria-valuenow",progress);
			$('#taskProgress').attr("style", "width: "+progress+"%");
			$('#taskProgress').html(progress+" % done");

			finishExperiment();
		}
	}

}

function resumeCounters(){

	console.log('resuming counters');
	$('#clocktask').countdown('resume');
	$('#clockpauses').countdown('resume');

}

function pauseCounters(){

	console.log('pausing counters');
	$('#clocktask').countdown('pause');
	$('#clockpauses').countdown('pause');

}


function finishExperiment(){

	console.log("Experiment finished! go back to beginning");

	//Show modal Thankyou window with loading animation
	$('#endModal').modal('show');
	$('#closetrbutton').hide();
	$('#endBackHome').button('loading');

	//Build the JS object for the results
        var data = {
		'user_id': user_id,
		'user_profile': JSON.stringify(user_profile),
		'data': JSON.stringify(results)
	}

	//Do Ajax POST to /result/submit
	console.log(data);
	var request = $.ajax({
	  type: "POST",
	  url: "/result/submit/",
	  data: data,
	  dataType: "json"
	});
	request.always(showFinalGoodbye);

}

function showFinalGoodbye(){
	console.log("Response received!");
	$('#endBackHome').button('reset');
	$('#closetrbutton').show();

}



function showHelp(){
	showModal(intro);

	timeshelp++;
}

function storeProfile(){

	var field = document.getElementById("colorblind");
	var colorblind = field.options[field.selectedIndex].value;
	if(colorblind=="true") user_profile.colorblind = true;
	else user_profile.colorblind = false;
	// We hide the form
	$("#userProfileForm").css( "display", "none" );
	// We display a message
	var newdiv = document.createElement('div');
	newdiv.setAttribute('class','alert alert-success');
	newdiv.setAttribute('role','alert');
	newdiv.innerHTML = "<p>Thanks for the info!</p>";
	document.getElementById("modalProfile").appendChild(newdiv);

}


function formatDate(date, format, utc) {
    var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    function ii(i, len) {
        var s = i + "";
        len = len || 2;
        while (s.length < len) s = "0" + s;
        return s;
    }

    var y = utc ? date.getUTCFullYear() : date.getFullYear();
    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
    format = format.replace(/(^|[^\\])y/g, "$1" + y);

    var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
    format = format.replace(/(^|[^\\])M/g, "$1" + M);

    var d = utc ? date.getUTCDate() : date.getDate();
    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
    format = format.replace(/(^|[^\\])d/g, "$1" + d);

    var H = utc ? date.getUTCHours() : date.getHours();
    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
    format = format.replace(/(^|[^\\])H/g, "$1" + H);

    var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
    format = format.replace(/(^|[^\\])h/g, "$1" + h);

    var m = utc ? date.getUTCMinutes() : date.getMinutes();
    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
    format = format.replace(/(^|[^\\])m/g, "$1" + m);

    var s = utc ? date.getUTCSeconds() : date.getSeconds();
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
    format = format.replace(/(^|[^\\])s/g, "$1" + s);

    var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])f/g, "$1" + f);

    var T = H < 12 ? "AM" : "PM";
    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

    var t = T.toLowerCase();
    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

    var tz = -date.getTimezoneOffset();
    var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
    if (!utc) {
        tz = Math.abs(tz);
        var tzHrs = Math.floor(tz / 60);
        var tzMin = tz % 60;
        K += ii(tzHrs) + ":" + ii(tzMin);
    }
    format = format.replace(/(^|[^\\])K/g, "$1" + K);

    var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

    format = format.replace(/\\(.)/g, "$1");

    return format;
};
