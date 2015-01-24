// TODO 0: General parameters of this experiment (time for each task and pauses in between)
var task_time_sym = 120; // time to do each task, in seconds
var task_time_ball = 120;
var task_time_dual = 120;

//For this task we need some specific timers and variables
var current_minitask_sym_success = false; //whether the current task has been successfully passed or not
var current_minitask_ball_success = false; //whether the current task has been successfully passed or not
var current_minitask_elapsed_time_sym = task_time_sym*1000; //time taken to solve this task (until keypress)
var current_minitask_elapsed_time_ball = task_time_ball*1000; //time taken to solve this task (until keypress)
var help_timestamp = 0; //moment in which we accessed the help
var total_help_time = 0; //total time spent in help during this task

var current_minitask=0;
var minitask_time_sym=10; //Time to answer the minitask about symmetry
							//For the ball game, it only depends on the time it takes to reach the ground (may change)

var results_baseline_ball = [];
var results_baseline_sym = [];


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
var tasks_sym_constant = [
{
	image1: "1a.jpg", 
	image2: "1b.jpg", 
	symmetrical: false 
}
];

var tasks_sym_increasing = [
{
	image1: "1a.jpg", 
	image2: "1b.jpg", 
	symmetrical: false 
}
];

var tasks_sym = tasks_sym_constant; //For the initial baseline test, the difficulty will not increase
var num_minitasks = tasks_sym.length;

var ball_speed = 1; //speed at which the ball falls


// TODO 3: Define the number of tasks that will make up the workflow of the experiment for one subject
num_tasks = 3; //i.e. the two single tasks, plus the dual task


// TODO 4: Define the init-specific() function with 
var game;
//Shooter game following this example http://examples.phaser.io/_site/view_full.html?d=games&f=invaders.js&t=invaders

function init_specific(){

	//Decide the condition randomly - to get equal number of people, for now we do even userids A and odd ones, B
	if(user_id % 2 == 0){
		user_profile.condition = "A";
	} 
	else{
		user_profile.condition = "B";
	} 

	//We add the behavior to capture keypresses
	$(document).keypress(function(e){
		if(on_task && !on_modal && current_minitask<num_minitasks){
	    	if(e.which == 89 || e.which == 121){// pressed y

	    		yes();

	    	}else if(e.which == 78 || e.which == 110){// pressed n

	    		no();
	    		
	    	}
		}
	});



	//Just in case, we hide the stimulus and buttons, as we begin with the pause stimulus
	$("#stimulus").hide();
	$("#stimulus-buttons").hide();

}


function preload () {

	//Load all the needed images, both for the ball, cannon and for the symmetry figures
	game.load.image('bullet', '/static/img/bullet.png');
	game.load.image('ship', '/static/img/player.png');
    game.load.spritesheet('kaboom', '/static/img/explode.png', 128, 128);
	game.load.image('invader', '/static/img/ball.png');


}

// TODO: delete the unused ones
var player;
var aliens;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var firingTimer = 0;
var livingEnemies = [];

function create () {

    //game.physics.startSystem(Phaser.Physics.ARCADE);

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);


    //  The hero!
    player = game.add.sprite(400, 500, 'ship');
    player.anchor.setTo(0.5, 0.5);
    //game.physics.enable(player, Phaser.Physics.ARCADE);

    //  The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    createBall();


    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(1, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    //TODO: This thing should be firing indefinitely... how?
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

function createBall () {

	//We randomly set where the ball will appear
	var initialx = (Math.random()*400);

    var alien = aliens.create(initialx, 50, 'invader');
    alien.anchor.setTo(0.5, 0.5);
    //alien.body.moves = false;

    aliens.x = initialx;
    aliens.y = 50;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { y: 500 }, 10000/ball_speed, Phaser.Easing.Linear.None, true, 0, 0, false);

    //  When the tween loops it calls descend
    tween.onLoop.add(touchGround, this);
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function update () {

	//Load all the needed images, both for the ball, cannon and for the symmetry figures
    game.load.image('logo', 'phaser.png');

}

function render () {

    var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);

}

function touchGround() {

    endTask();

}

