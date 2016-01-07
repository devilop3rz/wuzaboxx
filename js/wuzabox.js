  var wuzaBox = (function() {
    var  overlay, modal, maxHeight, maxWidth, minWidth, galleryImages, isGallery, activeImageId, galleryContainer, galleryCaption, galleryFullscreenImages;

    this.init = function() {
      minWidth = window.innerHeight * 0.4;
      maxWidth = 1000;
      maxHeight = window.innerHeight * 0.8;
      
      window.addEventListener('resize', resize);
      document.addEventListener('keydown', function (e) {
        if (e.keyCode === 39) {
          galleryNextImage();
        } 

        if (e.keyCode === 37) {
          galleryPrevImage();
        }
        if (e.keyCode === 27) {
          close();
        } 
      });
    };
    
    this.show = function (data, options) {
      var headlineElement, textElement, modalWidth, modalHeight;
      
      isGallery = false;
      
      overlay = createOverlay();
      modal = createModal();

      // Add data to modal
      if (typeof data === "object") {
        headline = document.createElement('h1');
        headline.innerHTML = data.title;
        modal.appendChild(headline);

        textElement = document.createElement('p');
        textElement.innerHTML = data.text;
        modal.appendChild(textElement);
        
        button = document.createElement('button');
        button.className = "wuza-button";
        button.innerHTML = "ok";
        modal.appendChild(button);
      } else {
        modal.innerHTML = data;
        if (options) {
          console.log('es gibt optionen');
        }
      }
          
      document.body.appendChild(modal);

      button.addEventListener('click', function () {close();});
      
      return modal;
    };
    
    this.gallery = function (selector) {
      var i, image;
      activeImageId = 0;
      galleryImages = document.querySelectorAll(selector);
      galleryFullscreenImages = [];

      for(i = 0; i< galleryImages.length; i++) {
        $(image).load(function () {
          console.log('loaded')
        })
        image = galleryImages[i];
        image.dataset.id = i;
        image.dataset.link = image.parentNode.dataset.link;;
        image.addEventListener('click', galleryShow);

        if(galleryImages[i].dataset.highres.indexOf('.webm') === -1) {
            var a = document.createElement('img');
            a.src = galleryImages[i].dataset.highres;
            galleryFullscreenImages.push(a);
        } else {
            var a = document.createElement('video');
         
            a.innerHTML = '<source src="'+galleryImages[i].dataset.highres+'" type="video/webm" />'
            galleryFullscreenImages.push(a);
        }
      }
    };
    
    this.galleryShow = function (e) {
      var galleryElement, galleryControls, i, nextButton, prevButton, closeButton, posX, posY, zoom, lX, lY, swiped, options, fullscreenButton;
  
      posX = 0;
      posY = 0;
      zoom = 1;
      isGallery = true;
      activeImageId = e.target.dataset.id;

      overlay = createOverlay();

      galleryContainer = document.createElement('div');
      galleryContainer.style.position = "absolute";
      galleryContainer.style.width = "100%";
      galleryContainer.style.height = window.innerHeight + 'px';
      galleryContainer.style.overflow = "hidden";
      galleryContainer.style.top = 0;
      galleryContainer.style.left = 0;

      document.body.style.overflow = 'hidden';
      // TouchEvents
      options = {
        dragLockToAxis: true,
        dragBlockHorizontal: true
      };

      if(galleryImages.length > 1 ) {
        var hammertime2 = Hammer(galleryContainer, options).on("pan", function(event) {
          var x, y;
          if(zoom > 1 && $('#wuza-modal').hasClass('fullscreen') === false) {
            posX = lX - event.deltaX;
            posY = lY- event.deltaY;  
            modal.querySelector('img').style.transform = 'scale(' +zoom +') translate(' + (posX) + 'px, ' + posY + 'px)';
          }
        }).on("panstart", function (event) {

        }).on("panend", function (event) {
          lY = event.deltaY;
          lX = event.deltaX;
        });

        var hammertime = Hammer(galleryContainer, options)
        .on("panleft panright", function (event) {
          if(zoom == 1 && $('#wuza-modal').hasClass('fullscreen') === false) {
            event.target.style.transform = 'translate(' + event.deltaX + 'px, 0px)';
          }
        }).on("panend", function (event) {
          var target = event.target;
          swiped = false;
          if (swiped !== true && zoom === 1 && $('#wuza-modal').hasClass('fullscreen') === false) {
            if (event.deltaX > 250) {
              galleryPrevImage();
            } else if (event.deltaX < -250) {
              galleryNextImage();
            }  else {
              target.style.transform = '';
            }
          }
        });
      }
        
      // Add Controls
      galleryControls = document.createElement('div');
      galleryControls.id = "wuza-gallery-controls";
      
      nextButton = document.createElement('button');
      nextButton .style.background = document.getElementById('side-bar').style.backgroundColor;
      nextButton.className = "wuza-button bounceIn";
      nextButton.id ="wuza-next-btn";
      nextButton.innerHTML = '<i class="fa fa-chevron-right"></i>';
      nextButton.addEventListener('click', galleryNextImage);
      ripple(nextButton);

      fullscreenButton = document.createElement('button');
      fullscreenButton.className = "wuza-button";
      fullscreenButton.style.background = document.getElementById('side-bar').style.backgroundColor;
      fullscreenButton.id ="wuza-full-btn";
      fullscreenButton.innerHTML = '<i class="fa fa-arrows-alt"></i>';
      fullscreenButton.addEventListener('click', galleryFullscreen);
      ripple(fullscreenButton);
      galleryContainer.appendChild(galleryControls);

      prevButton = document.createElement('button');
      prevButton.className = "wuza-button bounceIn";
      prevButton.style.background = document.getElementById('side-bar').style.backgroundColor;
      prevButton.id ="wuza-prev-btn";
      prevButton.innerHTML = '<i class="fa fa-chevron-left"></i>';
      prevButton.addEventListener('click', galleryPrevImage);
      ripple(prevButton);
      galleryContainer.appendChild(galleryControls);
      
        
      closeButton = document.createElement('button');
      closeButton.className = "wuza-button bounceIn ";
      closeButton.id ="wuza-close-btn";
      closeButton.style.background = document.getElementById('side-bar').style.backgroundColor;
      closeButton.innerHTML = '<i class="fa fa-times"></i>';
      closeButton.addEventListener('click', function () {close();});
      ripple(closeButton);

      // Add Caption
      galleryCaption = document.createElement('div');
      galleryCaption.id = "wuza-gallery-caption";
      galleryCaption.className = "fadeIn slow";

      document.body.appendChild(galleryContainer);

        galleryContainer.appendChild(closeButton);

        if(galleryFullscreenImages.length > 1) {
            galleryControls.appendChild(prevButton);
        }
        galleryControls.appendChild(fullscreenButton);
       
        if(galleryFullscreenImages.length > 1) {
            galleryControls.appendChild(nextButton);
        }

      galleryShowImage(activeImageId);
    };
    
    this.galleryShowImage = function (id) {
     
      var image, galleryElement;

      image = galleryFullscreenImages[id];
      modal = createModal();
      
            
      modal.className = "fadeIn wuza-gallery";
      
      if(image.width > image.height) {
        modal.className +=" landscape"
      } else {
        modal.className +=" portrait"
      }
      modal.style.width = "80%";
      modal.style.maxWidth = "1000px";
      
      modal.appendChild(image);

      if(image.play) {
        image.play();
      }
      
      if(image.src.indexOf('karte') !== -1 || image.src.indexOf('Karte') !== -1) {
        $('#wuza-full-btn').show();
      } else {
        $('#wuza-full-btn').hide();
      }

      galleryContainer.appendChild(modal);
      modal.style.marginTop =- (modal.offsetHeight / 2) +  "px";
      //galleryCaption.innerHTML = '<span class="title">'+image.title+'</span><br><span class="small">'+image.alt + '</span>';
      modal.appendChild(galleryCaption); swiped = false;
      
    };
    
    this.galleryNextImage = function () {
      if(galleryFullscreenImages.length > 1) {
          galleryContainer.removeChild(modal);

          if(activeImageId < galleryImages.length -1) {
              activeImageId++;
          } else {
              activeImageId = 0;
          }

          galleryShowImage(activeImageId);
      }
    };
    
    this.galleryPrevImage = function () {
            if(galleryFullscreenImages.length > 1) {
                galleryContainer.removeChild(modal);
                if(activeImageId > 0) {
                    activeImageId--;
                } else {
                    activeImageId = galleryImages.length - 1;
                }
                galleryShowImage(activeImageId);
            }
    };
    
    this.createModal = function () {
      var modal;   
      modal = document.createElement('div');
      modal.style.maxHeight = maxHeight + "px";
      modal.id = "wuza-modal";
      modal.className = "bounceIn";
      
      return modal;
    };

    this.galleryFullscreen = function () {
           console.log('fullscreen')
             $('#wuza-modal').toggleClass('fullscreen');
        }
        
    this.createOverlay = function () {
      var overlay;
      overlay = document.createElement('div');
      overlay.id = 'wuza-overlay';
      overlay.className = 'fadeIn';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function () {close();});
      return overlay;
    };
    
    this.resize = function (e) {
      minWidth = window.innerHeight * 0.4;
      maxHeight = window.innerHeight * 0.8;
    };
    
    this.close = function (m) {
      if (!m && modal) {
        
        if(isGallery === true) {
          modal.className = 'wuza-gallery bounceOut';
        } else {
          modal.className = 'bounceOut';
        }
        
        overlay.className = "fadeOut";
        //overlay.style.opacity = 0;
        overlay.removeEventListener('click');
        
        setTimeout(function () {
          if(isGallery === true) {
            document.body.removeChild(galleryContainer);
          } else {
            document.body.removeChild(modal);
          }
          document.body.style.overflow = 'inherit';
          document.body.removeChild(overlay);
          overlay = null;
          modal = null;
        }, 500);      
      }
    };

    function ripple(element) {
      var ink, d, x, y, xPos, yPos, elements;

      $(element).addClass('ripplelink');
      function rippleThis (e) {
        $(this).addClass('animatebg');
        if($(this).find(".ink").length === 0){
            $(this).prepend("<span class='ink'></span>");
          }

          ink = $(this).find(".ink");
          ink.removeClass("animate");
           
          if(!ink.height() && !ink.width()){
              d = Math.max($(this).outerWidth(), $(this).outerHeight());
              ink.css({height: d, width: d});
          }
          if(e.touches) {
            xPos = e.touches[0].pageX;
            yPos = e.touches[0].pageY;
          } else {
            xPos = e.pageX;
            yPos = e.pageY;
          }
          x = xPos - $(this).offset().left - ink.width()/2;
          y = yPos - $(this).offset().top - ink.height()/2;
          ink.css({top: y+'px', left: x+'px'}).addClass("animate");
      }

      element.addEventListener('mousedown', rippleThis);
      element.addEventListener('touchstart', rippleThis);
      element.addEventListener('touchend', function () {
        ink = $(this).find(".ink");
        ink.removeClass("animate");
      });
      element.addEventListener('mouseup', function () {
         ink = $(this).find(".ink");
        ink.removeClass("animate"); 
      });
    } 
    init();

    return {
      show:show,
      close:close,
      gallery:gallery
    };

  }());

