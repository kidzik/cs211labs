// TODO 0: General parameters of this experiment (time for each task and pauses in between)
task_time_sym = 120; // time to do each task, in seconds
task_time_ball = 120;
task_time_dual = 120;
pause_time_single = 5; // pause between each task, in seconds
pause_time_dual = 0;

// TODO 1: Define the user profile useful for this task (to be shown as a form in the intro)
//User profile for the DUAL task
user_profile = {
	device_id: "LM",
	condition: "A", //A=stable symmetry, increasing ball; B=increasing symmetry, stable ball
	baseline_ball: 0, //Number of completed ball tasks in the last 30s of the single-task period
	baseline_sym: 0 //Number of completed symmetry tasks in the last 30s of the single-task period
};

// TODO 2: Define any experiment-specific data structures
//Data for the DUAL task
//These are the sets of shapes
var tasks_ball = [
{
	image1: "1a.png", 
	image2: "1b.png", 
	symmetrical: true 
}
];

var ball_speed = 1; //speed at which the ball falls

var increase_difficulty_ball = function(){ //Each time we call this, the difficulty increases (for now, just speed increase by 1)
	ball_speed++;
}

// TODO 3: Define the number of tasks that will make up the workflow of the experiment for one subject
num_tasks = tasks_ball.length;

// TODO 4: Define the init-specific() function with 
var game; //Do the game following this example http://examples.phaser.io/_site/view_full.html?d=games&f=invaders.js&t=invaders

function init_specific(){

	//Initialize the game
    game = new Phaser.Game(800, 600, Phaser.AUTO, 'stimulus', { preload: preload, create: create, update: update, render: render });

	//Just in case, we hide the stimulus and buttons
	$("#stimulus").hide();
	$("#stimulus-buttons").hide();

}


function preload () {

	//Load all the needed images, both for the ball, cannon and for the symmetry figures
    game.load.image('logo', 'phaser.png');

}

function create () {

    var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);

}





// TODO 5: Define the startTask() function with whatever happens at the beginning of each task (show stimuli, countdown timers, initialize task timestamps)
function startTask(){
	// This part shoud
	current_task_success=false;//we reset the success of the task to false
	current_task_elapsed_time = task_time*1000; //we reset the time taken to solve the puzzle
	help_timestamp = 0;
	total_help_time = 0;

	//Experiment-specific stuff
	//We display the phrases and the question
	$("#pauseStimulus").hide();
	$("#stimulus").html( phrases[current_task].statements + "<br/><strong>" + phrases[current_task].question + "</strong>" );
	$("#stimulus").show();

	//We generate the response buttons and their behavior
	var buttons="";
	for (i = 0; i<phrases[current_task].options.length; i++){
		if(phrases[current_task].options[i]==phrases[current_task].solution){//button for the correct solution
			buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg correct-btn">'+phrases[current_task].options[i]+'</button>';
		} else {//button for an incorrect solution
			buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg incorrect-btn">'+phrases[current_task].options[i]+'</button>';
		}
	}
	buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg incorrect-btn">I don\'t know!</button>';
	$("#stimulus-buttons").html(buttons);
	$('.correct-btn').on('click', function () {
    	if(on_task && !on_modal && current_task<num_tasks){
    		correct();
    	}
  	})
	$('.incorrect-btn').on('click', function () {
    	if(on_task && !on_modal && current_task<num_tasks){
    		incorrect();
    	}
  	})
	$("#stimulus-buttons").show();

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


	// This part should also be in all experiments, probably
	current_task_timestamp = (new Date()).getTime();
	on_task = true;
}

function correct(){
				current_task_success=true;

	    		var time = (new Date()).getTime();
	    		current_task_elapsed_time = time - current_task_timestamp;

	    		endTask();
}

function incorrect(){
				current_task_success=false;

	    		var time = (new Date()).getTime();
	    		current_task_elapsed_time = time - current_task_timestamp;

	    		endTask();
}

// TODO 6: Define the endTask() function with whatever happens at the end of each task (hide stimuli, stop timers, build task result data)
function endTask(){

	if(current_task<num_tasks){// Just in case, it looks like this is called twice on ending
		
		//This part is experiment-specific
		//We decide if the task was correct?
		console.log("ended task - correctly? "+current_task_success + " in " + (current_task_elapsed_time - total_help_time) + " ms.");
		//We send store the data locally to be sent at the end of the experiment
		var result = {
		  "ordinal": current_task,
		  "num_elements": phrases[current_task].num_elements,
		  "outcome_corr": current_task_success,
		  "time": (current_task_elapsed_time - total_help_time)
		};
		results.push(result);

		//This part is largely generic, but has some experiment-specific stuff
		if(current_task<(phrases.length-1)){

			//Experiment-specific transition between task and pause (exchange stimuli)
			//We display the big dot
			$("#pauseStimulus").show();
			$("#stimulus").hide();
			$("#stimulus-buttons").hide();

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


// TODO 7: do the finishExperiment() function with whatever happens at the end of the experiment 
// (it is mostly generic like showing the ending window, but double-check that your experiment does not need anything special here)
function finishExperiment(){

	//Show modal Thankyou window with disabled buttons while we send the results to server
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

// This is the callback function when the results are successfully sent to server, probably no changes needed
function showFinalGoodbye(){
	console.log("Results sending successful!");
	$('#endBackHome').button('reset');
	$('#closetrbutton').show();

}


// TODO 8: do the storeProfile() function that reads the user profile form and translates it to the data structure that will be sent to the server along with the results
function storeProfile(){

	//We extract the answers and put them into the user profile
	var field = document.getElementById("id_device");
	var device = field.options[field.selectedIndex].value;
	user_profile.device_id = device;

	// We hide the form
	$("#userProfileForm").css( "display", "none" );
	// We display a message
	var newdiv = document.createElement('div');
	newdiv.setAttribute('class','alert alert-success');
	newdiv.setAttribute('role','alert');
	newdiv.innerHTML = "<p>Thanks for the info!</p>";
	document.getElementById("modalProfile").appendChild(newdiv);

}

