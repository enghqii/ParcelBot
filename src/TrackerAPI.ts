import * as request from 'request-promise'
import { Config } from './config'

export class TrackerAPI {
    
    public static readonly BaseURL: string = "http://info.sweettracker.co.kr";

    /**
     * 
     * @param companyCode 
     * @param invoiceNumber 
     */
    public static CreateQueryParcelPromise(companyCode: string, invoiceNumber: string): request.RequestPromise {

        let qs: object = {
            t_key: Config.trackerAPIKey,
            t_code: companyCode,
            t_invoice: invoiceNumber,
        };

        let options: request.OptionsWithUrl = {
            url: TrackerAPI.BaseURL + "/api/v1/trackingInfo",
            qs: qs,
            json: true,
        }

        let promise: request.RequestPromise = request(options);
        return promise;
    }

    /**
     * 
     * @param invoiceNumber 
     */
    public static CreateGuessCompanyCodePromise(invoiceNumber: string): request.RequestPromise {
        
        let qs: object = {
            t_key: Config.trackerAPIKey,
            t_invoice: invoiceNumber,
        };

        let options: request.OptionsWithUrl = {
            url: TrackerAPI.BaseURL + "/api/v1/recommend",
            qs: qs,
            json: true,
        }

        let promise: request.RequestPromise = request(options);
        return promise;
    }

    public static CreateRetrieveCompanyCodeListPromise(): request.RequestPromise {

        var qs = {
            t_key: Config.trackerAPIKey,
        };

        let options: request.OptionsWithUrl = {
            url: TrackerAPI.BaseURL + "/api/v1/companylist",
            qs: qs,
            json: true,
        }

        let promise: request.RequestPromise = request(options);
        return promise;
    }

    /**
     * 
     * @param err 
     */
    public static ErrorHandler(err): void {
        console.log("Something went wrong. \n" + err);
    }
}
