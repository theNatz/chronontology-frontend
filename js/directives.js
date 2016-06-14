'use strict';

angular.module('chronontology.directives', [])

  .directive('timeline', function($location) {
    return {
      restrict: 'EA',
      scope: {
          periods: '=',
          selectedPeriodId: '=',
          height: '@'
      },
      templateUrl: 'partials/timeline.html',
      link: function(scope, element, attrs) {

          var barHeight = 20;
          var bars, barRects, barTexts;
          var tooltip;
          var x, y;
          var totalXDomain = [];
          var startXDomain = [];
          var timeline;
          var canvas;
          var axis, axisElement;
          var zoom, drag;
          var rowMax = -1;

          scope.width = element[0].parentNode.clientWidth - 15;

          scope.$watch('periods', function() {
             if (scope.periods) initialize();
          });

          function initialize() {
              var periodsData = prepareData();

              x = d3.scale.linear()
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

              axis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .ticks(5)
                  .tickSize(10, 0);

              axisElement = timeline.append('svg')
                  .attr('y', parseInt(scope.height) - 30)
                  .attr('width', parseInt(scope.width))
                  .classed('axis', true)
                  .call(axis);

              var minZoom = (startXDomain[1] - startXDomain[0]) / (totalXDomain[1] - totalXDomain[0]);
              var maxZoom = startXDomain[1] - startXDomain[0];

              zoom = d3.behavior.zoom()
                  .x(x)
                  .scaleExtent([minZoom, maxZoom])
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

              tooltip = d3.select('body')
                  .append('div')
                  .classed('timeline-tooltip', true);

              bars = canvas.selectAll('rect').data(periodsData).enter();
              barRects = bars.append('rect')
                  .classed('bar', true)
                  .on('click', showPeriod);
              addTooltipBehavior(barRects);

              if (scope.selectedPeriodId) {
                  barRects.filter(function (d) {
                          return d.id == scope.selectedPeriodId;
                      })
                      .classed('selected', true);
              }

              barTexts = bars.append('text')
                  .classed('text', true)
                  .on('click', showPeriod);
              addTooltipBehavior(barTexts, tooltip);

              updateBars();
          }

          function updateBars() {
              barRects.attr('width', function(data) {
                      return x(data.to) - x(data.from);
                  })
                  .attr('height', barHeight)
                  .attr('x', function(data) {
                      return x(data.from);
                  })
                  .attr('y', function(data) {
                      return y(data.row) + data.row * (barHeight + 5);
                  });

              barTexts.attr('x', function(data) {
                      return x(data.from) + (x(data.to) - x(data.from)) / 2;
                  })
                  .attr('y', function(data) {
                      return y(data.row) + data.row * (barHeight + 5) + barHeight / 2 + 5;
                  })
                  .text(function(data) {
                      return data.name;
                  })
                  .text(function(data) {
                      if (this.getComputedTextLength() > x(data.to) - x(data.from)) {
                          data.textVisible = false;
                          return "";
                      }
                      else {
                          data.textVisible = true;
                          return data.name;
                      }
                  });

              axisElement.selectAll('.tick text')
                  .text(function() { return formatTickText(d3.select(this).text()); });
          }

          function showPeriod(period) {
              tooltip.style("visibility", "hidden");
              $location.path(period.id);
              scope.$apply();
          }

          function prepareData() {
              var periodsToDisplay = [];
              var periodsMap = {};

              for (var i in scope.periods) {
                  if (validatePeriod(scope.periods[i])) {
                      var period = {
                          id: scope.periods[i]['@id'],
                          name: scope.periods[i].resource.prefLabel.de,
                          from: parseInt(scope.periods[i].resource.hasTimespan[0].begin.at),
                          to: parseInt(scope.periods[i].resource.hasTimespan[0].end.at),
                          successor: scope.periods[i].resource.derived.isMetInTimeBy,
                          children: scope.periods[i].resource.hasPart,
                          row: -1
                      };
                      if (!totalXDomain[0] || period.from < totalXDomain[0]) totalXDomain[0] = period.from;
                      if (!totalXDomain[1] || period.to > totalXDomain[1]) totalXDomain[1] = period.to;
                      periodsToDisplay.push(period);
                      periodsMap[period.id] = period;
                  }
              }

              determinePeriodRows(periodsToDisplay, periodsMap);

              var selectedPeriod;
              if (scope.selectedPeriodId && (selectedPeriod = periodsMap[scope.selectedPeriodId]))
                  setStartDomain(selectedPeriod);
              else {
                  startXDomain[0] = totalXDomain[0];
                  startXDomain[1] = totalXDomain[1];
              }

              return periodsToDisplay;
          }

          function validatePeriod(period) {
              // Check if the timespan of the period is defined
              if (!period.resource.hasTimespan || !period.resource.hasTimespan[0])
                  return false;

              // Check if the begin and end values of the timespan are defined
              if (!period.resource.hasTimespan[0].begin || !period.resource.hasTimespan[0].end)
                  return false;

              // Check if the values of the timespan are numeric
              if (isNaN(period.resource.hasTimespan[0].begin.at)
                    || isNaN(period.resource.hasTimespan[0].end.at))
                  return false;

              // Check if the values of the timespan are set properly
              if (parseInt(period.resource.hasTimespan[0].end.at)
                    < parseInt(period.resource.hasTimespan[0].begin.at))
                  return false;

              return true;
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
                  if (successor.row == -1) {
                      successor.row = period.row;
                      setSuccessorRow(successor, periodsMap);
                  }
              }
          }

          function setStartDomain(selectedPeriod) {
              var offset = (selectedPeriod.to - selectedPeriod.from) / 2;
              var from = selectedPeriod.from - offset;
              var to = selectedPeriod.to + offset;
              if (from < totalXDomain[0]) from = totalXDomain[0];
              if (to > totalXDomain[1]) to = totalXDomain[1];
              startXDomain = [from, to];
          }

          function formatTickText(text) {
              text = text.split(",").join(".");

              return text;
          }

          function addTooltipBehavior(selection) {
              selection.on("mouseover", function(period) {
                  if (period.textVisible) return;
                  tooltip.text(period.name);
                  return tooltip.style("visibility", "visible");
              })
              .on("mousemove", function() {
                  return tooltip.style("top", (d3.event.pageY - 10) + "px")
                      .style("left", (d3.event.pageX + 10) + "px");
              })
              .on("mouseout", function() { return tooltip.style("visibility", "hidden"); });
          }
      }
    };
  }

);