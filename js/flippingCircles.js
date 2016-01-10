define(["jquery", "handlebars", "utils", 'picturefill'], function (jQuery, handlebars, utils, picturefill) {
    var moduleEdit = ".moduleEdit";
    var module = "flippingCircles";
    var controlSel = "." + module + "Control";
    var configSel = "." + module + "Config";
    var templateName = module + "Template.hbs";

	var init = function (renderControl) {
	    utils.bindEditButtons(configSel);

        if (renderControl) {
            jQuery.when(utils.GetTemplate("/style library/ci/templates/" + templateName)).done(function (data) {
                var source = data;
    	        var controls = jQuery(controlSel);
    	        controls.each(function (index) {
    	            var container = jQuery(this);

    	            var settings = {};
    	            settings.Circles = [];


    	            var container = jQuery(this);
    	            var settings = {};
    	            settings.Circles = [];
    	            var circles = container.children(":first").find(configSel);
    	            circles.each(function (index) {
    	                var param = jQuery(this).find(".moduleEdit");
    	                if (index == 0) {
    	                    jQuery.extend(settings, utils.getSettingsObject(["SectionId"], param));
    	                } else {
    	                    settings.Circles.push(utils.getSettingsObject(["Name", "Description"], param));
    	                }
    	            });

    	            // var circles = container.children(":first").children(configSel);
    	            // circles.each(function (index) {
    	            //     var circle = jQuery(this);
    	            //     var param = circle.find(moduleEdit);
    	            //     var valueObj = utils.getSettingsObject(["Name", "Description"], param);
    	            //     settings.Circles.push(valueObj);
    	            // });
    	            var template = handlebars.compile(source);
    	            container.replaceWith(template(settings));
    	        });
    	    });
    	}
    };

    return{
        init: init
    }

});