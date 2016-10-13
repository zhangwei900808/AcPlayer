/*
	AUTHOR: Osvaldas Valutis, www.osvaldas.info
*/
//说明js是加载是正确的，接下来看看是哪里出了问题

+function ($)
{
	'use strict';
	try {
		var isTouch		  = 'ontouchstart' in window,
			eStart		  = isTouch ? 'touchstart'	: 'mousedown',
			eMove		  = isTouch ? 'touchmove'	: 'mousemove',
			eEnd		  = isTouch ? 'touchend'	: 'mouseup',
			eCancel		  = isTouch ? 'touchcancel'	: 'mouseup',
			secondsToTime = function( secs )
			{
				var hours = Math.floor( secs / 3600 ), minutes = Math.floor( secs % 3600 / 60 ), seconds = Math.ceil( secs % 3600 % 60 );
				return ( hours == 0 ? '' : hours > 0 && hours.toString().length < 2 ? '0'+hours+':' : hours+':' ) + ( minutes.toString().length < 2 ? '0'+minutes : minutes ) + ':' + ( seconds.toString().length < 2 ? '0'+seconds : seconds );
			},
			canPlayType	  = function( file )
			{
				var audioElement = document.createElement( 'audio' );
				return !!( audioElement.canPlayType && audioElement.canPlayType( 'audio/' + file.split( '.' ).pop().toLowerCase() + ';' ).replace( /no/, '' ) );
			};

			var AcPlayer = function(ele, opt) {
						that = this;
						this.$element = ele,
						this.$playpause = $('#playpause'),
						this.$imgRotate= $("#img-rotate"),
						this.currentTime = 0,
						this.defaults = {
							classPrefix: 'audioplayer',
							strPlay: 'Play',
							strPause: 'Pause',
							strVolume: 'Volume'
						},
						this.params = $.extend({}, this.defaults, opt),
							this.cssClass	= {},
							this.cssClassSub =
							{
								playPause:	 	'playpause',
								playing:		'playing',
								time:		 	'time',
								timeCurrent:	'time-current',
								timeDuration: 	'time-duration',
								bar: 			'bar',
								barLoaded:		'bar-loaded',
								barPlayed:		'bar-played',
								volume:		 	'volume',
								volumeButton: 	'volume-button',
								volumeAdjust: 	'volume-adjust',
								noVolume: 		'novolume',
								mute: 			'mute',
								mini: 			'mini'
							};
							this.audioState='paused';
				}
				AcPlayer.prototype = {
				 play:function(){
					 if( this.$playpause.hasClass('acplayer-paused') )
					 {
							this.$playpause.removeClass('acplayer-paused').addClass('acplayer-playing');
					 }
					 if(!this.$imgRotate.hasClass('rotate-img'))
					 {
							this.$imgRotate.addClass('rotate-img');
					 }
					 this.$imgRotate.css('webkitAnimationPlayState','running');
					 if (this.theAudio.paused) {
							this.theAudio.play();
							this.monitorCurrentTime();
							this.audioState='playing';
						}
				 },
				 pause:function(){
					 if( this.$playpause.hasClass('acplayer-playing') )
						{
								 this.$playpause.removeClass('acplayer-playing').addClass('acplayer-paused');
						}
						clearInterval(this.ivl);
						if (!this.theAudio.paused) {
							this.theAudio.pause();
							this.$imgRotate.css('webkitAnimationPlayState','paused');
							this.audioState='paused';
						}
				 },
				 monitorCurrentTime(){
					 clearInterval(this.ivl);
					 this.ivl = setInterval(function(){
								that.currentTime = that.theAudio.currentTime;
								if(that.theAudio.ended){
									that.theAudio.currentTime=0;
									clearInterval(that.ivl);
									that.$imgRotate.css({
										'webkitAnimationPlayState':'paused'
									});
									that.$imgRotate.removeClass('rotate-img');
									that.$playpause.removeClass('acplayer-playing').addClass('acplayer-paused');
									that.audioState='paused';
								}
								console.log(that.currentTime)
								return that.currentTime;
					},100)
				},
				getCurrentTime:function(){
					return that.theAudio.currentTime;
				},
				toTheTime:function(time){
					if(time <= that.theAudio.duration)
					{
						that.theAudio.currentTime = time;
					}
				},
				 init: function() {
					 for( var subName in this.cssClassSub )
						 this.cssClass[ subName ] = this.params.classPrefix + '-' + this.cssClassSub[ subName ];

					 this.$element.each( function()
					 {
						 if( $( this ).prop( 'tagName' ).toLowerCase() != 'audio' )
							 return false;

						 var $this	   = $( this ),
							 audioFile  = $this.attr( 'src' ),
							 isAutoPlay = $this.get( 0 ).getAttribute( 'autoplay' ), isAutoPlay = isAutoPlay === '' || isAutoPlay === 'autoplay' ? true : false,
							 isLoop	   = $this.get( 0 ).getAttribute( 'loop' ),		isLoop	   = isLoop		=== '' || isLoop	 === 'loop'		? true : false,
							 isSupport  = false;

						 if( typeof audioFile === 'undefined' )
						 {
							 $this.find( 'source' ).each( function()
							 {
								 audioFile = $( this ).attr( 'src' );
								 if( typeof audioFile !== 'undefined' && canPlayType( audioFile ) )
								 {
									 isSupport = true;
									 return false;
								 }
							 });
						 }
						 else if( canPlayType( audioFile ) ) isSupport = true;

						 var thePlayer = $( '<div class="' + that.params.classPrefix + '">' + ( isSupport ? $( '<div>' ).append( $this.eq( 0 ).clone() ).html() : '<embed src="' + audioFile + '" width="0" height="0" volume="100" autostart="' + isAutoPlay.toString() +'" loop="' + isLoop.toString() + '" />' ) + '</div>' ),
							 theAudio  = isSupport ? thePlayer.find( 'audio' ) : thePlayer.find( 'embed' ), theAudio = theAudio.get( 0 );
							 that.theAudio = theAudio;
							 that.thePlayer = thePlayer;

						 if( isSupport )
						 {
							 thePlayer.find( 'audio' ).css( { 'width': 0, 'height': 0, 'visibility': 'hidden' } );
							 thePlayer.append( '<div class="' + that.cssClass.time + ' ' + that.cssClass.timeCurrent + '"></div><div class="' + that.cssClass.bar + '"><div class="' + that.cssClass.barLoaded + '"></div><div class="' + that.cssClass.barPlayed + '"></div></div><div class="' + that.cssClass.time + ' ' + that.cssClass.timeDuration + '"></div></div></div></div></div>' );

							 var theBar			  = thePlayer.find( '.' + that.cssClass.bar ),
								 barPlayed	 	  = thePlayer.find( '.' + that.cssClass.barPlayed ),
								 barLoaded	 	  = thePlayer.find( '.' + that.cssClass.barLoaded ),
								 timeCurrent		  = thePlayer.find( '.' + that.cssClass.timeCurrent ),
								 timeDuration	  = thePlayer.find( '.' + that.cssClass.timeDuration ),
								 volumeButton	  = thePlayer.find( '.' + that.cssClass.volumeButton ),
								 volumeAdjuster	  = thePlayer.find( '.' + that.cssClass.volumeAdjust + ' > div' ),
								 volumeDefault	  = 0,
								 adjustCurrentTime = function( e )
								 {
									 theRealEvent		 = isTouch ? e.originalEvent.touches[ 0 ] : e;
									 theAudio.currentTime = Math.round( ( theAudio.duration * ( theRealEvent.pageX - theBar.offset().left ) ) / theBar.width() );
								 },
								 adjustVolume = function( e )
								 {
									 theRealEvent	= isTouch ? e.originalEvent.touches[ 0 ] : e;
									 theAudio.volume = Math.abs( ( theRealEvent.pageY - ( volumeAdjuster.offset().top + volumeAdjuster.height() ) ) / volumeAdjuster.height() );
								 },
								 updateLoadBar = setInterval( function()
								 {
									 barLoaded.width( ( theAudio.buffered.end( 0 ) / theAudio.duration ) * 100 + '%' );
									 if( theAudio.buffered.end( 0 ) >= theAudio.duration )
										 clearInterval( updateLoadBar );
								 }, 100 );

							 var volumeTestDefault = theAudio.volume, volumeTestValue = theAudio.volume = 0.111;
							 if( Math.round( theAudio.volume * 1000 ) / 1000 == volumeTestValue ) theAudio.volume = volumeTestDefault;
							 else thePlayer.addClass( that.cssClass.noVolume );

							 timeDuration.html( '&hellip;' );
							 timeCurrent.text( secondsToTime( 0 ) );

							 theAudio.addEventListener( 'loadeddata', function()
							 {
								 timeDuration.text( secondsToTime( theAudio.duration ) );
								 volumeAdjuster.find( 'div' ).height( theAudio.volume * 100 + '%' );
								 volumeDefault = theAudio.volume;
							 });

							 theAudio.addEventListener( 'timeupdate', function()
							 {
								 timeCurrent.text( secondsToTime( theAudio.currentTime ) );
								 barPlayed.width( ( theAudio.currentTime / theAudio.duration ) * 100 + '%' );
							 });

							 theAudio.addEventListener( 'volumechange', function()
							 {
								 volumeAdjuster.find( 'div' ).height( theAudio.volume * 100 + '%' );
								 if( theAudio.volume > 0 && thePlayer.hasClass( that.cssClass.mute ) ) thePlayer.removeClass( that.cssClass.mute );
								 if( theAudio.volume <= 0 && !thePlayer.hasClass( that.cssClass.mute ) ) thePlayer.addClass( that.cssClass.mute );
							 });

							 theAudio.addEventListener( 'ended', function()
							 {
								 thePlayer.removeClass( that.cssClass.playing );
							 });

							 theBar.on( eStart, function( e )
							 {
								 adjustCurrentTime( e );
								 theBar.on( eMove, function( e ) { adjustCurrentTime( e ); } );
							 })
							 .on( eCancel, function()
							 {
								 theBar.unbind( eMove );
							 });

							 volumeButton.on( 'click', function()
							 {
								 if( thePlayer.hasClass( that.cssClass.mute ) )
								 {
									 thePlayer.removeClass( that.cssClass.mute );
									 theAudio.volume = volumeDefault;
								 }
								 else
								 {
									 thePlayer.addClass( that.cssClass.mute );
									 volumeDefault = theAudio.volume;
									 theAudio.volume = 0;
								 }
								 return false;
							 });

							 volumeAdjuster.on( eStart, function( e )
							 {
								 adjustVolume( e );
								 volumeAdjuster.on( eMove, function( e ) { adjustVolume( e ); } );
							 })
							 .on( eCancel, function()
							 {
								 volumeAdjuster.unbind( eMove );
							 });
						 }
						 else thePlayer.addClass( that.cssClass.mini );

						 if( isAutoPlay ) thePlayer.addClass( that.cssClass.playing );

						 thePlayer.find( '.' + that.cssClass.playPause ).on( 'click', function()
						 {
							 if( thePlayer.hasClass( that.cssClass.playing ) )
							 {
								 $( this ).attr( 'title', that.params.strPlay ).find( 'a' ).html( that.params.strPlay );
								 thePlayer.removeClass( that.cssClass.playing );
								 isSupport ? theAudio.pause() : theAudio.Stop();
							 }
							 else
							 {
								 $( this ).attr( 'title', that.params.strPause ).find( 'a' ).html( that.params.strPause );
								 thePlayer.addClass( that.cssClass.playing );
								 isSupport ? theAudio.play() : theAudio.Play();
							 }
							 return false;
						 });

						 $this.replaceWith( thePlayer );
					 });
					 return this;
				 }
				 };


		$.fn.acPlayer = function( options )
		{
			 //创建Beautifier的实体
			 var acPlayer = new AcPlayer(this, options);
			 //调用其方法
			 return acPlayer.init();
		}
		 $.fn.acPlayer.Constructor = AcPlayer;
	} catch (e) {
		alert('zw debug:'+e.message)
	} finally {

	}
	}(jQuery);
