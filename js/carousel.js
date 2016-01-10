/**
  * @name Carousel
  * @desc All carousel logic for the site, including heroes and galleries.
  *       See https://github.com/vigetlabs/conservation-international/blob/master/docs/Integration.md#carousel-components
  */
define(['lib/view'], function(View) {
	var $window = $(window);

	var Carousel = View.extend({

		dragging: false,

		defaults: {
			carouselAnimate: true,
			carouselStyle: 'arrows',
			carouselAutoplay: false
		},

		ui: {
			items     : '.carousel__items',
			landmarks : '.carousel__landmark',
			figures   : '.figure, .figure--shadow',
			bullets   : '.carousel__control--bullets li',
			next      : '.carousel__control--next',
			prev      : '.carousel__control--prev'
		},

		events: {
			'click.carousel {next}'    : 'advance',
			'click.carousel {prev}'    : 'retreat',
			'click.carousel {bullets}' : 'jump',
			'touchstart.carousel {figures}' : 'setDragging',
			'touchmove.carousel {figures}' : 'setDragging',
			'touchend.carousel {figures}' : 'toggleCaption'
		},

		templates: {
			arrow   : _.template("<span class='carousel__control--<%= type %> <%= size? 'size--' + size : ''%>'></span>"),
			bullet  : _.template("<li><a href='#'>Slide <%= slot %></a></li>"),
			bullets : _.template("<ol class='carousel__control--bullets'><%= list %></ol>")
		},

		initialize: function(options) {
			this.settings = $.extend(true, {}, this.defaults, options);
			this.render();
			this.reset();

			if (this.settings.carouselAutoplay) this.play();

			// When the user scrolls, live-update the controls
			this.ui.items.on('scroll', _.debounce(this.calibrateControls.bind(this), 100));

			// When the user moves on past the carousel, realign it if
			// left in a wonky position

			if (this.isAnimated()) {
				$window.on('scroll.carousel', _.throttle(this.move.bind(this), 250));
			}

			$window.on('resize.carousel', _.throttle(this.move.bind(this), 250));

//START Custom code by DM
//			console.log("Carousel must be enabled at start: " + EnabledAtStart)
			if(EnabledAtStart)
			{
				$('.carousel').removeClass('disabled');
				$('.carousel__control--next').removeClass('disabled');
			}
//END Custom code by DM
		},

		isAnimated: function() {
			return !!this.settings.carouselAnimate;
		},

		hasArrows: function() {
			var style = this.settings.carouselStyle;
			return style === 'both' || style === 'arrows';
		},

		hasBullets: function() {
			var style = this.settings.carouselStyle;
			return style === 'both' || style === 'bullets';
		},

		render: function() {
			var template = '';
			var size = this.settings.carouselSize;

			if (this.hasBullets()) {
				var list = _(this.ui.landmarks).reduce(function(list, el, n) {
					return list + this.templates.bullet({ slot: n });
				}, '', this);

				template = this.templates.bullets({ list: list });
			}

			if (this.hasArrows()) {
				template += this.templates.arrow({ type: 'prev', size: size });
				template += this.templates.arrow({ type: 'next', size: size });
			}

			if (this.settings.carouselAnimate === false) {
				this.$el.addClass('locked-in');
			}

			this.$el.prepend(template);

			this.bindUIElements();
		},

		progress: function() {
			return this.ui.items.scrollLeft();
		},

		threshold: function(element) {
			return 0.25 * element.offsetWidth;
		},

		jump: function(position) {
			if (position instanceof $.Event) {
				position.preventDefault();
				position = this.ui.bullets.index(position.target.parentNode);
			}

			if (position === -1) return;

			this.move(position - this.findNearestIndex());
		},

		stop: function() {
			clearInterval(this.timer);
		},

		autoplay: function() {
			if (this.settings.carouselAutoplay) this.play();
		},

		play: function() {
			clearInterval(this.timer);

			this.timer = setTimeout(function() {
				var next = this.move(1);
			}.bind(this), this.settings.carouselAutoplay);
		},

		distanceToLeft: function(el) {
			return this.relativeOffset(el);
		},

		distanceToRight: function(el) {
			return (this.relativeOffset(el) + el.offsetWidth) - this.ui.items.width();
		},

		inRightRegion: function(el) {
			var rightRegion = this.progress() + this.ui.items.width() * 0.5;

			return rightRegion < el.offsetLeft;
		},

		relativeOffset: function(el) {
			return $(el).position().left - (this.ui.items.position().left - this.ui.items.scrollLeft());
		},

		visit: function(el) {
			var landmarks  = this.ui.landmarks;
			var scroll     = this.inRightRegion(el)? this.distanceToRight(el) : this.distanceToLeft(el);
			var isAnimated = this.isAnimated();
			var timing     = isAnimated? 'fast' : 0;
			var delay      = isAnimated? 0 : 700;

			landmarks.addClass('on-exit');

			this.ui.items.delay(delay).animate({
				scrollLeft: scroll
			}, timing, function() {
				landmarks.removeClass('on-exit');
			});
		},

		move: function (offset) {
			var nearest = this.findNearest(offset).get(0);

			this.stop();
			this.visit(nearest);
			this.autoplay();
		},

		advance: function() {
			this.move(1);
		},

		retreat: function() {
			this.move(-1);
		},

		reset: function() {
			this.ui.items.scrollLeft(0);
			this.calibrateControls();
		},

		keepWithinRange: function(index) {
			var ceiling = this.ui.landmarks.length - 1;
			var floor = Math.max(0, index);

			if (this.settings.carouselAutoplay && index > ceiling) {
				return 0;
			} else {
				return Math.min(ceiling, floor);
			}
		},

		distanceFromEnd: function() {
			var target = this.ui.items.get(0);
			var box = this.el.offsetWidth;

			return target.scrollWidth - (target.scrollLeft + box);
		},

		atEnd: function() {
			var threshold = this.ui.landmarks.last().width() * 0.25;
			return this.distanceFromEnd() <= threshold;
		},

		atBeginning: function() {
			return this.ui.items.scrollLeft() <= 0;

		},

		selectItem: function(index) {
			return this.ui.landmarks.eq(this.keepWithinRange(index));
		},

		centerAlignControls: function() {
			//var halfHeight = this.photoHeight() / 2;
			var halfHeight = Math.min(this.$el.height(), this.photoHeight()) / 2;
			var offset = this.ui.items.position().top;

			// Align to the center any elements
			this.ui.next.add(this.ui.prev).css('top', (halfHeight + offset));
		},

		photoHeight: function() {
			if(($(this.ui.items.context).hasClass("theme--publication")))
			{
				R="220";
				EnabledAtStart=true;
			}
			else
			{
				R= this.ui.landmarks.first().find('img').height();
				EnabledAtStart=false;
			}			

			if((R==null)||(R==0))
			{
				var hadClass=false;
				//When no adjustment is needed, the minItems must be set to 1000
				var CarouselModules=[
				{className:"videoGalleryCarouselControl", height:"315", minItems:"1000"},
				{className:"smallVideoCarouselControl", height:"146", minItem:"1000"},
				{className:"defaultCarouselFullWidthControl", height:"260", minItems:"5"},
				{className:"hugeCarouselControl", height:"560", minItems:"1000"},
				{className:"defaultCarouselControl", height:"364", minItems:"3"},
				{className:"theme--publication", height:"220", minItems:"4"}
				];
	//			console.log(CarouselModules);
				for(var k=0; k<CarouselModules.length; k++)
				{
					if(($(this.ui.items.context).hasClass(CarouselModules[k].className))&&(!hadClass))
					{
						R=CarouselModules[k].height;
						hadclass=true;
	//					console.log(CarouselModules[k]);
						if(CarouselModules[k].minItems<=$('.carousel').find('li').length)
						{
							EnabledAtStart=true;
						}
					}
				}
			}
			return R;
		},

		calibrateControls: function(nearest) {
			var atBeginning = this.atBeginning();
			var atEnd = this.atEnd();

			var bullets = this.ui.bullets;
			var landmarks = this.ui.landmarks;
			var visible = this.findVisibleLandmarks();
			var index = landmarks.index(nearest);

			this.centerAlignControls();

			// Automatically disable controls at the beginning and end
			if (this.isAnimated()) {
				this.ui.next.toggleClass('disabled', atEnd);
				this.ui.prev.toggleClass('disabled', atBeginning);
			}

			// If both the beginning and end are visible, don't show controls
			this.$el.toggleClass('disabled', atBeginning && atEnd);

			// Now highlight bullets for all visible members
			bullets.removeClass('is-active');

			visible.each(function(i, el) {
				var index = landmarks.index(el);
				bullets.eq(index).addClass('is-active');
			});
		},

		findNearestIndex: function() {
			return this.ui.landmarks.index(this.findNearest());
		},

		findVisibleLandmarks: function() {
			var progress = this.progress();
			var containerWidth = this.ui.items.width();

			return this.ui.landmarks.filter(function() {
				var right = progress + containerWidth;
				var left  = this.offsetLeft + this.offsetWidth * 0.25;
				return left - progress > 0 && left < right;
			});
		},

		findNearest: function(shift) {
			if (!shift || shift instanceof $.Event) shift = 0;

			var visible = this.findVisibleLandmarks();
			var nearest = shift > 0 ? visible.last() : visible.first();
			var next = this.selectItem(this.ui.landmarks.index(nearest) + shift);

			this.calibrateControls(next);

			return next;
		},

		setDragging: function(e) {
			this.dragging = e.type === 'touchmove';
		},

		toggleCaption: function(e) {
			if (!this.dragging) {
				var $el = $(e.currentTarget);
				$el.toggleClass('show-caption');
			}
		}
	});

	$("[data-component=carousel]").each(function() {
		var data = $.extend(true, $(this).data(), {
			el: this
		});

		return new Carousel(data);
	});

	return Carousel;
});


