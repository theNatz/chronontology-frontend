'use strict';

angular.module('chronontology.directives', [])

  .directive('timeline', function($location) {
    return {
      restrict: 'EA',
      scope: {
          periods: '=',
          selectedPeriodId: '=',
          width: '@',
          height: '@'
      },
      templateUrl: 'partials/timeline.html',
      link: function(scope, element, attrs) {

          var barHeight = 20;
          var bars, barTexts;
          var x, y;
          var startXDomain = [];
          var timeline;
          var canvas;
          var axis, axisElement;
          var zoom, drag;
          var rowMax = -1;

          scope.$watch('periods', function() {
             if (scope.periods) initialize();
          });

          function initialize() {
              var periodsData = prepareData();

              x = d3.time.scale()
                  .domain(startXDomain)
                  .range([0, parseInt(scope.width)]);

              y = d3.scale.linear()
                  .domain([0, 200])
                  .range([0, parseInt(scope.height) - 30]);

              timeline = d3.select('#timeline').append('svg')
                  .attr('width', parseInt(scope.width))
                  .attr('height', parseInt(scope.height))
                  .classed('timeline', true);

              canvas = timeline.append('svg')
                  .attr('width', parseInt(scope.width))
                  .attr('height', parseInt(scope.height) - 30);

              var format = d3.time.format.multi([
                  ["%B %Y", function(d) { return d.getMonth(); }],
                  ["%Y", function() { return true; }]
              ]);

              axis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .ticks(5)
                  .tickPadding(5)
                  .tickSize(3)
                  .tickFormat(format);

              axisElement = timeline.append('svg')
                  .attr('width', parseInt(scope.width))
                  .attr('height', 30)
                  .attr("transform", "translate(0," + (parseInt(scope.height) - 30) + ")")
                  .call(axis);

              zoom = d3.behavior.zoom()
                  .x(x)
                  .on("zoom", function () {
                      axisElement.call(axis);
                      updateBars();
                  });

              drag = d3.behavior.drag()
                  .on("drag", function() {
                      var domain = y.domain();
                      domain[0] += d3.event.dy;
                      domain[1] += d3.event.dy;
                      y.domain(domain);
                      axisElement.call(axis);
                      updateBars();
                  });

              timeline.call(zoom).call(drag);

              bars = canvas.selectAll('rect').data(periodsData).enter();
              bars.append('rect')
                  .classed('bar', true)
                  .on('click', showPeriod);

              if (scope.selectedPeriodId) {
                      canvas.selectAll('rect')
                      .filter(function (d) {
                          return d.id == scope.selectedPeriodId;
                      })
                      .classed('selected', true);
              }

              barTexts = bars.append('text')
                  .classed('text', true)
                  .on('click', showPeriod);

              updateBars();
          }

          function updateBars() {
              canvas.selectAll('rect')
                  .attr('width', function(data) {
                      return x(data.to) - x(data.from);
                  })
                  .attr('height', barHeight)
                  .attr('x', function(data) {
                      return x(data.from);
                  })
                  .attr('y', function(data, i) {
                      return y(data.row * 15);
                  });

              barTexts.attr('x', function(data) {
                      return x(data.from) + (x(data.to) - x(data.from)) / 2;
                  })
                  .attr('y', function(data) {
                      return y(data.row * 15) + barHeight / 2 + 5;
                  })
                  .text(function(data) {
                      return data.name;
                  })
                  .text(function(data) {
                      if (this.getComputedTextLength() > x(data.to) - x(data.from))
                          return "";
                      else
                          return data.name;
                  });

              axisElement.selectAll('.tick text')
                  .text(function() { return formatTickText(d3.select(this).text()); });
          }

          function showPeriod(period) {
              $location.path(period.id);
              scope.$apply();
          }

          function prepareData() {
              var periodsToDisplay = [];
              var periodsMap = {};

              for (var i in scope.periods) {
                  if (scope.periods[i].resource.hasTimespan && scope.periods[i].resource.hasTimespan[0]
                      && !isNaN(scope.periods[i].resource.hasTimespan[0].from)
                      && !isNaN(scope.periods[i].resource.hasTimespan[0].to)) {
                      var period = {
                          id: scope.periods[i]['@id'],
                          name: scope.periods[i].resource.prefLabel.de,
                          from: getYearDate(parseInt(scope.periods[i].resource.hasTimespan[0].from), false),
                          to: getYearDate(parseInt(scope.periods[i].resource.hasTimespan[0].to), true),
                          successor: scope.periods[i].resource.isMetInTimeBy,
                          children: scope.periods[i].resource.contains,
                          row: -1
                      };
                      if (!startXDomain[0] || period.from < startXDomain[0]) startXDomain[0] = period.from;
                      if (!startXDomain[1] || period.to > startXDomain[1]) startXDomain[1] = period.to;
                      periodsToDisplay.push(period);
                      periodsMap[period.id] = period;
                  }
              }

              determinePeriodRows(periodsToDisplay, periodsMap);

              if (scope.selectedPeriodId) setSelectionStartDomain(periodsMap[scope.selectedPeriodId]);

              return periodsToDisplay;
          }

          function determinePeriodRows(periods, periodsMap) {
              periods.sort(function(a, b) {
                  if (a.children && a.children.indexOf(b.id) > -1) return -1;
                  if (b.children && b.children.indexOf(a.id) > -1) return 1;
                  return a.from - b.from;
              });

              for (var i in periods) {
                  if (periods[i].row > -1) continue;
                  setRow(periods[i], periodsMap, rowMax + 2);
              }

              for (var i in periods)
                setSuccessorRow(periods[i], periodsMap);
          }

          function setRow(period, periodsMap, row) {
              if (period.row > -1) return;
              period.row = row;
              if (row > rowMax) rowMax = row;
              for (var i in period.children) {
                  if (period.children[i] in periodsMap && period.id != period.children[i])
                      setRow(periodsMap[period.children[i]], periodsMap, row + 1);
              }
          }

          function setSuccessorRow(period, periodsMap) {
              if (period.successor && period.successor in periodsMap && period.id != period.successor) {
                  var successor = periodsMap[period.successor];
                  if (!successor.row) {
                      successor.row = period.row;
                      setSuccessorRow(successor, periodsMap);
                  }
              }
          }

          function setSelectionStartDomain(selectedPeriod) {
              var offset = (selectedPeriod.to.getTime() - selectedPeriod.from.getTime()) / 2;
              var from = selectedPeriod.from.getTime() - offset;
              var to = selectedPeriod.to.getTime() + offset;
              startXDomain = [from, to ];
          }

          function getYearDate(value, endOfYear) {
              var date = new Date();
              if (endOfYear)
                date.setFullYear(value, 11, 30);
              else
                  date.setFullYear(value, 0, 0);

              return date;
          }

          function formatTickText(text) {
              var months = [
                  [ "January", "Januar" ],
                  [ "February", "Februar" ],
                  [ "March", "März" ],
                  [ "April", "April" ],
                  [ "May", "Mai" ],
                  [ "June", "Juni" ],
                  [ "July", "Juli" ],
                  [ "August", "August" ],
                  [ "September", "September" ],
                  [ "October", "Oktober" ],
                  [ "November", "November" ],
                  [ "December", "Dezember" ]
              ];

              for (var i in months) {
                  if (text.indexOf(months[i][0]) > -1)
                      text = text.replace(months[i][0], months[i][1]);
              }

              var finished = false;
              while (!finished) {
                  var index = text.indexOf("0");
                  if (index == 0 && text != "0")
                      text = text.substr(1);
                  else if (index > 0 && (text[index - 1] == " ") || text[index - 1] == "-")
                      text = text.substr(0, index) + text.substr(index + 1);
                  else
                      finished = true;
              }

              return text;
          }
      }
    };
  }

);