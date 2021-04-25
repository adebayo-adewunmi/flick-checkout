"use strict";

//.remove polyfill
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
// classlist polyfill
/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */
"document"in self&&("classList"in document.createElement("_")&&(!document.createElementNS||"classList"in document.createElementNS("http://www.w3.org/2000/svg","g"))||!function(t){"use strict";if("Element"in t){var e="classList",n="prototype",i=t.Element[n],s=Object,r=String[n].trim||function(){return this.replace(/^\s+|\s+$/g,"")},o=Array[n].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1},c=function(t,e){this.name=t,this.code=DOMException[t],this.message=e},a=function(t,e){if(""===e)throw new c("SYNTAX_ERR","The token must not be empty.");if(/\s/.test(e))throw new c("INVALID_CHARACTER_ERR","The token must not contain space characters.");return o.call(t,e)},l=function(t){for(var e=r.call(t.getAttribute("class")||""),n=e?e.split(/\s+/):[],i=0,s=n.length;s>i;i++)this.push(n[i]);this._updateClassName=function(){t.setAttribute("class",this.toString())}},u=l[n]=[],h=function(){return new l(this)};if(c[n]=Error[n],u.item=function(t){return this[t]||null},u.contains=function(t){return~a(this,t+"")},u.add=function(){var t,e=arguments,n=0,i=e.length,s=!1;do t=e[n]+"",~a(this,t)||(this.push(t),s=!0);while(++n<i);s&&this._updateClassName()},u.remove=function(){var t,e,n=arguments,i=0,s=n.length,r=!1;do for(t=n[i]+"",e=a(this,t);~e;)this.splice(e,1),r=!0,e=a(this,t);while(++i<s);r&&this._updateClassName()},u.toggle=function(t,e){var n=this.contains(t),i=n?e!==!0&&"remove":e!==!1&&"add";return i&&this[i](t),e===!0||e===!1?e:!n},u.replace=function(t,e){var n=a(t+"");~n&&(this.splice(n,1,e),this._updateClassName())},u.toString=function(){return this.join(" ")},s.defineProperty){var f={get:h,enumerable:!0,configurable:!0};try{s.defineProperty(i,e,f)}catch(p){void 0!==p.number&&-2146823252!==p.number||(f.enumerable=!1,s.defineProperty(i,e,f))}}else s[n].__defineGetter__&&i.__defineGetter__(e,h)}}(self),function(){"use strict";var t=document.createElement("_");if(t.classList.add("c1","c2"),!t.classList.contains("c2")){var e=function(t){var e=DOMTokenList.prototype[t];DOMTokenList.prototype[t]=function(t){var n,i=arguments.length;for(n=0;i>n;n++)t=arguments[n],e.call(this,t)}};e("add"),e("remove")}if(t.classList.toggle("c3",!1),t.classList.contains("c3")){var n=DOMTokenList.prototype.toggle;DOMTokenList.prototype.toggle=function(t,e){return 1 in arguments&&!this.contains(t)==!e?e:n.call(this,t)}}"replace"in document.createElement("_").classList||(DOMTokenList.prototype.replace=function(t,e){var n=this.toString().split(" "),i=n.indexOf(t+"");~i&&(n=n.slice(i),this.remove.apply(this,n),this.add(e),this.add.apply(this,n.slice(1)))}),t=null}());

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };



