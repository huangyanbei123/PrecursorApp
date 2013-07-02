/*global jquery:true, $:true, console:true */
var app = window.app || {},
	helper = window.helper || {},
	settings = window.settings || {},
	utils = window.utils || {},
	router = window.router || {},
	view = window.view || {},
	test = window.test || {};

settings = {
	scripts: {
		paths: [
					"//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js",
					"components/eventEmitter/EventEmitter.js",
					"components/eventie/eventie.js",
					"components/imagesloaded/imagesloaded.js",
					"components/sammy.js",
					"components/handlebars.js",
					"//connect.soundcloud.com/sdk.js"
	]},
	console: {
		enabled:    true,
		msg:        document.getElementById("console")
	},
	typekit: {
		enabled:    false,
		id:         'eqy0kbp'
	},
	api: {
		enabled: 	true
	},
	site: { 
		template:   	"#content", //Render the templates in here
		data: {
			soundcloud: {
				set: 	"electronic-nightmares"
			}
		},
		client_id: 		'c2a76ad6fcc6e1f66034336ee1e469d7',
		redirect_uri: 	'http://dev.local/devsite02/',
		set_id: 		'611534'
	}
};

//------------------------------------------------------------------- 
//  APP (DOM)
//-------------------------------------------------------------------
app = {
	run: function(){
		//DOM ready in here
		helper.console("Ready &#10004;");
	},
	soundcloud: function(){
		SC.initialize({
			client_id: settings.site.client_id,
			redirect_uri: settings.site.redirect_uri
		});
		helper.console("Fetching data...")
		return $.ajax({
			type: "get",
			url: "http://api.soundcloud.com/playlists/"+ settings.site.set_id + ".json?client_id=" + settings.site.client_id, 
			success: function(data){
				settings.site.data.soundcloud.setdata = data;
			},
			error: function(xhr, status, error) {
			  	var err = eval("(" + xhr.responseText + ")");
			  	helper.console(err.Message);
			}
		});
	}
};

//-------------------------------------------------------------------
//  ROUTER
//-------------------------------------------------------------------
router = {
	init: function(route){
		helper.console('Routing &#10004;');
		route.mapRoutes([
			['get', '#/:frag', function() { 
				router.render(this.params['frag']);
				helper.console("* " + this.params['frag']);
			}]
		]);
	},
	render: function(route){
		var template = Handlebars.compile($("#" + route).html());
		$(settings.site.template).html(template(settings.site.data));

		utils.loader.load(route);
	}
};

//------------------------------------------------------------------- 
//  UTILS
//-------------------------------------------------------------------
utils = {
	loader: {
		loader:         document.getElementById("loader"),
		loaderText:     document.getElementById("loader-text"),
		loaderUpdate:   document.getElementById("loader-update"),
		loaderBar:      document.getElementById("loader-bar"),
		firstload:      true,
		loadpercentage: 20,
		progress:       0,
		itemstoload: 	0,
		instance:       {},		//Create an instance for each loaded item 

		init: function(){

			if (utils.loader.firstload){ 
				utils.loader.itemstoload += 3;	//WINDOW|DOM|SCRIPTS -
			}
			if (settings.typekit.enabled){
				utils.loader.itemstoload += 1;	//FONTS
			}
			if (settings.api.enabled){
				utils.loader.itemstoload += 1;
			}
			utils.loader.loadpercentage = 100 / utils.loader.itemstoload;
		},
		onEvent: function(msg, count){
			if (count === undefined){
				count = utils.loader.loadpercentage;
			}
			utils.loader.progress += count;
			utils.loader.render(msg);
		},
		render: function(msg){
			utils.loader.loaderText.innerHTML = Math.round(utils.loader.progress);
			utils.loader.loaderBar.style.width = Math.round(utils.loader.progress) + '%';
			utils.loader.loaderUpdate.innerHTML = msg;
		},
		eventHandler: function(command){
			helper.console(command);
		},
		load: function(route){
			var total = utils.loader.loadpercentage;
			if (!utils.loader.firstload){
				total = 100; //Percent
			}
			var view = imagesLoaded(document.getElementById("v_" + route)), 
				imagecount = view.images.length,
				_img = total / imagecount;

			if (!utils.loader.instance[route]){                             //  Check if this view instance has already loaded
				helper.console("Loading: " + imagecount + " imgs");     	//  Console :: Load count
				utils.loader.command("show");                               //  Show the loader
				view.on('progress', function(instance) {
					utils.loader.onEvent("Loading images...", _img);        //  Update the loader per image
				}).on('always', function(instance){
					utils.loader.instance[route] = instance.isComplete;     //  Set the view instance to true
					utils.loader.command("hide");                           //  Hide the loader
					helper.console("Assets &#10004;");                      //  Console :: success
					if (utils.loader.firstload){
						app.run();                                          //  DOM READY (run once)..
					}
					utils.loader.firstload = false;                         //  Set firstload to false
				}).on('fail', function(instance){
					helper.console("Asset 404...");
				});
			} else {
				utils.loader.command("hide");                               //  Hide the loader
			}
		},
		command: function(command){
			switch(command){
				case "hide": 
					var $loader = $('#loader');
						$loader.delay(300).fadeOut(250, function(){
							$(settings.site.template + ' .page').fadeIn(200);
						});

					setTimeout(function(){
						utils.loader.progress = 0;
						utils.loader.loaderBar.style.width = '0%';
						utils.loader.loaderText.innerHTML = '0';
					}, 550)
					break;
				case "show":
					utils.loader.loader.style.display = "block";
					break;
			}
		}
	}
};

//------------------------------------------------------------------- 
//  HELPERS
//-------------------------------------------------------------------
helper = {
	init: function(){
		if (settings.console.enabled){
			document.getElementById("app").className += " console";
		}
	},
	console: function(msg){
		if (settings.console.enabled){
			settings.console.msg.innerHTML += "<div>" + msg + "</div>";
		} else {
			settings.console.msg.style.display = "none";
		}
	}
};

//------------------------------------------------------------------- 
//  PAGE LOAD
//  Create the loader, and listen for changes
//-------------------------------------------------------------------
utils.loader.init();
helper.init();

(function(Modernizr) {
	Modernizr.load({
	load: settings.scripts.paths,
	complete: function(){
		helper.console("Scripts &#10004;");
		utils.loader.onEvent("Scripts loaded...");
		if (settings.typekit.enabled){
			TypekitConfig = {
				kitId: settings.typekit.id,
				scriptTimeout: 3000
			};
			(function() {
				var t = setTimeout(function() {
				}, TypekitConfig.scriptTimeout);
				var tk = document.createElement('script');
				tk.src = '//use.typekit.com/' + TypekitConfig.kitId + '.js';
				tk.onload = tk.onreadystatechange = function() {
					var rs = this.readyState;
					if (rs && rs !== 'complete' && rs !== 'loaded') return;
					clearTimeout(t);

					utils.loader.onEvent("Fonts loaded...");
					helper.console("Fonts &#10004;");

					try { Typekit.load(TypekitConfig); } catch (e) {}
				};
				var s = document.getElementsByTagName('script')[0];
				s.parentNode.insertBefore(tk, s);
			})();
		}
		utils.loader.onEvent("Assets loaded...");

		$(function(){
			if (settings.api.enabled){
				utils.loader.onEvent("Fetching data...");
				$.when(app.soundcloud()).done(function(data){
					helper.console("API &#10004;");
					route();
				});
			} else {
				route();
			}
			function route(){
				Sammy(function() {
					router.init(this);
				}).run();
			}
		});
		//
	}
});
})(Modernizr);