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
// 3. URL Referral Capture (Auto-fill)
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
// Screen Switcher
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
// User Signup Logic
// ==========================================
async function registerUser(event) {
    event.preventDefault(); 

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const mobile = document.getElementById('reg-mobile').value;
    const password = document.getElementById('reg-password').value;
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
            
            loadDashboard(); 
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
// App Navigation
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
        fetchPoolStatus(); // Load pool status when tab is opened
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
// Wallet Deposit Logic
// ==========================================
function openDepositModal() {
    document.getElementById('depositModal').style.display = 'block';
}

function closeDepositModal() {
    document.getElementById('depositModal').style.display = 'none';
    document.getElementById('depositAmount').value = '';
    document.getElementById('depositUtr').value = '';
}

async function submitDeposit() {
    const amount = document.getElementById('depositAmount').value;
    const utr = document.getElementById('depositUtr').value;
    const token = localStorage.getItem('sarmaya_token'); 

    if (!amount || amount <= 0 || !utr) {
        alert("⚠️ Please enter a valid amount and UTR number.");
        return;
    }

    if (!token) {
        alert("⚠️ You must be logged in to add money.");
        return;
    }

    try {
        const response = await fetch(`${SERVER_URL}/api/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                amount: parseFloat(amount),
                utr_number: utr,
                payment_method: 'UPI'
            })
        });

        const data = await response.json();

        if (data.success) {
            alert("✅ " + data.message);
            closeDepositModal();
        } else {
            alert("⚠️ Error: " + data.error);
        }
    } catch (error) {
        console.error("Deposit error:", error);
        alert("⚠️ Server error. Please try again later.");
    }
}

// ==========================================
// Transaction History
// ==========================================
function openHistoryModal() {
    closeProfile();
    document.getElementById('history-modal').style.display = 'block';
    fetchTransactionHistory(); 
}

function closeHistoryModal() {
    document.getElementById('history-modal').style.display = 'none';
}

async function fetchTransactionHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<p style="text-align: center; color: #666; font-size: 14px;">Loading transactions...</p>';

    const token = localStorage.getItem('sarmaya_token');
    if (!token) {
        historyList.innerHTML = '<p style="text-align: center; color: red; font-size: 14px;">Authentication error.</p>';
        return;
    }

    try {
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
                const date = new Date(tx.created_at).toLocaleDateString('en-GB'); 
                
                const isPositive = (tx.transaction_type === 'Deposit' || tx.transaction_type === 'Commission' || tx.transaction_type === 'Refund');
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
// Dashboard Logic
// ==========================================
async function loadDashboard() {
    const userId = localStorage.getItem('sarmaya_user_id');
    const token = localStorage.getItem('sarmaya_token'); 
    let balance = localStorage.getItem('sarmaya_balance') || 0;
    
    document.querySelectorAll('.wallet-amount').forEach(el => el.innerText = `$${parseFloat(balance).toFixed(2)}`);
    
    if (!userId || !token) return;

    try {
        const response = await fetch(`${SERVER_URL}/api/dashboard`, {
            method: 'GET', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.success) {
            document.querySelector('.stat-box p').innerText = `${data.active_groups} Active`;
            localStorage.setItem('sarmaya_balance', data.wallet_balance);
            document.querySelectorAll('.wallet-amount').forEach(el => el.innerText = `$${parseFloat(data.wallet_balance).toFixed(2)}`);
            
            const refEarningsDisplay = document.getElementById('dashboard-referral-earnings');
            if (refEarningsDisplay) {
                refEarningsDisplay.innerText = `$${parseFloat(data.referral_earnings || 0).toFixed(2)}`;
            }
            
            fetchMyPools(); 
        }
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

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
// Profile & Referral Fetch
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
                
                const profileName = document.getElementById('profile-name');
                if (profileName) profileName.innerText = userData.name;
                
                const profileEmail = document.getElementById('profile-email');
                if (profileEmail) {
                    // Store real email for unmasking
                    profileEmail.dataset.full = userData.email;
                    // Masking logic
                    const eParts = userData.email.split('@');
                    profileEmail.dataset.masked = eParts[0].substring(0, 2) + "****@" + eParts[1];
                    profileEmail.innerText = profileEmail.dataset.masked;
                }
                
                const profileMobile = document.getElementById('profile-mobile');
                if (profileMobile) {
                    // Store real mobile for unmasking
                    profileMobile.dataset.full = "+91 " + userData.mobile_number;
                    // Masking logic
                    const maskedMob = userData.mobile_number.substring(0, 2) + "******" + userData.mobile_number.substring(8);
                    profileMobile.dataset.masked = "+91 " + maskedMob;
                    profileMobile.innerText = profileMobile.dataset.masked;
                }
                
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

            // NAYA: Dynamically Set Social Links
            const shareMessage = encodeURIComponent(`Join Sarmaya Saathi and start saving! Use my code: ${data.referral_code}`);
            const appLink = encodeURIComponent(window.location.origin);
            
            if(document.getElementById('share-whatsapp')) {
                document.getElementById('share-whatsapp').href = `https://wa.me/?text=${shareMessage}%20${appLink}`;
            }
            if(document.getElementById('share-facebook')) {
                document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${appLink}`;
            }
            if(document.getElementById('share-twitter')) {
                document.getElementById('share-twitter').href = `https://twitter.com/intent/tweet?text=${shareMessage}&url=${appLink}`;
            }
            if(document.getElementById('share-instagram')) {
                document.getElementById('share-instagram').href = `https://www.instagram.com/`;
            }
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

document.querySelectorAll('.profile-icon').forEach(icon => {
    icon.addEventListener('click', openProfile);
});

// ==========================================
// Withdrawal Logic
// ==========================================
function openWithdrawalModal() {
    closeProfile(); 
    document.getElementById('withdrawal-modal').style.display = 'block';
    document.getElementById('withdraw-message').innerText = ''; 
    document.getElementById('withdrawalForm').reset(); 
}

function closeWithdrawalModal() {
    document.getElementById('withdrawal-modal').style.display = 'none';
}

async function submitWithdrawal(event) {
    event.preventDefault(); 
    
    const messageBox = document.getElementById('withdraw-message');
    
    messageBox.style.color = '#007bff';
    messageBox.style.display = 'block';
    messageBox.innerText = '⏳ Processing request... Please wait.';
    
    try {
        const amount = parseFloat(document.getElementById('withdraw-amount').value);
        const method = document.getElementById('withdraw-method').value;
        const details = document.getElementById('withdraw-details').value;
        
        const token = localStorage.getItem('sarmaya_token');
        if (!token) {
            messageBox.style.color = '#dc3545';
            messageBox.innerText = 'Authentication error. Please login again.';
            return;
        }

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
            messageBox.style.color = '#28a745'; 
            messageBox.innerText = '✅ ' + data.message;
            
            setTimeout(() => {
                closeWithdrawalModal();
                loadDashboard(); 
            }, 2000);
        } else {
            messageBox.style.color = '#dc3545'; 
            messageBox.innerText = '❌ ' + (data.error || "Request failed.");
        }
    } catch (error) {
        console.error("Withdrawal error:", error);
        messageBox.style.color = '#dc3545';
        messageBox.innerText = '❌ Server connection error. Please try again.';
    }
}

// ==========================================
// Bidding & Pool Status Engine (NEWLY ADDED)
// ==========================================

const CURRENT_POOL_ID = 1; 

async function submitMyBid() {
    const amount = document.getElementById('bidAmount').value;
    const messageBox = document.getElementById('bidMessage');
    const token = localStorage.getItem('sarmaya_token'); 
    const userId = localStorage.getItem('sarmaya_user_id');

    if (!amount || amount <= 0) {
        messageBox.style.color = "red";
        messageBox.innerText = "Please enter a valid amount.";
        return;
    }

    if (!token) {
        messageBox.style.color = "red";
        messageBox.innerText = "Please login first.";
        return;
    }

    try {
        const response = await fetch(`${SERVER_URL}/api/bidding/submit`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                pool_id: CURRENT_POOL_ID,
                user_id: userId,
                bid_amount: amount
            })
        });

        const data = await response.json();
        
        if (data.success) {
            messageBox.style.color = "green";
            messageBox.innerText = data.message;
            fetchPoolStatus(); 
        } else {
            messageBox.style.color = "red";
            messageBox.innerText = data.error || "Failed to submit bid.";
        }
    } catch (error) {
        messageBox.style.color = "red";
        messageBox.innerText = "Server error. Try again later.";
    }
}

