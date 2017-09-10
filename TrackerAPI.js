const request = require('request-promise');
const config = require('./config');

//
// Sweet tracker (택배 정보) API
//
class TrackerAPI {

    static GetTrackerBaseURL() {
        return 'http://info.sweettracker.co.kr';
    }

    static CreateQueryParcelPromise(companyCode, invoiceNumber) {

        // Http request params
        var qs = {
            t_key: config.trackerAPIKey,
            t_code: companyCode,
            t_invoice: invoiceNumber,
        };

        var options = {
            url: TrackerAPI.GetTrackerBaseURL() + '/api/v1/trackingInfo',
            qs: qs,
            json: true, // Enable automatic json parse
        };

        var promise = request(options)
            .catch(TrackerAPI.ErrorHandler);

        return promise;
    }

    static CreateGuessCompanyCodePromise(invoiceNumber) {

        // Http request params
        var qs = {
            t_key: config.trackerAPIKey,
            t_invoice: invoiceNumber,
        };

        var options = {
            url: TrackerAPI.GetTrackerBaseURL() + '/api/v1/recommend',
            qs: qs,
            json: true, // Enable automatic json parse
        };

        var promise = request(options)
            .catch(TrackerAPI.ErrorHandler);

        return promise;
    }

    static CreateRetrieveCompanyCodeListPromise() {

        // Http request params
        var qs = {
            t_key: config.trackerAPIKey,
        };

        var options = {
            url: TrackerAPI.GetTrackerBaseURL() + '/api/v1/companylist',
            qs: qs,
            json: true, // Enable automatic json parse
        };

        var promise = request(options)
            .catch(TrackerAPI.ErrorHandler);

        return promise;
    }

    static ErrorHandler(err) {
        console.log("Something went wrong. \n " + err)
    }
}

module.exports = TrackerAPI;