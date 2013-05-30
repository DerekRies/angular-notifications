'use strict';

angular.module('demo', ['notifications']).
  controller('MainCtrl', function($scope, $notification, $timeout){
    console.log('main ctrl started');
    $timeout(function(){
      $notification.success('Notifications Demo', 'The notifications demo is working!');
    }, 500);

    $scope.makeInfo = function(){
      if($scope.notiTitle !== '' || $scope.notiText !== ''){
        $notification.info($scope.notiTitle, $scope.notiText);
        $scope.notiText = '';
        $scope.notiTitle = '';
      }
    };

    $scope.makeWarning = function(){
      if($scope.notiTitle !== '' || $scope.notiText !== ''){
        $notification.warning($scope.notiTitle, $scope.notiText);
        $scope.notiText = '';
        $scope.notiTitle = '';
      }
    };

    $scope.makeError = function(){
      if($scope.notiTitle !== '' || $scope.notiText !== ''){
        $notification.error($scope.notiTitle, $scope.notiText);
        $scope.notiText = '';
        $scope.notiTitle = '';
      }
    };

    $scope.makeSuccess = function(){
      if($scope.notiTitle !== '' || $scope.notiText !== ''){
        $notification.success($scope.notiTitle, $scope.notiText);
        $scope.notiText = '';
        $scope.notiTitle = '';
      }
    };
  });