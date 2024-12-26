chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getBlockedItems') {
      chrome.storage.local.get(['blockedUsers', 'blockedTokens'], (result) => {
        sendResponse({
          blockedUsers: result.blockedUsers || [],
          blockedTokens: result.blockedTokens || []
        });
      });
      // Return true to indicate that the response will be sent asynchronously
      return true;
    }
  });