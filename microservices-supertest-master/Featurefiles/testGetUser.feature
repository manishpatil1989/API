
@getUser
Feature:    Validate GetUser call

        Scenario Outline:   Validate consumer contract and schema of adduser call for valid body parameters and 200 status response
            Given I am on "grp1" site
              And I GET "ms" with name "getUser" with input "" and header "" and cookie ""
              And I validate status code as "<statuscode>"
              And I validate consumer contract for "getUser" against schema "successschema"
              And I validate business logic as "<businesslogic>"

        Examples:
                  | bodyparam                                                                                                      | statuscode | businesslogic                            |
                  | {'fetch':{'userid':'userid'},{'replace':{'salary':10000}, 'add':{'firstname': 'Raymond'}, 'delete': ['title']} | 200        | {'firstname':'Raymond', 'salary': 10000} |
               


        Scenario Outline: Intercept test for Zap scan

            Given I am on "grp1" site
              And I turn on zap proxy
              And I GET "ms" with name "getUser" with input "" and header "" and cookie ""
              And I validate status code as "<statuscode>"
              And I validate consumer contract for "getUser" against schema "successschema"
              And I validate business logic as "<businesslogic>"
       
        Examples:
                  | bodyparam                                                                                                      | statuscode | businesslogic                            |
                  | {'fetch':{'userid':'userid'},{'replace':{'salary':10000}, 'add':{'firstname': 'Raymond'}, 'delete': ['title']} | 200        | {'firstname':'Raymond', 'salary': 10000} |
            