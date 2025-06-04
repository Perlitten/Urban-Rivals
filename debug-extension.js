// === CHROME MV3 SERVICE WORKER DEBUG SCRIPT ===
// Following best practices from MV3 documentation
// Run this in Chrome DevTools console on http://localhost:8000/test-extension.html

console.log('🔧 Starting MV3 Service Worker Debug Script');

// === COMPREHENSIVE DIAGNOSTICS ===

async function runFullDiagnostics() {
  console.log('🔍 === RUNNING FULL MV3 DIAGNOSTICS ===');
  
  // 1. Check basic Chrome extension API availability
  console.log('1️⃣ Checking Chrome extension API...');
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.error('❌ Chrome extension API not available');
    return false;
  }
  console.log('✅ Chrome extension API available');
  
  // 2. Check if extension is installed
  console.log('2️⃣ Checking if extension is installed...');
  try {
    await chrome.runtime.sendMessage(window.EXTENSION_ID, { type: 'PING' });
    console.log('✅ Extension responds to messages');
  } catch (error) {
    console.error('❌ Extension does not respond:', error.message);
    return false;
  }
  
  // 3. Check service worker status using chrome://serviceworker-internals
  console.log('3️⃣ Service worker diagnostics...');
  console.log('📖 Check manually: chrome://serviceworker-internals');
  console.log('📖 Check manually: chrome://extensions (look for "Service worker" link)');
  
  return true;
}

// === TEST FUNCTIONS ===

async function testPing() {
  console.log('🏓 Testing PING...');
  try {
    const response = await chrome.runtime.sendMessage(window.EXTENSION_ID, { type: 'PING' });
    console.log('✅ PING successful:', response);
    return true;
  } catch (error) {
    console.error('❌ PING failed:', error.message);
    return false;
  }
}

async function testPreferences() {
  console.log('⚙️  Testing GET_PREFERENCES...');
  try {
    const response = await chrome.runtime.sendMessage(window.EXTENSION_ID, { type: 'GET_PREFERENCES' });
    console.log('✅ Preferences loaded:', response);
    return true;
  } catch (error) {
    console.error('❌ Preferences failed:', error.message);
    return false;
  }
}

async function testMultiplePings() {
  console.log('🔄 Testing multiple rapid pings...');
  const results = [];
  
  for (let i = 0; i < 5; i++) {
    try {
      const start = Date.now();
      const response = await chrome.runtime.sendMessage(window.EXTENSION_ID, { type: 'PING' });
      const duration = Date.now() - start;
      results.push({ ping: i + 1, duration, success: true, response });
      console.log(`✅ Ping ${i + 1}: ${duration}ms`, response);
    } catch (error) {
      results.push({ ping: i + 1, success: false, error: error.message });
      console.error(`❌ Ping ${i + 1} failed:`, error.message);
    }
    
    // Small delay between pings
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

async function checkServiceWorkerLifecycle() {
  console.log('🔄 Testing service worker lifecycle...');
  
  // First ping
  console.log('🏓 Initial ping...');
  await testPing();
  
  // Wait for potential worker shutdown (30+ seconds)
  console.log('⏱️  Waiting 35 seconds for worker to potentially shut down...');
  console.log('   (Service workers in MV3 shut down after ~30 seconds of inactivity)');
  
  return new Promise(resolve => {
    setTimeout(async () => {
      console.log('🏓 Ping after potential shutdown...');
      const result = await testPing();
      if (result) {
        console.log('✅ Service worker successfully woke up after shutdown');
      } else {
        console.log('❌ Service worker failed to wake up');
      }
      resolve(result);
    }, 35000);
  });
}

// === ERROR DIAGNOSTICS ===

function diagnoseConnectionError(error) {
  console.log('🔍 === CONNECTION ERROR DIAGNOSIS ===');
  
  if (error.message.includes('Could not establish connection')) {
    console.log('🔍 Root cause: "Could not establish connection. Receiving end does not exist"');
    console.log('');
    console.log('📋 Possible causes:');
    console.log('   1. Service worker is not running (inactive)');
    console.log('   2. Event listeners not registered at top level');
    console.log('   3. Extension has compilation errors');
    console.log('   4. Wrong extension ID');
    console.log('   5. Service worker crashed during startup');
    console.log('');
    console.log('🛠️  Troubleshooting steps:');
    console.log('   1. Check chrome://extensions for errors');
    console.log('   2. Click "Service worker" link to open DevTools');
    console.log('   3. Look for [BG_MINIMAL] logs in service worker console');
    console.log('   4. Verify extension ID matches manifest');
    console.log('   5. Reinstall extension completely');
  }
}

// === MAIN TEST SEQUENCE ===

async function runAllTests() {
  console.log('🚀 === STARTING COMPLETE TEST SEQUENCE ===');
  
  // Step 1: Basic diagnostics
  const basicsOk = await runFullDiagnostics();
  if (!basicsOk) {
    console.log('❌ Basic diagnostics failed. Cannot continue.');
    return;
  }
  
  // Step 2: Basic functionality
  console.log('\n🧪 === BASIC FUNCTIONALITY TESTS ===');
  await testPing();
  await testPreferences();
  
  // Step 3: Stress testing
  console.log('\n🏋️ === STRESS TESTS ===');
  await testMultiplePings();
  
  console.log('\n✅ === ALL TESTS COMPLETED ===');
  console.log('📊 Check the results above for any failures');
}

// === UTILITIES ===

function clearServiceWorkers() {
  console.log('🧹 Clearing old service workers...');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log(`Found ${registrations.length} service worker registrations`);
      registrations.forEach((registration, index) => {
        console.log(`Unregistering SW ${index + 1}:`, registration.scope);
        registration.unregister();
      });
    });
  }
}

