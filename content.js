let blockedUsers = [];
let blockedTokens = [];

// Function to request blocked items from the background script
function requestBlockedItems() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getBlockedItems' }, (response) => {
      resolve(response);
    });
  });
}

function getTokenFromAltText(altText) {
  // Extract token name from alt text like "Donatello token avatar"
  const tokenMatch = altText.match(/^(\w+)/);
  if (tokenMatch) {
    console.log('Token extracted from alt text:', tokenMatch[1]);
    return tokenMatch[1];
  }
  console.log('No token found in alt text:', altText);
  return null;
}

function hideBlockedContent() {
  // Handle user comments (keeping existing functionality)
  const userLinks = document.querySelectorAll('a.font-weight-semibold.font-size-2');
  userLinks.forEach(link => {
    const username = link.textContent.trim();
    console.log('Username:', username);
    if (blockedUsers.includes(username)) {
      const comment = link.closest('.comment');
      if (comment) {
        console.log('Hiding comment for user:', username);
        comment.style.display = 'none';
      }
    }
  });

  // Handle token posts using the alt text of the avatar image
  const posts = document.querySelectorAll('.post.card');
  console.log('Found posts:', posts.length);
  posts.forEach(post => {
    const avatarImg = post.querySelector('img.avatar-img[alt*="token avatar"]');
    if (avatarImg) {
      const altText = avatarImg.getAttribute('alt');
      const token = getTokenFromAltText(altText);

      // Debugging step: Log token and alt text to verify the extraction
      console.log('Token:', token, 'Alt Text:', altText);

      if (token && blockedTokens.includes(token)) {
        console.log('Hiding post for token:', token);
        post.style.display = 'none';
      }
    } else {
      console.log('No avatar image found in post:', post);
    }
  });
}

// Function to set up the MutationObserver
function setupMutationObserver() {
  // Set up the observer on the feed container or body
  const targetNode = document.body;
  if (targetNode) {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          hideBlockedContent();
        }
      }
    });

    observer.observe(targetNode, {
      childList: true,
      subtree: true
    });
  } else {
    console.error('Failed to find document body');
  }
}

// Function to initialize the content script
async function initializeContentScript() {
  const response = await requestBlockedItems();
  blockedUsers = response.blockedUsers;
  blockedTokens = response.blockedTokens;

  console.log('Blocked Users:', blockedUsers);
  console.log('Blocked Tokens:', blockedTokens);

  hideBlockedContent();
  setupMutationObserver();
}

// Wait for the DOM to be fully loaded before setting up the observer and hiding content
function waitForDocumentBody() {
  if (document.body) {
    initializeContentScript();
  } else {
    requestAnimationFrame(waitForDocumentBody);
  }
}

waitForDocumentBody();