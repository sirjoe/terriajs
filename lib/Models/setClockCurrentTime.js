'use strict';

/*global require*/
var defined = require('terriajs-cesium/Source/Core/defined');
var defaultValue = require('terriajs-cesium/Source/Core/defaultValue');
var JulianDate = require('terriajs-cesium/Source/Core/JulianDate');

var TerriaError = require('../Core/TerriaError');

/**
 * Set time to nearest time to specified (may be start or end of time range if time is not in range).
 * @param {DataSourceClock} clock clock to set current time on.
 * @param {JulianDate} timeToSet the time to set
 * @private
 */
function _setTimeIfInRange(clock, timeToSet)
{
    if (JulianDate.lessThan(timeToSet, clock.startTime)) {
        clock.currentTime = clock.startTime.clone(clock.currentTime);
    }
    else if (JulianDate.greaterThan(timeToSet, clock.stopTime)) {
        clock.currentTime = clock.stopTime.clone(clock.currentTime);
    } else {
        clock.currentTime = timeToSet.clone(clock.currentTime);
    }
}

/**
 * Sets the current time of the clock, using a string defined specification for the time point to use.
 * @param {DataSourceClock} clock clock to set the current time on.
 * @param {String} initialTimeSource A string specifiying the value to use when setting the currentTime of the clock. Valid options are:
 *                 ("present": closest to today's date,
 *                  "start": start of time range of animation,
 *                  "end": end of time range of animation,
 *                  An ISO8601 date e.g. "2015-08-08": specified date or nearest if date is outside range).
 */
function setClockCurrentTime(clock, initialTimeSource)
{
    // This is our default. Start at the nearest instant in time.
    var now = JulianDate.now();
    _setTimeIfInRange(clock, now);

    initialTimeSource = defaultValue(initialTimeSource, "present");
    switch(initialTimeSource)
    {
        case "start":
            clock.currentTime = clock.startTime.clone(clock.currentTime);
            break;
        case "end":
            clock.currentTime = clock.stopTime.clone(clock.currentTime);
            break;
        case "present":
            // Set to present by default.
            break;
        default:
            // Note that if it's not an ISO8601 timestamp, it ends up being set to present.
            // Find out whether it's an ISO8601 timestamp.
            var timestamp;
            try {
                timestamp = JulianDate.fromIso8601(initialTimeSource);

                // Cesium no longer validates dates in the release build.
                // So convert to a JavaScript date as a cheesy means of checking if the date is valid.
                if (isNaN(JulianDate.toDate(timestamp))) {
                    throw new Error('Invalid Date');
                }
            }
            catch (e) {
                throw new TerriaError('Invalid initialTimeSource specified in config file: ' + initialTimeSource);
            }
            if (defined(timestamp))
            {
                _setTimeIfInRange(clock, timestamp);
            }
    }
}

module.exports = setClockCurrentTime;
