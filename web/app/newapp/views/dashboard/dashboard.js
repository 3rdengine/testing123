(function()
{
	  newappApp.config(['engStateProvider', function (state)
		{
			state.add({view: 'engViewDashboard', title: "Dash", url: '/dashboard', role: 'ROLE_ALL', menus: {'main': 1}});
		}]);
		newappApp.directive("engViewDashboard",dashboard);
		function dashboard()
		{
			return {
				restrict: "A",
				scope: {},
				templateUrl: "/app/newapp/views/dashboard/partial.html",
				controller: ['$scope',
					function($scope)
					{
						angular.noop();
					}
				]
			};
		}
	   
})();
