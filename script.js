// ==========================================
// 1. API Server URL Setup
// ==========================================
const SERVER_URL = 'https://sarmaya-saathi-api.onrender.com';

// ==========================================
// 2. Splash Screen Timer
// ==========================================
setTimeout(() => {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
}, 3000); 

// ==========================================
// 3. NAYA: URL Referral Capture (Auto-fill)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
        setTimeout(() => {
            toggleScreens('signup');
            const refInput = document.getElementById('reg-referral');
            if(refInput) refInput.value = refCode;
        }, 3100); 
    }
});

// ==========================================
// Screen Switcher (Toggle Log In / Sign Up / OTP)
// ==========================================
function toggleScreens(screenName) {
    const signupScreen = document.getElementById('signup-section');
    const loginScreen = document.getElementById('login-section');
    const otpScreen = document.getElementById('otp-section');

    signupScreen.style.display = 'none';
    loginScreen.style.display = 'none';
    otpScreen.style.display = 'none';

    if (screenName === 'login') {
        loginScreen.style.display = 'block';
    } else if (screenName === 'signup') {
        signupScreen.style.display = 'block';
    } else if (screenName === 'otp') {
        otpScreen.style.display = 'block';
    }
}

// ==========================================
// UPDATED: User Signup Logic (With Referral)
// ==========================================
async function registerUser(event) {
    event.preventDefault(); 

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const mobile = document.getElementById('reg-mobile').value;
    const password = document.getElementById('reg-password').value;
    
    // Form se referral code uthayein
    const refInput = document.getElementById('reg-referral');
    const referral_code = refInput ? refInput.value.trim() : ''; 

    const messageBox = document.getElementById('signup-message');

    messageBox.style.color = "#FFD700";
    messageBox.innerText = "Processing & sending OTP...";

    try {
        const response = await fetch(`${SERVER_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, mobile_number: mobile, email, password, referral_code })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('temp_email', email);
            messageBox.innerText = "";
            document.getElementById('signupForm').reset();
            toggleScreens('otp');
        } else {
            messageBox.style.color = "#dc3545";
            messageBox.innerText = `⚠️ Error: ${data.error}`; 
        }
    } catch (error) {
        console.error("Signup request fail:", error);
        messageBox.style.color = "#dc3545";
        messageBox.innerText = "⚠️ Server connection failed.";
    }
}

// ==========================================
// OTP Verification Logic 
// ==========================================
async function verifyOTPUser(event) {
    event.preventDefault();

    const email = localStorage.getItem('temp_email');
    const otp = document.getElementById('otp-input').value;
    const messageBox = document.getElementById('otp-message');

    if(!email) {
        alert("Session expired. Please signup again.");
        toggleScreens('signup');
        return;
    }

    messageBox.style.color = "#FFD700";
    messageBox.innerText = "Verifying...";

    try {
        const response = await fetch(`${SERVER_URL}/api/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();

        if (response.ok) {
            messageBox.style.color = "#28a745";
            messageBox.innerText = `🎉 ${data.message}`; 
            localStorage.removeItem('temp_email'); 
            document.getElementById('otpForm').reset();
            setTimeout(() => toggleScreens('login'), 2000); 
        } else {
            messageBox.style.color = "#dc3545";
            messageBox.innerText = `⚠️ Error: ${data.error}`; 
        }
    } catch (error) {
        console.error("OTP error:", error);
        messageBox.style.color = "#dc3545";
        messageBox.innerText = "⚠️ Server connection failed.";
    }
}

// ==========================================
// User Login Function
// ==========================================
async function loginUser(event) {
    event.preventDefault(); 

    const mobile = document.getElementById('login-mobile').value;
    const password = document.getElementById('login-password').value;
    const messageBox = document.getElementById('login-message');
    
    messageBox.style.color = "#FFD700";
    messageBox.innerText = "Logging in...";

    try {
        const response = await fetch(`${SERVER_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mobile_number: mobile, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('sarmaya_token', data.token); 
            localStorage.setItem('sarmaya_user_id', data.user.id);
            localStorage.setItem('sarmaya_name', data.user.name);
            localStorage.setItem('sarmaya_mobile', data.user.mobile_number);
            localStorage.setItem('sarmaya_balance', data.user.wallet_balance);

            messageBox.innerText = "";
            document.getElementById('login-mobile').value = '';
            document.getElementById('login-password').value = '';

            document.getElementById('auth-screen').style.display = 'none'; 
            document.getElementById('dashboard-screen').style.display = 'flex'; 
            document.getElementById('bottom-nav').style.display = 'flex'; 

            const userNameDisplay = document.getElementById('user-name-display');
            if(userNameDisplay) userNameDisplay.innerText = data.user.name;
            
            const walletBalance = document.getElementById('wallet-balance');
            if(walletBalance) walletBalance.innerText = `$${data.user.wallet_balance}`;
            
            loadDashboard(); // Load data on login
        } else {
            messageBox.style.color = "#dc3545";
            messageBox.innerText = `⚠️ Error: ${data.error}`;
        }
    } catch (error) {
        console.error("Error during login:", error);
        messageBox.style.color = "#dc3545";
        messageBox.innerText = "⚠️ Server connection failed.";
    }
}

// ==========================================
// App Navigation & Logic
// ==========================================
function switchTab(tabName) {
    document.getElementById('dashboard-screen').style.display = 'none';
    document.getElementById('groups-screen').style.display = 'none';
    document.getElementById('payouts-screen').style.display = 'none';
    document.getElementById('join-group-screen').style.display = 'none'; 
    document.getElementById('referral-screen').style.display = 'none'; 
    
    document.getElementById('nav-home').classList.remove('active');
    document.getElementById('nav-groups').classList.remove('active');
    document.getElementById('nav-payouts').classList.remove('active');

    if(tabName === 'home') {
        document.getElementById('dashboard-screen').style.display = 'flex';
        document.getElementById('nav-home').classList.add('active');
        loadDashboard();
    } else if(tabName === 'groups') {
        document.getElementById('groups-screen').style.display = 'flex';
        document.getElementById('nav-groups').classList.add('active');
        fetchGroups(); 
    } else if(tabName === 'payouts') {
        document.getElementById('payouts-screen').style.display = 'flex';
        document.getElementById('nav-payouts').classList.add('active');
    }
}

function openJoinScreen() {
    document.getElementById('groups-screen').style.display = 'none';
    document.getElementById('join-group-screen').style.display = 'flex';
}

function closeJoinScreen() {
    document.getElementById('join-group-screen').style.display = 'none';
    document.getElementById('groups-screen').style.display = 'flex';
}

function syncInputs(type, source) {
    let slider = document.getElementById(type + '-slider');
    let box = document.getElementById(type + '-box');
    
    if(source === 'slider') {
        box.value = slider.value;
    } else {
        let max = parseInt(slider.max);
        let min = parseInt(slider.min);
        let val = parseInt(box.value);
        if (val > max) { box.value = max; val = max; }
        if (!isNaN(val) && val >= min && val <= max) { slider.value = val; }
    }
}

function checkLimits(type) {
    let slider = document.getElementById(type + '-slider');
    let box = document.getElementById(type + '-box');
    let min = parseInt(slider.min);
    let val = parseInt(box.value);
    if (isNaN(val) || val < min) { box.value = min; slider.value = min; }
}

// ==========================================
// Groups Fetching & Filtering Logic
// ==========================================
let globalGroupsList = []; 

async function fetchGroups() {
    try {
        const response = await fetch(`${SERVER_URL}/api/groups`);
        const data = await response.json();

        if (data.success) {
            globalGroupsList = data.groups; 
            const activeTab = document.querySelector('.filter-tabs .tab.active');
            const defaultFilter = activeTab ? activeTab.innerText : 'Weekly';
            filterGroups(defaultFilter, activeTab);
        }
    } catch (error) {
        console.error("Groups fetch error:", error);
        document.querySelector('.group-list').innerHTML = '<p style="text-align: center; color: red;">Failed to load pools from server.</p>';
    }
}

function filterGroups(cycleName, tabElement) {
    if (tabElement) {
        document.querySelectorAll('.filter-tabs .tab').forEach(tab => tab.classList.remove('active'));
        tabElement.classList.add('active');
    }

    const groupListContainer = document.querySelector('.group-list');
    groupListContainer.innerHTML = ''; 

    let filteredGroups = [];
    if (cycleName === 'All') {
        filteredGroups = globalGroupsList; 
    } else {
        filteredGroups = globalGroupsList.filter(group => group.cycle === cycleName);
    }

    if (filteredGroups.length === 0) {
        groupListContainer.innerHTML = `<p style="text-align: center; padding: 20px; color: #666;">No active ${cycleName} pools found.</p>`;
        return;
    }

    filteredGroups.forEach(group => {
        groupListContainer.innerHTML += `
            <div class="group-card">
                <div class="group-header">
                    <strong>${group.name || 'Sarmaya Pool'}</strong>
                    <span class="badge">${group.cycle || 'Weekly'}</span>
                </div>
                <p style="font-size: 14px; color: #555;">Pool Amount: $${group.pool_amount || group.amount || 0}</p>
                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">Members: ${group.max_members || 20}</p>
                <button class="primary-btn" onclick="joinPool(${group.id})" style="padding: 8px;">Join Pool</button>
            </div>
        `;
    });
}

async function joinPool(poolId) {
    const userId = localStorage.getItem('sarmaya_user_id');
    const token = localStorage.getItem('sarmaya_token'); 
    if (!userId || !token) { alert("Please login again."); return; }
    try {
        const response = await fetch(`${SERVER_URL}/api/join-pool`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ user_id: parseInt(userId), pool_id: parseInt(poolId) })
        });
        const data = await response.json();

        if (data.success) {
            alert("🎉 " + data.message);
            loadDashboard();
        } else {
            alert("⚠️ " + data.error);
        }
    } catch (error) {
        alert("Backend connection failed!");
    }
}

async function createCustomPool() {
    const amount = document.getElementById('amount-box').value;
    const members = document.getElementById('member-box').value;
    const cycle = document.querySelector('.cycle-select').value;
    try {
        const response = await fetch(`${SERVER_URL}/api/create-pool`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: parseInt(amount), members: parseInt(members), cycle: cycle })
        });
        const data = await response.json();
        if (data.success) {
            alert("🎉 " + data.message);
            closeJoinScreen(); 
            fetchGroups(); 
        } else {
            alert("⚠️ " + data.error);
        }
    } catch (error) {
        alert("Backend connection failed!");
    }
}

// ==========================================
// Wallet Deposit Logic (Add Funds)
// ==========================================
async function addFunds() {
    const amount = prompt("Enter amount to add to your wallet:");
    
    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    const token = localStorage.getItem('sarmaya_token');
    if (!token) {
        alert("Please login first.");
        return;
    }

    try {
        const response = await fetch(`${SERVER_URL}/api/add-funds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount: parseFloat(amount) })
        });

        const data = await response.json();
        if (data.success) {
            alert(`🎉 Success! New Balance: $${data.new_balance}`);
            localStorage.setItem('sarmaya_balance', data.new_balance);
            loadDashboard(); 
        } else {
            alert("⚠️ Error: " + data.error);
        }
    } catch (error) {
        console.error("Error adding funds:", error);
        alert("⚠️ Backend connection failed!");
    }
}

