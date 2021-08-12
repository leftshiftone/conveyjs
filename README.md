# Convey

[![CircleCI branch](https://img.shields.io/circleci/project/github/leftshiftone/conveyjs/master.svg?style=flat-square)](https://circleci.com/gh/leftshiftone/conveyjs)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/tag/leftshiftone/conveyjs.svg?style=flat-square)](https://github.com/leftshiftone/conveyjs)
[![npm (scoped)](https://img.shields.io/npm/v/@leftshiftone/convey?style=flat-square)](https://www.npmjs.com/package/@leftshiftone/convey)

Convey is a JavaScript Framework for connecting to processes created
with [AIOS](https://www.leftshiftone.com/product/ai-operating-system/).

The framework ist compatible with all major Browsers and can be used
standalone as well as in conjunction with React, Angular or Vue.

### Prerequisites
[//]: <> (TODO: Create sample project to demonstrate integration)
In order to add Convey to your project, follow these steps:
1. MQTT endpoint: e.g. wss://gaia.local/mqtt
2. Identifier of the so called *Identity* to connect to.

## Installation

Using npm:
```bash
$ npm i @leftshiftone/convey
```

Using in browser:
```html
<script src="convey-std.js"/>
```

## Usage

Create the following DOM structure in your project

```html
<div class="lto-gaia">
    <div class="lto-content"/>
    <div class="lto-suggest"/>
    <input class="lto-textbox"/>
    <button class="lto-invoker"/>
</div>
```

#### Integrate Convey as standalone lib
Import Convey
```html
<head>
   <meta charset="UTF-8"/>
   <link rel="stylesheet" href="convey-std.css"/>
   <script src="convey-std.js"/>
</head>
```

Connect to AIOS
```html
<script type="text/javascript">
    const header = new GaiaConvey.QueueHeader("anyIdentityId", "optionalChannelId")

    new GaiaConvey.Gaia(new GaiaConvey.DefaultListener())
        .connect(new GaiaConvey.QueueOptions('wss://URL/mqtt', 443, "MQTT_USERNAME", "MQTT_PASSWORD"))
        .then(connection => {
            const interactionSubscription = connection.subscribeInteraction(header, payload => console.debug(`Interaction:`, payload), new GaiaConvey.ContentCentricRenderer());
            connection.subscribeNotification(header, payload => console.debug('Notification:', payload));
            connection.subscribeLogging(header, payload => console.debug('Logging:', payload))
            connection.subscribeContext(header, payload => console.debug('context:', payload))
            interactionSubscription.reception({initialMessage: "value"});
        });
</script>
```

#### Integrate Convey as NPM package
Import Convey
```javascript
import {Gaia, ContentCentricRenderer, OffSwitchListener, ConversationQueueType, QueueOptions} from "@leftshiftone/convey";
```

Connect to AIOS
```javascript
const header = new QueueHeader("anyIdentityId", "optionalChannelId")

new Gaia(new OffSwitchListener())
    .connect(new QueueOptions('wss://URL/', 8080, "USERNAME", "PASSWORD"))
    .then(connection => {
        const interactionSubscription = connection.subscribeInteraction(header, payload => console.debug(`Interaction:`, payload), new ContentCentricRenderer());
        connection.subscribeNotification(header, payload => console.debug('Notification:', payload));
        connection.subscribeLogging(header, payload => console.debug('Logging:', payload))
        connection.subscribeContext(header, payload => console.debug('context:', payload))
        interactionSubscription.reception({initialMessage: "value"});
    });
```

To use the default styling you can import it like the following:
```javascript
import '@leftshiftone/convey/dist/convey-all.css';
```

## Queues

The communication with AIOS contains several queueTypes where each one has its own purpose.

### INTERACTION
The Interaction queue is the main queue and is responsible for exchanging the elements configured in
AIOS. Convey automatically subscribes to this queue by calling `interactionSubscription.reception()`.
The messages in this queue are rendered to HTML elements.

### CONTEXT
The Context consists of attributes defined in the AIOS BPMN process. It can be received by
subscribing to this queue.

### NOTIFICATION
Each notification configured in the AIOS BPMN process can be received if subscribed to this queue.

### LOGGING
AIOS sends logs for certain process executions which can be received by subscribing to this queue.


## Renderer

A Renderer defines how elements, which were received by the 'Interaction' queue, are rendered in
the HTML DOM tree. Furthermore, a renderer specifies the layout of an integration project.
You can define a renderer by passing it to `connection.subscribeInteraction`.

```javascript
const header = new QueueHeader("anyIdentityId", "optionalChannelId")

new Gaia().connect( ... )
    .then(connection => {
        const interactionSubscription  = connection.subscribeInteraction(header, payload => console.debug(`Interaction:`, payload), new ContentCentricRenderer());
    });
```

### Classic Renderer
The classic renderer renders the messages in a classic top-down manner.

### Content Centric Renderer
The content centric renderer tries to maximize the time a content is visible by updating the content
if possible or displaying interrupting actions like intent cascading by overlaying the content.

### RevealJS Renderer
Renderer implementation which is based on the reveal.js library. This renderer supports horizontal
as well as vertical navigation.

### NoopRenderer
No-operation dummy renderer. Mainly used for audio only use cases.

### RatingDecorator
The Rating Decorator cannot be used as standalone renderer, but instead wraps any of the previous renderers.
It adds a rating element with thumbs up / thumbs down and comment field to every incoming message.
On click the rating is sent and stored in the backend.
```javascript
const header = new QueueHeader("anyIdentityId", "optionalChannelId")

new Gaia().connect( ... )
    .then(connection => {
        const interactionSubscription  = connection.subscribeInteraction(header, payload => console.debug(`Interaction:`, payload), new RatingDecorator(new ContentCentricRenderer()));
    });
```

The rating decorator takes the RatingRenderStrategy as an optional argument. Possible options are
* ALL_EXCEPT_DISABLED_RATINGS (default): Render ratings for all interactions except the ones with rating markup where enabled is set to false.
* ONLY_ENABLED_RATINGS: Only render ratings for interactions for rating markup with enabled set to true.

Example usage:

```javascript
new RatingDecorator(new ContentCentricRenderer(), RatingRenderStrategy.ONLY_ENABLED_RATINGS)
```

## Listener
A listener provides the functionality to react to certain events. Events can be:
* Connected
* ConnectionLost
* PacketSend
* Disconnected
* Error
* Message

### Default Listener
Acts as the base listener.

### OffSwitch Listener
If an input text area should only be visible when an input is required, this is the listener to be used.


## Behaviour
A behaviour adds event listeners to UI elements for a specific subscription.

### AutocompleteBehaviour
The autocomplete behaviour adds autocomplete suggestions for a given textarea (or the default textarea with class
"lto-textbox") to a given div (or the default div with class "lto-autocomplete").
Provide the autocomplete elements through the add-method.

Required html structure:
```html
<div style="position: absolute">
    <textarea title="" class="lto-textbox"></textarea>
    <div class="lto-autocomplete"></div>
    <button class="lto-invoker"></button>
</div>
```

```javascript
        const autocompleteBehaviour = new GaiaConvey.AutocompleteBehaviour({
            maxNumberOfResults : 3
        })
        ["hello", "world", "hello world", "hello1", "hello 123"].forEach(e => autocompleteBehaviour.add(e));

        let gaia = new GaiaConvey.Gaia(renderer, listener);
        gaia.connect(...)
            .then(connection => {
                const subscription = connection.subscribe(...);
                autocompleteBehaviour.bind(subscription);
            });
```

## Interaction language
A language code must be present in all convey interactions in order for AIOS to be able to reply in the proper language.

### Language code

* ISO 639-1 (e.g. de => german, en => english)
* Locale (e.g. de_DE, de_AT, en_US)

### How to enrich the interactions with the language code
The languages can be provided in 3 different ways:
1. By setting the environment variable CONVERSATION_LANGUAGE
2. By defining a HTML element with the class "lto-language" containing the language code as its value
3. By the browser. The default language browser or rather its locale will be sent to AIOS.

```
Please note that the language providers will be executed in the described order.
In other words, if the variable CONVERSATION_LANGUAGE is set, the language code defined in the HTML element or the browser will be ignored.
```
NOTE: Programmatically it is also possible to hardcode the language. See example below (LanguageInteractionInterceptor):

```javascript
const header = new QueueHeader("anyIdentityId", "optionalChannelId")

new Gaia(new OffSwitchListener())
    .connect(new QueueOptions('wss://URL/', 8080, "USERNAME", "PASSWORD"))
    .then(connection => {
        const interactionSubscription = connection.subscribeInteraction(header, payload => console.debug(`Interaction:`, payload), new ContentCentricRenderer(), new LanguageInteractionInterceptor("en"));
        connection.subscribeNotification(header, payload => console.debug('Notification:', payload));
        connection.subscribeLogging(header, payload => console.debug('Logging:', payload))
        connection.subscribeContext(header, payload => console.debug('context:', payload))
        interactionSubscription.reception({initialMessage: "value"});
    });
```

## Modules

The following modules are available:
* std: Contains default modules
* aud: Contains the audio module
* cod: Contains the code reader module (e.g. QRCode)
* map: Contains modules for Open Street Map, Google Maps and Here Maps
* vis: Contains modules for rendering data as charts
* all: Contains all modules


## Development

### Release
Releases are triggered locally. Just a tag will be pushed to trigger the CI release pipeline.

#### Major
Run `yarn trigger-release:major` locally.

#### Major RC
Run `yarn trigger-candidate:major` locally.

#### Minor
Run `yarn trigger-release:minor` locally.

#### Minor RC
Run `yarn trigger-candidate:minor` locally.

#### Patch
Switch to the minor version branch, before performing the release (e.g. `release/1.3.x`) then run `yarn trigger-release:patch` locally.


## Project Template

Visit [conveyjs-starter](https://github.com/leftshiftone/conveyjs-starter/generate) to create a new project including conveyjs

For a short guide check the [conveyjs-starter readme](https://github.com/leftshiftone/conveyjs-starter/blob/master/README.md)


## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you
would like to change.

In general, we follow the "fork-and-pull" Git workflow:
1. Fork the repo on GitHub
2. Clone the project to your own machine
3. Commit changes to your own branch
4. Push your work back up to your fork
5. Submit a Pull request so that we can review your changes

Please refer to the project's guidelines for submitting patches and additions and make sure
to update tests as appropriate.

NOTE: Be sure to merge the latest from "upstream" before making a pull request!


## License

MIT Licence
