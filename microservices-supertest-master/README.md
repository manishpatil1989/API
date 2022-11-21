# microservices-supertest

This module provides ready to use, light weight framework for Api testing. It is built in Node js (v14) and uses other supporting packages mainly Supertest.

**Installation:**
-------------

To install execute: npm install

**Usage:**
------

To run feature files: npm run test
To generate Html report: npm run report.  Report config parameters are set in 'reportgenerator.js'

**Setup** :
-------

There are 2 config files:
1. Configs/Env.json, contains all Global config
2. Configs/<apiname>.json to set up individual Api configuration

**Configs/Env.json**: 
-----------------

 - 'env' parameter specifies the environment to execute tests.
 - Each 'env' has further provisions to specify the group urls.
 - 'zapproxy': to specify zap server.

**Setting up API:**
------

- Each API should have its config file located at Configs/<apiname>.json containing the details of api in json format, below we have explained config json keys for 'getUser' api:

  **Schemas:** Object/Array (depends on api output)
   --------

   - getUser.json has two schemas mentioned, 'successSchema' for expected api response when api is successful and 'failschema' for expected api failure 		response.
   - Multiple schemas can be provided here with unique names and these names will be used in stepDefinition in Feature files to match the response against the schema mentioned in step definition


	e.g stepDefinition : 
	And I validate consumer contract for "getUser" against schema "successschema"
	this will validate the response from 'getUser' api to check if it conforms with schema mentioned in 'successschema'

	**endpoint:** string
    ---------

	this specifies the endpoint for the api

	**input: **   Object/Array (depends on api input)
	---------

	In case the api expects input json then this parameter specifies the default input that will be passed as input. Specific json keys, if needed can be added, modified, removed from this default input through Feature files, OR you could also ignore the input from config and pass an altogether new input from Feature files

	These provisions in config file with respect to 'input', 
	- helps in data management as we do not need to specifiy the complete input to apis at every call
	- only required parts of input can be amended through Feature files
	- if there are future changes to api input then it can be managed as single point of change


	**header :**   Object/Array (depends on api input)
	---------

	this specifies the headers for the api. Similar to 'input' parameter the header can be amended from stepdefinition


	**responseToSave:** Array
	---------------
	 In case the response of api is needed in further stepdifinitions then specify the response keys to be saved and these can be further extracted for use in 		next api in sequence.

	**headerToSave:**   Array
	---------------
	 In case the response Header of api is needed in further stepdifinitions then specify the response header keys to be saved and these can be further 		extracted for use in next api in sequence.

	 **cookieToSave:**   Array
	 ---------------
	 In case specific response cookies of api is needed for verification or to be passed on to next api in sequence, then specify the response cookie keys to 		be saved and these can be further extracted for use in next api in sequence.

	saveResponseCookies:	boolean
	setRequestCookies:		boolean
    --------------------
    When the entire set of response cookies need to be passed on to next api in sequence then set 'saveResponseCookies' to true in the upstream api and set 'setRequestCookies' to true in the downstream api so that all the response cookies from upstream api are passed on as input cookies in downstream api


Feature Files:
--------------
Default input, header are specified in the respective api json file. If any of these, for eg. default input, header needs to be changed at run time then use the below conventions in Feature file:

	- To Add new key/value to default input, insert 'add' key in Feature file as follows: {'add':{'key':'value'}}
	- To Replace default value of key in config file with key/value from feature file: {'replace':{'key':'value'}}
	- To Delete key from default input: {'delete':['key']}
	- To Replace default value of key with response from upstream api:
		- In config file of upstream api set the parameter 'responseToSave' to the key in response to be saved
		- In feature file, for the down stream api set: {'fetch':{'upstreamKey' : 'downstreamKey'}} so that the value of response Key 'upstreamKey' from upstream api is used as value of key 'downstreamKey' in down stream api.
	All of the above can be used together or in parts in input and header
	-For Cookies:
		- If specific cookies from upstream api response have to be passed to down stream api as input cookie then 
			- In config file of upstream api set the parameter 'cookieToSave' to the key from response cookie that needs to be saved
			- use {'upstreamKey': 'downstreamKey'} in step definition so that the value of response cookie Key 'upstreamKey' from upstream api is used as value of key 'downstreamKey' in down stream api.
		- When the entire set of response cookies need to be passed on to next api, then set 'saveResponseCookies' to true in the upstream api and set 'setRequestCookies' to true in the downstream api so that all the response cookies from upstream api are passed on as input cookies in downstream api
	-Bypass the config file: to by pass input, header values from default config json: 
		use key 'as-is':  {'as-is':{'key':'value', 'list': [1,2]}}, value of 'as-is' will be used as input.

e.g. of step definition:
	
	And I GET "ms" with name "testapi" with body "{'replace:{'key' : 'value'}}" and header "" and cookie ""

	And I POST "ms" with name "testapi" with body "" and header "{'add':{'key':'value'}}" and cookie ""

	And I GET "ms" with name "testapi" with body "{'delete':['key']}" and header "" and cookie ""

	And I POST "ms" with name "testapi" with body "{'fetch':{'upstreamKey' : 'downstreamKey'}" and header "" and cookie ""

	All of the above amendments can be used in 'input' and 'header' together like:

	And I POST "ms" with name "testapi" with body "" and header "{'add':{'key':'value'}, 'delete':['key']}" and cookie ""

	And I GET "ms" with name "testapi" with body "" and header "" and cookie "{'upstreamKey': 'downstreamKey'}"

ZAP: To use ZAP set below
----
	-set 'zapproxy' in Env.json to point to zap server
	-In Feature file use step definition 'And I turn on zap proxy' at the start of scenario to pass api calls through ZAP scan.


Contacts:
--------------
vinay.redkar@publicissapient.com

ajay.thakur@publicissapient.com