// ==========================================
// Transaction History Logic
// ==========================================

function openHistoryModal() {
    closeProfile(); // Profile menu band karein
    document.getElementById('history-modal').style.display = 'block';
    fetchTransactionHistory(); // API call karein
}

function closeHistoryModal() {
    document.getElementById('history-modal').style.display = 'none';
}

async function fetchTransactionHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<p style="text-align: center; color: #666; font-size: 14px;">Loading transactions...</p>';

    // FIX: Changed from 'token' to 'sarmaya_token'
    const token = localStorage.getItem('sarmaya_token');
    if (!token) {
        historyList.innerHTML = '<p style="text-align: center; color: red; font-size: 14px;">Authentication error.</p>';
        return;
    }

    try {
        // FIX: Changed from API_BASE_URL to SERVER_URL
        const response = await fetch(`${SERVER_URL}/api/transactions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (data.success) {
            if (data.transactions.length === 0) {
                historyList.innerHTML = '<p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">No transactions found.</p>';
                return;
            }

            let html = '';
            data.transactions.forEach(tx => {
                // Date ko format karein
                const date = new Date(tx.created_at).toLocaleDateString('en-GB'); 
                
                // Deposit/Commission ke liye Green, Withdrawal ke liye Red
                const isPositive = (tx.transaction_type === 'Deposit' || tx.transaction_type === 'Commission');
                const color = isPositive ? '#28a745' : '#dc3545';
                const sign = isPositive ? '+' : '-';
                
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee;">
                        <div>
                            <strong style="color: #333; font-size: 14px;">${tx.transaction_type}</strong>
                            <p style="color: #777; font-size: 12px; margin: 3px 0 0 0;">${date} • ${tx.description || ''}</p>
                        </div>
                        <div style="color: ${color}; font-weight: bold; font-size: 15px;">
                            ${sign}$${parseFloat(tx.amount).toFixed(2)}
                        </div>
                    </div>
                `;
            });
            historyList.innerHTML = html;
        } else {
            historyList.innerHTML = '<p style="text-align: center; color: red; font-size: 14px;">Failed to load history.</p>';
        }
    } catch (error) {
        console.error("Error fetching history:", error);
        historyList.innerHTML = '<p style="text-align: center; color: red; font-size: 14px;">Server connection error.</p>';
    }
}

