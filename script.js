// ==========================================
// 1. API Server URL Setup
// ==========================================
// Yahan humne aapka live Render backend URL set kar diya hai
const SERVER_URL = 'https://sarmaya-saathi-api.onrender.com';

// ==========================================
// 2. Splash Screen Timer
// ==========================================
setTimeout(() => {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
}, 3000); 

// ==========================================
// Screen Switcher (Toggle Log In / Sign Up)
// ==========================================
function toggleScreens(screenName) {
    const signupScreen = document.getElementById('signup-section');
    const loginScreen = document.getElementById('login-section');

    if (screenName === 'login') {
        signupScreen.style.display = 'none';
        loginScreen.style.display = 'block';
    } else if (screenName === 'signup') {
        loginScreen.style.display = 'none';
        signupScreen.style.display = 'block';
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
    messageBox.innerText = "Processing...";

    try {
        const response = await fetch(`${SERVER_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, mobile_number: mobile, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            messageBox.style.color = "#28a745";
            messageBox.innerText = `🎉 ${data.message}`; 
            document.getElementById('signupForm').reset();
            setTimeout(() => toggleScreens('login'), 2000);
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
// User Login Function
// ==========================================
async function loginUser(event) {
    event.preventDefault(); 

    const mobile = document.getElementById('login-mobile').value;
    const password = document.getElementById('login-password').value;

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

            alert("Login Successful! Welcome to Sarmaya Saathi.");

            document.getElementById('login-mobile').value = '';
            document.getElementById('login-password').value = '';

            document.getElementById('auth-screen').style.display = 'none'; 
            document.getElementById('dashboard-screen').style.display = 'flex'; 
            document.getElementById('bottom-nav').style.display = 'flex'; 

            const userNameDisplay = document.getElementById('user-name-display');
            if(userNameDisplay) userNameDisplay.innerText = data.user.name;
            
            const walletBalance = document.getElementById('wallet-balance');
            if(walletBalance) walletBalance.innerText = data.user.wallet_balance;
            
        } else {
            alert("Error: " + data.error);
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("Failed to connect to the server. Check if your backend is running.");
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

async function fetchGroups() {
    try {
        const response = await fetch(`${SERVER_URL}/api/groups`);
        const data = await response.json();

        if (data.success) {
            const groupList = document.querySelector('.group-list');
            groupList.innerHTML = ''; 
            if(data.groups.length === 0) {
                groupList.innerHTML = '<p style="text-align: center; color: #666;">No active pools found.</p>';
                return;
            }
            data.groups.forEach(group => {
                groupList.innerHTML += `
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
    } catch (error) {
        console.error("Groups fetch error:", error);
    }
}

async function joinPool(poolId) {
    const userId = localStorage.getItem('sarmaya_user_id');
    if (!userId) { alert("Please login again."); return; }
    try {
        const response = await fetch(`${SERVER_URL}/api/join-pool`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: parseInt(userId), pool_id: parseInt(poolId) })
        });
        const data = await response.json();
        alert(data.success ? "🎉 " + data.message : "⚠️ " + data.error);
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

async function loadDashboard() {
    const userId = localStorage.getItem('sarmaya_user_id');
    const balance = localStorage.getItem('sarmaya_balance') || 0;
    
    const walletElement = document.querySelector('.wallet-amount');
    if (walletElement) walletElement.innerText = `$${balance}`;
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
        }
    } catch (error) {
        console.error("Dashboard fetch error:", error);
    }
}
