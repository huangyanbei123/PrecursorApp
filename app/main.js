/*global jquery:true, $:true, console:true */
var app = window.app || {},
    helper = window.helper || {},
    settings = window.settings || {},
    utils = window.utils || {},
    router = window.router || {},
    view = window.view || {};

settings = {

    //External scripts, loaded with Modernizr
    scripts: {
        paths: [
                        "//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js",
                        "components/eventEmitter/EventEmitter.js",
                        "components/eventie/eventie.js",
                        "components/imagesloaded/imagesloaded.js",
                        "components/sammy.js",
                        "components/handlebars.js"
    ]},

    //Enable / disable the console
    console: {
        enabled:        true,
        msg:            document.getElementById("console")
    },

    //Enable / disable typekit
    typekit: {
        enabled:        true,
        id:             'eqy0kbp'
    },

    //Content loader
    loader: {
        l:              '#loader',
        loaderText:     document.getElementById("loader-text"),
        loaderUpdate:   document.getElementById("loader-update"),
        loaderBar:      document.getElementById("loader-bar"),
        progress:       0,
        lang: {
            en: {
                msg: {
                    initializing:   "Initializing...",
                    assets:         "Loading JS..",
                    fonts:          "Loading fonts...",
                    images:         "Loading images...",
                    finished:       "All finished!"
                },
                status: {
                    ready:          "App is ready",
                    dom:            "DOM has loaded",
                    scripts:        "Scripts have loaded",
                    fonts:          "Fonts have loaded",
                    images:         "Images have loaded",
                    err: {
                        "404":        "One or more of the images returned a 404..."
                    }
                }
            }
        }
    },

    site: { 
        template:       "#content", //Render the templates in here
        home:           "page1"     //The #hash of the first page
    }
};

//------------------------------------------------------------------- 
app = {
    run: function(){
        //DOM ready in here
        helper.console(settings.loader.lang.en.status.ready);
    }
};

//------------------------------------------------------------------- 
view = {
    render: function(route){
        //Load routed template
        $(settings.site.template).html(Handlebars.compile($("#" + route).html()));
        
        //Initialize the loader
        utils.loader.images(route);
    }
};

//------------------------------------------------------------------- 
utils = {
    loader: {
        init: function(){
            var SiteLoader = (function(window){
                var document = window.document
                return loader;
            })(window);
        },
        onEvent: function(event, elem){
            if (elem === undefined){elem = 15;}
            settings.loader.progress += elem;
            utils.loader.render(event);
        },
        render: function(event){
            settings.loader.loaderText.innerHTML = Math.round(settings.loader.progress);
            settings.loader.loaderUpdate.innerHTML = event;
            settings.loader.loaderBar.style.width = Math.round(settings.loader.progress) + '%';
        },
        command: function(command){
            switch(command){
                case "hide": 
                    $(settings.loader.l).delay(500).fadeOut(450);
                    break;
                case "show":
                    settings.loader.progress = 0;
                    utils.loader.render(settings.loader.lang.en.msg.images);
                    $(settings.loader.l).show();
                    break;
            }
        },
        images: function(route){
            var imgLoad = imagesLoaded(document.getElementById("c_" + route))
              , imagecount = imgLoad.images.length
              , _img = 100 / imagecount;

            helper.console("Loading " + imagecount + " images");

            if (imagecount !== 0){
                utils.loader.command("show");

                imgLoad.on('progress', function() {
                    utils.loader.onEvent(settings.loader.lang.en.msg.images, _img);
                }).on('always', function(){
                    utils.loader.onEvent(settings.loader.lang.en.msg.finished, 0);
                    helper.console(settings.loader.lang.en.status.images);
                    utils.loader.command("hide");
                }).on('fail', function(){
                    helper.console(settings.loader.lang.en.status.err["404"]);
                });
            } else {
                utils.loader.command("hide");
            }

        }
    }
};

//------------------------------------------------------------------- 
router = {
    init: function(route){
        helper.console('Routing is ready');
        route.mapRoutes([
            ['get', '#/', function() { 
                helper.console('Home');
                //DO SOMETHING
            }],
            ['get', '#/:frag', function() { 
                //From the router, send value to the view / template
                view.render(this.params['frag']);
            }]
        ]);
    }
};

//------------------------------------------------------------------- 
helper = {
    console: function(msg){
        if (settings.console.enabled){
            settings.console.msg.innerHTML += "<div>" + msg + "</div>";
        }
    }
};


//------------------------------------------------------------------- 
//  PAGE LOAD
//  Create the loader, and listen for changes
//-------------------------------------------------------------------

helper.console(settings.loader.lang.en.status.dom);
(function(Modernizr, loader) {
    Modernizr.load({
    load: settings.scripts.paths,
    complete: function(){
        helper.console(settings.loader.lang.en.status.scripts);

        //Load our typekit fonts
        if (settings.typekit.enabled){
            //utils.loader.onEvent(settings.loader.lang.en.msg.fonts);
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
                    try { Typekit.load(TypekitConfig); } catch (e) {}
                };
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(tk, s);
            })();
            helper.console(settings.loader.lang.en.status.fonts);
        }

        //Scripts are loaded, so load all images and report back status
        $(function(){
            //Initial run, hide the loader and run the app.
            app.run();

            //Initialize routing, then load images...
            Sammy(function() {
                router.init(this);
            }).run();
        });
    }
});
})(Modernizr);