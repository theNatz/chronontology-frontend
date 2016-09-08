'use strict';

angular.module('chronontology.directives', [])

  .directive('timeline', function($location) {
    return {
      restrict: 'EA',
      scope: {
          periods: '=',
          selectedPeriodId: '='
      },
      templateUrl: 'partials/timeline.html',
      link: function(scope, element, attrs) {

          // These variables should be constant variables. Set to var because of an error with safari.
          var barHeight = 20;
          var margin = 15;
          var minYear = -10000;
          var maxYear = new Date().getFullYear();
          var maxZoomYears = 5;
          // / These variables should be constant variables. Set to var because of an error with safari.

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

          scope.$watch('periods', function() {
             if (scope.periods) initialize();
          });

          d3.select(window).on('resize', resize);

          function initialize() {
              var width = getWidth();
              var height = getHeight();

              y = d3.scale.linear()
                  .domain([0, barHeight * 20])
                  .range([0, parseInt(height) - 30]);

              var periodsData = prepareData();

              x = d3.scale.linear()
                  .domain(startXDomain)
                  .range([0, parseInt(width)]);

              y.domain(startYDomain);

              timeline = d3.select('#timeline').append('svg')
                  .attr('width', parseInt(width))
                  .attr('height', parseInt(height))
                  .classed('timeline', true);

              canvas = timeline.append('svg')
                  .attr('width', parseInt(width))
                  .attr('height', parseInt(height) - 30);

              axis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .ticks(7)
                  .tickSize(10, 0);

              axisElement = timeline.append('svg')
                  .attr('y', parseInt(height) - 30)
                  .attr('width', parseInt(width))
                  .classed('axis', true)
                  .call(axis);

              var minZoom = (startXDomain[1] - startXDomain[0]) / (totalXDomain[1] - totalXDomain[0]);
              var maxZoom = (startXDomain[1] - startXDomain[0]) / maxZoomYears;

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

          function resize() {
              var width = getWidth();
              var height = getHeight();

              y.range([0, parseInt(height) - 30]);
              x.range([0, parseInt(width)]);

              timeline.attr('width', parseInt(width))
                  .attr('height', parseInt(height));

              canvas.attr('width', parseInt(width))
                  .attr('height', parseInt(height) - 30);

              axisElement.attr('width', parseInt(width));
              axisElement.call(axis);

              updateBars();
          }

          function getWidth() {
              return element[0].parentNode.clientWidth - margin;
          }

          function getHeight() {
              return element[0].parentNode.clientHeight - margin;
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
                          id: scope.periods[i].resource['@id'],
                          name: label,
                          from: parseInt(scope.periods[i].resource.hasTimespan[0].begin.at),
                          to: parseInt(scope.periods[i].resource.hasTimespan[0].end.at),
                          successor: scope.periods[i].resource.relations.isFollowedBy
                              ? scope.periods[i].resource.relations.isFollowedBy[0] : undefined,
                          parent: scope.periods[i].resource.relations.isPartOf,
                          children: scope.periods[i].resource.relations.hasPart,
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
                  setStartDomainsToSelection(selectedPeriod);
              else
                  setStandardStartDomains();

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
                  return b.periodsCount - a.periodsCount;
              });

              var rows = [];
              var colorGroupNumber = 1;

              for (var i in periodGroups) {
                  for (var rowNumber = 0; rowNumber < 1000; rowNumber++) {
                      if (doesPeriodGroupFitInRow(periodGroups[i], rowNumber, rows)) {
                          putPeriodGroupToRow(periodGroups[i], rowNumber, rows);
                          colorGroupNumber = getColorGroupNumber(colorGroupNumber, periodGroups[i], rows);
                          setColorGroup(periodGroups[i], colorGroupNumber);
                          break;
                      }
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
                  if (!periods[i].periodGroup) {
                      var period = periods[i];
                      while (period.parent && period.parent[0]) {
                          if (period.parent[0] in periodsMap)
                              period = periodsMap[period.parent[0]];
                          else break;
                      }
                      addToGroup(period, periodsMap, null, 0, periodGroups);
                      if (periodGroups.indexOf(period.periodGroup) == -1)
                          periodGroups.push(period.periodGroup);
                  }
              }

              for (var i in periods)
                  addSuccessorToGroup(periods[i], periodsMap, periodGroups);

              return periodGroups;
          }

          function addToGroup(period, periodsMap, group, row, periodGroups) {

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
                      addToGroup(periodsMap[period.children[i]], periodsMap, group, row + 1, periodGroups);
                  }
              }
          }

          function addSuccessorToGroup(period, periodsMap, periodGroups) {
              if (period.successor && period.successor in periodsMap && period.id != period.successor) {
                  var successor = periodsMap[period.successor];
                  if (successor.periodGroup.periodsCount == 1) {
                      periodGroups.splice(periodGroups.indexOf(successor.periodGroup), 1);
                      setPeriodGroup(successor, period.periodGroup, period.groupRow);
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

          function doesPeriodGroupFitInRow(group, rowNumber, rows) {
              for (var i = rowNumber; i < rowNumber + group.rows.length; i++) {
                  if (!rows[i]) continue;
                  for (var j in rows[i]) {
                      var period = rows[i][j];
                      if (!(period.to <= group.from || period.from >= group.to)) {
                          return false;
                      }
                  }
              }
              return true;
          }

          function putPeriodGroupToRow(group, rowNumber, rows) {
              group.startRow = rowNumber;
              for (var i = 0; i < group.rows.length; i++) {
                  for (var j in group.rows[i]) {
                      group.rows[i][j].row = rowNumber + i;
                      if (!rows[rowNumber + i]) rows[rowNumber + i] = [];
                      rows[rowNumber + i].push(group.rows[i][j]);
                      rows[rowNumber + i].sort(function(a, b) {
                          return a.from - b.from;
                      });
                  }
              }
          }

          function getColorGroupNumber(currentColorGroupNumber, group, rows) {
              var colorGroupNumber = currentColorGroupNumber;

              var loops = 0;
              do {
                  colorGroupNumber = (colorGroupNumber == 10) ? 1 : colorGroupNumber + 1;
              } while (doAdjacentPeriodGroupsHaveColorGroup(group, colorGroupNumber, rows) && loops++ < 10)

              return colorGroupNumber;
          }

          function doAdjacentPeriodGroupsHaveColorGroup(group, colorGroupNumber, rows) {
              var startRow = (group.startRow == 0) ? 0 : group.startRow - 1;
              var endRow = (group.startRow == 0) ? startRow + group.rows.length : startRow + group.rows.length + 1;
              for (var i = startRow; i <= endRow; i++) {
                  for (var j in rows[i]) {
                      var period = rows[i][j];
                      if (period.colorGroup == colorGroupNumber &&
                            detectIntersection(period.from, period.to, group.from, group.to))
                          return true;
                  }
              }

              for (var i = 0; i < group.rows.length; i++) {
                  for (var j in group.rows[i]) {
                      var rowIndex = rows[group.startRow + i].indexOf(group.rows[i][j]);
                      if (rowIndex > 0) {
                          var period = rows[group.startRow + i][rowIndex - 1];
                          if (period.colorGroup == colorGroupNumber &&
                              detectIntersection(period.from, period.to, group.from, group.to))
                              return true;
                      }
                      if (rowIndex < rows[group.startRow + i].length - 1) {
                          var period = rows[group.startRow + i][rowIndex + 1];
                          if (period.colorGroup == colorGroupNumber &&
                              detectIntersection(period.from, period.to, group.from, group.to))
                              return true;
                      }
                  }
              }

              return false;
          }

          function detectIntersection(from1, to1, from2, to2) {
              if (from1 <= from2 && to1 >= from2) return true;
              if (from1 <= to2 && to1 >= to2) return true;
              if (from1 >= from2 && to1 <= to2) return true;

              return false;
          }

          function setColorGroup(group, colorGroupNumber) {
              for (var i in group.rows) {
                  for (var j in group.rows[i]) {
                      group.rows[i][j].colorGroup = colorGroupNumber;
                  }
              }
          }

          function formatTickText(text) {
              text = text.split(".").join("$");
              text = text.split(",").join(".");
              text = text.split("$").join(",");

              if (text.length < 6 || (text.indexOf("-") > -1 && text.length < 7)) {
                  text = text.replace(".", "");
              }

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

          function setStartDomainsToSelection(selectedPeriod) {
              var span = selectedPeriod.to - selectedPeriod.from;
              var offset = (span < maxZoomYears) ? (maxZoomYears - span) / 2 : span / 2;
              var from = selectedPeriod.from - offset;
              var to = selectedPeriod.to + offset;
              if (from < totalXDomain[0]) from = totalXDomain[0];
              if (to > totalXDomain[1]) to = totalXDomain[1];
              startXDomain = [from, to];

              var centralRow = selectedPeriod.row;
              if (centralRow < 5) centralRow = 5;
              var yPos = centralRow + y.invert(centralRow * (barHeight + 5));
              startYDomain = [yPos - barHeight * 10, yPos + barHeight * 10];
          }

          function setStandardStartDomains() {
              startXDomain[0] = totalXDomain[0];
              startXDomain[1] = totalXDomain[1];
              if (startXDomain[0] < minYear)
                  startXDomain[0] = minYear;
              if (startXDomain[1] > maxYear)
                  startXDomain[1] = maxYear;

              startYDomain = [0, barHeight * 20];
          }
      }
    };
  }

);