function update() {

    if (player.alive)
    {
        //  Reset the player, then check for movement keys
        player.body.velocity.setTo(0, 0);

        // TODO: Add the buttons actions????
        if (cursors.left.isDown)
        {
            player.body.velocity.x = -200;
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 200;
        }

        fireBullet();

        //  Run collision
        game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
    }

}

function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    //  End the task
    endTask();
    

}

function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            //  And fire it
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }

}

function resetBullet (bullet) {

    //  Called if the bullet goes out of the screen
    bullet.kill();

}

function restart () {

    //  A new task starts
    
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    createAliens();

    //revives the player
    player.revive();

}

// TODO 5: Define the startTask() function with whatever happens at the beginning of each task (show stimuli, countdown timers, initialize task timestamps)
function startTask(){

	//Experiment-specific stuff
	$("#pauseStimulus").hide();
	$("#stimulus").show();


	// Basically, do three cases for the 3 different phases: 0-shape, 1-game, 2-dual
	if(current_task==0){//Start the shapes task

		//We do not initialize the game yet

		//We start and display the task countdown
		$('#initialMessage').hide();
		$('#clocktask').show();
		$('#clockpauses').hide();
		$('#clockpauses').countdown('option',{
				onExpiry: null
			});
		$('#clocktask').countdown({
				until: '+'+task_time_sym+'s', 
		    	layout: '<span class="huge">{mn}</span>m <span class="huge">{sn}</span>s',
		    	onExpiry: endTask 
		    }); //We initialize the clock
		$('#clocktask').countdown('option',{
				until: '+'+task_time_sym+'s', 
		    	layout: '<span class="huge">{mn}</span>m <span class="huge">{sn}</span>s',
		    	onExpiry: endTask 
		    });// In case the clock was already initialized, we restart it

		current_minitask = 0;//Initialize the number of shapes tasks within this first phase

		startMiniTask();




	} else if(current_task==1){//Start the game task


	} else if(current_task==2){//Start the dual task

		//Initialize the game?
		game = new Phaser.Game(400, 600, Phaser.AUTO, 'stimulus-game', { preload: preload, create: create, update: update });


		// Initialize the variables for this task
		current_task_sym_success = false; //whether the current task has been successfully passed or not
		current_task_ball_success = false; //whether the current task has been successfully passed or not
		current_task_elapsed_time_sym = task_time_sym*1000; //time taken to solve this task (until keypress)
		current_task_elapsed_time_ball = task_time_ball*1000; //time taken to solve this task (until keypress)
		help_timestamp = 0; //moment in which we accessed the help
		total_help_time = 0; //total time spent in help during this task

		//Depending on the condition, assign the right set of symmetry tasks to tasks_sym
		if(user_profile.condition=="A") tasks_sym = tasks_sym_constant;
		else tasks_sym = tasks_sym_increasing;

	}




	//We generate the response buttons and their behavior
	// var buttons="";
	// for (i = 0; i<phrases[current_task].options.length; i++){
	// 	if(phrases[current_task].options[i]==phrases[current_task].solution){//button for the correct solution
	// 		buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg correct-btn">'+phrases[current_task].options[i]+'</button>';
	// 	} else {//button for an incorrect solution
	// 		buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg incorrect-btn">'+phrases[current_task].options[i]+'</button>';
	// 	}
	// }
	// buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg incorrect-btn">I don\'t know!</button>';
	// $("#stimulus-buttons").html(buttons);
	// $('.correct-btn').on('click', function () {
 //    	if(on_task && !on_modal && current_task<num_tasks){
 //    		correct();
 //    	}
 //  	})
	// $('.incorrect-btn').on('click', function () {
 //    	if(on_task && !on_modal && current_task<num_tasks){
 //    		incorrect();
 //    	}
 //  	})
	// $("#stimulus-buttons").show();




	// This part should also be in all experiments, probably
	current_task_timestamp = (new Date()).getTime();
	on_task = true;
}


