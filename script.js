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
// User Signup Logic
// ==========================================
async function registerUser(event) {
    event.preventDefault(); 

    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const mobile = document.getElementById('reg-mobile').value;
    const password = document.getElementById('reg-password').value;
    const messageBox = document.getElementById('signup-message');

    messageBox.style.color = "#FFD700";
    messageBox.innerText = "Processing & sending OTP...";

    try {
        const response = await fetch(`${SERVER_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, mobile_number: mobile, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Email ko localStorage me save karein taaki OTP verification me use ho sake
            localStorage.setItem('temp_email', email);
            messageBox.innerText = "";
            document.getElementById('signupForm').reset();
            
            // OTP Screen dikhayein
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
// OTP Verification Logic (NEW)
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
            localStorage.removeItem('temp_email'); // Safai
            document.getElementById('otpForm').reset();
            setTimeout(() => toggleScreens('login'), 2000); // 2 second baad login par bhejein
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
            // Token aur User Data Save karein
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
const token = localStorage.getItem('sarmaya_token'); // Token get kiya
    if (!userId || !token) { alert("Please login again."); return; }
    try {
        const response = await fetch(`${SERVER_URL}/api/join-pool`, {
            method: 'POST',
            headers: {
'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Token header mein add kiya
            },
            body: JSON.stringify({ user_id: parseInt(userId), pool_id: parseInt(poolId) })
        });
        const data = await response.json();

if (data.success) {
            alert("🎉 " + data.message);
            // NAYA FIX 2: Join hone ke turant baad dashboard data (aur balance) refresh karein
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
// Wallet Deposit Logic (NEW: Add Funds)
// ==========================================
async function addFunds() {
    const amount = prompt("Enter amount to add to your wallet:");
    
    // Check if user cancelled or entered invalid text
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
            // Naya balance localStorage me save karke UI update karein
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
// Dashboard Logic
// ==========================================
async function loadDashboard() {
    const userId = localStorage.getItem('sarmaya_user_id');
    
    // UI ko turant purane balance se update karein
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
            // NAYA FIX 3: Server se live API data aane par UI aur LocalStorage update karein
            document.querySelector('.stat-box p').innerText = `${data.active_groups} Active`;
            
            localStorage.setItem('sarmaya_balance', data.wallet_balance);
            document.querySelectorAll('.wallet-amount').forEach(el => el.innerText = `$${data.wallet_balance}`);
        }
    } catch (error) {
        console.error("Dashboard fetch error:", error);
    }
}

// ==========================================
// Profile (Secure Route Fetch) & Referral Logic
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
                console.log("Secure Profile Loaded:", data.user_data);
            }
        } catch(error) {
            console.error("Failed to fetch secure profile data");
        }
    }
}

function closeProfile() {
    document.getElementById('profile-menu').style.display = 'none';
}

function openReferralScreen() {
    closeProfile();
    document.getElementById('dashboard-screen').style.display = 'none';
    document.getElementById('referral-screen').style.display = 'flex';
}

function closeReferralScreen() {
    document.getElementById('referral-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'flex';
}

function copyLink() {
    const linkInput = document.getElementById('invite-link');
    linkInput.select();
    document.execCommand('copy');
    alert("Invitation Link Copied!");
}

function logoutUser() {
    localStorage.clear(); 
    alert("Logged out successfully.");
    window.location.reload(); 
}

// Har screen ke profile icon par click event jodne ke liye
document.querySelectorAll('.profile-icon').forEach(icon => {
    icon.addEventListener('click', openProfile);
});
