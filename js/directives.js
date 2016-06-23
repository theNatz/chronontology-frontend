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

          const barHeight = 20;
          const minYear = -10000;
          const maxYear = new Date().getFullYear();
          var bars, barRects, barTexts;
          var tooltip;
          var x, y;
          var totalXDomain = [];
          var startXDomain = [];
          var startYDomain = [];
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
              y = d3.scale.linear()
                  .domain([0, barHeight * 20])
                  .range([0, parseInt(scope.height) - 30]);

              var periodsData = prepareData();
              adjustStartXDomain();

              x = d3.scale.linear()
                  .domain(startXDomain)
                  .range([0, parseInt(scope.width)]);

              y.domain(startYDomain);

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
                  .ticks(7)
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
                      domain[0] -= d3.event.dy;
                      domain[1] -= d3.event.dy;
                      y.domain(domain);
                      axisElement.call(axis);
                      updateBars();
                  });

              timeline.call(zoom).call(drag);

              tooltip = d3.select('body')
                  .append('div')
                  .classed('timeline-tooltip', true);

              bars = canvas.selectAll('g').data(periodsData).enter();
              barRects = bars.append('g')
                  .attr("class", function(d) { return "bar group" + d.colorGroup + " level" + (d.groupRow + 1) })
                  .append('rect')
                  .classed('bar', true)
                  .attr('rx','5')
                  .attr('ry','5')
                  .on('click', showPeriod);
              addTooltipBehavior(barRects);

              if (scope.selectedPeriodId) {
                  barRects.filter(function (d) {
                          return d.id == scope.selectedPeriodId;
                      })
                      .classed('selected', true);
              }

              barTexts = canvas.selectAll('g')
                  .append('text')
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

              removeOverlappingTicks(axisElement.selectAll('.tick'));
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
                      var label = "";
                      if (scope.periods[i].resource.prefLabel && scope.periods[i].resource.prefLabel.de)
                        label = scope.periods[i].resource.prefLabel.de;
                      var period = {
                          id: scope.periods[i]['@id'],
                          name: label,
                          from: parseInt(scope.periods[i].resource.hasTimespan[0].begin.at),
                          to: parseInt(scope.periods[i].resource.hasTimespan[0].end.at),
                          successor: scope.periods[i].resource.follows
                              ? scope.periods[i].resource.follows[0] : undefined,
                          children: scope.periods[i].resource.contains,
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
                  setStartDomains(selectedPeriod);
              else {
                  startXDomain[0] = totalXDomain[0];
                  startXDomain[1] = totalXDomain[1];
                  startYDomain = [0, barHeight * 20];
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
              var periodGroups = assignPeriodsToGroups(periods, periodsMap);

              periodGroups.sort(function(a, b) {
                  return a.from - b.from;
              });

              var currentRowPositions = [];
              var colorGroupNumber = 1;

              for (var i in periodGroups) {
                    for (var row = 0; row < 1000; row++) {
                        if (doesPeriodGroupFitInRow(periodGroups[i], row, currentRowPositions)) {
                            putPeriodGroupToRow(periodGroups[i], row, currentRowPositions);
                            setColorGroup(periodGroups[i], colorGroupNumber);
                            colorGroupNumber = (colorGroupNumber == 10) ? 1 : colorGroupNumber + 1;
                            break;
                        }
                    }
              }
          }

          function doesPeriodGroupFitInRow(group, row, currentRowPositions) {
              for (var i = row; i < row + group.rows.length; i++) {
                  if (currentRowPositions[i] != undefined && group.from < currentRowPositions[i]) return false;
              }
              return true;
          }

          function putPeriodGroupToRow(group, row, currentRowPositions) {
              for (var i = 0; i < group.rows.length; i++) {
                  for (var j in group.rows[i]) {
                      group.rows[i][j].row = row + i;
                      if (currentRowPositions[row + i] == undefined || currentRowPositions[row + i] < group.rows[i][j].to)
                          currentRowPositions[row + i] = group.rows[i][j].to;
                  }
              }
          }

          function setColorGroup(group, colorGroupNumber) {
              for (var i in group.rows) {
                  for (var j in group.rows[i]) {
                      group.rows[i][j].colorGroup = colorGroupNumber;
                  }
              }
          }

          function assignPeriodsToGroups(periods, periodsMap) {
              periods.sort(function(a, b) {
                  if (a.children && a.children.indexOf(b.id) > -1) return -1;
                  if (b.children && b.children.indexOf(a.id) > -1) return 1;
                  return a.from - b.from;
              });

              var periodGroups = [];

              for (var i in periods) {
                  addToGroup(periods[i], periodsMap, null, 0);
                  if (periodGroups.indexOf(periods[i].periodGroup) == -1)
                      periodGroups.push(periods[i].periodGroup);
              }

              for (var i in periods)
                  addSuccessorToGroup(periods[i], periodsMap, periodGroups);

              return periodGroups;
          }

          function addToGroup(period, periodsMap, group, row) {
              if (period.periodGroup) return;

              if (!group) {
                  group = {
                      rows: [],
                      periodsCount: 0,
                      from: NaN,
                      to: NaN
                  };
              }

              setPeriodGroup(period, group, row);

              for (var i in period.children) {
                  if (period.children[i] in periodsMap && period.id != period.children[i]) {
                      addToGroup(periodsMap[period.children[i]], periodsMap, group, row + 1);
                  }
              }
          }

          function addSuccessorToGroup(period, periodsMap, periodGroups) {
              if (period.successor && period.successor in periodsMap && period.id != period.successor) {
                  var successor = periodsMap[period.successor];
                  if (successor.periodGroup.periodsCount == 1) {
                      setPeriodGroup(successor, period.periodGroup, period.groupRow);
                      periodGroups.splice(periodGroups.indexOf(successor.periodGroup), 0);
                      addSuccessorToGroup(successor, periodsMap, periodGroups);
                  }
              }
          }

          function setPeriodGroup(period, group, row) {
              period.periodGroup = group;
              period.groupRow = row;
              if (!group.rows[row]) group.rows[row] = [];
              group.rows[row].push(period);
              group.periodsCount++;

              if (isNaN(group.from) || group.from > period.from) group.from = period.from;
              if (isNaN(group.to) || group.to < period.to) group.to = period.to;
          }

          function setStartDomains(selectedPeriod) {
              var offset = (selectedPeriod.to - selectedPeriod.from) / 2;
              var from = selectedPeriod.from - offset;
              var to = selectedPeriod.to + offset;
              if (from < totalXDomain[0]) from = totalXDomain[0];
              if (to > totalXDomain[1]) to = totalXDomain[1];
              startXDomain = [from, to];

              var yPos = selectedPeriod.row + y.invert(selectedPeriod.row * (barHeight + 5));
              startYDomain = [yPos - barHeight * 10, yPos + barHeight * 10];
          }

          function formatTickText(text) {
              text = text.split(".").join("$");
              text = text.split(",").join(".");
              text = text.split("$").join(",");

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

          function removeOverlappingTicks(ticksSelection) {
              for (var i = 0; i < ticksSelection[0].length; i++) {
                  var currentTick = ticksSelection[0][i];
                  var nextTick = ticksSelection[0][i+1];
                  if (!currentTick || !nextTick || !currentTick.getBoundingClientRect() || !nextTick.getBoundingClientRect())
                      continue;
                  while (currentTick.getBoundingClientRect().right > nextTick.getBoundingClientRect().left) {
                      d3.select(nextTick).remove();
                      i++;
                      nextTick = ticksSelection[0][i+1];
                      if (!nextTick)
                          break;
                  }
              }
          }

          function adjustStartXDomain() {
              if (startXDomain[0] < minYear)
                  startXDomain[0] = minYear;
              if (startXDomain[1] > maxYear)
                  startXDomain[1] = maxYear;
          }
      }
    };
  }

);