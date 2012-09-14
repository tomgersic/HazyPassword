#Hazy Password

This is the [Salesforce.com Mobile SDK](https://github.com/forcedotcom/SalesforceMobileSDK-iOS) iOS native demo app shown during the [Dreamforce](http://www.dreamforce.com) #DF12 developer session **Developing Offline-Capable Apps with the Salesforce Mobile SDK and SmartStore**.

The goal of this session is to show how to build an app offline-capable app using the Mobile SDK. If a sales rep has five minutes with a doctor in the basement of a hospital, or a service rep needs detailed equipment specs in a remote location, they might not have a data signal when they need it most. Salesforce Mobile SDK SmartStore functionality adds JSON document storage for both native and hybrid applications on iOS and Android. Join us to learn how to build an offline-capable application for salesforce.com, and some of the things to think about along the way.

Thursday, September 20th, 2012: 1:30 PM - 2:30 PM

Moscone Center West, 2005

#DO THIS FIRST

**PLEASE NOTE: THE APP REQUIRES YOUR DATABASE.COM or SALESFORCE.COM ORG TO BE CONFIGURED AS FOLLOWS. LOGGING INTO AN ORG THAT DOESN'T HAVE THE CORRECT CONFIGURATION WILL NOT WORK.**

This app relies on the creation of a custom object named Password (Password__c) in your Salesforce.com or Database.com org. If you try to sync this app with an org that does not have this object, it will fail to work as intended. The schema for this object is pretty simple:

![Screenshot](http://mm-tom.s3.amazonaws.com/hazypasswordschema.jpg "Screenshot")

This app is really meant as a demo only, but if you choose to use this in production, given the sensitivity of passwords, I would also recommend setting the Sharing Settings for the Password object to Private, with "Grant Access Using Hierarchies" unchecked.

#Salesforce SDK

The app is built and tested on version 1.3 of the [Salesforce Mobile SDK for iOS](https://github.com/forcedotcom/SalesforceMobileSDK-iOS). You'll want to clone that first (and run the install scripts) before trying to build this app.

#More Information
For more information about the Salesforce Mobile SDK, try these links on for size:

* http://developer.force.com/mobilesdk
* http://blogs.developerforce.com/developer-relations/2012/03/offline-support-in-salesforce-mobile-sdk.html
* http://www.modelmetrics.com/tomgersic/storing-data-offline-with-salesforce-mobile-sdk-smartstore/
* http://blogs.developerforce.com/developer-relations/2012/06/tom-gersic-on-the-mobile-sdks-smartstore.html

#Help!
If you have questions about or issues with this demo, the best way to get help is to reach out on Twitter to [@tomgersic](https://twitter.com/#!/tomgersic).

#More Help!
I work for [Model Metrics](http://www.modelmetrics.com/), a [Salesforce.com](http://www.salesforce.com) company. We do mobile apps (amongst other things), so if you need a mobile app), well, that's what we do!
