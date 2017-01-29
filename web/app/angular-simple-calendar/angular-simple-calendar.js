angular.module('simple-calendar', []).directive('simpleCalendar', function () {
  return {
    restrict: 'E',
    scope: {
      options: '=?',
      events: '=?',

      dayDropdown: '=?',
      eventDropdowns: '=?',

      suppressDropdowns: '=',

      viewMonthYear: '=?',
      dayClassCallback: '&?'
    },

    template:''+
      '<div class="current-month"> '+
      '<div class="move-month prev-month" ng-click="prevMonth()"> '+
      '<span ng-show="allowedPrevMonth()">&#x2039;</span> '+
      '</div> '+
      '<span>{{ selectedMonth }}</span> '+
      '&nbsp; '+
      '<span>{{ selectedYear }}</span> '+
      '<div class="move-month next-month" ng-click="nextMonth()"> '+
      '<span ng-show="allowedNextMonth()">&#x203a;</span> '+
      '</div> '+
      '</div> '+
''+
'      <div style="width: 100%:"> '+
'      <div ng-repeat="day in weekDays(options.dayNamesLength) track by $index" class="weekday">{{ day }}</div> '+
'      </div> '+
'      <div> '+
'      <div ng-repeat="week in weeks track by $index" class="week"> '+
'      <div class="day" '+
'      ng-repeat="date in week  track by $index" bs-dropdown="getDropdown(date)"'+
'      ng-class="getDayClass(date)"'+
'      ng-click="onClick(date, $event)" bs-tooltip="{title:date.event?date.event[0].title:\'\',trigger:date.event?\'hover\':\'manual\'}"> '+
'      <div class="day-number">{{ date.day || "&nbsp;" }}</div> '+
'      <div class="event-title" ng-repeat="events in date.event | limitTo : options.maxEventsPerDay" ng-if="options.multiEventDates">{{ events.title || "&nbsp;" }}<div ng-if="date.event.length > options.maxEventsPerDay">More Events</div></div>	  	  '+
'      <div class="event-title" ng-if="!options.multiEventDates">{{ date.event[0].title || "&nbsp;" }}</div> '+
'       </div> '+
'      </div> '+
'      </div>',
    controller: ['$scope', '$moment', function ($scope, $moment) {
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var calculateSelectedDate, calculateWeeks, allowedDate, bindEvent;

      $scope.suppressDropdowns = false;

      if (!$scope.viewMonthYear)
      {
        $scope.viewMonthYear = {month: '', year: ''};
      }

      $scope.options = $scope.options || {};
      $scope.options.dayNamesLength = $scope.options.dayNamesLength || 1;
      $scope.options.multiEventDates = $scope.options.multiEventDates || false;
	    $scope.options.maxEventsPerDay = $scope.options.maxEventsPerDay || 3;


      /**
       * This method will determine if a specified date has events attached.
       *
       * @param date
       * @return bool
       */
      var dateHasEvents = function (date)
      {
        return date && date.event && date.event.length > 0;
      };

      $scope.onClick = function (date, $event) {
        if (!date || date.disabled) { return; }
        if (date.event && date.event.length > 0) {
          $scope.options.eventClick(date, $event);
        } else {
          $scope.options.dateClick(date, $event);
        }
      };

      if ($scope.options.minDate) {
        $scope.options.minDate = new Date($scope.options.minDate);
      }

      if ($scope.options.maxDate) {
        $scope.options.maxDate = new Date($scope.options.maxDate);
      }

      bindEvent = function (date) {
        if (!date || !$scope.events) { return; }
        date.event = [];
        $scope.events.forEach(function(event) {
          event.date = new Date($moment(event.date).format());
          if (date.year === event.date.getFullYear() && date.month === event.date.getMonth() && date.day === event.date.getDate()) {
            date.event.push(event);
          }
        });
      };

      var getSelectedMonthValue = function ()
      {
        return MONTHS.indexOf($scope.selectedMonth) + 1;
      };

      allowedDate = function (date) {
        if (!$scope.options.minDate && !$scope.options.maxDate) {
          return true;
        }
        var currDate = new Date([date.year, date.month + 1, date.day]);
        if ($scope.options.minDate && (currDate < $scope.options.minDate)) { return false; }
        if ($scope.options.maxDate && (currDate > $scope.options.maxDate)) { return false; }
        return true;
      };

      $scope.allowedPrevMonth = function () {
        var prevYear = null;
        var prevMonth = null;
        if (!$scope.options.minDate) { return true; }
        var currMonth = MONTHS.indexOf($scope.selectedMonth);
        if (currMonth === 0) {
          prevYear = ($scope.selectedYear - 1);
        } else {
          prevYear = $scope.selectedYear;
        }
        if (currMonth === 0) {
          prevMonth = 11;
        } else {
          prevMonth = (currMonth - 1);
        }
        if (prevYear < $scope.options.minDate.getFullYear()) { return false; }
        if (prevYear === $scope.options.minDate.getFullYear()) {
          if (prevMonth < $scope.options.minDate.getMonth()) { return false; }
        }
        return true;
      };

      $scope.allowedNextMonth = function () {
        var nextYear = null;
        var nextMonth = null;
        if (!$scope.options.maxDate) { return true; }
        var currMonth = MONTHS.indexOf($scope.selectedMonth);
        if (currMonth === 11) {
          nextYear = ($scope.selectedYear + 1);
        } else {
          nextYear = $scope.selectedYear;
        }
        if (currMonth === 11) {
          nextMonth = 0;
        } else {
          nextMonth = (currMonth + 1);
        }
        if (nextYear > $scope.options.maxDate.getFullYear()) { return false; }
        if (nextYear === $scope.options.maxDate.getFullYear()) {
          if (nextMonth > $scope.options.maxDate.getMonth()) { return false; }
        }
        return true;
      };

      calculateWeeks = function () {
        $scope.weeks = [];
        var week = null;
        var daysInCurrentMonth = new Date($scope.selectedYear, MONTHS.indexOf($scope.selectedMonth) + 1, 0).getDate();
        for (var day = 1; day < daysInCurrentMonth + 1; day += 1) {
          var dayNumber = new Date($scope.selectedYear, MONTHS.indexOf($scope.selectedMonth), day).getDay();
          week = week || [null, null, null, null, null, null, null];
          week[dayNumber] = {
            year: $scope.selectedYear,
            month: MONTHS.indexOf($scope.selectedMonth),
            day: day
          };

          if (allowedDate(week[dayNumber])) {
            if ($scope.events) { bindEvent(week[dayNumber]); }
          } else {
            week[dayNumber].disabled = true;
          }

          if (dayNumber === 6 || day === daysInCurrentMonth) {
            $scope.weeks.push(week);
            week = undefined;
          }
        }

        // Update the view variables so any listeners outside of our directive will detect
        // changes in what month is being viewed.

        if ($scope.viewMonthYear.month != getSelectedMonthValue())
        {
          $scope.viewMonthYear.month = getSelectedMonthValue();
        }

        if ($scope.viewMonthYear.year != $scope.selectedYear)
        {
          $scope.viewMonthYear.year = $scope.selectedYear;
        }
      };

      $scope.getDayClass = function (date)
      {
        if (!date)
        {
          return '';
        }

        var standardClasses = {
          default: $scope.isDefaultDate(date),
          event: date.event.length > 0,
          disabled: date.disabled || !date
        };

        var additionalClasses = [];
        if ($scope.dayClassCallback)
        {
          additionalClasses = $scope.dayClassCallback({date: date});
        }

        var eventClass = dateHasEvents(date) ? date.event[0].class : '';
        return [standardClasses, additionalClasses, eventClass];
      };

      calculateSelectedDate = function () {
        if ($scope.options.defaultDate) {
          $scope.options._defaultDate = new Date($scope.options.defaultDate);
        } else {
          $scope.options._defaultDate = new Date();
        }

        $scope.selectedYear  = $scope.options._defaultDate.getFullYear();
        $scope.selectedMonth = MONTHS[$scope.options._defaultDate.getMonth()];
        $scope.selectedDay   = $scope.options._defaultDate.getDate();

        updateViewedMonth();
        calculateWeeks();
      };

      $scope.weekDays = function (size) {
        return WEEKDAYS.map(function(name) { return name.slice(0, size); });
      };

      $scope.isDefaultDate = function (date) {
        if (!date) { return; }
        return date.year === $scope.options._defaultDate.getFullYear() &&
          date.month === $scope.options._defaultDate.getMonth() &&
          date.day === $scope.options._defaultDate.getDate();
      };

      $scope.prevMonth = function () {
        if (!$scope.allowedPrevMonth()) { return; }
        var currIndex = MONTHS.indexOf($scope.selectedMonth);
        if (currIndex === 0) {
          $scope.selectedYear -= 1;
          $scope.selectedMonth = MONTHS[11];
        } else {
          $scope.selectedMonth = MONTHS[currIndex - 1];
        }
        calculateWeeks();
      };

      $scope.nextMonth = function () {
        if (!$scope.allowedNextMonth()) { return; }
        var currIndex = MONTHS.indexOf($scope.selectedMonth);
        if (currIndex === 11) {
          $scope.selectedYear += 1;
          $scope.selectedMonth = MONTHS[0];
        } else {
          $scope.selectedMonth = MONTHS[currIndex + 1];
        }
        calculateWeeks();
      };

      $scope.getDropdown = function (date)
      {
        if ($scope.suppressDropdowns)
        {
          // This is used when the calling code is in progress with something, and doesn't
          // want the user to start a new operation just yet.
          return null;
        }

        if (!dateHasEvents(date))
        {
          return $scope.dayDropdown;
        }

        var event = date.event[0];
        return $scope.eventDropdowns[event.type] ? $scope.eventDropdowns[event.type] : null;
      };


      var getWatchableViewMonthYearString = function ()
      {
        return $scope.viewMonthYear.month.toString() + $scope.viewMonthYear.year.toString();
      };

      var updateViewedMonth = function ()
      {
        if (!$scope.viewMonthYear.month || !$scope.viewMonthYear.year)
        {
          return;
        }

        $scope.selectedMonth = MONTHS[$scope.viewMonthYear.month - 1];
        $scope.selectedYear = $scope.viewMonthYear.year;

        calculateWeeks();
      };

      var getWatchableEventsString = function ()
      {
        var eventsAsString = '';

        angular.forEach($scope.events, function (event) {
          eventsAsString += event.class;
          eventsAsString += event.date ? event.date.toString() : 'none';
          eventsAsString += event.title;
        });

        return eventsAsString;
      };

      $scope.$watch(getWatchableViewMonthYearString, updateViewedMonth);
      $scope.$watch('options.defaultDate', calculateSelectedDate);
      $scope.$watch(getWatchableEventsString, calculateWeeks);
    }]
  };
});
