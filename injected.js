const libs_synthetics_urlMatcher = {
    isURLFetchingSyntheticContent: (url) => {
        if (!url.startsWith("/api/v0/synthetics/tests")) {
            return false;
        }
        const mainPath = url.split("?")[0];
        const splittedPath = mainPath.split("/");
        // console.log("isURLFetchingSyntheticContent", { url, mainPath, splittedPath });
        if (splittedPath.length !== 6) {
            return false;
        }
        return true;
    }
}

const libs_synthetics_detailedAnalytics = {
    isMonitorTaggedWithKey: (key, tags) => {
        for (let i = 0, tagsLength = tags.length; i < tagsLength; i++) {
            const tag = tags[i];
            const tagKey = tag.split(":")[0];
            if (tagKey === key) {
                return true;
            }
        }
        return false;
    },
}

const libs_synthetics_analytics = (monitorJSON) => {
    return {
        isMonitorTaggedWithKeyOwner: libs_monitors_detailedAnalytics
            .isMonitorTaggedWithKey("owner", monitorJSON.tags),
        isMonitorTaggedWithKeyEnv: libs_monitors_detailedAnalytics
            .isMonitorTaggedWithKey("env", monitorJSON.tags),
    }
}

const libs_synthetics_displayMessage = (message) => {
    const recommendationDOM = document.getElementById("recommendation");

    if (recommendationDOM === null) {
        const blockDOM = document.createElement('div');
        blockDOM.id = "recommendation";
        blockDOM.className = "synthetics_ui_accordion-block";
        const subBlockDOM = document.createElement('div');
        subBlockDOM.className = "ui_layout_panel ui_layout_panel--default ui_layout_panel--shadow-level-0";
        blockDOM.appendChild(subBlockDOM);

        const topSectionDOM = document.createElement('section');
        topSectionDOM.className = "ui_layout_accordion-skeleton ui_layout_accordion-skeleton--xl ui_layout_accordion ui_layout_accordion--xl";
        subBlockDOM.appendChild(topSectionDOM);

        const headerDOM = document.createElement('header');
        headerDOM.className = "ui_typography_text ui_typography_text--xl ui_typography_text--default ui_typography_text--normal ui_typography_text--left ui_typography_title ui_layout_accordion-skeleton__header ui_layout_accordion-skeleton__header--is-closed ui_layout_accordion__header";
        topSectionDOM.appendChild(headerDOM);
        const spanTitleDOM = document.createElement('span');
        spanTitleDOM.className = "ui_layout_accordion-skeleton__header__title";
        spanTitleDOM.innerHTML = '<svg class="ui_icons_icon ui_icons_icon--xl ui_layout_accordion-skeleton__header__icon ui_layout_accordion__header__icon" aria-hidden="true"><use xlink:href="#ui_icons_angle-right--sprite" fill=""></use></svg>';
        spanTitleDOM.innerHTML += "Company Recommendations"
        headerDOM.appendChild(spanTitleDOM);

        const recoBody1DOM = document.createElement('div');
        recoBody1DOM.className = "ui_layout_accordion-skeleton__body";
        topSectionDOM.appendChild(recoBody1DOM);
        const recoBody2DOM = document.createElement('div');
        recoBody2DOM.className = "ui_layout_panel ui_layout_panel--default ui_layout_panel--shadow-level-0 ui_layout_panel--is-borderless ui_padding--top-md ui_padding--bottom-md ui_padding--left-md ui_padding--right-md";
        recoBody1DOM.appendChild(recoBody2DOM);
        const recoBody3DOM = document.createElement('div');
        recoBody3DOM.className = "PropertiesSection-body";
        recoBody2DOM.appendChild(recoBody3DOM);
        const contentDOM = document.createElement('ul');
        contentDOM.innerHTML = message;
        recoBody3DOM.appendChild(contentDOM);

        const monitorStatusBodyDOM = document.getElementsByClassName("ui_margin--top-md ui_margin--bottom-md ui_margin--left-md ui_margin--right-md")[0];
        if (monitorStatusBodyDOM) {
            monitorStatusBodyDOM.prepend(blockDOM);
        }
    }
}