//'use strict';
(function(window) {
    var globalConfigData;
    var globalChargeData;
    var globalMeta;
    var globalSubaccounts;
    var globalTheme;
    var globalClosePopup;
    var globalButtonClicked;
    var globalIsHostedPage;
    var afterCallbackRedirectTimeout;
    var modaliframe;
    var API_URL;
    var localData;
    var loadState = 'none';
    var iframeAlreadyShown = false;
    var hideIframe = false;
    var deferredShowIframe = function (){};
    var showSpinner = null;
    var modalframesource = ''
    var originsource = ''
    var readyToReceive = false;

    var w = window;

    function closePopup(fromCloseMethod, cancelled) {
        readyToReceive = false;
        if (fromCloseMethod === false && globalConfigData && globalConfigData.onclose) {
            globalConfigData.onclose(cancelled === true);
        }
        hideIframe();
    }

    globalClosePopup = closePopup;

    //message handlers
    var message_handlers = {};

    message_handlers.txfailed = function (d) {
        readyToReceive = false;

        setTimeout(function() {
            hideIframe();
            if (globalConfigData && globalConfigData.onTransactionFailed) {
                globalConfigData.onTransactionFailed(d.data);
            }
        }, 15 * 1000);
    };

    message_handlers.cannotloadiframe = function (d) {
        readyToReceive = false;
        var data = JSON.parse(JSON.stringify(globalChargeData));
        document.location = modalframesource.src + generateQueryString(data) || document.location;
    };

    message_handlers.readytorecieve = function(d) {
        readyToReceive = true;
        originsource = d.origin
        d.source.postMessage(
            {
                name: "updategotten",
                meta: globalMeta,
                subaccounts: globalSubaccounts,
                theme: globalTheme
            },
            d.origin
        );
    };

    message_handlers.switch_hosted_pay = function (d) {
        window.open(d.data.link, '_blank');
    };

    var loadtimeout_settimeouthandler;

    function handleLoadTimeout(timeout_callback, wait) {
        loadtimeout_settimeouthandler = setTimeout(function () {
            closePopup();
            try {
                timeout_callback();
            } catch (e) {}
        }, wait);
    }

    message_handlers.allcontentloaded = function(d) {
        //clearTimeout for waiting
        clearTimeout(loadtimeout_settimeouthandler);
        loadState = "loaded";
        if(!iframeAlreadyShown){
            deferredShowIframe();
        }

        d.source.postMessage(
            {
                name: "clickreport",
                time: globalButtonClicked
            },
            d.origin
        );

        //document.body.removeChild( document.getElementsByClassName('spinner-container')[0]);

        if(showSpinner){
            document.getElementById('rve_spinner_container_0999') && document.body.removeChild( document.getElementById('rve_spinner_container_0999') );
        }

        if (globalConfigData && globalConfigData.onopen) {
            globalConfigData.onopen();
        }

        function icheckNext(err, msg) {
            d.source.postMessage(
                {
                    name: "icheckcomplete",
                    check_error: err,
                    check_error_message: msg
                },
                d.origin
            );
        }
        if (globalConfigData && globalConfigData.onintegritycheck) {
            globalConfigData.onintegritycheck(d.data.hash, icheckNext);
        } else {
            icheckNext();
        }
    };

    message_handlers.charge_complete = function (d) {
        readyToReceive = false;
        if (globalConfigData && globalConfigData.chargecomplete) {
            globalConfigData.chargecomplete(d.data.type, d.data.data);
        }
    };

    message_handlers.charge_init = function (d) {
        if (globalConfigData && globalConfigData.chargeinit) {
            globalConfigData.chargeinit(d.data.type, d.data.timestamp);
        }
    };

    message_handlers.opop = message_handlers.vbvcomplete = function(d) {
        readyToReceive = false;

        if (afterCallbackRedirectTimeout) {
            clearTimeout(afterCallbackRedirectTimeout);
        }

        if (globalConfigData && globalConfigData.callback)
            globalConfigData.callback(d.data);

        // delay by at least a second
        // only redirect when we are not on a hosted page
        afterCallbackRedirectTimeout = setTimeout(function () {
            if (
                !globalIsHostedPage &&
                globalConfigData &&
                globalConfigData.redirect_url &&
                d.data.success
            ) {
                var method = +globalConfigData.redirect_post ? 'POST' : 'GET';

                if (method === 'GET' && +globalConfigData.redirect_no_json) {
                    window.location.href = globalConfigData.redirect_url;
                    return;
                }

                var $form = document.createElement('form');
                var $textarea = document.createElement('textarea');
                var hideStyle = 'position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;';

                $textarea.setAttribute('name', 'resp');
                $textarea.setAttribute('hidden', 'hidden');
                $textarea.setAttribute('readonly', 'readonly');
                $textarea.style = hideStyle;
                $textarea.value = JSON.stringify(d.data);

                $form.setAttribute('method', method);
                $form.setAttribute('action', globalConfigData.redirect_url);
                $form.setAttribute('hidden', 'hidden');
                $form.style = hideStyle;

                $form.appendChild($textarea);
                document.body.appendChild($form);

                $form.submit();
            }
        }, 1000); // end set timeout
    }

    message_handlers.closeiframe = function(d) {
        closePopup(false, d.data.data.cancelled);
        if (window.top && window.top !== self) {
            window.top.postMessage({ name: 'closeiframe' }, '*');
        }
    };

    message_handlers.modalready = function(d) {
        if (window.top && window.top !== self) {
            window.top.postMessage({ name: 'modalready' }, '*');
        }
    };

    // message_handlers.modalready = function(d) {
    //     document.body.style.overflow = "hidden";
    //     modaliframe.style.opacity = "1";
    //     modaliframe.style.pointerEvents = "";
    //     modaliframe.style.zIndex = "2147483647";
    // };

    w.addEventListener(
        "message",
        function(message_data) {
            if (
                message_data &&
                message_data.data &&
                message_data.data.name &&
                message_handlers[message_data.data.name]
            ) {
                message_handlers[message_data.data.name](message_data);
            }
        },
        false
    );

    //document.addEventListener("DOMContentLoaded", function(event) {
    function generateQueryString(obj) {
        var str = [];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                var v = obj[prop];
                v = encodeURIComponent(v);
                str.push(prop + "=" + v);
            }
        }
        return str.join("&");
    }

    var showIframe;

    function loadIframe (data, is_hide) {
        // show the spinner
        showSpinner = function () {
            var spinnerContainer = document.createElement("div");
            var spinner = document.createElement("div");
            spinnerContainer.setAttribute("class", "spinner-container");
            spinnerContainer.setAttribute("id", "rve_spinner_container_0999");
            spinner.setAttribute("class", "spinner");
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "40px");
            svg.setAttribute("height", "40px");
            svg.setAttribute("viewBox", "0 0 60 60");
            var path = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );
            path.style.fill = "#f5a623";
            path.style.fillRule = "evenodd";
            path.setAttribute(
                "d",
                "M59.972 26a37.616 37.616 0 0 0-.71-3.455 30.092 30.092 0 0 0-1.446-4.26 30.682 30.682 0 0 0-4.809-7.849 29.483 29.483 0 0 0-7.594-6.389A29.733 29.733 0 0 0 36.292.551C34.63.216 32.956.015 31.255.002a39.08 39.08 0 0 0-3.964.16 30.369 30.369 0 0 0-9.898 2.747 30.882 30.882 0 0 0-7.34 4.848A30.286 30.286 0 0 0 4.4 14.495C2.7 17.28 1.427 20.32.73 23.509c-.562 2.545-.83 5.17-.696 7.782.12 2.532.509 5.063 1.272 7.488a30.823 30.823 0 0 0 1.782 4.5 30.367 30.367 0 0 0 2.464 4.112 30.149 30.149 0 0 0 6.67 6.764 29.967 29.967 0 0 0 18.779 5.827 29.845 29.845 0 0 0 9.724-1.942 29.06 29.06 0 0 0 8.237-4.862c1.232-1.045 2.33-2.224 3.362-3.47 1.045-1.259 1.982-2.585 2.76-4.018a29.445 29.445 0 0 0 1.714-3.817c.24-.643.469-1.286.656-1.956.2-.71.348-1.446.482-2.17.201-1.138.281-2.317.174-3.469-.093.51-.174 1.005-.294 1.5a14.602 14.602 0 0 1-.55 1.688c-.428 1.165-.964 2.29-1.473 3.416a36.09 36.09 0 0 1-2.25 4.125 28.98 28.98 0 0 1-1.353 1.996c-.482.643-1.031 1.259-1.58 1.862a23.257 23.257 0 0 1-3.617 3.268 26.913 26.913 0 0 1-4.3 2.585c-3.026 1.473-6.335 2.357-9.683 2.652a27.72 27.72 0 0 1-10.22-1.018 27.424 27.424 0 0 1-8.72-4.393 27.441 27.441 0 0 1-6.455-6.939c-1.808-2.719-3.054-5.786-3.737-8.987a26.897 26.897 0 0 1-.402-2.532c-.08-.723-.147-1.46-.174-2.196a26.23 26.23 0 0 1 .281-4.581c.496-3.295 1.568-6.47 3.228-9.363a26.813 26.813 0 0 1 5.64-6.885 26.563 26.563 0 0 1 7.607-4.701 25.887 25.887 0 0 1 5.01-1.46 24.97 24.97 0 0 1 2.611-.362c.429-.04.844-.04 1.273-.08.174 0 .348.013.522.013 2.906-.053 5.826.322 8.599 1.192a25.15 25.15 0 0 1 8.237 4.42 25.798 25.798 0 0 1 6.295 7.475 27.988 27.988 0 0 1 2.934 7.795c.134.63.24 1.26.348 1.889a2.11 2.11 0 0 0 .91 1.433c1.045.696 2.505.228 3.014-.897.174-.389.228-.804.161-1.193z"
            );
            svg.appendChild(path);
            svg.classList.add("svg-spinner");
            spinner.appendChild(svg);
            spinnerContainer.appendChild(spinner);
            document.body.appendChild(spinnerContainer);

            var pageStyle = document.createElement("style");
            if (pageStyle) {
                pageStyle.appendChild(
                    document.createTextNode(
                        ".spinner-container{height:100%;width:100%;position:fixed;top:0;left:0;background-color:rgba(225,225,225,.95); z-index:9999999}.svg-spinner{-webkit-animation:spin 500ms infinite linear;animation:spin 500ms infinite linear}.spinner{margin-top:-20px; margin-left:-20px; position:fixed; top:50%; left:50%;}@-webkit-keyframes spin {from { -webkit-transform: rotate(0deg);}to { -webkit-transform: rotate(360deg); }}@keyframes spin{from {transform:rotate(0deg);}to {transform:rotate(360deg);}}"
                    )
                );
                document.getElementsByTagName("head")[0].appendChild(pageStyle);
            }
        };

        modalframesource = document.createElement('iframe');
        modalframesource.setAttribute('style', 'position:fixed;top:0;left:0;z-index:-1;border:none;opacity:0;pointer-events:none;width:100%;height:100%;');
        modalframesource.setAttribute('allowTransparency', 'true');
        modalframesource.setAttribute("width", "100%");
        modalframesource.setAttribute("height", "100%");
        modalframesource.setAttribute('name', 'checkout');

        if (!is_hide) {
            // modalframesource.setAttribute('width', '100%');
            // modalframesource.setAttribute('height', '100%');
            document.body.style.overflow = "";
            modalframesource.style.opacity = "1";
            modalframesource.style.pointerEvents = "";
            modalframesource.style.zIndex = "2147483647";
        }
        else {
            loadState = 'loading';
            // modalframesource.setAttribute('width', '0%');
            // modalframesource.setAttribute('height', '0%');
            modalframesource.style.opacity = "0";
            modalframesource.style.pointerEvents = "none";
            modalframesource.style.zIndex = "-1";

            showIframe = function (){
                iframeAlreadyShown = true;
                // modalframesource.setAttribute('width', '100%');
                // modalframesource.setAttribute('height', '100%');
                document.body.style.overflow = "hidden";
                modalframesource.style.opacity = "1";
                modalframesource.style.pointerEvents = "";
                modalframesource.style.zIndex = "2147483647";
            }

            hideIframe = function (){
                iframeAlreadyShown = false;
                modalframesource.style.opacity = "0";
                modalframesource.style.pointerEvents = "none";
                modalframesource.style.zIndex = "-1";
                document.body.style.overflow = "";
                initialize();
            }
        }

        //loadState

        modalframesource.setAttribute('id', 'flwpugpaidid');

        modalframesource.src = 'https://ravemodal-dev.herokuapp.com/?'

        if (document.body) {

            // If iframe already exists on the page, remove it from the body
            if (document.querySelector('#flwpugpaidid')) {
                document.querySelector('#flwpugpaidid').remove()
            }

            document.body.appendChild(modalframesource);
        }


    }

    function extractAttributes(element, attributes) {
        var obj = {};
        attributes.forEach(function(attrib) {
            var aa = element.getAttribute("data-" + attrib);
            if (aa) obj[attrib] = aa;
        });
        return obj;
    }

    function extractMetaInfo(element) {
        var attributes = element.attributes;
        var atrlen = attributes.length;
        var metas = [];
        for (var x = 0; x < atrlen; x++) {
            var attrib = attributes[x];
            if (attrib.name.match(/^data-meta-/)) {
                metas.push({
                    metaname: attrib.name.replace("data-meta-", ""),
                    metavalue: attrib.value
                });
            }
        }

        //=== Handle sideffects\\
        x = null;
        atrlen = null;
        //======================\\
        return metas;
    }

    function addQueryToIframe(data, callback) {
        modaliframe = document.getElementById("flwpugpaidid");

        if (data.loadtimeout) {
            handleLoadTimeout(data.onloadtimeout, data.loadtimeout);
        }

        globalConfigData = data;

        //this inadvertently strips all functions, the inner stringify that is. Accidental genius maybe?
        var _data = JSON.parse(JSON.stringify(data));

        delete _data.callback; //callback is not required as a query string to pass
        delete _data.onclose; //onclose is not required as a query string to pass
        delete _data.onpaymentinit;
        delete _data.onvalidateotpinit;
        delete _data.meta;
        delete _data.theme;
        //delete _data.onintegritycheck;

        _data.init_url = encodeURIComponent(window.location.href);


        // console.log(readyToReceive);

        if (window.location.href.includes('https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/hosted_pay/')) {
            modalframesource.src = modalframesource.src + generateQueryString(_data);
        }

        else if (data.hosted_payment || globalIsHostedPage === 1) {
            modalframesource.src = modalframesource.src + generateQueryString(_data);
        }
        else {

            let win = window.frames.checkout;

            let postmessagesource = 'https://ravemodal-dev.herokuapp.com';

            if (!readyToReceive) {
                modalframesource = document.createElement('iframe');
                modalframesource.setAttribute('style', 'position:fixed;top:0;left:0;z-index:-1;border:none;opacity:0;pointer-events:none;width:100%;height:100%;');
                modalframesource.setAttribute('allowTransparency', 'true');
                modalframesource.setAttribute("width", "100%");
                modalframesource.setAttribute("height", "100%");
                modalframesource.setAttribute('name', 'checkout');
                modalframesource.style.opacity = "1";
                modalframesource.style.pointerEvents = "";
                modalframesource.style.zIndex = "2147483647";
                document.body.style.overflow = "hidden";


                modalframesource.src = 'https://ravemodal-dev.herokuapp.com/?' + generateQueryString(_data);

                // If iframe already exists on the page, remove it from the body
                if (document.querySelector('#flwpugpaidid')) {
                    document.querySelector('#flwpugpaidid').remove()
                }

                document.body.appendChild(modalframesource)
            }
            else {
                win.postMessage(
                    {
                        name: "config",
                        configdata: generateQueryString(_data),
                    },
                    '*'
                );
            }

        }

    }
    var anchors = document.querySelectorAll(".flwpug_getpaid");
    var anlen = anchors.length;

    function initialize() {
        if (anlen) {
            for (var i = 0; i < anlen; i++) {
                var ahref = anchors[i];
                if (ahref) {
                    var iframeData = {};
                    iframeData = extractAttributes(ahref, [
                        "PBFPubKey",
                        "txref",
                        "amount",
                        "customer_email",
                        "customer_phone",
                        "customer_lastname",
                        "customer_firstname",
                        "currency",
                        "country",
                        "customer_fullname",
                        "callback",
                        "onclose",
                        "onvalidateotpinit",
                        "onpaymentinit",
                        "redirect_url",
                        "pay_button_text",
                        "custom_title",
                        "custom_description",
                        "custom_logo",
                        "custom_narration",
                        "default_account",
                        "payment_method",
                        "exclude_banks",
                        "settlement_token",
                        "recurring_stop",
                        "integrity_hash",
                        "redirect_post",
                        "redirect_no_json",
                        "payment_page",
                        "payment_plan",
                        "campaign_id",
                        "subaccounts_id",
                        "subaccounts_transaction_charge_type",
                        "subaccounts_transaction_split_ratio",
                        "subaccounts_transaction_charge",
                        "subaccounts",
                        "payment_options",
                        "disable_pwb",
                        "hosted_payment",
                        "include_discount_amount",
                        "mobilemoney_network"
                    ]);

                    //globalMeta = extractMetaInfo(ahref);
                    iframeData.meta = extractMetaInfo(ahref);

                    if (iframeData.subaccounts) {
                        iframeData.subaccounts = JSON.parse(iframeData.subaccounts);
                    }

                    if (iframeData.subaccounts_id) {
                        iframeData.subaccounts = [{
                            id: iframeData.subaccounts_id,
                            transaction_split_ratio: iframeData.subaccounts_transaction_split_ratio,
                            transaction_charge_type: iframeData.subaccounts_transaction_charge_type,
                            transaction_charge: iframeData.subaccounts_transaction_charge,
                        }]

                        delete iframeData.subaccounts_transaction_split_ratio
                        delete iframeData.subaccounts_transaction_charge_type
                        delete iframeData.subaccounts_transaction_charge
                        delete iframeData.subaccounts_id
                    }

                    var paybutton = document.createElement("button");
                    paybutton.innerText = iframeData.pay_button_text || "PAY NOW";
                    ahref.innerText = "";

                    paybutton.setAttribute(
                        "style",
                        "color:#fff;background-color:#0a2740;border-color:#142a3e;/*padding:10px;*/display:inline-block;padding:6px12px;margin-bottom:0;font-size:14px;font-weight:400;line-height:1.42857143;text-align:center;white-space:nowrap;vertical-align:middle;-ms-touch-action:manipulation;touch-action:manipulation;cursor:pointer;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-image:none;border:1pxsolidtransparent;border-radius:4px;"
                    );

                    paybutton.setAttribute("type", "button");

                    paybutton.addEventListener("click", function (e) {
                        window.getpaidSetup(iframeData);
                    });
                    ahref.appendChild(paybutton);
                }
            }
        }

        // loadIframe(null, true);
    }

    initialize();

    window.addEventListener('beforeunload', function () {
        if (afterCallbackRedirectTimeout) {
            clearTimeout(afterCallbackRedirectTimeout);
        }

        // if (readyToReceive !== false) {
        //     var win = window.frames.checkout;
        //     win && win.postMessage({ name: 'forceclose' }, '*');
        // }
    });

    window.getpaidSetup = function(config) {

        globalChargeData = config;

        if (globalChargeData && !globalChargeData.onclose) {
            globalChargeData.onclose = (function () {
                var location = document.location;
                return function () { document.location = location; }
            }());
        }

        globalButtonClicked = Date.now();
        if (config.hosted_payment == 1 && !config.is_hosted_page) {
            var form = document.createElement("form");
            form.setAttribute("method", "POST");
            form.setAttribute(
                "action",
                "https://ravemodal-dev.herokuapp.com/hosted/pay"
            );
            console.log(config)
            for (var c in config) {
                if (c === "meta") {
                    config[c].forEach(function(m, mi) {
                        var i = document.createElement("input");
                        i.setAttribute("type", "hidden");
                        i.setAttribute("name", c + "[" + mi + "][metaname]");
                        i.setAttribute("value", m.metaname);
                        form.appendChild(i);
                        var i = document.createElement("input");
                        i.setAttribute("type", "hidden");
                        i.setAttribute("name", c + "[" + mi + "][metavalue]");
                        i.setAttribute("value", m.metavalue);
                        form.appendChild(i);
                    });
                }
                else if (c === 'theme' && Object.prototype.toString.call(config[c]) === '[object Object]') {
                    Object.keys(config[c]).forEach(function (prop) {
                        var i = document.createElement("input");
                        i.setAttribute("type", "hidden");
                        i.setAttribute("name", c + "[" + prop + "]");
                        i.setAttribute("value", config[c][prop]);
                        form.appendChild(i);
                    });
                }
                else if (c === 'subaccounts') {
                    config[c].forEach(function(m, mi) {
                        var i = document.createElement("input");
                        i.setAttribute("type", "hidden");
                        i.setAttribute("name", c + "[" + mi + "][id]");
                        i.setAttribute("value", m.id);
                        form.appendChild(i);
                        if (m.transaction_charge_type) {
                            var i = document.createElement("input");
                            i.setAttribute("type", "hidden");
                            i.setAttribute("name", c + "[" + mi + "][transaction_charge_type]");
                            i.setAttribute("value", m.transaction_charge_type);
                            form.appendChild(i);
                        }

                        if (m.transaction_charge) {
                            var i = document.createElement("input");
                            i.setAttribute("type", "hidden");
                            i.setAttribute("name", c + "[" + mi + "][transaction_charge]");
                            i.setAttribute("value", m.transaction_charge);
                            form.appendChild(i);
                        }

                        if (m.transaction_split_ratio) {
                            var i = document.createElement("input");
                            i.setAttribute("type", "hidden");
                            i.setAttribute("name", c + "[" + mi + "][transaction_split_ratio]");
                            i.setAttribute("value", m.transaction_split_ratio);
                            form.appendChild(i);
                        }

                    });
                }
                else {
                    if (
                        !~["string", "number", "boolean"].indexOf(
                            _typeof(config[c])
                        )
                    )
                        continue;
                    var i = document.createElement("input");
                    i.setAttribute("type", "hidden");
                    i.setAttribute("name", c);
                    i.setAttribute("value", config[c]);
                    form.appendChild(i);
                }
            }
            document.body.appendChild(form);
            form.submit();
            return;
        }

        globalIsHostedPage = config.is_hosted_page;
        delete config.is_hosted_page;
        globalMeta = config.meta;
        globalSubaccounts = config.subaccounts;
        globalTheme = config.theme;
        delete config.theme;

        loadIframe(config, true);

        addQueryToIframe(config);
        if (loadState == "loaded") {
            showIframe();
        }
        else {
            showSpinner();
            deferredShowIframe = function (){
                showIframe();
            }
        }

        return {
            close: globalClosePopup.bind(null, true, false)
        };
    };
    // Execute the showIframe function
    // showIframe();

})(window);
