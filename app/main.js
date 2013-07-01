/*global jquery:true, $:true, console:true */
var app = window.app || {},
    helper = window.helper || {},
    settings = window.settings || {},
    utils = window.utils || {};

settings = {

    //External scripts, loaded with Modernizr
    scripts: {
        paths: [
                        "//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js",
                        "components/eventEmitter/EventEmitter.js",
                        "components/eventie/eventie.js",
                        "components/imagesloaded/imagesloaded.js"
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
    }
};

app = {
    init: function(){
        //DOM ready in here
        helper.console(settings.loader.lang.en.status.ready);

    }
};

utils = {
    loader: function(command){
        switch(command){
            case "hide": 
                $(settings.loader.l).delay(450).fadeOut(150);
                break;
            case "show": 
                $(settings.loader.l).delay(450).fadeIn(150);
                break;
        }
    }
};

helper = {
    console: function(msg){
        if (settings.console.enabled){
            settings.console.msg.innerHTML += "<div>" + msg + "</div>";
        }
    }
};

//------------------------------------------------------------------- 

var SiteLoader = (function(window, Math){
    var document = window.document
      , loader = {
        onEvent: function(event, elem){
            if (elem === undefined){
                elem = 15;
            }
            settings.loader.progress += elem;
            render(event);
        }
    } 
    function render(event){
        settings.loader.loaderText.innerHTML = Math.round(settings.loader.progress);
        settings.loader.loaderUpdate.innerHTML = event;
        settings.loader.loaderBar.style.width = Math.round(settings.loader.progress) + '%';
    }
    return loader;
})(window, Math);

SiteLoader.onEvent(settings.loader.lang.en.msg.assets, 5);
helper.console(settings.loader.lang.en.status.dom);

(function(Modernizr, loader) {
    Modernizr.load({
    load: settings.scripts.paths,
    complete: function(){
        helper.console(settings.loader.lang.en.status.scripts);

        //Load our typekit fonts
        if (settings.typekit.enabled){
            SiteLoader.onEvent(settings.loader.lang.en.msg.fonts);
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
        SiteLoader.onEvent(settings.loader.lang.en.msg.images);
        
        var imgLoad = imagesLoaded(document.getElementById("app"))
          , _img = (100 - settings.loader.progress) / imgLoad.images.length;

        imgLoad.on('progress', function() {
            SiteLoader.onEvent(settings.loader.lang.en.msg.images, _img);
        }).on('always', function(){
            SiteLoader.onEvent(settings.loader.lang.en.msg.finished, 0);
            helper.console(settings.loader.lang.en.status.images);
            $(function(){
                utils.loader("hide");
                app.init();
            });
        }).on('fail', function(){
            helper.console(settings.loader.lang.en.status.err["404"]);
        });
    }
});
})(Modernizr, SiteLoader);