const libs_synthetics_analyze = (syntheticJSON) => {
    const analytics = libs_synthetics_analytics(syntheticJSON);
    messageContent = "";
    if (!analytics.isMonitorTaggedWithKeyOwner || !analytics.isMonitorTaggedWithKeyEnv) {
        messageContent += "<li>Tags env and owner are mandatory. One of them is missing.</li>";
    }
    if (messageContent !== "") {
        libs_synthetics_displayMessage(messageContent);
    }

}

const libs_monitors_urlMatcher = {
    isURLFetchingMonitorContent: (url) => {
        if (!url.startsWith("/api/v1/monitor/")) {
            return false;
        }
        const mainPath = url.split("?")[0];
        const splittedPath = mainPath.split("/");
        // console.log("isURLFetchingMonitorContent", { url, mainPath, splittedPath });
        if (splittedPath.length !== 5) {
            return false;
        }
        return true;
    }
};

const libs_monitors_detailedAnalytics = {
    isMessageContainingAnURL: (message) => {
        const splittedMessage = message.split("http");
        if (splittedMessage.length > 1) {
            return true;
        }
        return false;
    },
    isMonitorTaggedWithKey: (key, tags) => {
        for (let i = 0, tagsLength = tags.length; i < tagsLength; i++) {
            const tag = tags[i];
            const tagKey = tag.split(":")[0];
            if (tagKey === key) {
                return true;
            }
        }
        return false;
    },
    isMonitorUsingRecommendedEvaluationDelay: (metrics, evaluationDelay) => {
        let isEvaluationDelayRequired = false;
        for (let i = 0, l = metrics.length; i < l; i++) {
            const m = metrics[i];
            if (isEvaluationDelayRequired === true) {
                continue;
            }
            if (m.startsWith('aws.')) {
                isEvaluationDelayRequired = true;
                continue;
            }
            if (m.startsWith('azure.')) {
                isEvaluationDelayRequired = true;
                continue;
            }
            if (m.startsWith('gcp.')) {
                isEvaluationDelayRequired = true;
                continue;
            }
        }
        if (!isEvaluationDelayRequired) {
            return true;
        }
        if (evaluationDelay && evaluationDelay >= 900) {
            return true;
        }
        return false;
    },
    isMonitorNotTriggeredRecently: (latestStateModified) => {
        if (!latestStateModified) {
            return false;
        }
        const latestStateModifiedDate = Date.parse(latestStateModified);
        const thresholdDate = new Date();
        const DAYS_TO_REMOVE = 90;
        thresholdDate.setDate(thresholdDate.getDate() - DAYS_TO_REMOVE);
        if (thresholdDate < latestStateModifiedDate) {
            return true;
        }
        return false;
    }
}

const libs_monitors_analytics = (monitorJSON) => {
    return {
        isMessageContainingAnURL: libs_monitors_detailedAnalytics
            .isMessageContainingAnURL(monitorJSON.message),
        isMonitorTaggedWithKeyOwner: libs_monitors_detailedAnalytics
            .isMonitorTaggedWithKey("owner", monitorJSON.tags),
        isMonitorTaggedWithKeyEnv: libs_monitors_detailedAnalytics
            .isMonitorTaggedWithKey("env", monitorJSON.tags),
        isMonitorUsingRecommendedEvaluationDelay: libs_monitors_detailedAnalytics
            .isMonitorUsingRecommendedEvaluationDelay(monitorJSON.params.metrics, monitorJSON.evaluation_delay),
        isMonitorNotTriggeredRecently: libs_monitors_detailedAnalytics
            .isMonitorNotTriggeredRecently(monitorJSON.overall_state_modified)
    }
}