async function fetchPoolStatus() {
    const token = localStorage.getItem('sarmaya_token'); 
    
    if (!token) return;

    try {
        const response = await fetch(`${SERVER_URL}/api/pool/status/${CURRENT_POOL_ID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById('poolStatus').innerText = data.pool.status;
            document.getElementById('poolMembers').innerText = data.pool.current_members;
            document.getElementById('maxMembers').innerText = data.pool.max_members;
            document.getElementById('totalBids').innerText = data.total_bids_placed;
        }
    } catch (error) {
        console.error("Error fetching status:", error);
        document.getElementById('poolStatus').innerText = "Connection Error";
    }
}

// ==========================================
// 🛡️ NAYA: Privacy Toggle & Change Password
// ==========================================

function togglePrivacy(elementId, iconElement) {
    const el = document.getElementById(elementId);
    if (el.innerText.includes('*')) {
        el.innerText = el.dataset.full; // Show
        iconElement.classList.remove('fa-eye-slash');
        iconElement.classList.add('fa-eye');
    } else {
        el.innerText = el.dataset.masked; // Hide
        iconElement.classList.remove('fa-eye');
        iconElement.classList.add('fa-eye-slash');
    }
}

function openChangePasswordModal() {
    closeProfile();
    document.getElementById('change-password-modal').style.display = 'block';
}

function closeChangePasswordModal() {
    document.getElementById('change-password-modal').style.display = 'none';
}

async function submitChangePassword(event) {
    event.preventDefault();
    const oldPwd = document.getElementById('old-pwd').value;
    const newPwd = document.getElementById('new-pwd').value;
    const confirmPwd = document.getElementById('confirm-new-pwd').value;
    const msgBox = document.getElementById('change-pwd-msg');

    if (newPwd !== confirmPwd) {
        msgBox.style.color = 'red';
        msgBox.innerText = "New Password aur Confirm Password match nahi ho rahe.";
        return;
    }
    
    const token = localStorage.getItem('sarmaya_token');
    
    msgBox.style.color = '#007bff';
    msgBox.innerText = 'Updating password...';

    try {
        const response = await fetch(`${SERVER_URL}/api/change-password`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd })
        });
        
        const data = await response.json();
        
        if(data.success) {
            msgBox.style.color = 'green';
            msgBox.innerText = "✅ Password successfully update ho gaya!";
            setTimeout(() => { 
                closeChangePasswordModal(); 
                document.getElementById('changePasswordForm').reset(); 
                msgBox.innerText = ''; 
            }, 2000);
        } else { 
            msgBox.style.color = 'red'; 
            msgBox.innerText = "❌ " + data.error; 
        }
    } catch (error) { 
        msgBox.style.color = 'red'; 
        msgBox.innerText = "❌ Server error. Try again."; 
    }
}