// ==========================================
// Dashboard Load (UPDATED for Referral Earnings)
// ==========================================
async function loadDashboard() {
    const userId = localStorage.getItem('sarmaya_user_id');
    let balance = localStorage.getItem('sarmaya_balance') || 0;
    
    document.querySelectorAll('.wallet-amount').forEach(el => el.innerText = `$${balance}`);
    
    if (!userId) return;

    try {
        const response = await fetch(`${SERVER_URL}/api/dashboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: parseInt(userId) })
        });
        const data = await response.json();
        
        if (data.success) {
            document.querySelector('.stat-box p').innerText = `${data.active_groups} Active`;
            localStorage.setItem('sarmaya_balance', data.wallet_balance);
            document.querySelectorAll('.wallet-amount').forEach(el => el.innerText = `$${data.wallet_balance}`);
            
            // NAYA: Dashboard me referral earnings show karna
            const refEarningsDisplay = document.getElementById('dashboard-referral-earnings');
            if (refEarningsDisplay) {
                // Is se amount hamesha decimal me sahi format hoga (e.g., $10.50)
                refEarningsDisplay.innerText = `$${parseFloat(data.referral_earnings || 0).toFixed(2)}`;
            }
            
            fetchMyPools(); 
        }
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

// ==========================================
// Fetch User's Joined Pools 
// ==========================================
async function fetchMyPools() {
    const token = localStorage.getItem('sarmaya_token');
    if (!token) return;

    try {
        const response = await fetch(`${SERVER_URL}/api/my-pools`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });
        const data = await response.json();

        if (data.success) {
            const listContainer = document.getElementById('my-pools-list');
            
            if (data.my_pools.length === 0) {
                listContainer.innerHTML = '<p style="text-align: center; font-size: 14px; color: #666; padding: 10px;">You haven\'t joined any pools yet.</p>';
                return;
            }

            listContainer.innerHTML = ''; 
            
            data.my_pools.forEach(pool => {
                listContainer.innerHTML += `
                    <div class="activity-item" style="border-left: 4px solid #FFD700; background: #fff; margin-bottom: 10px; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #0A192F; font-size: 16px;">${pool.name || 'Custom Pool'}</strong>
                                <p class="date" style="margin-top: 5px;">Cycle: ${pool.cycle || 'Weekly'} | Max Members: ${pool.max_members || 10}</p>
                            </div>
                            <div class="activity-amount positive" style="font-size: 18px; font-weight: bold; color: #28a745;">$${pool.pool_amount || pool.amount}</div>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error("Error fetching my pools:", error);
        document.getElementById('my-pools-list').innerHTML = '<p style="color: red; text-align: center;">Failed to load your pools.</p>';
    }
}

// ==========================================
// Profile & Referral Fetch Logic (UPDATED)
// ==========================================
async function openProfile() {
    document.getElementById('profile-menu').style.display = 'block';

    const token = localStorage.getItem('sarmaya_token');
    if(token) {
        try {
            const response = await fetch(`${SERVER_URL}/api/profile`, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });
            const data = await response.json();
            if(data.success) {
                const userData = data.user_data;
                
                // UI Update logic (HTML IDs match karne chahiye)
                const profileName = document.getElementById('profile-name');
                if (profileName) profileName.innerText = userData.name;
                
                const profileEmail = document.getElementById('profile-email');
                if (profileEmail) profileEmail.innerText = userData.email;
                
                const profileMobile = document.getElementById('profile-mobile');
                if (profileMobile) profileMobile.innerText = "+91 " + userData.mobile_number;
                
                // NAYA: Unique ID Generate Karke Show Karein (e.g., SS-1001)
                const uniqueId = "SS-" + (1000 + parseInt(userData.id)); 
                const profileUid = document.getElementById('profile-uid');
                if (profileUid) profileUid.innerText = "User ID: " + uniqueId;
            }
        } catch(error) {
            console.error("Failed to fetch secure profile data");
        }
    }
}

