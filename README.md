## Angular-Notifications

### v0.1

This particular component provides a service for creating notifications, and an
easy to use directive for displaying those notifications. Also provides the ability
to use Chrome Notifications instead.

This is an early release, and I'm going to be changing a lot of stuff soon.

### Demo
You can check out a really simple [Demo right here](http://derekries.github.io/angular-notifications). Documentation beyond this README coming soon.

### Dependencies
This component is an angularjs component so it should be obvious it depends on angular.
Also for the default notifications **font-awesome 3.1.1** is required to display the icons.

### Installation
After you've downloaded this repository, include both the css and javascript file
and then declare the notifications module as a dependency of your app module.

e.g `angular.module('ngcomponentsApp', ['notifications'])`

Once you've finished that business you should be able to use the notifications service.
If you want those notifications to show up on the screen however (optional), you
will need to add a div to your body tag somewhere and give it a notifications directive
specifying its position like so:

`<div notifications="bottom right"></div>`

You should now magically get notifications

### Usage

In order to use the API you need to inject the `$notification` service into
your controllers. From there you can use one of the many different notifications
like:

 * info
 * warning
 * error
 * success

You can use these methods with the following line of code

`$notification.info(title, content, userData);`
`$notification.warning(title, content, userData);`
`$notification.error(title, content, userData);`
`$notification.success(title, content, userData);`

**Title** is of course the title displayed in a large, bold text on the notification.
**Content** is the additional detail text for that notification. The **userData** parameter
is optional but allows you to store some data with a particular notification.

You can also use a generic notify method more inline with the standard chrome desktop
notifications by specifying an image to display in the notification.
`$notification.notify('image.jpg', 'My Title', 'My notification description text');`

### HTML5 Notifications
If you want to use HTML5 notifications with the same API then you can call
`$notification.enableHtml5Mode()`. **Note:** You will need permissions in
order to use HTML5 notifications so for this reason you should call enableHtml5Mode
in a click event listener or something.


### Coming Soon

 * Animations - Using ng-animate, will require a minimum of angular 1.1.4 for these
 * Better Looking, More Easily Styleable Notifications
