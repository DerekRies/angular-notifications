'use strict';

angular.module('demo', ['notifications']).
  controller('mainCtrl', function ($scope, $notification, $timeout) {
      $timeout(function () {
          $notification.success('Notifications Demo', 'The notifications demo is working!');
      }, 500);

      $scope.gimmeHTML5 = function () {
          $notification.enableHtml5Mode();
      };

      $scope.showNotification = function () {
          if ($scope.notificationForm.$valid) {
              if ($scope.notiType === 'Info') {
                  $notification.info($scope.notiTitle, $scope.notiText);
              } else if ($scope.notiType === 'Warning') {
                  $notification.warning($scope.notiTitle, $scope.notiText);
              } else if ($scope.notiType === 'Error') {
                  $notification.error($scope.notiTitle, $scope.notiText);
              } else if ($scope.notiType === 'Success') {
                  $notification.success($scope.notiTitle, $scope.notiText);
              }
              $scope.notiTitle = '';
              $scope.notiText = '';
              $scope.submitted = false;
          } else {
              $scope.submitted = true;
          }
          
      };
  });
