document.getElementById('sendUrl').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var currentTab = tabs[0];
        chrome.runtime.sendMessage({url: currentTab.url}, function(response) {
            document.getElementById('apiResponse').textContent = response;
        });
    });
});