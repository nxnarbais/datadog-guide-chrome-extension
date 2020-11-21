// Step 1: Send an alert
// alert("Hello from your Chrome extension!")

// Step 2: Connect to the content with jQuery and log it
// var firstHref = $("a[href^='http']").eq(0).attr("href");
// console.log(firstHref);

// Step 3: Use background script to trigger payload and a listener to react to it

// Content scripts have some limitations. They cannot use chrome.* APIs, with the exception of extension, i18n, runtime, and storage.

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if( request.message === "clicked_browser_action" ) {
//       var firstHref = $("a[href^='http']").eq(0).attr("href");

//       console.log(firstHref);
//     }
//   }
// );

// Step 4: Open a new tab

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);

      chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
    }
  }
);