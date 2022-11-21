var request = require('supertest');
var Ajv = require('ajv');

try {

    let commonConfig = require('../../Configs/CommonConfig.json');
    let envConfig = require('../../Configs/Env.json');

    async function postapi(url, body, header) {
        req = request(url);
        return ((await req
            .post('')
            .send(body)
            .set(header)))
    }

    async function getapi(url, header, param) {

        req = request(url)
        return ((await req
            .get('')
            .set(header)))

    }


    async function postzapapi(url, body, header) {

        var zaprequest = require('supertest-with-proxy');
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        zapreq = zaprequest(url);
        return ((await zapreq
            .post('')
            .send(body)
            .proxy(envConfig['zapproxy'])
            .set(header)))
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    }

    async function getzapapi(url, header, param) {

        var zaprequest = require('supertest-with-proxy');
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        zapreq = zaprequest(url)
        return ((await zapreq
            .get('')
            .proxy(envConfig['zapproxy'])
            .set(header)))
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    }

    function getRespBody(res) {

        return (res.body)
    }

    function getRespHeader() {
        return (res.headers)

    }

    function getApiUrl(apiName, grp, isMS) {

        if (isMS) {
            let msConfig = require('../../Configs/' + apiName + '.json');
            if ("env" in msConfig)
                return (msConfig[msConfig['env']][grp] + msConfig['endpoint'])
            else
                return (getGroupDomain(grp) + msConfig['endpoint'])
            //envConfig[ envConfig['env']][grp]
        } else
            return (getGroupDomain(grp) + commonConfig[apiName]['endpoint'])
    }


    function getGroupDomain(grp) {

        return (envConfig[envConfig['env']][grp])


    }



    function getApiSchema(apiName, schemaName) {

        let msConfig = require('../../Configs/' + apiName + '.json');
        return (msConfig[schemaName.toLowerCase()])

    }



    function replaceParam(baselineStr, paramObj) {
        //paramObj = JSON.parse(param)     
        for (let key in paramObj)
            baselineStr = replaceJsonValue(baselineStr, key, paramObj[key])

        return (baselineStr)
    }


    function replaceJsonValue(data, k, v) {

        var parsedJson = JSON.parse(data, function (key, value) {
            if (key === k)
                return v;

            return value;
        });
        return (JSON.stringify(parsedJson))

    }




    //Delete Param

    function deleteParam(baselineStr, delArr) {

        for (item in delArr) {

            baselineStr = JSON.parse(baselineStr, function (key, value) {

                if (key === delArr[item])
                    return undefined;

                return value;
            });


            baselineStr = JSON.stringify(baslineStr)

        }

        return baselineStr
    }


    function addParam(baselineStr, addObj) {
        baseObj = JSON.parse(baselineStr)
        for (item in addObj)

            baseObj[item] = addObj[item]

        return JSON.stringify(baseObj)
    }


    //fecth Param

    function fetchParam(thisClass, baselineStr, paramObj) {
        //baseline = getApiBody(apiName, isMS)
        //baselineStr = JSON.stringify(baseline)
        //paramObj = JSON.parse(param.split("'").join("\""))

        for (let key in paramObj)
            if (thisClass[key.toLowerCase()] != undefined)
                baselineStr = replaceJsonValue(baselineStr, paramObj[key], thisClass[key.toLowerCase()])

        return (baselineStr)

    }

    //Construct cookie
    function constructCookie(thisClass, cookie) {
        cookieObj = JSON.parse(cookie.split("'").join("\""))

        if (Object.entries(cookieObj).length === 0)
            return


        strCookie = ''

        for (let cKey in cookieObj) {

            key = cKey.toLowerCase()
            if (thisClass[key] != undefined)
                strCookie = strCookie + cookieObj[cKey] + '=' + thisClass[key].substring(thisClass[key].indexOf('='), thisClass[key].length) + ';'


        }
        //console.log(strCookie.substring(0, strCookie.length - 1))
        return strCookie.substring(0, strCookie.length - 1);


    }

    function appendUrl(url, input) {



        inputObj = JSON.parse(input.split("'").join("\""))

        if (!inputObj.replace)
            return

        url = url + '?';

        for (let key in inputObj.replace) {
            if (key != undefined)
                url = url + key + '=' + inputObj.replace[key] + '&'
        }
        return url.substring(0, url.length - 1)

    }



    function validateContract(response, apiName, schemaName) {

        var ajv = new Ajv();
        //console.log(getApiSchema(apiName, schemaName))
        var valid = ajv.validate(getApiSchema(apiName, schemaName), response);
        if (!valid)
            return (ajv.errors);
        else
            return (true)

    }

    function validateBusLogic(response, param) {
        var json = JSON.parse(JSON.stringify(response));
        param = param.split("'").join("\"")
        paramObj = JSON.parse(param)
        for (let key in paramObj) {
            found = false
            isExact = true
            result = findVal(json, key, paramObj[key])
            if (!isExact)
                return retval
            else if (!found)
                return ('Key not found')

        }
        return true

        function findVal(object, propName, expectedval) {

            for (let key in object) {
                if (key === propName && object[key] == expectedval)
                    found = true
                if (key === propName && object[key] != expectedval) {
                    {
                        retval = 'Key: ' + propName + ' actualValue:' + object[key]
                        isExact = false
                    }

                } else {

                    if (typeof (object[key]) === 'object')
                        findVal(object[key], propName, expectedval)

                }
            }
        }

    }

 
    function saveResp(thisClass, apiName, res, isMS) {
        var res = getRespBody(res);
        keysToSave = getApiConfig(apiName, 'responseToSave', isMS);

        if (keysToSave.length == 0)
            return

        saveSessionparam(res, keysToSave, thisClass)

    }


    function saveCookie(thisClass, apiName, res, isMS) {
        //var res = getResBody(res);
        //var cookie = extractJsession(thisClass, res);
        keysToSave = getApiConfig(apiName, 'cookieToSave', isMS);

        if (keysToSave.length == 0)
            return

        var arrCookie = res['headers']['set-cookie'];

        for (k in keysToSave) {

            for (itr of arrCookie) {

                if (itr.includes(keysToSave[k]) == true) {

                    thisClass[keysToSave[k]] = itr.substring(0, itr.indexOf(';'))
                    break
                }
            }
        }

    }


    function setPersistentCookies(thisClass, apiName, res, isMS) {
        if (getApiConfig(apiName, 'saveResponseCookies', isMS))
            thisClass.allCookies = res['headers']['set-cookie'];
    }


    function createJsonInput(thisClass, base, param) {
        // //baseline = getApiBody(apiName, isMS)
        // baseline = getApiConfig(apiName, param, isMS)
        baselineStr = JSON.stringify(base)

        paramObj = JSON.parse(param.split("'").join("\""))

        if (paramObj['as-is'])
            return JSON.stringify(paramObj['as-is'])
        if (paramObj.replace)
            baselineStr = replaceParam(baselineStr, paramObj.replace)
        if (paramObj.fetch)
            baselineStr = fetchParam(thisClass, baselineStr, paramObj.fetch)
        if (paramObj.delete)
            baselineStr = deleteParam(baselineStr, paramObj.delete)
        if (paramObj.add)
            baselineStr = addParam(baselineStr, paramObj.add)


        return baselineStr
    }


    function saveHeader(thisClass, apiName, res, isMS) {
        var res = getRespHeader(res);

        keysToSave = getApiConfig(apiName, 'headerToSave', isMS);

        saveSessionparam(res, keysToSave, thisClass)

    }

    function saveSessionparam(res, arr, thisClass) {


        for (const i in arr) {
            JSON.parse(JSON.stringify(res), function (key, value) {
                if (key.toLowerCase() === arr[i].toLowerCase()) {
                    thisClass[arr[i].toLowerCase()] = value;
                    return value;
                }


                //thisClass[arr[i].toLowerCase()] = value;

            });
        }


    }


    function getApiConfig(apiName, param, isMS) {


        if (isMS) {
            let msConfig = require('../../Configs/' + apiName + '.json');
            return (msConfig[param])
        } else
            return (commonConfig[apiName][param])


    }




    module.exports = {
        getApiUrl,
        // getApiBody,
        replaceParam,
        postapi,
        validateContract,
        validateBusLogic,
        getapi,
        getApiConfig,
        saveResp,
        saveCookie,
        saveHeader,
        createJsonInput,
        appendUrl,
        constructCookie,
        getGroupDomain,
        getzapapi,
        postzapapi,
        setPersistentCookies
    };

} catch (err) {

    console.log('Error found in servicelib.js File');
    console.log(err);
}