function showInstructions() {
  console.log('📖 === USAGE INSTRUCTIONS ===');
  console.log('');
  console.log('Available functions:');
  console.log('  🏓 testPing()                   - Test basic ping');
  console.log('  ⚙️  testPreferences()           - Test preferences loading');
  console.log('  🔄 testMultiplePings()          - Test multiple rapid pings');
  console.log('  🔄 checkServiceWorkerLifecycle() - Test worker shutdown/wakeup (35s)');
  console.log('  🚀 runAllTests()               - Run complete test suite');
  console.log('  🧹 clearServiceWorkers()       - Clear old service workers');
  console.log('  🔍 diagnoseConnectionError(err) - Diagnose connection errors');
  console.log('');
  console.log('🎯 Quick start: runAllTests()');
}

// === AUTO-START ===

console.log('🎯 MV3 Debug Script Ready!');
showInstructions();

// Auto-run basic test
setTimeout(() => {
  console.log('🔄 Auto-running basic test in 2 seconds...');
  testPing().catch(error => {
    console.error('❌ Auto-test failed:', error.message);
    diagnoseConnectionError(error);
  });
}, 2000);

// Debug Extension Communication
console.log('🔧 Extension Debug Script Loading...');

// Remove hardcoded extension ID - let Chrome tell us the real one
function detectExtensionId() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      // Try to get the extension ID from the current context
      if (chrome.runtime.id) {
        resolve(chrome.runtime.id);
      } else {
        // If we're on a webpage, we need to ask all possible extensions
        // This is a fallback method
        resolve(null);
      }
    } else {
      resolve(null);
    }
  });
}

// Find working extension ID by trying to communicate
async function findWorkingExtensionId() {
  console.log('🔍 Searching for working extension...');
  
  // List of possible extension IDs to test
  const testIds = [
    chrome.runtime?.id, // Current extension ID if available
    'eoggfhdgnpmmbglniapcifoigpkeadkg', // Old hardcoded ID
    'invalid' // This will definitely fail
  ].filter(Boolean);
  
  for (const extensionId of testIds) {
    try {
      console.log(`Testing extension ID: ${extensionId}`);
      
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(extensionId, { type: 'PING' }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });
      
      if (response && response.pong) {
        console.log(`✅ Found working extension ID: ${extensionId}`);
        return extensionId;
      }
    } catch (error) {
      console.log(`❌ Extension ID ${extensionId} failed:`, error.message);
    }
  }
  
  console.log('❌ No working extension found');
  return null;
}

// Test extension communication
async function testExtensionCommunication() {
  console.log('🧪 Testing Extension Communication...');
  
  const workingId = await findWorkingExtensionId();
  if (!workingId) {
    console.log('❌ Could not find working extension');
    return;
  }
  
  window.WORKING_EXTENSION_ID = workingId;
  
  try {
    // Test PING
    console.log('📤 Testing PING...');
    const pingResponse = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(workingId, { type: 'PING' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
    console.log('📥 PING Response:', pingResponse);
    
    // Test GET_PREFERENCES
    console.log('📤 Testing GET_PREFERENCES...');
    const prefsResponse = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(workingId, { type: 'GET_PREFERENCES' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
    console.log('📥 GET_PREFERENCES Response:', prefsResponse);
    
  } catch (error) {
    console.error('❌ Communication test failed:', error);
  }
}

// Auto-run tests
if (typeof chrome !== 'undefined' && chrome.runtime) {
  testExtensionCommunication();
} else {
  console.log('❌ Chrome runtime not available');
} 