function startMiniTask(){

		if(tasks_sym[current_minitask]){ //If we have enough shape tasks to show yet
			$("#shape-left").append("<img id='image1' src='/static/img/"+tasks_sym[current_minitask].image1+"'/>");			
			$("#shape-right").append("<img id='image2' src='/static/img/"+tasks_sym[current_minitask].image2+"'/>");
			$("#shape-left").show();
			$("#shape-right").show();	
		}

		//We generate the response buttons and their behavior
		var buttons="";
		if(tasks_sym[current_minitask].symmetrical){//The shapes are symmetric, so the good response is Y
			buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg correct-btn">Yes</button>';
			buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg incorrect-btn">No</button>';
		} else {//button for N is the correct solution
			buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg incorrect-btn">Yes</button>';
			buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg correct-btn">No</button>';
		}
		buttons += 	'&nbsp;<button type="button" class="btn btn-default btn-lg incorrect-btn">I don\'t know!</button>';
		$("#stimulus-buttons").html(buttons);
		$('.correct-btn').on('click', function () {
	    	if(on_task && !on_modal && current_minitask<num_minitasks){
	    		correct();
	    	}
	  	})
		$('.incorrect-btn').on('click', function () {
	    	if(on_task && !on_modal && current_minitask<num_minitasks){
	    		incorrect();
	    	}
	  	})
		$("#stimulus-buttons").show();


		//We start and display the minitask countdown
		$('#clockminitask').show();
		$('#clockminitask').countdown({
				until: '+'+task_time_sym+'s', 
		    	layout: '<span class="huge">{sn}</span>s',
		    	onExpiry: endTask 
		    }); //We initialize the clock
		$('#clockminitask').countdown('option',{
				until: '+'+task_time_sym+'s', 
		    	layout: '<span class="huge">{sn}</span>s',
		    	onExpiry: endTask 
		    });// In case the clock was already initialized, we restart it


}

function yes(){//A yes has been registered... is it correct?
	if(current_task == 0 || current_task == 2){// This does not apply to the single task game task
		if(tasks_sym[current_minitask].symmetrical) correct();
		else incorrect();
	}

}

function no(){//A yes has been registered... is it correct?
	if(current_task == 0 || current_task == 2){// This does not apply to the single task game task
		if(!tasks_sym[current_minitask].symmetrical) correct();
		else incorrect();
	}

}

function correct(){
				current_minitask_success=true;

	    		var time = (new Date()).getTime();
	    		current_minitask_elapsed_time = time - current_minitask_timestamp;

	    		endMiniTask();
}

function incorrect(){
				current_minitask_success=false;

	    		var time = (new Date()).getTime();
	    		current_minitask_elapsed_time = time - current_minitask_timestamp;

	    		endMiniTask();
}



function endMiniTask(){

	if(current_minitask<num_minitasks){// Just in case, it looks like this is called twice on ending
		
		//This part is experiment-specific
		//We decide if the task was correct?
		console.log("ended minitask - correctly? ball "+current_minitask_ball_success + "  sym "+current_minitask_sym_success + "in ball " + (current_task_elapsed_time_ball - total_help_time) + " ms. sym " + (current_task_elapsed_time_sym - total_help_time) + " ms.");
		//We send store the data locally to be sent at the end of the experiment
		var result = {
		  "ordinal": current_minitask,
		  "outcome_ball_corr": current_minitask_ball_success,
		  "time_ball": (current_minitask_elapsed_time_ball - total_help_time),
		  "outcome_sym_corr": current_minitask_sym_success,
		  "time_sym": (current_minitask_elapsed_time_sym - total_help_time),
		};


		if(current_task==0){ // If we are in the symmetry baseline, we add it to another array of results, which will be used to calculate the baseline
			results_baseline_sym.push(result);
		} else if(current_task==1){ // If we are in the symmetry baseline, we add it to another array of results, which will be used to calculate the baseline
			results_baseline_ball.push(result);
		} else if(current_task==2){ // It is the dual task, we really add it to the results array
			results.push(result);
		}

		//This part is largely generic, but has some experiment-specific stuff
		if(current_minitask<(tasks_sym.length-1)){

			//Experiment-specific transition between task and pause (exchange stimuli)
			current_minitask++;

			//TODO: We reset the minitask
			if(current_task==0){ // If we are in the symmetry baseline

			} else if(current_task==1){ // If we are in the symmetry baseline

			} else if(current_task==2){ // It is the dual task

			}


		} else {
			current_minitask++;

			endTask();
		}
	}

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

