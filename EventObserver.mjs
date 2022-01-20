export class EventObserver {
	constructor(...configs) {
		// exit if no config supplied
		if (!configs.length) return console.error(`MISSING CONFIG PARAMETER - Use 'new EventObserver({...})' `);

		this.observing = []; // array of observer objects

		for (let config of configs) {
			// exit if config is not type 'object'
			if (Object.prototype.toString.call(config).includes('Object')) {
				// exit if callback or __default not supplied where displayTarget is missing - defines non standard useage
				if (!config.displayTarget && !(config.eventHandler || config.__defaultEventHandler)) {
					console.warn(
						`REQUIRED 'eventHandler' or '__defaultEventListener'. Observer for '${JSON.stringify(
							config
						)}' not created!`
					);
				} else this.observing.push(new ObserverObject(config));
			} else console.warn(`MUST BE TYPE OBJECT! Observer for '${JSON.stringify(config)}' not created!`);
		}
		console.log(this);
	}
	/* METHODS 
    *  - add/remove ObserverObjects
    *  - observe / unobserve ObserverObjects - set 'active' property
    */
}

class ObserverObject {
	defaultSanitizerConfig = {
		tags            : [],
		stripOnHandlers : true,
		imgExtentions   : [ 'jpg', 'jpeg', 'png', 'webp' ]
	};

	constructor(config) {
		this.active = true; // used to 'turn on' observation
		this.sanitize = config.sanitize || this.defaultSanitizerConfig; // sanitizer config object
		this.observing = document.querySelector(config.observeTarget); //required
		this.eventType = config.eventType || 'click'; // support clicks or double clicks
		this.currentUrl; // hold value for loadad url, avoids re loading if link re clicked

		// set custom per instance callback - called last, receives event
		if (config.callback) this.callback = config.callback;

		// set class method custom code for class defaultEventHandler
		if (config.__eventHandlerExtention) this.__proto__.eventHandlerExtention = config.__eventHandlerExtention;

		// add displayTarget if present
		if (config.displayTarget) this.displayTarget = document.querySelector(config.displayTarget);

		// set custom per instance eventHandler function if present, overrides class method
		if (config.eventHandler) this.defaultEventHandler = config.eventHandler;

		// add event listener to container - include feature to add to targets??
		document.querySelector(config.observeTarget).addEventListener(this.eventType, e => this.defaultEventHandler(e));

		// allow changing of __proto__ default callbackk for all instances if required
		if (config.__defaultEventHandler) this.__proto__.defaultEventHandler = config.__defaultEventHandler;
	}

	/*  METHODS
    *  - sanitizer(htmlNodes, this.sanitise)
   *  - all img src must point to file type not js, mjs etc
   *  - anything beginning with 'on' - inline js
   */
	defaultEventHandler(e) {
		/* this.observing - represents the element the listener is attached to
      * this - represents the ObserverObject
      */

		//exit if not active
		if (!this.active) return;

		/* If click is an anchor tag stop default action fetch url and load into this.displayTarget */
		const anchor = e.target.closest('a');
		if (anchor) {
			e.preventDefault();
			e.stopPropagation();

			/* exit if re-loading currentUrl */
			if (anchor.href === this.currentUrl) return;

			/* Set currently loaded URL to prevent unnecessary re-loading*/
			this.currentUrl = anchor.href;

			fetch(anchor.href)
				.then(res => res.text())
				.then(data => {
					/* Define script cache */
					const scripts = [];
					/* Create initial page content*/
					const template = document.createElement('template');
					template.innerHTML = data;

					/* Run sanitizer() - this.sanitize will be true if an object is supplied*/
					this.sanitize && this.defaultSanitizer(e, this.sanitize, template.content.childNodes);

					/* Find scripts and cache src 
                * An alturnative method is to store each page JS in a master minified file and call functions as required to handle each page when loaded
               */
					for (let node of template.content.childNodes) {
						if (node.tagName === 'SCRIPT') {
							// cache script src
							scripts.push(node.src.substring(node.src.indexOf('/js')));
							// remove script node prior to appending to document
							node.remove();
						}
					}

					// clear display & load new html
					this.displayTarget.textContent = null;
					this.displayTarget.append(template.content);

					// load scripts extracted from fetch
					if (!scripts.length) for (let script of scripts) import(script);

					// return loaded resource
					return this.currentUrl;
				})
				// call custom code for ALL instance
				.then(url => this.eventHandlerExtention && this.eventHandlerExtention(e, url))
				// call custom call back if supplied - passed return from eventHandlerExtention
				.then(val => this.callback && this.callback(e, val))
				.catch(err => console.log(err));
		}
	}
	defaultSanitizer(e, config, nodeList) {
		/* This function needs to 
       *  - clean node according to config
       *  - check !node.childElementCount 
       *  - call itself passing in node.childNodes
       * */
		console.log('Sanitizer Not Yet Created!!');
		for (let node of nodeList) {
			for (let property in node) {
				// clean 'on*' and inline styles
				config.stripOnHandlers &&
					((property.startsWith('on') || property.startsWith('style')) && (nodeList[property] = null));

				// clean attributes for 'javascript:'
				if (typeof node[property] === 'string' && node[property].match(/(.*:)/g)) {
					node[property] = null;
				}
			}
			//go deep
			if (!!node.childElementCount) this.defaultSanitizer(e, this.defaultSanitizerConfig, node.childNodes);
		}
	}
}

const configs = [
	{
		observeTarget : 'h1',
		// displayTarget: 'h2',
		callback      : function(e) {
			console.log(`you clicked on ${e.target.tagName}`);
		}
	},
	{
		observeTarget : 'h1'
		// displayTarget: 'h2',
		// eventHandler: function(e){console.log(`you clicked on ${e.target.tagName}`)}
	},
	[
		'observeTarget',
		'h1'
		// displayTarget: 'h2',
		// callback: function(e){console.log(`you clicked on ${e.target.tagName}`)}
	],
	{
		observeTarget : 'h1',
		eventType     : 'dblclick',
		eventHandler  : function(e) {
			e.target.style.color = `red`;
			e.target.style.transform = `translateX(50%)`;
			e.target.style.transition = `transform 1.5s`;
		}
	}
];

export default function create(...configs) {
	return new EventObserver(
		...configs
		// sanitize: {tags: [], inlineJS: Boolean} // runs html sanitizer to remove specified opts.
		// observeTarget: '#cp-menu',
		// displayTarget: '#display', // optional if not outputting to another container - maybe use a 'self' option?
		// callback: function (e) { console.log(`Loading link: ${e.target.closest('a')}`); }
		// eventType: 'click', // optional, default 'click'
		// eventHandler: function(){} // replaces prototype default handler on per instance basis
		// __defaultEventHandler: function(){}  // replaces prototype defaultEventHandelr for ALL instances
	);
}
const LinkObserver1 = new EventObserver();

//USAGE
new EventObserver({
	observeTarget           : '#cp-menu',
	displayTarget           : '#display', // required only for default behaviour
	__eventHandlerExtention : function(e, data) {
		console.log(this);
		hello(e, data);
	} // runs after defaultEvent for all instances
	// eventType: 'click', // optional, default 'click'
	// callback: function (e) { console.log(`Loading link: ${e.target.closest('a')}`); } // additional code to execute after default behaviour
	// eventHandler: function(){} // replaces prototype default handler on per instance basis
	// __defaultEventHandler: function(){}  // replaces prototype defaultEventHandelr for ALL instances
});
