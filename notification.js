(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['angular'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        factory(require('angular'));
    } else {
        // Browser globals
        factory(angular);
    }
}(function (angular) {

    var module = angular.module('notifications', []);

    module.provider('$notification', function () {
        var settings = {
            info: {
                duration: 5000,
                enabled: true,
                class: 'info'
            },
            warning: {
                duration: 5000,
                enabled: true,
                class: 'warning'
            },
            error: {
                duration: 5000,
                enabled: true,
                class: 'danger'
            },
            success: {
                duration: 5000,
                enabled: true,
                class: 'success'
            },
            progress: {
                duration: 0,
                enabled: true,
                class: ''
            },
            custom: {
                duration: 35000,
                enabled: true,
                class: ''
            },
            details: true,
            localStorage: false,
            html5Mode: false,
            templateName: 'ng-notification-template'
        };
        this.setSettings = function (s) {
            angular.extend(settings, s);
        };

        function Notification($timeout, s) {
            var settings = s;
            var notifications = JSON.parse(localStorage.getItem('$notifications')) || [],
                queue = [];

            function html5Notify(icon, title, content, ondisplay, onclose) {
              if (settings.html5Mode == 'webkit') {
                if (window.webkitNotifications.checkPermission() === 0) {
                  if (!icon) {
                    icon = 'favicon.ico';
                  }
                  var noti = window.webkitNotifications.createNotification(icon, title, content);
                  if (typeof ondisplay === 'function') {
                    noti.ondisplay = ondisplay;
                  }
                  if (typeof onclose === 'function') {
                    noti.onclose = onclose;
                  }
                  noti.show();
                }
                else {
                  settings.html5Mode = false;
                }
              }
              else if (settings.html5Mode == 'moz') {
                if (!icon) {
                  icon = 'favicon.ico';
                }
                try {
                  Notification = window.Notification || window.mozNotification;
                  var noti = new Notification(
                    title,
                    {
                      body: content,
                      dir: "auto",
                      lang: "",
                      tag: 'test',
                      icon: icon
                    }
                    );
                }
                catch(err) {
                  settings.html5Mode = false;
                }
              }
            }


            return {

                /* ========== SETTINGS RELATED METHODS =============*/

                disableHtml5Mode: function () {
                    settings.html5Mode = false;
                },

                disableType: function (notificationType) {
                    settings[notificationType].enabled = false;
                },

                enableHtml5Mode: function () {
                    // settings.html5Mode = true;
                    settings.html5Mode = this.requestHtml5ModePermissions();
                },

                enableType: function (notificationType) {
                    settings[notificationType].enabled = true;
                },

                getSettings: function () {
                    return settings;
                },

                toggleType: function (notificationType) {
                    settings[notificationType].enabled = !settings[notificationType].enabled;
                },

                toggleHtml5Mode: function () {
                    settings.html5Mode = !settings.html5Mode;
                },

                requestHtml5ModePermissions: function () {
                  if (window.webkitNotifications) {
                    //console.log('notifications are available');
                    if (window.webkitNotifications.checkPermission() === 0) {
                      return true;
                    }
                    else{
                      window.webkitNotifications.requestPermission(function() {
                        if (window.webkitNotifications.checkPermission() === 0) {
                          settings.html5Mode = 'webkit';
                        }
                        else {
                          settings.html5Mode = false;
                        }
                      });
                      return false;
                    }
                  }
                  else if (window.Notification || window.mozNotification) {
                    Notification = window.Notification || window.mozNotification;
                    Notification.requestPermission(function(perm) {
                      if (perm == 'granted') {
                        settings.html5Mode = 'moz';
                      }
                      else {
                        settings.html5Mode = false;
                      }
                    });
                  }
                  else {
                    //console.log('notifications are not supported');
                    return false;
                  }
                },


                /* ============ QUERYING RELATED METHODS ============*/

                getAll: function () {
                    // Returns all notifications that are currently stored
                    return notifications;
                },

                getQueue: function () {
                    return queue;
                },

                /* ============== NOTIFICATION METHODS ==============*/

                info: function (title, content, userData, duration) {
                    return this.notify('info', 'info', title, content, userData, duration);
                },

                error: function (title, content, userData, duration) {
                    return this.notify('error', 'error', title, content, userData, duration);
                },

                success: function (title, content, userData, duration) {
                    return this.notify('success', 'success', title, content, userData, duration);
                },

                warning: function (title, content, userData, duration) {
                    return this.notify('warning', 'warning', title, content, userData, duration);
                },

                notify: function (type, icon, title, content, userData, duration) {
                    return this.makeNotification(type, false, icon, title, content, userData, duration);
                },

                makeNotification: function (type, image, icon, title, content, userData, duration) {
                    var notification = {
                        'type': type,
                        'image': image,
                        'icon': icon,
                        'title': title,
                        'content': content,
                        'timestamp': +new Date(),
                        'userData': userData,
                        'duration': duration,
                        'class': settings[type].class
                    };
                    notifications.push(notification);

                    if (duration === undefined) {
                        duration = settings[type].duration;
                    }

                    if (settings.html5Mode) {
                        html5Notify(image, title, content, function () {}, function () {

                        });
                    } else {
                        queue.push(notification);
                        if (duration) {
                          $timeout(function removeFromQueueTimeout() {
                              queue.splice(queue.indexOf(notification), 1);
                          }, duration);
                        }
                    }

                    this.save();
                    return notification;
                },


                /* ============ PERSISTENCE METHODS ============ */

                save: function () {
                    // Save all the notifications into localStorage
                    if (settings.localStorage) {
                        localStorage.setItem('$notifications', JSON.stringify(notifications));
                    }
                },

                restore: function () {
                    // Load all notifications from localStorage
                },

                clear: function () {
                    notifications = [];
                    this.save();
                }
            }
        }

        this.$get = ['$timeout', '$templateCache',
            function ($timeout, $templateCache) {
                if (!$templateCache.get('ng-notification-template')) {
                    $templateCache.put('ng-notification-template',
                        '<div class="ng-notification-wrapper" ng-repeat="noti in queue">' +
                        '<div class="ng-notification alert alert-{{noti.class}}">' +
                        '<div class="ng-notification-content">' +
                        '<button type="button" class="close" data-dismiss="modal" ng-click="removeNotification(noti)">'+
                        '<span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                        '<span class="title" ng-bind="noti.title"></span>' +
                        '</div>' +
                        '</div>' +
                        '</div>'
                    );
                }
                return new Notification($timeout, settings);
            }
        ];
    })

    module.directive('notifications', ['$notification', '$compile', '$templateCache',
        function ($notification, $compile, $templateCache) {
            /**
             *
             * It should also parse the arguments passed to it that specify
             * its position on the screen like "bottom right" and apply those
             * positions as a class to the container element
             *
             * Finally, the directive should have its own controller for
             * handling all of the notifications from the notification service
             */
            function link(scope, element, attrs) {
                var position = attrs.notifications;
                position = position.split(' ');
                element.addClass('ng-notification-container');
                for (var i = 0; i < position.length; i++) {
                    element.addClass(position[i]);
                }
            }


            return {
                restrict: 'A',
                scope: {},
                template: $templateCache.get($notification.getSettings().templateName),
                link: link,
                controller: ['$scope',
                    function NotificationsCtrl($scope) {
                        $scope.queue = $notification.getQueue();

                        $scope.removeNotification = function (noti) {
                            $scope.queue.splice($scope.queue.indexOf(noti), 1);
                        };
                    }
                ]

            };
        }
    ]);

    return module;

}));