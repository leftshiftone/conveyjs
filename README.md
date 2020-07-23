# Convey

[![CircleCI branch](https://img.shields.io/circleci/project/github/leftshiftone/conveyjs/master.svg?style=flat-square)](https://circleci.com/gh/leftshiftone/conveyjs)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/tag/leftshiftone/conveyjs.svg?style=flat-square)](https://github.com/leftshiftone/conveyjs)
[![npm (scoped)](https://img.shields.io/npm/v/@leftshiftone/convey?style=flat-square)](https://www.npmjs.com/package/@leftshiftone/convey)

Convey is a JavaScript Framework for connecting to processes created with [G.A.I.A.](https://www.leftshift.one/produkt/gaia-services/).

The framework ist compatible with all major Browsers and can be used standalone as well as in conjunction with React, Angular or Vue.

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

Connect to the G.A.I.A. ecosystem
```html
<script type="text/javascript">
    const header = new GaiaConvey.QueueHeader("anyIdentityId", "optionalChannelId")

    new GaiaConvey.Gaia(
        new GaiaConvey.ContentCentricRenderer(),
        new GaiaConvey.OffSwitchListener()
    ).connect(new GaiaConvey.QueueOptions('wss://URL/', 8080, "USERNAME", "PASSWORD"))
        .then(connection => {
            const subscription = connection.subscribe(GaiaConvey.ConversationQueueType.INTERACTION, header, payload => console.debug(`interaction:`, payload));
            connection.subscribe(GaiaConvey.ConversationQueueType.CONTEXT, header, payload => console.debug(`context:`, payload));
            subscription.reception({key: "value"});
        });
</script>
```

#### Integrate Convey as NPM package
Import Convey
```javascript
import {Gaia, ContentCentricRenderer, OffSwitchListener, ConversationQueueType, QueueOptions} from "@leftshiftone/convey";
```

Connect to the G.A.I.A. ecosystem
```javascript
const header = new QueueHeader("anyIdentityId", "optionalChannelId")

new Gaia(new ContentCentricRenderer(), new OffSwitchListener()).
    .connect(new QueueOptions('wss://URL/', 8080, "USERNAME", "PASSWORD"))
    .then(connection => {
        const subscription = connection.subscribe(ConversationQueueType.INTERACTION, header, payload => console.debug(`interaction:`, payload));
        connection.subscribe(ConversationQueueType.CONTEXT, header, payload => console.debug(`context:`, payload));
        subscription.reception({key: "value"});
    });
```

To use the default styling you can import it like the following:
```javascript
import '@leftshiftone/convey/dist/convey-all.css';
```

## Queues

The communication with G.A.I.A. contains several queueTypes where each one has its own purpose.

### INTERACTION
The Interaction queue is the main queue and is responsible for exchanging the elements configured in
G.A.I.A.. Convey automatically subscribes to this queue by calling `subscription.reception()`.
The messages in this queue are rendered to HTML elements.

### CONTEXT
The Context consists of attributes defined in the G.A.I.A. BPMN process. It can be received by
subscribing to this queue.

### NOTIFICATION
Each notification configured in the G.A.I.A. BPMN process can be received if subscribed to this queue.

### LOGGING
G.A.I.A. sends logs for certain process executions which can be received by subscribing to this queue.


## Renderer

A Renderer defines how elements, which were received by the 'Interaction' queue, are rendered in
the HTML DOM tree. Furthermore, a renderer specifies the layout of an integration project.

### Classic Renderer
The classic renderer renders the G.A.I.A. messages in a classic top-down manner.

### Content Centric Renderer
The content centric renderer tries to maximize the time a content is visible by updating the content
if possible or displaying interrupting actions like intent cascading by overlaying the content.

### RevealJS Renderer
Renderer implementation which is based on the reveal.js library. This renderer supports horizontal
as well as vertical navigation.

### MultiTargetRenderer
This renderer can decide which renderer is used for each channel.
It should be used if you are using multiple channels.

```javascript
const contentCentricRenderer = new ContentCentricRenderer("lto-content-for-channel-2-and-3")
const multiTargetRenderer = new MultiTargetRenderer({
    "channel1": new ContentCentricRenderer(),
    "channel2": contentCentricRenderer,
    "channel3": contentCentricRenderer,
    "channel4": new ClassicRenderer("lto-content-for-channel-4")
})

new Gaia(multiTargetRenderer).connect(options).then(...)
```
__
### NoopRenderer
No-operation dummy renderer. Mainly used for audio only use cases.


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
If an input text area should only be visible when a input is required, this is the listener to be used.


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

#### Minor
Run `yarn trigger-release:minor` locally.

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
