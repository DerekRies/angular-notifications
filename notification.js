'use strict';

angular.module('notifications', []).
  factory('$notification', ['$timeout',function($timeout){
    /*
      The $notification service provides the ability for users to send notifications
      of various levels of importance around their application. Using some of the other
      components contained within this library they can also get the ability for these
      notifications to act like the toast notifications on many other platforms.

      All notifications are added into the notifications array, which is also persisted
      through local storage (additionally through some database backend if so desired by
      the end user). Notifications that are expected to be displayed are also added to a
      queue which can be used by the notifications controller to display them with
      animations in and out.

      It's very common for applications to have a notifications button as well where they
      can bring up all the recent notifications they've gotten and click through them.
      This is supported as well by querying for all of the notifications that are stored
      by this service.

      There will also be support for configuring settings that will allow your users to
      explicitly state which notifications they would like to recieve. This will make it
      so only notifications that are on will be added to the queue. Also when querying
      for notifications it will return only those that are not turned off.


      Types of Notifications:
      1. Info - A basic notification that gives some small bit of information

      2. Warning - Lets the user know something didn't work just right.

      3. Error - Let the user know something went wrong. This is usually to let them know
         some other action is now required by them. e.g. Retrying the failed action.

      4. Success - Some action was completed successfuly (don't use this for small actions
         that could be spammed)

      5. Progress - A progress notification is a special type of notification that stays on
         screen until loading reaches 100% and turns into a success or error notification
         by default. They display a loading widget to indicate the progress of some action
         like uploading something perhaps.

         This one will be tricky to pull off, how should the notification be informed of
         the progress of some action. When the user creates this notification should they
         be given an object that can be used to update that progress?

      6. Custom - Is configured by the user to make special notifications.

      Every notification call can attach a piece of userData to that notification. This lets
      the user filter notifications by certain bits of information they may have attached to
      it.

      The notifications API should have some settings that let users control what it's doing
      with more fine control. Like setting the durations of specific notification types.

      Also one thing that would be nice to use is HTML5 notifications if opted for. This is
      called html5Mode.
    */
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

      info: function(title, content, userData){
        console.log(title, content);
        return this.awesomeNotify('info','info', title, content, userData);
      },

      error: function(title, content, userData){
        return this.awesomeNotify('error', 'remove', title, content, userData);
      },

      success: function(title, content, userData){
        return this.awesomeNotify('success', 'ok', title, content, userData);
      },

      warning: function(title, content, userData){
        return this.awesomeNotify('warning', 'exclamation', title, content, userData);
      },

      awesomeNotify: function(type, icon, title, content, userData){
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
        return this.makeNotification(type, false, icon, title, content, userData);
      },

      notify: function(image, title, content, userData){
        // Wraps the makeNotification method for displaying notifications with images
        // rather than icons
        return this.makeNotification('custom', image, true, title, content, userData);
      },

      makeNotification: function(type, image, icon, title, content, userData){
        var notification = {
          'type': type,
          'image': image,
          'icon': icon,
          'title': title,
          'content': content,
          'timestamp': +new Date(),
          'userData': userData
        };
        notifications.push(notification);

        if(settings.html5Mode){
          html5Notify(image, title, content, function(){
            console.log("inner on display function");
          }, function(){
            console.log("inner on close function");
          });
        }
        else{
          queue.push(notification);
          $timeout(function removeFromQueueTimeout(){
            queue.splice(queue.indexOf(notification), 1);
          }, settings[type].duration);

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

    function NotificationsCtrl( $scope ){

      $scope.queue = $notification.getQueue();

      $scope.removeNotification = function(noti){
        $scope.queue.splice($scope.queue.indexOf(noti), 1);
      };

    }

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
      controller: NotificationsCtrl

    };
  }]);
