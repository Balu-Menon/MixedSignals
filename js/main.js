/**
 * @name RequireJS Setup
 * @desc Responsible for setting up requirejs,
 *       then loading the main app
 */


//--------------------Start Environment Detection
var localEnvironment = {
	Environment : "/Style Library/CI_custom/js/", //default Environment
	Host : document.location.host
};
var EnvironmentDef = 
	[
	{host:"www.conservation.org" , cdn:"/Style Library/CI/"},
	{host:"sp13.conservation.org",cdn:"/Style Library/CI/"},
	{host:"vm-sp13test",cdn:"http://webcdn.conservation.org.s3.amazonaws.com/test/"},
	{host:"vm-sp13dev",cdn:"http://webcdndev.conservation.org/dev/"}
	]

	$.each(EnvironmentDef, function(index, value)
	{
		if(localEnvironment.Host==value.host){localEnvironment.Environment=value.cdn;};
	});
	window.CIEnvironment = localEnvironment.Environment; //Set global variable for detected environment	
//--------------------End Environment Detection

//--------------------Start Language Detection
var pageHostArray=document.location.href.split('/');
CICurrentLocale="CI_i18n_enUS"; //Default Locale
if(pageHostArray[3]=="global")
{
	if(pageHostArray[4]=="brasil"){CICurrentLocale="CI_i18n_ptBR";}
	if(pageHostArray[4]=="japan"){CICurrentLocale="CI_i18n_JP";}
}

window.CILocale = window.CIEnvironment +"js/plugins/locales/" +CICurrentLocale +".js" ; //Set global variable locale	
//--------------------End Language detection



define('jquery', [], function () {
    return window.jQuery;
});

requirejs.config({
    baseUrl: '/style library/ci/js',
    // urlArgs: 'bust=' + (new Date()).getTime(), // ONLY USE FOR LOCAL DEVELOPMENT

    paths: {
        jquery: 'vendor/jquery',
        underscore: 'vendor/underscore',
        enquire: 'vendor/enquire',
        handlebars: 'handlebars',
        picturefill: 'vendor/picturefill',
        mapbox: 'vendor/mapbox',
        knockout: 'vendor/knockout-3.1.0'

    },

    shim: {
        jquery: {
            exports: '$'
        },
        'plugins/jquery.selectreplace': {
            deps: ['jquery']
        },
        underscore: {
            exports: '_'
        },
        handlebars: {
            exports: 'Handlebars'
        },
        main: {
            deps: ['jquery', 'underscore', 'enquire', 'picturefill']
        }
        
    }

});

