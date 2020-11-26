# Datadog Guide

## Concept

The idea behind this project is to intercept some objects coming from Datadog and display custom recommendations to improve the quality of monitors, dashboards, etc. based on Company's policies and rules.

Use case examples:

- Display a warning when a set of tags is not set on a monitor
- Inject templated monitor message for people to follow
- Suggest options and features to use based on initial configuration
- Add links to internal documentation

## Get started

1. Clone this repository locally
1. Navigate to [chrome://extensions/](chrome://extensions/)
1. Enable developer mode
1. Select "Load unpacked" and select the extension repository

## Customize

This repository is aimed at being kept simple in order for people to easily customize it.

The `inject.js` script is used to automatically inject the `injected.js` script in all pages.

The `injected.js` script is simply listening to *xhr* calls and can answer to them. In this example, if the url called matches some defined pattern, the response of the xhr call is then analyzed. The result of the analysis then insert a *DOM* object inside the html page.

## Resources

- [Build Chrome Extension](https://thoughtbot.com/blog/how-to-make-a-chrome-extension)
- [Intercept API Calls](https://stackoverflow.com/questions/52669328/chrome-extension-intercept-http-response) which led to [this article](https://medium.com/better-programming/chrome-extension-intercepting-and-reading-the-body-of-http-requests-dd9ebdf2348b) and the [full example on github](https://github.com/AniketBhadane/kumpan-phish-extension)