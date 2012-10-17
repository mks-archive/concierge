# Concierge
<img alt="Photo of Concierge Sign by Kin Lane" height="220" width="226" src="https://raw.github.com/newclarity/concierge/master/photos/concierge-sign-by-kin-lane.jpg" align="right" />
**_A Node.js-based Universal Client for RESTful APIs_**

Concierge is designed to be a universal client SDK that works across all platforms by leveraging [code-on-demand](http://bitworking.org/news/355/code-on-demand-rest-and-cloud-computing) but in reverse; the API client sends code to the API server, in this case a _Concierge Server_.

**Concierge envisions itself as a companion to a REST API**, not an alternative. Concierge was designed to work as a layer on top of a REST API that is optional at the _per request level_.  Our goal is for Concierge to become a defacto-standard optional method of interacting with RESTful APIs and is appropriately open-source. _(Who knows, maybe we'll even spawn an [RFC](http://en.wikipedia.org/wiki/Request_for_Comments)?)_

Photo by [Kin Lane](https://twitter.com/kinlane) of [API Evangelist](http://apievangelist.com) while at [twilioCON 2012](http://www.twilio.com/conference).
##Targeted Users

We envision Concierge benefiting the following types of people:

1. **Web Professional, Power Users and Occupational Programmers accessing APIs** for real-world needs who cannot afford to invest the time required to program against typical APIs.

2. **Professional Developers building Hypermedia-based APIs** who want to simplify the requirements discovery process required when architecting the meta data and content type structure for a hypermedia API.

3. **Professional Developers writing API Clients** that need to navigate many links during a single API interaction which can be especially useful for mobile developers who want to push work to a server and issue a single API call.


## Concierge Concepts

- **Concierge Scripts**
- **The API-specific module; _"A Concierge"_**
- **The Concierge Server**

##Concierge Scripts

A _Concierge Script_ is a Javascript designed to be run on a Concierge Server. A Concierge client would then issue an HTTP POST sending a `"script"` value to the Concierge Server's published URL. The Concierge Server would execute the script and redirect the client to a URL it could GET to retrieve the results of the script.

### A Highly Constrained `$api` Object
Concierge Scripts are designed to be highly constrained, just like [REST](http://en.wikipedia.org/wiki/Representational_state_transfer). A Concierge Script would be written in sandboxed Javascript and have access to a single global object named `$api` with methods `GET`, `PUT`, `POST`, `PATCH`, `DELETE` and `NEW`, the latter being a well-known special case of `POST` _(which we may decide to remove if we get mostly negative feedback on the idea of `NEW`.)_

The `$api` object also has a minumum number or other properties and methods such as `request`, `response` and `server` as well as `header()`, `code()` and `out()` and probably a few more. The final list will be what we discover is minimimally required for real-world use-cases, and nothing more.

### Example: Foursquare Venue Categories
At it's simplest here's a Concierge script that calls the [FourSquare's v2 API](http://developer.foursquare.com) to get a [list of venue categories](https://developer.foursquare.com/docs/venues/categories). This takes a much larger list of categories and returns just the top level categories but as an object instead of an array so each category can accessed by category ID, i.e. `categories['4d4b7104d754a06370d81259']`:

    $api.GET('venue-categories',function(data) {
      var category, categories = {};
      for(var i=0; i<data.response.categories.length; i++){
        category = data.response.categories[i];
        category.categories = [];  // Clear child categories
        categories[category.id] = category.name;
      }
      $api.out( categories ); // Output the JSON
    });

Here's what the data the above Concierge returns might look like:

    {
      "4d4b7104d754a06370d81259" : "Arts & Entertainment",
      "4d4b7105d754a06372d81259" : "College & University",
      "4d4b7105d754a06374d81259" : "Food",
      "4d4b7105d754a06376d81259" : "Nightlife Spot",
      "4d4b7105d754a06377d81259" : "Outdoors & Recreation",
      "4d4b7105d754a06375d81259" : "Professional & Other Places",
      "4e67e38e036454776db1fb3a" : "Residence",
      "4d4b7105d754a06378d81259" : "Shop & Service",
      "4d4b7105d754a06379d81259" : "Travel & Transport"
    }

### Goal: Concierge Scripts to be a Frozen Specification
Ideally the Concierge Script and its `$api` object will not be a moving target after we complete a version 1.0. The concept is to craft the smallest interface that would be usable in real-world scenarios and then freeze the spec at version 1.0 much like HTTP/1.1 has been frozen for years.

##The API-specific Module; The Concierge

A _"Concierge"_ is a module for consuming a specific API. Building a Concierge is similar to the discovery process for architecting a hypermedia-based API, but with a bit of client SDK architecture thrown in for good measure.

###Foursquare's v2 API as a Concierge
Here is what the [Concierge for Foursquare v2](http://github.com/newclarity/concierge/blob/master/apis/foursquare.js) looks like based on FourSquare's v2 API _(this is very rough; it is only the first iteration of our proof of concept):_

    /**
     * Concierge for Foursquare v2 API
     * VERY PRELIMINARY, only covers one (1) of probably 100 services.
     */

    var date = '20121006';  // Date we coded this so we know the 4sq API worked on that date.

    module.exports.protocol = 'http';

    module.exports.version = '0.0';

    module.exports.credentials = {};

    module.exports.service = {
      host: 'api.foursquare.com',
      port: 443,
      path: '/v2',
      headers: {'Content-Type': 'application/json'}
    };

    module.exports.actions = {
    };

    module.exports.links = {
      'venue-categories': {
        path: 'venues/categories',
        access: 'app' // vs. 'user'
      }
    };

    module.exports.filterOutput = function(output) {
      this.code(output.meta.code);
      return output;
    }
    module.exports.onServiceInit = function(service){
      var auth = this.credentials;
      service.path += '?client_id=' + auth.client_id + '&client_secret=' + auth.client_secret + '&v=' + date;
    };

###Concierges for Hypermedia-Specific Content-Types
We also envision people being able to build different Concierges that each work with a different hypermedia-specific content type. For example we envision it will be possible to create a Concierge for any or all of the following that could allow a Concierge Script to interact with any hypermedia API that uses them, such as these and others:

- [**Siren**](http://github.com/kevinswiber/siren#readme)
- [**HAL**](http://stateless.co/hal_specification.html)
- [**Collection+JSON**](http://amundsen.com/media-types/collection/)
- [**oData Lite**](http://skydrive.live.com/?cid=0d23ed2816deea7b&id=D23ED2816DEEA7B%21966)

##The Concierge Server

Concierge Scripts will be run by a **_Concierge Server_** and in concept a Concierge server could be hosted as an API proxy, locally as part of your client SDK, or ideally side-by-side with the API server by the providers of the API. Theoretically a Concierge Script could run anywhere. You could potentially have numerous Concierge servers in parallel and/or in series as a way to offload API processing from the client and yet maintain the purity of the RESTful API.

###Technology: Currently Node.js

The current Concierge code has been implemented using [Node.js](http://nodejs.org) and the [ current demo](http://concierge.jit.su) is hosted on [Nodejistu](http://nodejitsu.com) at [concierge.jit.su](http://concierge.jit.su) _(and it **may or may not** be working at the time you read this)_. This demo is far from impressive; it is what it is at this point. We can always improve it later. :)

It's our team's first stab at a Node.js app so we're probably doing a tremendous amount wrong. I'm sure I'm doing a lot wrong. But that can be improved.  But as programmers we all know that kind of disclaimer.

If you are a Node.js expert and can recommend improvement _(that doesn't conflict with our goals)_ we'll be ecstatic to get your input and/or your pull requests.

###The Server as a Generic Concierge Script Sandbox
Although Concierge is currently implemented using Node.js it can theoretically be hosted using any web container capable of executing a Concierge Script in a appropriate sandbox.

We envision and would love to see Concierge Servers running as Python Eggs, Ruby Gems, PHP scripts, in a .NET server maybe in [Azure](http://www.windowsazure.com/en-us/); anything that can hosts the [Google V8 Javascript engine](http://code.google.com/p/v8/) or any other current or future Javascript engine equivalent.

###Client-side Concierge
We can even envision Concierge Servers being able to be run in the browsers so that client-side developers could share Concierge Scripts for client-side development for those who don't or cannot use Concierge as a proxy server.

###The Server: The Epicenter for Concierge Innovation
While we intend for the Concierge Script to be frozen as a specification we expect that the innovation can and will happen in the Concierge Server end. There is so much that can be done here:

- Sophisticated **Caching Algorithms**.
- **Performance Optimizations** for Parallel Script Execution.
- Shared Concierge **Script Repositories**.
- Coalescence around **a single API client** for a specific API rather than effort spread among many.
- **_"Standard"_ Concierge Interfaces** for similar SaaS offerings so you could program to the standard interface and it would work with any one of many different similar services. Examples might include Accounting and Project Management SaaS.
- Hopefully many other things we don't have the depth of vision to yet expect. :)

##Analogies: Food for Thought

Think of Concierge as a _(__psuedo-_)interactive API language/platform.  Think of it analogous to [Yahoo Pipes](http://pipes.yahoo.com/pipes/) and/or [IFTTT](htts://ifttt.com/) but with an actual programming language for glue between the feeds and APIs.

Think of Concierge as being a standard glue that companies like [Apigee](http://apigee.com/about/) and [Mashape](http://www.mashape.com) could potentially adopt and support.

##Envisioned Benefits of Concierge

We believe Concierge could have the following benefits:

- **Easier Access to Web APIs** especially on an ad-hoc basis by people who are not neccessarily accomplished professional programmers.
- **Allows API Clients to Delegate Multiple API Calls** and processing logic to an Concierge server.
- **Simplify Requirements Discovery** for hypermedia-based APIs.
- **Inertia from Community Collaboration** on Fewer Client APIs.

###Easier Access to Web APIs

Concierge is designed to be is super easy for the person who wants to do real work against an API but is not a professional software developer. Think of web designers, consultants where time is money, startup CEOs and growth hackers and even some marketing people; all people who need to access APIs but who will never have the time or skill to learn how to write code against APIs, deal with hypermedia, deal with all the error handling, etc.

###Allows API Clients to Delegate

At first blush, you might not think Concierge would be the best solution for high performance API access. Consider the benefit of being able to offload calling multiple API calls and performing the required data transformations on a Concierge server rather than having to do all the work in a single mobile device or WordPress plugin? Imagine being able to go write a named Concierge Script and then just being able to run it by accessing a single URL as you would an RSS feed? This is a large part of the vision of Concierge.

###Simplifies Requirements Discovery

Concierge could be viewed as _hypermedia-Lite_ and help diminish the teeth-knashing that happens when people first encounter the real world difficulties of implement hypermedia on the client. Concierge Scripts model themselves after hypermedia interactions, ideally in a one-to-one correspondence. Concierge's analog to hypermedia is Javascript objects vs content types and referenced objects vs links.

We think that there's one thing that REST purists should like about Concierge and that is it de-emphasizes the need for [URL construction](https://groups.google.com/forum/?fromgroups=#!topic/api-craft/QKdbHK1wXY4) that they argue against yet that is so prevalent among [commercial APIs](http://www.programmableweb.com/apis/directory/1?protocol=REST) that describe themselves as RESTful.

###Inertia from Community Collaboration

While this one presumes Concierge will be wildly successful, think about how many different API clients are created for all the different APIs and all the different languages. Currently lots of effort is distributed widely across tens of thousands of APIs. Imagine if a lot of that engineering talent could be concentrated on making Concierge better, more performant, more scalable, easier to use?

With Concierge every API publisher could create a Concierge for their API and then anyone running any platform could access their API without the need for a custom developed API client. And even if they do need a custom developer API client, building one would be much easier.

##Challenges

Yes, there are potential challenges for Concierge to overcome including:

- What if people write Concierge Scripts that take a long time to run, or consume lots of resources on the server?
- What about APIs whose terms of service that won't let you proxy them, or that have a limit based on IP address?
- Probably other concerns(?)

However, we think if we can prove the functional benefits there will be ways to mitigate these concerns, especially if the benefits are in fact significant as we expect they will be.

##History/Background

Probably shortly after the dawn of the commericial web circa 1995 people started thinking about using the web for machine-to-machine interaction. Those ideas have come to be known as one of more of the following _(and probably more)_:

- **Web Services**,
- **RESTful Web Services**,
- **REST APIs**,
- **Web APIs and**
- **RESTful Web APIs**.

Along the way there have been many missteps too such as [**SOAP**](http://en.wikipedia.org/wiki/SOAP) and [**XML-RPC**](http://en.wikipedia.org/wiki/XML-RPC), among others _(ugh!)_ You can read more about the [history of web services](http://en.wikipedia.org/wiki/Web_service) on Wikipedia.

In 2000 [Roy Fielding](http://en.wikipedia.org/wiki/Roy_Fielding) wrote the seminal work on web services in his thesis called [Architectural Styles and the Design of Network-based Software Architectures](http://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm). It was chapter 5 [Representational State Transfer (REST](http://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)) that actually triggered many in the technology world to refer to their web service APIs as [RESTful](http://en.wikipedia.org/wiki/Representational_state_transfer), typically and much to the chagrin of Fielding and other REST faithful.

The vast majority of web service APIs advertising themselves as RESTful don't adhere to [The Hypermedia Constraint](http://www.infoq.com/articles/mark-baker-hypermedia), often referred to as [HATEOAS](http://en.wikipedia.org/wiki/HATEOAS). In the mid 2000's many discussions on the topic were had on the [[rest-discuss] list]([http://tech.groups.yahoo.com/group/rest-discuss/)] and more recently on the [API Craft list](http://groups.google.com/forum/#!forum/api-craft), and the author of Concierge has been a frequent participant.

At the time of this writing _(late 2012)_ there are many organizations [offering web APIs](http://www.programmableweb.com/apis) and many more organizations and [SaaS startups](http://thesmallbusinessweb.org) consuming them. As far as the hypermedia constraint for REST is concerned people tend to fall into one of two camps _(and we don't intend any connotations with the names, negative or positive):_

- **REST Purists**, and
- **REST Pragmatists** _(this being an oxymoron, maybe?)_

While the rest-discuss list is mostly oriented toward discussion of REST purity the API Craft has many REST pragmatists including as it appears the sponsor of the list: [Apigee](http://apigee.com/about/).

**REST Purists** promote hypermedia by saying it:

1. **Reduces coupling** between API client and API server and permits each to evolve independently of each other
2. **Minimizes fragility** of tightly coupled systems,
3. Enables **very long-lived systems**, and
4. Provides **service discoverability** based on the links made available.

On the other hand, while **REST Pragmatists** typically agree with the benefits of hypermedia in theory they argue that the benefits come at too high a cost in practice because:

1. There is **no consensus on hypermedia media types** among REST advocates,
2. **Few examples in the wild** of successful hypermedia-based APIs,
3. There are **very few client libraries**  to simplify hypermedia-based API access, and none with any significant adoption, and
4. They question if hypermedia's **benefits are not dubious** because control information still needs to be coupled and the only well-known use-case for hypermedia are web pages and feeds (other?) both of which are navigated by humans vs. machines.

Given this tension between the two REST camps where both sides have compelling arguments the idea of Concierge emerged as a potential way to bridge the gap between the two.

The initial coding for Concierge was done by [Mike Schinkel](http://about.me/mikeschinkel) at [HackGT](http://hackgt.georgiatechtes.com) on [October 5th and 6th, 2012](http://atlantastartupcommunity.wordpress.com/2012/10/06/hack-a-thons-the-lifeblood-of-atlantas-startup-community/). We will see how it goes, wish us luck!

##Future? Contributions and/or Sponsorship

If you are interested in pushing the future for Concierge forward faster, consider contributing and/or sponsoring specific development.

###Developers
If you are a developer interested in the Concierge idea and want to push it forward, [discuss it by adding issues](https://github.com/newclarity/concierge/issues). If there's enough interest we'll open a mailing list.

###Organizations
if you are part of an organization that can envision Concierge benefitting you strategically, [contact Mike Schinkel](http://about.me/mikeschinkel) and let him know that you'd like to sponsor additional development on Concierge.

##License
This project is released under the [MIT License](https://github.com/newclarity/concierge/blob/master/license.txt).