function closeProfile() {
    document.getElementById('profile-menu').style.display = 'none';
}

// Fetch and Load Referral Data
async function loadReferralData() {
    const token = localStorage.getItem('sarmaya_token');
    if (!token) return;

    try {
        const response = await fetch(`${SERVER_URL}/api/referrals`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            const walletAmountEl = document.querySelector('#referral-screen .wallet-amount');
            if(walletAmountEl) walletAmountEl.innerText = `$${data.commission_earned}`;
            
            const activityAmountEl = document.querySelector('#referral-screen .activity-amount');
            if(activityAmountEl) activityAmountEl.innerText = `${data.team_size} Members`;
            
            const inviteLink = `${window.location.origin}?ref=${data.referral_code}`;
            const linkInput = document.getElementById('invite-link');
            if(linkInput) linkInput.value = inviteLink;
        }
    } catch (error) {
        console.error("Referral fetch error:", error);
    }
}

function openReferralScreen() {
    closeProfile();
    
    document.getElementById('dashboard-screen').style.display = 'none';
    document.getElementById('groups-screen').style.display = 'none';
    document.getElementById('payouts-screen').style.display = 'none';
    document.getElementById('join-group-screen').style.display = 'none';
    
    document.getElementById('referral-screen').style.display = 'flex';
    
    loadReferralData(); 
}

