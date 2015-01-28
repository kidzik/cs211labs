// TODO 0: General parameters of this experiment (time for each task and pauses in between)
task_time = 60; // time to do each task, in seconds
pause_time = 1; // pause between each task, in seconds


// TODO 1: Define the user profile useful for this task (to be shown as a form in the intro)
//User profile for the STROOP task
user_profile = {
    device_id: "LM"
};

var help_hits;

// TODO 3: Define the number of tasks that will make up the workflow of the experiment for one subject
num_tasks = 4;

// TODO 2: Define any experiment-specific data structures
//Data for the GENEALOGY task
//These are the sets of logical elements
var cities = ["Geneve", "Lausanne", "Zurich", "Fribourg", "Basel", "Neuchatel", "Davos"]

var fares = ["standard", "young", "half-fare"]
var travel = ["one-way", "return"]
var bike = ["yes", "no"]

var interfaces = ["command", "graphical", "form", "dragdrop"]

function generate_ticket(){
    var nfare = Math.floor(Math.random() * fares.length); 
    var nfrom = Math.floor(Math.random() * cities.length); 
    var ntravel = Math.floor(Math.random() * travel.length); 
    var nto;
    do {
	nto = Math.floor(Math.random() * cities.length);
    }
    while (nfrom == nto);

    var ticket = []
    ticket['from'] = cities[nfrom];
    ticket['to'] = cities[nto];
    ticket['travel'] = travel[ntravel]
    ticket['bike'] = Math.random() > 0.5;
    ticket['fare'] = fares[nfare];
    ticket['travelClass'] = Math.floor(Math.random() * 2) + 1

    return ticket;
}

var tickets = [];

for (var i = 0; i < num_tasks; i++){
    tickets.push(generate_ticket());
}

function get_command_for_ticket(ticket){
    var command = "Please order a ";
    command += ticket.fare + " ";
    command += ticket.travel + " ";
    var cls = "1st class ticket ";
    if (ticket.travelClass == 2)
	cls = "2nd class ticket ";
    command += cls;
    command += "from " + ticket.from + " ";
    command += "to " + ticket.to + " ";
    if (ticket.bike)
	command += "with a bike";
    else
	command += "without bike";
    command += ".";
    return command;
}


// TODO 4: Define the init-specific() function with 
function init_specific(){
    shuffle(interfaces);

    //Just in case, we hide the stimulus and buttons
    $("#stimulus").hide();
    $("#stimulus-buttons").hide();

    $("#help-button").click(function(){
	help_hits++;
    });
}

function get_current_interface(){
    return interfaces[Math.floor(current_task * interfaces.length / num_tasks)];
}


// TODO 5: Define the startTask() function with whatever happens at the beginning of each task (show stimuli, countdown timers, initialize task timestamps)
function startTask(){
    // This part shoud
    current_task_success=false;//we reset the success of the task to false
    current_task_elapsed_time = task_time*1000; //we reset the time taken to solve the puzzle
    help_timestamp = 0;
    total_help_time = 0;
    help_hits = 0;
    

    //Experiment-specific stuff
    //We display the phrases and the question
    $("#pauseStimulus").hide();

    $("#interface").show();
    $("#interface").load(STATIC_URL + "html/TRAIN-" + get_current_interface() + ".html");
    $("#keyInstructions").html(get_command_for_ticket(tickets[current_task]));

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

function interface_result(ticket){
// TODO
    if (Math.random() > 0.5)
	correct();
    else
	incorrect();
    return;

    ticket.bike = (ticket.bike=="yes")?true:false;
    ticket.travelClass = parseInt(ticket.travelClass);

    if (tickets[current_task].from == ticket.from &&
       tickets[current_task].to == ticket.to &&
       tickets[current_task].travel == ticket.travel &&
       tickets[current_task].bike == ticket.bike &&
       tickets[current_task].fare == ticket.fare &&
       tickets[current_task].travelClass == ticket.travelClass){
	correct();
    }
    else
	incorrect();
}

function correct(){
    current_task_success = true;
    endTask();
}

function incorrect(){
    current_task_success = false;
    endTask();
}

// TODO 6: Define the endTask() function with whatever happens at the end of each task (hide stimuli, stop timers, build task result data)
function endTask(){
    var time = (new Date()).getTime();
    current_task_elapsed_time = time - current_task_timestamp;

    $("#interface").hide();

    if(current_task<num_tasks){// Just in case, it looks like this is called twice on ending
	
	//This part is experiment-specific
	//We decide if the task was correct?
	console.log("ended task - correctly? "+current_task_success + " in " + (current_task_elapsed_time - total_help_time) + " ms.");
	//We send store the data locally to be sent at the end of the experiment
	var result = {
	    "ordinal": current_task,
	    "interface": get_current_interface(),
	    "outcome_corr": current_task_success,
	    "help": help_hits,
	    "time": (current_task_elapsed_time - total_help_time)
	};
	results.push(result);

	//This part is largely generic, but has some experiment-specific stuff
	if(current_task<(num_tasks-1)){

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