const libs_monitors_displayMessage = (message) => {
    const recommendationDOM = document.getElementById("recommendation");

    if (recommendationDOM === null) {
        const blockDOM = document.createElement('div');
        blockDOM.id = "recommendation";
        blockDOM.className = "ui_margin--top-md MonitorStatus-panel";
        const topSectionDOM = document.createElement('section');
        topSectionDOM.className = "ui_layout_accordion-skeleton ui_layout_accordion-skeleton--xl ui_layout_accordion ui_layout_accordion--xl PropertiesSection-container";
        blockDOM.appendChild(topSectionDOM);

        const headerDOM = document.createElement('header');
        headerDOM.className = "ui_typography_text ui_typography_text--xl ui_typography_text--default ui_typography_text--normal ui_typography_text--left ui_typography_title ui_layout_accordion-skeleton__header ui_layout_accordion-skeleton__header--is-open ui_layout_accordion__header";
        topSectionDOM.appendChild(headerDOM);
        const spanTitleDOM = document.createElement('span');
        spanTitleDOM.className = "ui_layout_accordion-skeleton__header__title";
        spanTitleDOM.innerHTML = '<svg class="ui_icons_icon ui_icons_icon--xl ui_layout_accordion-skeleton__header__icon ui_layout_accordion__header__icon" aria-hidden="true"><use xlink:href="#ui_icons_angle-right--sprite" fill=""></use></svg>';
        spanTitleDOM.innerHTML += "Company Recommendations"
        headerDOM.appendChild(spanTitleDOM);

        const recoBody1DOM = document.createElement('div');
        recoBody1DOM.className = "ui_layout_accordion-skeleton__body";
        topSectionDOM.appendChild(recoBody1DOM);
        const recoBody2DOM = document.createElement('div');
        recoBody2DOM.className = "ui_layout_panel ui_layout_panel--default ui_layout_panel--shadow-level-0 ui_layout_panel--is-borderless ui_padding--top-md ui_padding--bottom-md ui_padding--left-md ui_padding--right-md";
        recoBody1DOM.appendChild(recoBody2DOM);
        const recoBody3DOM = document.createElement('div');
        recoBody3DOM.className = "PropertiesSection-body";
        recoBody2DOM.appendChild(recoBody3DOM);
        const contentDOM = document.createElement('ul');
        contentDOM.innerHTML = message;
        recoBody3DOM.appendChild(contentDOM);

        const monitorStatusBodyDOM = document.getElementsByClassName("MonitorStatus-body")[0];
        if (monitorStatusBodyDOM) {
            monitorStatusBodyDOM.prepend(blockDOM);
        }
    }
}

const libs_monitors_analyze = (monitorJSON) => {
    const analytics = libs_monitors_analytics(monitorJSON);
    // console.log("injected.js", "send", "addEventListener", "isURLFetchingMonitorContent", {
    //     monitorJSON,
    //     analytics
    // });
    messageContent = "";
    if (!analytics.isMessageContainingAnURL) {
        messageContent += "<li>An alert should be actionable, why not adding a link to a dashboard or a doc.</li>";
    }
    if (!analytics.isMonitorTaggedWithKeyOwner || !analytics.isMonitorTaggedWithKeyEnv) {
        messageContent += "<li>Tags env and owner are mandatory. One of them is missing.</li>";
    }
    if (!analytics.isMonitorUsingRecommendedEvaluationDelay) {
        messageContent += "<li>Cloud metrics require a 15min (900sec) evaluation delay.[documentation](https://docs.datadoghq.com/integrations/faq/cloud-metric-delay/)</li>";
    }
    if (!analytics.isMonitorNotTriggeredRecently) {
        messageContent += "<li>This monitor has not triggered in a while, is it still well configured?</li>";
    }
    if (messageContent !== "") {
        libs_monitors_displayMessage(messageContent);
    }

}