function closeReferralScreen() {
    document.getElementById('referral-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'flex';
}

function copyLink() {
    const linkInput = document.getElementById('invite-link');
    if(linkInput) {
        linkInput.select();
        document.execCommand('copy');
        alert("Invitation Link Copied!");
    }
}

function logoutUser() {
    localStorage.removeItem('sarmaya_token'); 
    localStorage.removeItem('sarmaya_user_id');
    localStorage.removeItem('sarmaya_name');
    localStorage.removeItem('sarmaya_mobile');
    localStorage.removeItem('sarmaya_balance');
    localStorage.removeItem('temp_email');
    
    alert("Logged out successfully.");
    window.location.reload(); 
}

// Har screen ke profile icon par click event jodne ke liye
document.querySelectorAll('.profile-icon').forEach(icon => {
    icon.addEventListener('click', openProfile);
});

// ==========================================
// Withdrawal Logic
// ==========================================

function openWithdrawalModal() {
    closeProfile(); // Profile menu band karein
    document.getElementById('withdrawal-modal').style.display = 'block';
    document.getElementById('withdraw-message').innerText = ''; // Purana message clear karein
    document.getElementById('withdrawalForm').reset(); // Form clear karein
}

function closeWithdrawalModal() {
    document.getElementById('withdrawal-modal').style.display = 'none';
}

async function submitWithdrawal(event) {
    event.preventDefault(); // Page refresh hone se rokein
    
    const messageBox = document.getElementById('withdraw-message');
    
    // NAYA: Button click hote hi turant UI update hoga
    messageBox.style.color = '#007bff';
    messageBox.style.display = 'block';
    messageBox.innerText = '⏳ Processing request... Please wait.';
    
    try {
        const amount = parseFloat(document.getElementById('withdraw-amount').value);
        const method = document.getElementById('withdraw-method').value;
        const details = document.getElementById('withdraw-details').value;
        
        // FIX: Changed from 'token' to 'sarmaya_token'
        const token = localStorage.getItem('sarmaya_token');
        if (!token) {
            messageBox.style.color = '#dc3545';
            messageBox.innerText = 'Authentication error. Please login again.';
            return;
        }

        // FIX: Changed from API_BASE_URL to SERVER_URL
        const response = await fetch(`${SERVER_URL}/api/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                amount: amount,
                payment_method: method,
                payment_details: details
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            messageBox.style.color = '#28a745'; // Green color for success
            messageBox.innerText = '✅ ' + data.message;
            
            // 2 second baad modal close karein aur balance update karein
            setTimeout(() => {
                closeWithdrawalModal();
                loadDashboard(); 
            }, 2000);
        } else {
            messageBox.style.color = '#dc3545'; // Red color for error
            messageBox.innerText = '❌ ' + (data.error || "Request failed.");
        }
    } catch (error) {
        console.error("Withdrawal error:", error);
        messageBox.style.color = '#dc3545';
        messageBox.innerText = '❌ Server connection error. Please try again.';
    }
}
