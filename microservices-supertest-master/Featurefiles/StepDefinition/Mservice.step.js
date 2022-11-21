
const { Given, Then, When } = require('cucumber');
let servicelib = require('../lib/servicelib.js');
let assert = require('chai').assert;

Given(/^I am on \"(.*)\" site$/, async function (grp) {
    this.grp = grp
    this.baseUrl = servicelib.getGroupDomain(grp)


});

When(/^I validate status code as \"(.*)\"$/, async function (code) {


    assert.equal(this.response.statusCode, parseInt(code), 'Service call failed return status code: ' + this.response.statusCode + 'response is:' + JSON.stringify(this.response.body))
});

When(/^I validate consumer contract for \"(.*)\" against schema \"(.*)\"$/, async function (apiName, schemaName) {

    schRes = servicelib.validateContract(this.response.body, apiName, schemaName)

    assert.equal(schRes, true, JSON.stringify(schRes) + 'Service call failed return response is:' + JSON.stringify(this.response.body))
});

When(/^I validate business logic as (\"(.*)\")$/, async function (param) {

    result = servicelib.validateBusLogic(this.response.body, param)
    assert.equal(result, true, 'Service call failed return response is:' + JSON.stringify(this.response.body) + ' Expected is: ' + param)

});


When(/^I POST \"(.*)\" with name \"(.*)\" with body \"(.*)\" and header \"(.*)\" and cookie \"(.*)\"$/, async function (isMS, apiName, bodyParam, headerParam, cookieParam) {


    isMS = isMS == 'ms' ? true : false
    url = servicelib.getApiUrl(apiName, this.grp, isMS)

    body = servicelib.getApiConfig(apiName, 'input', isMS)
    header = servicelib.getApiConfig(apiName, 'header', isMS)

    if (bodyParam != null)
        body = JSON.parse(servicelib.createJsonInput(this, body, bodyParam))

    if (headerParam != null)

        header = JSON.parse(servicelib.createJsonInput(this, header, headerParam))




    if (typeof (header['Content-Length']) == 'string') {
        header['Content-Length'] = JSON.stringify(body).length.toString();

    }

    if (cookieParam != null) {

        strCookie = servicelib.constructCookie(this, cookieParam)
        arrCookie = []
        arrCookie.push(strCookie)
        header.Cookie = arrCookie
    }
    else if (servicelib.getApiConfig(apiName, 'setRequestCookies', isMS))
        header.Cookie = this.allCookies

    if (this.isZap)
        await servicelib.postzapapi(url, body, header)
    else {
        res = (await servicelib.postapi(url, body, header))
        servicelib.saveResp(this, apiName, res, isMS);
        servicelib.saveCookie(this, apiName, res, isMS)
        servicelib.saveHeader(this, apiName, res, isMS)
        servicelib.setPersistentCookies(this, apiName, res, isMS)
        this.response = res
    }

});



Then(/^I GET \"(.*)\" with name \"(.*)\" with input \"(.*)\" and header \"(.*)\" and cookie \"(.*)\"$/, async function (isMS, apiName, inputParam, headerParam, cookieParam) {



    isMS = isMS == 'ms' ? true : false

    url = servicelib.getApiUrl(apiName, this.grp, isMS)



    if (inputParam != null)
        url = servicelib.appendUrl(url, inputParam);

    header = servicelib.getApiConfig(apiName, 'header', isMS)

    if (headerParam != null) {
        header = servicelib.createJsonInput(this, header, headerParam)
        header = JSON.parse(header)
    }


    if (cookieParam != null) {


        strCookie = servicelib.constructCookie(this, cookieParam)
        header.Cookie = strCookie;
    }

    if (this.isZap)
        await servicelib.getzapapi(url, header)
    else {
        res = (await servicelib.getapi(url, header))

        servicelib.saveResp(this, apiName, res, isMS);
        servicelib.saveCookie(this, apiName, res, isMS)
        servicelib.saveHeader(this, apiName, res, isMS)
        servicelib.setPersistentCookies(this, apiName, res, isMS)
        this.response = res
    }


});


Then(/^I turn on zap proxy$/, async function () {
    this.isZap = true
});