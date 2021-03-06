function TimelineController(timelineDataService, $location, $element, $scope) {

    var _this = this;

    // These variables should be constant variables. Set to var because of an error with safari.
    var margin = 15;
    var maxZoomYears = 5;
    var minStartYear = -10000;
    var maxStartYear = new Date().getFullYear();
    var barHeight = 20;
    var buttonZoomFactor = 0.5;
    // -------

    var timeline;
    var canvas;
    var axis, axisElement;
    var bars, barPaths, barTexts;
    var tooltip;
    var zoom, drag;
    var x, y;

    var timelineData;

    var totalXDomain = [];
    var startXDomain = [];
    var startYDomain = [];

    var width;
    var height;

    var initialized = false;

    var hoverPeriod;

    d3.selection.prototype.moveToFront = function() {

        return this.each(function() {
            this.parentNode.appendChild(this);
        });
    };

    this.$onChanges = function() {

        if (this.periods) this.initialize();
    };

    this.initialize = function() {

        width = this.getWidth();
        height = this.getHeight();

        y = d3.scale.linear()
            .domain([0, barHeight * 20])
            .range([0, parseInt(height) - 30]);

        timelineData = timelineDataService.getTimelineData(this.periods);
        totalXDomain = timelineData.xDomain;

        this.setStartDomains(timelineData.periodsMap);

        x = d3.scale.linear()
            .domain(startXDomain)
            .range([0, parseInt(width)]);

        y.domain(startYDomain);

        timeline = d3.select('#timeline').append('svg')
            .attr('width', parseInt(width))
            .attr('height', parseInt(height))
            .classed('timeline', true);

        if (this.inactive) timeline.classed('inactive', true);

        canvas = timeline.append('svg')
            .attr('width', parseInt(width))
            .attr('height', parseInt(height) - 30);

        axis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .ticks(parseInt(this.axisTicks))
            .tickSize(10, 0);

        axisElement = timeline.append('svg')
            .attr('y', parseInt(height) - 30)
            .attr('width', parseInt(width))
            .classed('axis', true)
            .call(axis);


        if (!this.inactive) {
            var minZoom = (startXDomain[1] - startXDomain[0])
                / (totalXDomain[1] - totalXDomain[0]);
            var maxZoom = (startXDomain[1] - startXDomain[0]) / maxZoomYears;

            zoom = d3.behavior.zoom()
                .x(x)
                .scaleExtent([minZoom, maxZoom])
                .on('zoom', function () {
                    axisElement.call(axis);
                    _this.updateBars();
                });

            drag = d3.behavior.drag()
                .on('drag', function () {
                    var domain = y.domain();
                    domain[0] -= d3.event.dy;
                    domain[1] -= d3.event.dy;
                    y.domain(domain);
                    axisElement.call(axis);
                    _this.updateBars();
                });

            timeline.call(zoom).call(drag);

            tooltip = d3.select('body')
                .append('div')
                .classed('timeline-tooltip', true);
        }

        bars = canvas.selectAll('g').data(timelineData.periods).enter();
        barPaths = bars.append('g')
            .attr('id', function(d) { return 'bar-path-' + d.id; })
            .attr('class', function(d) {
                var barClass = 'bar level' + (d.level + 1);
                if (_this.inactive) {
                    barClass += ' inactive';
                } else {
                    barClass += ' group' + d.colorGroup;
                }
                return barClass;
            })
            .append('path');

        if (!this.inactive) {
            barPaths.on('click', _this.showPeriod);
            this.addHoverBehavior(barPaths);
        }

        if (this.selectedPeriodId) {
            barPaths.filter(function(d) {
                return d.id === _this.selectedPeriodId;
            }).classed('selected', true);
        }

        barTexts = canvas.selectAll('g')
            .append('text')
            .classed('text', true)
            .attr('id', function(d) { return 'bar-text-' + d.id; })
            .on('click', _this.showPeriod);
        if (this.inactive) {
            barTexts.classed('inactive', true);
        } else {
            this.addHoverBehavior(barTexts);
        }

        this.updateBars();

        d3.select(window).on('resize', _this.resize);

        initialized = true;
    };

    this.resize = function() {

        if (!initialized) return;

        var width = _this.getWidth();
        var height = _this.getHeight();

        y.range([0, parseInt(height) - 30]);
        x.range([0, parseInt(width)]);

        timeline.attr('width', parseInt(width))
            .attr('height', parseInt(height));

        canvas.attr('width', parseInt(width))
            .attr('height', parseInt(height) - 30);

        axisElement.attr('y', parseInt(height) - 30);
        axisElement.attr('width', parseInt(width));
        axisElement.call(axis);

        _this.updateBars();
    };

    this.getWidth = function() {

        return $element[0].parentNode.clientWidth - margin;
    };

    this.getHeight = function() {

        return $element[0].parentNode.clientHeight - margin;
    };

    this.updateBars = function() {

        barPaths.attr('d', function(data) { return _this.computeBarPaths(data); });

        barTexts.attr('x', function(data) {
            return x(data.from) + (_this.getBarWidth(data)) / 2;
        })
            .attr('y', function(data) {
                return y(data.row) + data.row * (barHeight + 5) + barHeight / 2 + 5;
            })
            .text(function(data) {
                if (_this.doesTextFitInBar(data.name, _this.getBarWidth(data))) {
                    data.textVisible = true;
                    return data.name;
                } else {
                    data.textVisible = false;
                    return '';
                }
            });

        axisElement.selectAll('.tick text')
            .text(function() { return _this.formatTickText(d3.select(this).text()); });
    };

    this.computeBarPaths = function(data) {

        var topY = _this.getPathYPosition(data);
        var bottomY = topY + barHeight;
        var edgeRadius = Math.min(Math.floor(_this.getBarWidth(data) / 2), 5);

        return _this.computeLeftEndPathDefinition(data, topY, bottomY, edgeRadius) + ' '
            + _this.computeRightEndPathDefinition(data, topY, bottomY, edgeRadius) + 'Z';
    };

    this.computeLeftEndPathDefinition = function(data, topY, bottomY, edgeRadius) {

        if (data.earliestFrom) {
            return 'M' + (x(data.earliestFrom) + ((x(data.from) - x(data.earliestFrom)) / 10)) + ' ' + bottomY + ' '
                + 'L' + (x(data.from) + + ((x(data.from) - x(data.earliestFrom)) / 10)) + ' ' + topY;
        } else if (edgeRadius > 0) {
            return 'M' + (x(data.from) + edgeRadius) + ' ' + bottomY + ' '
                + 'Q' + x(data.from) + ' ' + bottomY + ' ' + x(data.from) + ' ' + (bottomY - edgeRadius)
                + 'L' + x(data.from) + ' ' + (topY + edgeRadius)
                + 'Q' + x(data.from) + ' ' + topY + ' ' + (x(data.from) + edgeRadius) + ' ' + topY
        } else {
            return 'M' + x(data.from) + ' ' + bottomY + ' '
                + 'L' + x(data.from) + ' ' + topY;
        }
    };

    this.computeRightEndPathDefinition = function(data, topY, bottomY, edgeRadius) {

        if (data.latestTo || edgeRadius === 0) {
            return 'L' + x(data.latestTo || data.to) + ' ' + topY + ' '
                + 'L' + x(data.to) + ' ' + bottomY;
        } else {
            return 'L' + (x(data.to) - edgeRadius) + ' ' + topY + ' '
                + 'Q' + x(data.to) + ' ' + topY + ' ' + x(data.to) + ' ' + (topY + edgeRadius)
                + 'L' + x(data.to) + ' ' + (bottomY - edgeRadius)
                + 'Q' + x(data.to) + ' ' + bottomY + ' ' + (x(data.to) - edgeRadius) + ' ' + bottomY;
        }
    };

    this.getPathYPosition = function(data) {

        return y(data.row) + data.row * (barHeight + 5);
    };

    this.getBarWidth = function(data) {

        return x(data.to) - x(data.from);
    };

    this.doesTextFitInBar = function(text, barWidth) {

        return !(this.getApproximatedTextLabelWidth(text) > barWidth);
    };

    this.getApproximatedTextLabelWidth = function(text) {

        return text.length * 7;
    };

    this.showPeriod = function(period) {

        tooltip.style('visibility', 'hidden');
        $location.path('/period/' + period.id);
        $scope.$apply();
    };

    this.formatTickText = function(text) {

        text = text.split('.').join('$');
        text = text.split(',').join('.');
        text = text.split('$').join(',');

        if (text.length < 6 || (text.indexOf('-') > -1 && text.length < 7)) {
            text = text.replace('.', '');
        }

        return text;
    };

    this.addHoverBehavior = function(selection) {

        selection.on('mouseover', function(period) {
            d3.select('#bar-path-' + period.id).classed('hover', true);
            if (period !== hoverPeriod) {
                d3.select('#bar-path-' + period.id).moveToFront();
                d3.select('#bar-text-' + period.id).moveToFront();
                hoverPeriod = period;
            }
            if (period.textVisible) return;
            tooltip.text(period.name);
            return tooltip.style('visibility', 'visible');
        })
            .on('mousemove', function() {
                tooltip.style('top', (d3.event.pageY - 10) + 'px');
                var tooltipWidth = tooltip.node().getBoundingClientRect().width;
                return tooltipWidth < width - d3.event.pageX
                    ? tooltip.style('left', (d3.event.pageX + 10) + 'px')
                    : tooltip.style('left', (d3.event.pageX - tooltipWidth - 10) + 'px');
            })
            .on('mouseout', function(period) {
                d3.select('#bar-path-' + period.id).classed('hover', false);
                return tooltip.style('visibility', 'hidden');
            });
    };

    this.setStartDomains = function(periodsMap) {

        if (this.selectedPeriodId && periodsMap[this.selectedPeriodId])
            this.setStartDomainsToSelection(periodsMap[this.selectedPeriodId]);
        else
            this.setStandardStartDomains();
    };

    this.setStartDomainsToSelection = function(selectedPeriod) {

        var span = (selectedPeriod.latestTo || selectedPeriod.to) - (selectedPeriod.earliestFrom || selectedPeriod.from);
        var offset = (span < maxZoomYears) ? (maxZoomYears - span) / 2 : span / 2;
        var from = (selectedPeriod.earliestFrom || selectedPeriod.from) - offset;
        var to = (selectedPeriod.latestTo || selectedPeriod.to) + offset;
        if (from < totalXDomain[0]) from = totalXDomain[0];
        if (to > totalXDomain[1]) to = totalXDomain[1];
        startXDomain = [from, to];

        var centralRow = selectedPeriod.row;
        if (centralRow < 5) centralRow = 5;
        var yPos = centralRow + y.invert(centralRow * (barHeight + 5)) - 5;
        startYDomain = [yPos - barHeight * 10, yPos + barHeight * 10];
    };

    this.setStandardStartDomains = function() {

        startXDomain[0] = totalXDomain[0];
        startXDomain[1] = totalXDomain[1];
        if (startXDomain[0] < minStartYear)
            startXDomain[0] = minStartYear;
        if (startXDomain[1] > maxStartYear)
            startXDomain[1] = maxStartYear;

        startYDomain = [0, barHeight * 20];
    };

    this.zoomIn = function(event) {

        event.target.blur();
        this.zoom(true);
    };

    this.zoomOut = function(event) {

        event.target.blur();
        this.zoom(false);
    };

    this.zoom = function(zoomIn) {

        var center = [width / 2, height / 2];
        var view = { x: zoom.translate()[0], y: zoom.translate()[1], k: zoom.scale() };

        var targetZoom = zoom.scale() * (1 + buttonZoomFactor * (zoomIn ? 1 : -1));

        if (targetZoom < zoom.scaleExtent()[0] || targetZoom > zoom.scaleExtent()[1]) return false;

        view.x += center[0] - (((center[0] - view.x) / view.k) * targetZoom + view.x);
        view.y += center[1] - (((center[1] - view.y) / view.k) * targetZoom + view.y);
        view.k = targetZoom;

        this.interpolateZoom([view.x, view.y], view.k);
    };

    this.interpolateZoom = function(translate, scale) {

        return d3.transition().duration(350).tween('zoom', function() {

            var interpolatedTranslate = d3.interpolate(zoom.translate(), translate),
                interpolatedScale = d3.interpolate(zoom.scale(), scale);

            return function(time) {
                zoom.scale(interpolatedScale(time))
                    .translate(interpolatedTranslate(time));
                axisElement.call(axis);
                _this.updateBars();
            };
        });
    };
}

angular.module('chronontology.components').component('timeline', {
    templateUrl: '../../partials/components/timeline.html',
    bindings: {
        periods: '<',
        selectedPeriodId: '@',
        axisTicks: '@',
        inactive: '<'
    },
    controller: TimelineController
});