(function(xhr) {

  var XHR = XMLHttpRequest.prototype;

  var open = XHR.open;
  var send = XHR.send;
  var setRequestHeader = XHR.setRequestHeader;

  XHR.open = function(method, url) {
    // console.log("injected.js", "open", {method, url});
    this._method = method;
    this._url = url;
    this._requestHeaders = {};
    this._startTime = (new Date()).toISOString();

    return open.apply(this, arguments);
  };

  XHR.setRequestHeader = function(header, value) {
    // console.log("injected.js", "setRequestHeader", {header, value});
    this._requestHeaders[header] = value;
    return setRequestHeader.apply(this, arguments);
  };

  XHR.send = function(postData) {
    // console.log("injected.js", "send", {url: this._url, postData});

    this.addEventListener('load', function() {
        var endTime = (new Date()).toISOString();

        var myUrl = this._url ? this._url.toLowerCase() : this._url;

        // if(myUrl) {
        // if(myUrl && (myUrl.startsWith("/monitor/search") || myUrl.startsWith("/api/v"))) {
        if (false) {

            if (postData) {
                if (typeof postData === 'string') {
                    try {
                        // here you get the REQUEST HEADERS, in JSON format, so you can also use JSON.parse
                        this._requestHeaders = postData;    
                    } catch(err) {
                        console.log('Request Header JSON decode failed, transfer_encoding field could be base64');
                        console.log(err);
                    }
                } else if (typeof postData === 'object' || typeof postData === 'array' || typeof postData === 'number' || typeof postData === 'boolean') {
                        // do something if you need
                }
            }

            // here you get the RESPONSE HEADERS
            var responseHeaders = this.getAllResponseHeaders();
            // console.log("injected.js", "send", "addEventListener", {url: this._url, responseHeaders});
            // console.log("injected.js", "send", "addEventListener", {
            //     url: this._url,
            //     responseType: this.responseType,
            //     responseText: this.responseText
            // });

            if ( this.responseType != 'blob' && this.responseText) {
                // responseText is string or null
                try {

                    // here you get RESPONSE TEXT (BODY), in JSON format, so you can use JSON.parse
                    var responseBody = this.responseText;

                    // printing url, request headers, response headers, response body, to console

                    // console.log(this._url);
                    // console.log(JSON.parse(this._requestHeaders));
                    // console.log(responseHeaders);
                    // console.log(JSON.parse(arr));   
                    console.log("injected.js", "send", "addEventListener", {
                        url: this._url,
                        // requestHeaders: JSON.parse(this._requestHeaders),
                        responseHeaders,
                        arr: JSON.parse(responseBody)
                    });

                } catch(err) {
                    console.log("Error in responseType try catch");
                    console.log(err);
                }
            }
        }

        if (myUrl && libs_monitors_urlMatcher.isURLFetchingMonitorContent(myUrl)) {
            console.log("### START Monitor Analytics");

            if ( this.responseType != 'blob' && this.responseText) {
                try {
                    var responseBody = this.responseText;
                    monitorJSON = JSON.parse(responseBody);
                    // console.log(monitorJSON)
                    libs_monitors_analyze(monitorJSON);
                } catch(err) {
                    console.log("Error in responseType try catch");
                    console.log(err);
                }
            }

            console.log("### END Monitor Analytics");
        }

        if (myUrl && libs_synthetics_urlMatcher.isURLFetchingSyntheticContent(myUrl)) {
            console.log("### START Synthetic Analytics");

            if ( this.responseType != 'blob' && this.responseText) {
                try {
                    var responseBody = this.responseText;
                    syntheticJSON = JSON.parse(responseBody);
                    // console.log(syntheticJSON)
                    libs_synthetics_analyze(syntheticJSON);
                } catch(err) {
                    console.log("Error in responseType try catch");
                    console.log(err);
                }
            }

            console.log("### END Synthetic Analytics");
        }
    });

    return send.apply(this, arguments);
  };

})(XMLHttpRequest);