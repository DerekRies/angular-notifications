'use strict';

angular.module('notifications', []).
  factory('$notification', ['$timeout',function($timeout){

    console.log('notification service online');
    var notifications = JSON.parse(localStorage.getItem('$notifications')) || [],
        queue = [];

    var settings = {
      info: { duration: 5000, enabled: true },
      warning: { duration: 5000, enabled: true },
      error: { duration: 5000, enabled: true },
      success: { duration: 5000, enabled: true },
      progress: { duration: 0, enabled: true },
      custom: { duration: 35000, enabled: true },
      details: true,
      localStorage: false,
      html5Mode: false,
      html5DefaultIcon: 'icon.png'
    };

    function html5Notify(icon, title, content, ondisplay, onclose){
      if(window.webkitNotifications.checkPermission() === 0){
        if(!icon){
          icon = 'favicon.ico';
        }
        var noti = window.webkitNotifications.createNotification(icon, title, content);
        if(typeof ondisplay === 'function'){
          noti.ondisplay = ondisplay;
        }
        if(typeof onclose === 'function'){
          noti.onclose = onclose;
        }
        noti.show();
      }
      else {
        settings.html5Mode = false;
      }
    }


    return {

      /* ========== SETTINGS RELATED METHODS =============*/

      disableHtml5Mode: function(){
        settings.html5Mode = false;
      },

      disableType: function(notificationType){
        settings[notificationType].enabled = false;
      },

      enableHtml5Mode: function(){
        // settings.html5Mode = true;
        settings.html5Mode = this.requestHtml5ModePermissions();
      },

      enableType: function(notificationType){
        settings[notificationType].enabled = true;
      },

      getSettings: function(){
        return settings;
      },

      toggleType: function(notificationType){
        settings[notificationType].enabled = !settings[notificationType].enabled;
      },

      toggleHtml5Mode: function(){
        settings.html5Mode = !settings.html5Mode;
      },

      requestHtml5ModePermissions: function(){
        if (window.webkitNotifications){
          console.log('notifications are available');
          if (window.webkitNotifications.checkPermission() === 0) {
            return true;
          }
          else{
            window.webkitNotifications.requestPermission(function(){
              if(window.webkitNotifications.checkPermission() === 0){
                settings.html5Mode = true;
              }
              else{
                settings.html5Mode = false;
              }
            });
            return false;
          }
        }
        else{
          console.log('notifications are not supported');
          return false;
        }
      },


      /* ============ QUERYING RELATED METHODS ============*/

      getAll: function(){
        // Returns all notifications that are currently stored
        return notifications;
      },

      getQueue: function(){
        return queue;
      },

      /* ============== NOTIFICATION METHODS ==============*/

      info: function(title, content, userData, duration){
        console.log(title, content);
        return this.awesomeNotify('info','info', title, content, userData, duration);
      },

      error: function(title, content, userData, duration){
        return this.awesomeNotify('error', 'remove', title, content, userData, duration);
      },

      success: function(title, content, userData, duration){
        return this.awesomeNotify('success', 'ok', title, content, userData, duration);
      },

      warning: function(title, content, userData, duration){
        return this.awesomeNotify('warning', 'exclamation', title, content, userData, duration);
      },

      awesomeNotify: function(type, icon, title, content, userData, duration){
        /**
         * Supposed to wrap the makeNotification method for drawing icons using font-awesome
         * rather than an image.
         *
         * Need to find out how I'm going to make the API take either an image
         * resource, or a font-awesome icon and then display either of them.
         * Also should probably provide some bits of color, could do the coloring
         * through classes.
         */
        // image = '<i class="icon-' + image + '"></i>';
        return this.makeNotification(type, false, icon, title, content, userData, duration);
      },

      notify: function(image, title, content, userData, duration){
        // Wraps the makeNotification method for displaying notifications with images
        // rather than icons
        return this.makeNotification('custom', image, true, title, content, userData);
      },

      makeNotification: function(type, image, icon, title, content, userData, duration){
        var notification = {
          'type': type,
          'image': image,
          'icon': icon,
          'title': title,
          'content': content,
          'timestamp': +new Date(),
          'userData': userData,
	  'duration': duration
        };
        notifications.push(notification);
	if(duration == undefined) {
	  duration = settings[type].duration;
	}
        if(settings.html5Mode){
          html5Notify(image, title, content, function(){
            console.log("inner on display function");
          }, function(){
            console.log("inner on close function");
          });
        }
        else{
          queue.push(notification);
	  if(duration){
            $timeout(function removeFromQueueTimeout(){
              queue.splice(queue.indexOf(notification), 1);
            }, duration);
	  }
        }

        this.save();
        return notification;
      },


      /* ============ PERSISTENCE METHODS ============ */

      save: function(){
        // Save all the notifications into localStorage
        // console.log(JSON);
        if(settings.localStorage){
          localStorage.setItem('$notifications', JSON.stringify(notifications));
        }
        // console.log(localStorage.getItem('$notifications'));
      },

      restore: function(){
        // Load all notifications from localStorage
      },

      clear: function(){
        notifications = [];
        this.save();
      }

    };
  }]).
  directive('notifications', ['$notification', '$compile', function($notification, $compile){
    /**
     *
     * It should also parse the arguments passed to it that specify
     * its position on the screen like "bottom right" and apply those
     * positions as a class to the container element
     *
     * Finally, the directive should have its own controller for
     * handling all of the notifications from the notification service
     */
    console.log('this is a new directive');
    var html =
      '<div class="dr-notification-wrapper" ng-repeat="noti in queue">' +
        '<div class="dr-notification-close-btn" ng-click="removeNotification(noti)">' +
          '<i class="icon-remove"></i>' +
        '</div>' +
        '<div class="dr-notification">' +
          '<div class="dr-notification-image dr-notification-type-{{noti.type}}" ng-switch on="noti.image">' +
            '<i class="icon-{{noti.icon}}" ng-switch-when="false"></i>' +
            '<img ng-src="{{noti.image}}" ng-switch-default />' +
          '</div>' +
          '<div class="dr-notification-content">' +
            '<h3 class="dr-notification-title">{{noti.title}}</h3>' +
            '<p class="dr-notification-text">{{noti.content}}</p>' +
          '</div>' +
        '</div>' +
      '</div>';


    function link(scope, element, attrs){
      var position = attrs.notifications;
      position = position.split(' ');
      element.addClass('dr-notification-container');
      for(var i = 0; i < position.length ; i++){
        element.addClass(position[i]);
      }
    }


    return {
      restrict: 'A',
      scope: {},
      template: html,
      link: link,
      controller: ['$scope', function NotificationsCtrl( $scope ){
        $scope.queue = $notification.getQueue();

        $scope.removeNotification = function(noti){
          $scope.queue.splice($scope.queue.indexOf(noti), 1);
        };
      }
    ]

    };
  }]);
