document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-section`).classList.add('active');
      });
    });
  
    // Load blocked items
    loadBlockedItems();
  
    // Add event listeners
    document.getElementById('add-user').addEventListener('click', () => addItem('users'));
    document.getElementById('add-token').addEventListener('click', () => addItem('tokens'));
    
    document.getElementById('username').addEventListener('keypress', e => {
      if (e.key === 'Enter') addItem('users');
    });
    
    document.getElementById('token').addEventListener('keypress', e => {
      if (e.key === 'Enter') addItem('tokens');
    });
  
    function loadBlockedItems() {
      chrome.storage.local.get(['blockedUsers', 'blockedTokens']).then(result => {
        updateList('users', result.blockedUsers || []);
        updateList('tokens', result.blockedTokens || []);
      });
    }
  
    function addItem(type) {
      const input = document.getElementById(type === 'users' ? 'username' : 'token');
      const value = input.value.trim();
      if (value) {
        const storageKey = type === 'users' ? 'blockedUsers' : 'blockedTokens';
        chrome.storage.local.get([storageKey]).then(result => {
          const items = result[storageKey] || [];
          if (!items.includes(value)) {
            items.push(value);
            chrome.storage.local.set({ [storageKey]: items }).then(() => {
              updateList(type, items);
              input.value = '';
            });
          }
        });
      }
    }
  
    function updateList(type, items) {
      const list = document.getElementById(`${type}-list`);
      list.innerHTML = '';
      
      if (items.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = `No ${type} blocked yet`;
        list.appendChild(emptyState);
        return;
      }
  
      items.forEach(item => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = item;
        li.appendChild(span);
        
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove';
        removeBtn.onclick = () => removeItem(type, item);
        li.appendChild(removeBtn);
        
        list.appendChild(li);
      });
    }
  
    function removeItem(type, item) {
      const storageKey = type === 'users' ? 'blockedUsers' : 'blockedTokens';
      chrome.storage.local.get([storageKey]).then(result => {
        const items = result[storageKey] || [];
        const index = items.indexOf(item);
        if (index > -1) {
          items.splice(index, 1);
          chrome.storage.local.set({ [storageKey]: items }).then(() => {
            updateList(type, items);
          });
        }
      });
    }
  });