define('main', ['lib/view', 'global/site-header', 'underscore'], function (view, siteheader, _) {

    // init form input placeholders
    Modernizr.load({
        'test': Modernizr.input.placeholder,
        'nope': "/style library/ci/js/vendor/jquery.placeholder.js",
        'complete': function () {
            if (!Modernizr.input.placeholder) {
                var objs = $('input[placeholder], textarea[placeholder]');
                objs.each(function () { jQuery(this).placeholder(); });
            }
        }
    });

    function subscribeSubmit(newsletterDiv, email)
    {
        // google tag manager
        dataLayer.push({'event': 'emailSubmissionSock'});
        var conviourl = "http://getinvolved.conservation.org/site/CRConsAPI?";
        conviourl += "method=create&";
        conviourl += "v=1.0&";
        conviourl += "api_key=a35edff24047cce9c57a94e7-505472176&";
        conviourl += "primary_email=" + email + "&";
        conviourl += "no_welcome=false";
        
        //if you can do XDomainRequest in IE
		 if (window.XDomainRequest) {
			ieSubmit(conviourl, newsletterDiv);
		 }
		//all other browsers
		 else{
			otherBrowsersSubmit(conviourl, newsletterDiv);
		 }
    }
    
	function otherBrowsersSubmit(conviourl,newsletterDiv){
	//start Non-IE
		jQuery.support.cors = true;
        var jqxhr = jQuery.post(conviourl, function(data)
        {
            //alertDisp(email + " was added to the conservation.org mailing list");
        })

        .done(function(data, textStatus, jqXHR)
        {
            var newsletterForm = newsletterDiv.find(".footerNewsletterForm");
            var confirmationMessage = newsletterForm.siblings(".footerNewsletterConfirmation");
            newsletterForm.addClass('twoColumnHide');
            confirmationMessage.removeClass('twoColumnHide');
        })


        .fail(function(jqXHR, textStatus, errorThrown)
        {
            var code = jQuery(jqXHR.responseText).find("code").text();
            if (code == "11")
            {
                var newsletterForm = newsletterDiv.find(".footerNewsletterForm");
                var confirmationMessage = newsletterForm.siblings(".footerNewsletterConfirmation");
                newsletterForm.addClass('twoColumnHide');
                confirmationMessage.removeClass('twoColumnHide');
            }
            else
            {
                newsletterDiv.find(".emailError").removeClass('twoColumnHide');
            }
        });
	//end non-IE
	}

	//submit via IE
	function ieSubmit(conviourl,newsletterDiv){
		xdr = new XDomainRequest(); // Create a new XDR object.
		if (xdr) {
			//Convio throws an error - in this case it will also throw an error if the user already exists
			xdr.onerror = function(){
                newsletterDiv.find(".emailError").text("Your email address was not able to be added because we already have it in our system or you entered an invalid address.");
                newsletterDiv.find(".emailError").removeClass('twoColumnHide');
			};
			
			// This event is raised when the request reaches its timeout. 
			xdr.ontimeout = function(){
			};
			
			// When the object starts returning data, the onprogress event 
			// is raised and the data can be retrieved by using responseText.
			xdr.onprogress = function(){
			};
			
			// When the object is complete, the onload event is raised and 
			// the responseText ensures the data is available. 
			xdr.onload = function(){
	            var newsletterForm = newsletterDiv.find(".footerNewsletterForm");
	            var confirmationMessage = newsletterForm.siblings(".footerNewsletterConfirmation");
	            newsletterForm.addClass('twoColumnHide');
	            confirmationMessage.removeClass('twoColumnHide');
			};
			
			// The URL is preset in the text area. This is passed in the 
			// open call with a get request.
			xdr.open("post", conviourl);
			
			// The request is then sent to the server.  
			xdr.send();
		}
	}

    function initializeModules() {
    
// Start FOUD fix part 1
// Show the content area previously hidded on masterpage to avoid FOUC
// If there is any module, the content will only be displayed again after the first module is done
		hasScrolled=false;
	   	jQuery(document).ajaxComplete(function(){
			//Show the invisible container again
	   		jQuery('div.container').css('visibility','visible');
		
    	});
// End FOUC fix


        var contentRegion = jQuery("#contentBox");
        moduleSelectors = [
        					//Old Press Releases Page activation test
        					
        					{ moduleSelector: "div.request-interview-box", moduleJS: "rowDivider" },
        					//Updated Intro Photo Large
        					//{ moduleSelector: "div.heroSP", moduleJS: "hero" },
        					{ moduleSelector: "div.heroSP", moduleJS: localEnvironment.Environment +"js/hero.min.js?version=20150804" },
        					
							{ moduleSelector: "div.flippingCirclesControl", moduleJS: "flippingCircles" },
							{ moduleSelector: "div.storyItemControl", moduleJS: "storyItem" },
							{ moduleSelector: "div.twoColumnDonateNewsletterControl", moduleJS: "twoColumnDonateNewsletter" },
							//Temporary module for NIS-Brazil launch
							{ moduleSelector: "div.twoColumnDonateNewsletterControlBrazil", moduleJS: "twoColumnDonateNewsletterBrazil" },
							{ moduleSelector: "div.publicationBrowserWrapper", moduleJS: "publicationbrowser" },
							{ moduleSelector:"div.wrapperNewsRoom",moduleJS:"newsroombrowser"},
							{ moduleSelector: "div.donateControl", moduleJS: "donate" },
							{ moduleSelector: "div.threeImagesControl", moduleJS: "threeImages" },
                            //Old na New Emails Signup Module
  							{ moduleSelector:"div.newsletterControl",moduleJS: localEnvironment.Environment +"js/newsletter.min.js?version=20150804"},
                            { moduleSelector:"div.newsletter2Control", moduleJS: localEnvironment.Environment +"js/newsletter2.min.js?version=20150804" },
                            //{ moduleSelector: "div.hugeCarouselControl", moduleJS: "hugeCarousel" }, //UPDATED on 03-17-2015
                            { moduleSelector: "div.hugeCarouselControl", moduleJS: window.CIEnvironment +"js/hugeCarousel.min.js?version=20150430" },
		                    //{ moduleSelector: "div.heroMultiControl", moduleJS: "heroMulti" },//UPDATED on 03-17-2015
							{ moduleSelector: "div.heroMultiControl", moduleJS: window.CIEnvironment +"js/heroMulti.min.js?version=20150430" },
							//{ moduleSelector: "div.threeColumnTextControl", moduleJS: "threeColumnText" },
							{ moduleSelector: "div.threeColumnTextControl", moduleJS: window.CIEnvironment +"js/threeColumnText.min.js?version=20150430" },
                            //{ moduleSelector: "div.defaultCarouselControl", moduleJS: "defaultCarousel" },
                            { moduleSelector: "div.defaultCarouselControl", moduleJS: window.CIEnvironment +"js/defaultCarousel.min.js?version=20150430" },
							//{ moduleSelector: "div.defaultCarouselFullWidthControl", moduleJS: "defaultCarouselFullWidth" },
                            { moduleSelector: "div.defaultCarouselFullWidthControl", moduleJS: window.CIEnvironment +"js/defaultCarouselFullWidth.min.js?version=20150430" },
                            //{ moduleSelector: "div.galleryCarouselControl", moduleJS: "galleryCarousel" },
                            { moduleSelector: "div.galleryCarouselControl", moduleJS: window.CIEnvironment +"js/galleryCarousel.min.js?version=20150430" },
                            //{ moduleSelector: "div.videoGalleryCarouselControl", moduleJS: "videoGalleryCarousel" },
                            { moduleSelector: "div.videoGalleryCarouselControl", moduleJS: window.CIEnvironment +"js/videoGalleryCarousel.min.js?version=201500520" },
                            //{ moduleSelector: "div.sectionNavControl", moduleJS: "sectionNav" },
                            { moduleSelector: "div.sectionNavControl", moduleJS: window.CIEnvironment +"js/sectionNav.min.js?version=20150430" },
                            //{ moduleSelector: "div.pkBoxBlueControl", moduleJS: "pkBoxBlue" },
                            { moduleSelector: "div.pkBoxBlueControl", moduleJS: window.CIEnvironment +"js/pkBoxBlue.min.js?version=20150430" },
                            //{ moduleSelector: "div.partsKitControl", moduleJS: "partsKit" },
                            { moduleSelector: "div.partsKitControl", moduleJS: window.CIEnvironment +"js/partsKit.min.js?version=20150430" },
                            //{ moduleSelector: "div.publicationCarouselMetadata2Control", moduleJS: "publicationCarouselMetadata2" },
                            { moduleSelector: "div.publicationCarouselMetadata2Control", moduleJS: window.CIEnvironment +"js/publicationCarouselMetadata2.min.js?version=20150430" },
							// New Publications Carousel Individual Items
                            { moduleSelector: "div.publicationCarouselIndividualControl", moduleJS: window.CIEnvironment +"js/publicationCarouselIndividual.min.js?version=20150430" },
                            //New Country Press Releases Browser Module
                            { moduleSelector: "div.PressReleaseControl", moduleJS: localEnvironment.Environment +"js/pressRelease.min.js?version=20150520"}, 
							// New Country Press Releases Search Results							
							{ moduleSelector: "div.PressReleasesSearchResults", moduleJS: localEnvironment.Environment +"js/pressReleasesSearchResults.min.js?version=201500520"}, 
							//{ moduleSelector: "div.videoCustomControl", moduleJS: "videoModuleCustom" },
							{ moduleSelector: "div.videoCustomControl", moduleJS:  localEnvironment.Environment +"js/videoModuleCustom.min.js?version=20150520" },
							//{ moduleSelector: "div.videoControl", moduleJS: "videoModule" },
							{ moduleSelector: "div.videoControl", moduleJS: localEnvironment.Environment +"js/videoModule.min.js?version=20150604" },
							//{ moduleSelector: "div.smallVideoCarouselControl", moduleJS: "smallVideoCarousel" },
							{ moduleSelector: "div.smallVideoCarouselControl", moduleJS: localEnvironment.Environment +"js/smallVideoCarousel.min.js?version=20150626" },
							//New Map module
							{ moduleSelector: "div.CICustomMapControl", moduleJS: localEnvironment.Environment +"js/CIMap.min.js?version=20150624"}, //Where we work map module
							//New Images Carousel (4 w rollover text w/ ediatable readmore field)
							{ moduleSelector: "div.defaultCarouselFullWidthCustomControl", moduleJS: window.CIEnvironment +"js/defaultCarouselFullWidthCustom.min.js?version=20150625" },
							//New Images Thumbnail List
							{ moduleSelector: "div.partsKitImageControl", moduleJS: localEnvironment.Environment +"js/partsKitImage.min.js?version=20150626" },
							//{ moduleSelector: "div.spreadTheWordControl", moduleJS: "spreadTheWord" },
							{ moduleSelector: "div.spreadTheWordControl", moduleJS: localEnvironment.Environment +"js/spreadTheWord.min.js?version=20150626" },
							//CTA3Across with custom Twitter Text
   							{ moduleSelector: "div.spreadTheWordCustomControl", moduleJS: localEnvironment.Environment +"js/spreadTheWordCustom.min.js?version=20150824" },                            
                            //{ moduleSelector: "div.wcydControl", moduleJS: "wcyd" },
                            { moduleSelector: "div.wcydControl", moduleJS: localEnvironment.Environment +"js/wcyd.min.js?version=20150626" },
							//CTA3Across with bg image and custom Twitter Text
		                    { moduleSelector: "div.wcydCustomControl", moduleJS: localEnvironment.Environment +"js/wcydCustom.js?version=20150824" },							
		                    //{ moduleSelector: "div.giveToCIControl", moduleJS: "giveToCI" },
		                    { moduleSelector: "div.giveToCIControl", moduleJS: localEnvironment.Environment +"js/giveToCI.min.js?version=20150626" },
                            //{ moduleSelector: "div.ourWorkControl", moduleJS: "ourWork" },
                            { moduleSelector: "div.ourWorkControl", moduleJS: localEnvironment.Environment +"js/ourWork.min.js?version=20150626" },
   							//{ moduleSelector: "div.fourResultCirclesControl", moduleJS: "fourResultCircles" },
   							{ moduleSelector: "div.fourResultCirclesControl", moduleJS: localEnvironment.Environment +"js/fourResultCircles.min.js?version=20150626" },
							//{ moduleSelector: "div.threeCirclesControl", moduleJS: "threeCircles" },
							{ moduleSelector: "div.threeCirclesControl", moduleJS: localEnvironment.Environment +"js/threeCircles.min.js?version=20150626" },
                            //{ moduleSelector: "div.fourCirclesControl", moduleJS: "fourCircles" },
							{ moduleSelector: "div.fourCirclesControl", moduleJS: localEnvironment.Environment +"js/fourCircles.min.js?version=20150626" },
							//New Ammado Donate form
							{ moduleSelector: "div.donateAmmadoControl", moduleJS: localEnvironment.Environment +"js/donateAmmado.min.js?version=20150908" },							
							//Get involved with tweaked css for mobile view                            
							{ moduleSelector: "div.getInvolvedHeroControl", moduleJS: localEnvironment.Environment +"js/getInvolvedHero.min.js?version=20150908" },
							// CI Experts Module							
   							{ moduleSelector: "div.ExpertsBrowserControl", moduleJS: localEnvironment.Environment +"js/expertsBrowser.min.js?version=20150106" },                            
							{ moduleSelector: "div.ExpertDetailsControl", moduleJS: localEnvironment.Environment +"js/expertsDetails.min.js?version=20150106" },                            
							// Translation on press releases pages
							{ moduleSelector: "div.request-interview-box", moduleJS: localEnvironment.Environment +"js/requestinterview.min.js?version=20150925"},
							// NIS Circles 4 Across
							{ moduleSelector: "div.NISCirclesControl", moduleJS: localEnvironment.Environment +"js/NISCircles.min.js?version=20151028" },							   					        
							// NIS Carousel
							{ moduleSelector: "div.NISCarouselControl", moduleJS: localEnvironment.Environment +"js/NISCarousel.min.js?version=20151028"}, 
							// NIS Youtube Playlist					        							
   					        { moduleSelector: "div.NISVideoControlYT", moduleJS: localEnvironment.Environment +"js/NISVideoControlYT.min.js?version=20151028"},
							// NIS Social Share
							{ moduleSelector: "div.NISSocialShareControl", moduleJS: localEnvironment.Environment +"js/NISSocialShare.min.js?version=20151115" },							
							//Senior Staff Page Controller
                            { moduleSelector: "div.CISenior", moduleJS: localEnvironment.Environment +"js/CISenior.min.js?version=20150106" },
							//Infographic Module
   							{ moduleSelector: "div.CIInfographicsControl", moduleJS: localEnvironment.Environment +"js/CIInfographics.min.js?version=20150108" },							
                            
		                    { moduleSelector: "div.stickyNavControl", moduleJS: "stickyNav" },
		                    { moduleSelector: "div.rowDividerControl", moduleJS: "rowDivider" },
							{ moduleSelector: "div.publicationCarouselControl", moduleJS: "publicationCarousel" },
							{ moduleSelector: "div.publicationCarouselMetadataControl", moduleJS: "publicationCarouselMetadata" },
                            { moduleSelector: "div.storyImageControl", moduleJS: "storyImage" },
                            { moduleSelector: "div.blockQuoteControl", moduleJS: "blockQuote" },
                            { moduleSelector: "div.threeColumnsControl", moduleJS: "threeColumns" },
							{ moduleSelector: "div.newsroomControl", moduleJS: "newsroom" },
                            { moduleSelector: "div.detailedCalloutControl", moduleJS: "detailedCallout" },
                            { moduleSelector: "div.galleryCarouselExpertControl", moduleJS: "galleryCarouselExpert" },
                            { moduleSelector: "div.whereWeWorkControl", moduleJS: "/Style Library/CI_custom/js/CIWhereControl.js" }, //Where we work map module
							{ moduleSelector: "div.videoSearchControl", moduleJS: "/Style Library/CI_custom/js/CIVideoSearchControl.js" }, //Video search module
							{ moduleSelector: "div.CIExpertControl", moduleJS: "/Style Library/CI_custom/js/CIExpertControl.js" }, //Expert control module
							{ moduleSelector: "div.CIEventsControl", moduleJS: "/Style Library/CI_custom/js/CIEventsControl.js" } //Events control module
							
        ];

		var hasModule = false; //Auxiliary variable for FOUC fix
        jQuery.each(moduleSelectors, function (index, value) {
            if (jQuery.data(document.body, value.moduleJS) === undefined && contentRegion.find(value.moduleSelector).length > 0) {

		        jQuery.data(document.body, value.moduleJS, "true");
		        //console.log("MainJs - Module loaded: ", value.moduleJS);
                require([value.moduleJS], function (module) {
                    module.init(true);
                });
                hasModule = true; //Set true if any module is applied on the document for FOUC fix
            }
	       else if (require.defined(value.moduleJS)) {
                //contentRegion.find(value.moduleSelector).attr("initialized",true);
            }
        });
//Start FOUC fix part 2
//If there is no module applied to the page, the container is set to visible
        if (!hasModule)
        {
        	jQuery('div.container').css('visibility','visible');
        }
//End FOUC fix part 2        
    }

    initializeModules();
    
   
});

require(['main'], function () {
    //console.log("require main function");
});




