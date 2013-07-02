/*global jquery:true, $:true, console:true */
var app = window.app || {},
    helper = window.helper || {},
    settings = window.settings || {},
    utils = window.utils || {},
    router = window.router || {},
    view = window.view || {};

settings = {
    scripts: {
        paths: [
                        "//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js",
                        "components/eventEmitter/EventEmitter.js",
                        "components/eventie/eventie.js",
                        "components/imagesloaded/imagesloaded.js",
                        "components/sammy.js",
                        "components/handlebars.js"
    ]},
    console: {
        enabled:        true,
        msg:            document.getElementById("console")
    },
    typekit: {
        enabled:        true,
        id:             'eqy0kbp'
    },
    site: { 
        template:       "#content", //Render the templates in here
        data:           null
    }
};

//------------------------------------------------------------------- 
//  APP (DOM)
//-------------------------------------------------------------------
app = {
    run: function(){
        //DOM ready in here
        helper.console("Ready &#10004;");
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
        useJquery:      true,
        loader:         document.getElementById("loader"),
        loaderText:     document.getElementById("loader-text"),
        loaderUpdate:   document.getElementById("loader-update"),
        loaderBar:      document.getElementById("loader-bar"),
        firstload:      true,
        loadpercentage: 25,
        progress:       0,
        instance:       {}, 
        init: function(){
            //TODO - Clean this up.
            if (utils.loader.firstload && settings.typekit.enabled){
                utils.loader.loadpercentage = 20;
            }
            utils.loader.onEvent("Initializing...");                         // Run the first event
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
        load: function(route){
            var total = utils.loader.loadpercentage;
            if (!utils.loader.firstload){
                total = 100;
            }
            var imgLoad = imagesLoaded(document.getElementById("v_" + route)), 
                imagecount = imgLoad.images.length,
                _img = total / imagecount;

            if (!utils.loader.instance[route]){                             //  Check if this view instance has already loaded
                helper.console("Loading " + imagecount + " images...");     //  Console :: Load count
                utils.loader.command("show");                               //  Show the loader
                imgLoad.on('progress', function(instance) {
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
                    helper.console("404 on one or more images");
                });
            }
        },
        command: function(command){
            switch(command){
                case "hide": 
                    if (!utils.loader.useJquery){
                        utils.loader.loader.style.display = "none";
                    } else {
                        var $loader = $('#loader');
                        $loader.delay(300).fadeOut(250);
                    }
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
                    if (rs && rs != 'complete' && rs != 'loaded') return;
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
            Sammy(function() {
                router.init(this);
            }).run();
        });
    }
});
})(Modernizr);