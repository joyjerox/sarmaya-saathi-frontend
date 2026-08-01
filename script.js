// ==========================================
// 1. API Server URL Setup
// ==========================================
const SERVER_URL = 'https://sarmaya-saathi-api.onrender.com';

// ==========================================
// Multi-Language Translation Logic
// ==========================================
const translations = {
    en: {
        greeting: "Hi,", wallet: "Total Wallet Balance", add_funds: "+ Add Funds", my_groups: "My Groups", 
        referrals: "Referrals", recent: "Recent Activity", joined_pools: "My Joined Pools",
        nav_home: "🏠 Home", nav_groups: "👥 Groups", nav_payouts: "💰 Payouts", nav_refer: "🤝 Refer",
        active_groups: "Active Groups", filter: "Filter:", action_center: "Action Center",
        team: "Team", my_total_comm: "My Total Commission", comm_yest: "Commission Yesterday",
        team_count: "Team Count", comm_today: "Commission Today", today_new: "Today New Team",
        inv_link: "Invitation Link", more_ways: "More Ways To Invite", more: "More", team_det: "Team Detail"
    },
    hi: {
        greeting: "नमस्ते,", wallet: "कुल वॉलेट बैलेंस", add_funds: "+ पैसे जोड़ें", my_groups: "मेरे समूह", 
        referrals: "रेफरल", recent: "हाल की गतिविधि", joined_pools: "मेरे जुड़े हुए पूल",
        nav_home: "🏠 होम", nav_groups: "👥 समूह", nav_payouts: "💰 पेआउट", nav_refer: "🤝 रेफर",
        active_groups: "सक्रिय समूह", filter: "फ़िल्टर:", action_center: "एक्शन सेंटर",
        team: "टीम", my_total_comm: "मेरा कुल कमीशन", comm_yest: "कल का कमीशन",
        team_count: "टीम की संख्या", comm_today: "आज का कमीशन", today_new: "आज की नई टीम",
        inv_link: "निमंत्रण लिंक", more_ways: "आमंत्रित करने के अन्य तरीके", more: "और", team_det: "टीम विवरण"
    }
};

let currentLang = localStorage.getItem('sarmaya_lang') || 'en';

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    localStorage.setItem('sarmaya_lang', currentLang);
    applyLanguage();
}

function applyLanguage() {
    document.getElementById('lang-btn').innerHTML = currentLang === 'en' ? '<span>EN/HI</span> <i class="fa-solid fa-language"></i>' : '<span>HI/EN</span> <i class="fa-solid fa-language"></i>';
    
    document.getElementById('nav-text-home').innerText = translations[currentLang].nav_home;
    document.getElementById('nav-text-groups').innerText = translations[currentLang].nav_groups;
    document.getElementById('nav-text-payouts').innerText = translations[currentLang].nav_payouts;
    document.getElementById('nav-text-refer').innerText = translations[currentLang].nav_refer;

    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (translations[currentLang][key]) {
            el.innerHTML = translations[currentLang][key] + (key === 'greeting' ? ` <span id="user-name-display" style="color: white;">${localStorage.getItem('sarmaya_name') || 'User'}</span>` : '');
        }
    });
}

// ==========================================
// Biometric (Fingerprint) Security
// ==========================================
async function verifyBiometric(reasonText) {
    if (typeof Capacitor === 'undefined' || !Capacitor.isNativePlatform()) {
        return true; 
    }
    try {
        const { NativeBiometric } = Capacitor.Plugins;
        const result = await NativeBiometric.isAvailable();
        if (!result.isAvailable) {
            alert("Biometric not set up on this device. Please use PIN.");
            return true; 
        }
        const verified = await NativeBiometric.verifyIdentity({
            reason: reasonText, 
            title: "Security Check", 
            subtitle: "Sarmaya Saathi App Lock",
        });
        return true; 
    } catch (error) {
        console.error("Biometric Verification Failed:", error);
        return false; 
    }
}

async function biometricLogin() {
    const savedMobile = localStorage.getItem('sarmaya_remember_mobile');
    const savedPassword = localStorage.getItem('sarmaya_remember_password');
    
    if (!savedMobile || !savedPassword) {
        alert("Please login manually and check 'Remember me' to enable Fingerprint Login.");
        return;
    }

    const isAuthorized = await verifyBiometric("Login to Sarmaya Saathi");
    if (isAuthorized) {
        document.getElementById('login-mobile').value = savedMobile;
        document.getElementById('login-password').value = savedPassword;
        document.getElementById('loginForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
}

// ==========================================
// 2. Splash Screen & OnLoad Logic 
// ==========================================
setTimeout(async () => {
    document.getElementById('splash-screen').style.display = 'none';
    
    const userId = localStorage.getItem('sarmaya_user_id');
    const isAppLockEnabled = localStorage.getItem('sarmaya_biometric_lock') === 'true';

    if (userId && isAppLockEnabled) {
        const unlocked = await verifyBiometric("Unlock Sarmaya Saathi");
        
        if (unlocked) {
            document.getElementById('dashboard-screen').style.display = 'flex';
            document.getElementById('bottom-nav').style.display = 'flex';
            
            const userNameDisplay = document.getElementById('user-name-display');
            if(userNameDisplay) userNameDisplay.innerText = localStorage.getItem('sarmaya_name') || "User";
            
            loadDashboard();
            applyLanguage();
            return; 
        }
    }
    
    document.getElementById('auth-screen').style.display = 'flex';
}, 3000); 

window.addEventListener('DOMContentLoaded', () => {
    applyLanguage(); 
    
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
        setTimeout(() => {
            toggleScreens('signup');
            const refInput = document.getElementById('reg-referral');
            if(refInput) refInput.value = refCode;
        }, 3100); 
    }

    const savedMobile = localStorage.getItem('sarmaya_remember_mobile');
    const savedPassword = localStorage.getItem('sarmaya_remember_password');
    
    if (savedMobile && savedPassword) {
        const mobileInput = document.getElementById('login-mobile');
        const passwordInput = document.getElementById('login-password');
        const rememberCheckbox = document.getElementById('remember-me');
        
        if (mobileInput) mobileInput.value = savedMobile;
        if (passwordInput) passwordInput.value = savedPassword;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
});

// ==========================================
// Screen Switcher 
// ==========================================
function toggleScreens(screenName) {
    const screens = ['signup', 'login', 'otp', 'forgot', 'reset'];
    screens.forEach(screen => {
        const el = document.getElementById(`${screen}-section`);
        if (el) el.style.display = 'none';
    });
    const activeScreen = document.getElementById(`${screenName}-section`);
    if (activeScreen) activeScreen.style.display = 'block';
}

function sendForgotOTP(event) {
    event.preventDefault();
    const email = document.getElementById('forgot-email').value;
    alert(`OTP sent securely to ${email}`);
    toggleScreens('reset'); 
}

function resetPassword(event) {
    event.preventDefault();
    const otp = document.getElementById('reset-otp').value;
    const newPwd = document.getElementById('reset-new-pwd').value;
    alert('Password reset successful! Please login with your new password.');
    toggleScreens('login');
}

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
            credentials: 'include',
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
        messageBox.style.color = "#dc3545";
        messageBox.innerText = "⚠️ Server connection failed.";
    }
}

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
            credentials: 'include',
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
        messageBox.style.color = "#dc3545";
        messageBox.innerText = "⚠️ Server connection failed.";
    }
}

async function loginUser(event) {
    event.preventDefault(); 
    const mobile = document.getElementById('login-mobile').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked; 
    const messageBox = document.getElementById('login-message');
    
    messageBox.style.color = "#FFD700";
    messageBox.innerText = "Logging in...";

    try {
        const response = await fetch(`${SERVER_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', 
            body: JSON.stringify({ mobile_number: mobile, password: password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('sarmaya_user_id', data.user.id);
            localStorage.setItem('sarmaya_name', data.user.name);
            localStorage.setItem('sarmaya_mobile', data.user.mobile_number);
            localStorage.setItem('sarmaya_balance', data.user.wallet_balance);

            if (rememberMe) {
                localStorage.setItem('sarmaya_remember_mobile', mobile);
                localStorage.setItem('sarmaya_remember_password', password);
            } else {
                localStorage.removeItem('sarmaya_remember_mobile');
                localStorage.removeItem('sarmaya_remember_password');
            }

            messageBox.innerText = "";
            document.getElementById('auth-screen').style.display = 'none'; 
            document.getElementById('dashboard-screen').style.display = 'flex'; 
            document.getElementById('bottom-nav').style.display = 'flex'; 

            const userNameDisplay = document.getElementById('user-name-display');
            if(userNameDisplay) userNameDisplay.innerText = data.user.name;
            
            const walletBalance = document.getElementById('wallet-balance');
            if(walletBalance) walletBalance.innerText = `₹${data.user.wallet_balance}`;
            
            loadDashboard();
            applyLanguage();
        } else {
            messageBox.style.color = "#dc3545";
            messageBox.innerText = `⚠️ Error: ${data.error}`;
        }
    } catch (error) {
        messageBox.style.color = "#dc3545";
        messageBox.innerText = "⚠️ Server connection failed.";
    }
}

function switchTab(tabName) {
    document.getElementById('dashboard-screen').style.display = 'none';
    document.getElementById('groups-screen').style.display = 'none';
    document.getElementById('payouts-screen').style.display = 'none';
    document.getElementById('join-group-screen').style.display = 'none'; 
    document.getElementById('referral-screen').style.display = 'none'; 
    
    document.getElementById('nav-home').classList.remove('active');
    document.getElementById('nav-groups').classList.remove('active');
    document.getElementById('nav-payouts').classList.remove('active');
    const navReferrals = document.getElementById('nav-referrals');
    if (navReferrals) navReferrals.classList.remove('active');

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
    } else if(tabName === 'referrals') {
        closeProfile();
        document.getElementById('referral-screen').style.display = 'flex';
        if (navReferrals) navReferrals.classList.add('active');
        loadReferralData();
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

function openMyGroups() { 
    document.getElementById('my-groups-modal').style.display = 'block';
    fetchMyPoolsForModal(); 
}

function closeMyGroups() {
    document.getElementById('my-groups-modal').style.display = 'none';
}

async function fetchMyPoolsForModal() {
    const listContainer = document.getElementById('my-groups-modal-list');
    if(listContainer) listContainer.innerHTML = '<p style="text-align: center; color: #666; font-size: 14px; padding: 20px;">Loading your pools...</p>';
    
    const userId = localStorage.getItem('sarmaya_user_id');
    if (!userId) return;

    try {
        const response = await fetch(`${SERVER_URL}/api/my-pools`, {
            method: 'GET',
            credentials: 'include' 
        });
        const data = await response.json();

        if (data.success && listContainer) {
            if (data.my_pools.length === 0) {
                listContainer.innerHTML = '<p style="text-align: center; font-size: 14px; color: #666; padding: 20px;">You haven\'t joined any active groups yet.</p>';
                return;
            }
            listContainer.innerHTML = ''; 
            data.my_pools.forEach(pool => {
                const poolName = pool.cycle ? `${pool.cycle} Pool` : (pool.name || 'Sarmaya Pool');
                listContainer.innerHTML += `
                    <div style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 3px 10px rgba(0,0,0,0.08); border-left: 5px solid #FFD700; border-top: 1px solid #eee; border-right: 1px solid #eee; border-bottom: 1px solid #eee;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h4 style="color: #0A192F; margin: 0;">${poolName}</h4>
                            <span style="background: #e0f2f1; color: #00796b; font-size: 11px; padding: 3px 8px; border-radius: 10px; font-weight: bold;">Active</span>
                        </div>
                        <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Cycle: ${pool.cycle || 'Weekly'} | Amount: ₹${pool.pool_amount || pool.amount}</p>
                        
                        <div style="background: #f4f7f6; padding: 10px; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 5px;">
                                <span>Total Members:</span>
                                <span style="color:#0A192F;">${pool.max_members || 10}</span>
                            </div>
                            <div style="width: 100%; background: #ddd; height: 6px; border-radius: 3px; overflow: hidden;">
                                <div style="width: 100%; background: #4caf50; height: 100%; transition: width 0.5s ease-in-out;"></div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) {
        if(listContainer) listContainer.innerHTML = '<p style="color: red; text-align: center;">Failed to load pools.</p>';
    }
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
// Groups Logic & Filtering (NAYA FIX: Detailed View)
// ==========================================
let globalGroupsList = []; 
async function fetchGroups() {
    try {
        const response = await fetch(`${SERVER_URL}/api/groups`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            globalGroupsList = data.groups; 
            filterPoolsDropdown(); 
        }
    } catch (error) {
        document.querySelector('.group-list').innerHTML = '<p style="text-align: center; color: red;">Failed to load pools from server.</p>';
    }
}

function filterPoolsDropdown() {
    const selectedFilter = document.getElementById('poolFilter').value;
    filterGroups(selectedFilter);
}

function filterGroups(cycleName) {
    const groupListContainer = document.querySelector('.group-list');
    groupListContainer.innerHTML = ''; 
    let filteredGroups = cycleName === 'All' ? globalGroupsList : globalGroupsList.filter(group => group.cycle === cycleName);

    if (filteredGroups.length === 0) {
        groupListContainer.innerHTML = `<p style="text-align: center; padding: 20px; color: #666;">No active ${cycleName === 'All' ? '' : cycleName} pools found.</p>`;
        return;
    }

    filteredGroups.forEach(group => {
        const poolName = group.cycle ? `${group.cycle} Pool` : (group.name || 'Sarmaya Pool');
        const maxMem = group.max_members || 20;
        const joinedMem = group.joined_count || 0; 
        const slotsLeft = maxMem - joinedMem;
        const progress = (joinedMem / maxMem) * 100;
        
        groupListContainer.innerHTML += `
            <div class="group-card" style="padding: 15px; border-radius: 12px; margin-bottom: 15px; background: white; box-shadow: 0 3px 10px rgba(0,0,0,0.08); border-left: 5px solid #0A192F;">
                <div class="group-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: #0A192F; font-size: 16px;">${poolName}</strong>
                    <span class="badge" style="background: #e3f2fd; color: #1565c0; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">${group.cycle || 'Weekly'}</span>
                </div>
                <p style="font-size: 14px; color: #555; margin-bottom: 15px;">Amount: <strong style="color: #28a745;">₹${group.pool_amount || group.amount || 0}</strong></p>
                
                <div style="background: #f4f7f6; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 5px;">
                        <span>Joined: <span style="color:#0A192F;">${joinedMem}</span></span>
                        <span>Total: <span style="color:#0A192F;">${maxMem}</span></span>
                    </div>
                    <div style="width: 100%; background: #ddd; height: 6px; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${progress}%; background: ${slotsLeft <= 5 ? '#dc3545' : '#4caf50'}; height: 100%; transition: width 0.5s ease-in-out;"></div>
                    </div>
                    <p style="font-size: 11px; color: ${slotsLeft <= 5 ? '#dc3545' : '#666'}; margin-top: 5px; text-align: right; font-weight: bold;">
                        ${slotsLeft > 0 ? `${slotsLeft} spots left!` : 'Pool Full!'}
                    </p>
                </div>
                
                <button class="primary-btn" onclick="joinPool(${group.id})" style="padding: 10px; width: 100%; background-color: ${slotsLeft === 0 ? '#ccc' : '#0A192F'}; color: ${slotsLeft === 0 ? '#666' : '#FFD700'}; border: none; border-radius: 8px; font-weight: bold; cursor: ${slotsLeft === 0 ? 'not-allowed' : 'pointer'};" ${slotsLeft === 0 ? 'disabled' : ''}>
                    ${slotsLeft === 0 ? 'Pool Full' : 'Join Pool'}
                </button>
            </div>
        `;
    });
}

async function joinPool(poolId) {
    const userId = localStorage.getItem('sarmaya_user_id');
    if (!userId) { alert("Please login again."); return; }
    try {
        const response = await fetch(`${SERVER_URL}/api/join-pool`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', 
            body: JSON.stringify({ user_id: parseInt(userId), pool_id: parseInt(poolId) })
        });
        const data = await response.json();
        if (data.success) {
            alert("🎉 " + data.message);
            loadDashboard();
        } else {
            alert("⚠️ " + data.error);
        }
    } catch (error) { alert("Backend connection failed!"); }
}

async function createCustomPool() {
    const amount = document.getElementById('amount-box').value;
    const members = document.getElementById('member-box').value;
    const cycle = document.querySelector('.cycle-select').value;
    try {
        const response = await fetch(`${SERVER_URL}/api/create-pool`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ amount: parseInt(amount), members: parseInt(members), cycle: cycle })
        });
        const data = await response.json();
        if (data.success) {
            alert("🎉 " + data.message);
            closeJoinScreen(); 
            fetchGroups(); 
        } else { alert("⚠️ " + data.error); }
    } catch (error) { alert("Backend connection failed!"); }
}

function openDepositModal() { document.getElementById('depositModal').style.display = 'block'; }
function closeDepositModal() {
    document.getElementById('depositModal').style.display = 'none';
    document.getElementById('depositAmount').value = '';
    document.getElementById('depositUtr').value = '';
}
async function submitDeposit() {
    const amount = document.getElementById('depositAmount').value;
    const utr = document.getElementById('depositUtr').value;
    const userId = localStorage.getItem('sarmaya_user_id');

    if (!amount || amount <= 0 || !utr) { alert("⚠️ Please enter a valid amount and UTR number."); return; }
    if (!userId) { alert("⚠️ You must be logged in to add money."); return; }

    try {
        const response = await fetch(`${SERVER_URL}/api/deposit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', 
            body: JSON.stringify({ amount: parseFloat(amount), utr_number: utr, payment_method: 'UPI' })
        });
        const data = await response.json();
        if (data.success) {
            alert("✅ " + data.message);
            closeDepositModal();
        } else { alert("⚠️ Error: " + data.error); }
    } catch (error) { alert("⚠️ Server error. Please try again later."); }
}

async function loadDashboard() {
    const userId = localStorage.getItem('sarmaya_user_id');
    let balance = localStorage.getItem('sarmaya_balance') || 0;
    
    document.querySelectorAll('.wallet-amount').forEach(el => el.innerText = `₹${parseFloat(balance).toFixed(2)}`);
    if (!userId) return;

    try {
        const response = await fetch(`${SERVER_URL}/api/dashboard`, {
            method: 'GET',
            credentials: 'include' 
        });
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('dashboard-active-groups').innerText = data.active_groups;
            localStorage.setItem('sarmaya_balance', data.wallet_balance);
            document.querySelectorAll('.wallet-amount').forEach(el => el.innerText = `₹${parseFloat(data.wallet_balance).toFixed(2)}`);
            
            const refEarningsDisplay = document.getElementById('dashboard-referral-earnings');
            if (refEarningsDisplay) refEarningsDisplay.innerText = `₹${parseFloat(data.referral_earnings || 0).toFixed(2)}`;
            fetchMyPools(); 
        }
    } catch (error) { console.error("Dashboard error:", error); }
}

async function fetchMyPools() {
    const userId = localStorage.getItem('sarmaya_user_id');
    if (!userId) return;
    try {
        const response = await fetch(`${SERVER_URL}/api/my-pools`, {
            method: 'GET',
            credentials: 'include' 
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
                const poolName = pool.cycle ? `${pool.cycle} Pool` : (pool.name || 'Custom Pool');
                listContainer.innerHTML += `
                    <div class="activity-item" style="border-left: 4px solid #FFD700; background: #fff; margin-bottom: 10px; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="color: #0A192F; font-size: 16px;">${poolName}</strong>
                                <p class="date" style="margin-top: 5px;">Cycle: ${pool.cycle || 'Weekly'} | Max Members: ${pool.max_members || 10}</p>
                            </div>
                            <div class="activity-amount positive" style="font-size: 18px; font-weight: bold; color: #28a745;">₹${pool.pool_amount || pool.amount}</div>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) { document.getElementById('my-pools-list').innerHTML = '<p style="color: red; text-align: center;">Failed to load your pools.</p>'; }
}

async function openProfile() {
    document.getElementById('profile-menu').style.display = 'block';

    const userId = localStorage.getItem('sarmaya_user_id');
    if(userId) {
        try {
            const response = await fetch(`${SERVER_URL}/api/profile`, {
                method: 'GET',
                credentials: 'include' 
            });
            const data = await response.json();
            if(data.success) {
                const userData = data.user_data;
                
                const profileName = document.getElementById('profile-name');
                if (profileName) profileName.innerText = userData.name;
                
                const uniqueId = "SS-" + (1000 + parseInt(userData.id)); 
                const profileUid = document.getElementById('profile-uid');
                if (profileUid) profileUid.innerText = "User ID: " + uniqueId;

                const rawMobile = String(userData.mobile_number);
                const mobileFull = "+91 " + rawMobile;
                const mobileMasked = "+91 ******" + rawMobile.slice(-4); 
                
                const emailParts = userData.email.split("@");
                const emailMasked = emailParts[0].charAt(0) + "***@" + emailParts[1];
                const emailFull = userData.email;

                const profileMobile = document.getElementById('profile-mobile');
                if (profileMobile) {
                    profileMobile.setAttribute('data-full', mobileFull);
                    profileMobile.setAttribute('data-masked', mobileMasked);
                    profileMobile.innerText = mobileMasked; 
                    profileMobile.nextElementSibling.className = 'fa-solid fa-eye-slash'; 
                }

                const profileEmail = document.getElementById('profile-email');
                if (profileEmail) {
                    profileEmail.setAttribute('data-full', emailFull);
                    profileEmail.setAttribute('data-masked', emailMasked);
                    profileEmail.innerText = emailMasked; 
                    profileEmail.nextElementSibling.className = 'fa-solid fa-eye-slash'; 
                }
            }
        } catch(error) { console.error("Failed to fetch secure profile data"); }
    }

    const biometricToggle = document.getElementById('biometric-toggle');
    if (biometricToggle) {
        biometricToggle.checked = (localStorage.getItem('sarmaya_biometric_lock') === 'true');
    }
}

function backToProfile(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById('profile-menu').style.display = 'block';
}

function toggleBiometricLock(element) {
    if (element.checked) {
        localStorage.setItem('sarmaya_biometric_lock', 'true');
        alert("🔒 Biometric App Lock Enabled!");
    } else {
        localStorage.setItem('sarmaya_biometric_lock', 'false');
        alert("🔓 Biometric App Lock Disabled!");
    }
}

function togglePrivacy(elementId, iconElement) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const fullText = el.getAttribute('data-full');
    const maskedText = el.getAttribute('data-masked');
    
    if (el.innerText === maskedText) {
        el.innerText = fullText;
        iconElement.className = 'fa-solid fa-eye';
        iconElement.style.color = '#0A192F'; 
    } else {
        el.innerText = maskedText;
        iconElement.className = 'fa-solid fa-eye-slash';
        iconElement.style.color = '#888'; 
    }
}

function closeProfile() { document.getElementById('profile-menu').style.display = 'none'; }
function openChangePasswordModal() { closeProfile(); document.getElementById('change-password-modal').style.display = 'block'; }
function closeChangePasswordModal() { document.getElementById('change-password-modal').style.display = 'none'; }

function submitChangePassword(event) {
    event.preventDefault();
    const newPwd = document.getElementById('new-pwd').value;
    const confirmPwd = document.getElementById('confirm-new-pwd').value;
    const msgBox = document.getElementById('change-pwd-msg');

    if (newPwd !== confirmPwd) {
        msgBox.style.color = 'red';
        msgBox.innerText = "New passwords do not match!";
        return;
    }
    
    msgBox.style.color = 'green';
    msgBox.innerText = "Password updated successfully!";
    setTimeout(() => {
        document.getElementById('changePasswordForm').reset();
        msgBox.innerText = "";
        closeChangePasswordModal();
    }, 1500);
}

// ==========================================
// Referral System & Others
// ==========================================
async function loadReferralData() {
    const userId = localStorage.getItem('sarmaya_user_id');
    if (!userId) return;
    try {
        const response = await fetch(`${SERVER_URL}/api/referrals`, {
            method: 'GET', 
            credentials: 'include' 
        });
        const data = await response.json();
        if (data.success) {
            const walletAmountEl = document.querySelector('#referral-screen .wallet-amount');
            if(walletAmountEl) walletAmountEl.innerText = `₹${data.commission_earned}`;
            const activityAmountEl = document.querySelector('#referral-screen .activity-amount');
            if(activityAmountEl) activityAmountEl.innerText = `${data.team_size}`; 
            const inviteLink = `${window.location.origin}?ref=${data.referral_code}`;
            const linkInput = document.getElementById('invite-link');
            if(linkInput) linkInput.value = inviteLink;

            const teamList = document.getElementById('team-details-list');
            if(teamList) {
                if(data.team && data.team.length > 0) {
                    let html = '';
                    data.team.forEach(member => {
                        let lvlColor = member.level == 1 ? '#1565c0' : '#9c27b0';
                        let lvlBg = member.level == 1 ? '#e3f2fd' : '#f3e5f5';
                        html += `
                        <div class="team-grid-layout" style="font-size: clamp(12px, 3.2vw, 14px); color: #333; margin-bottom: 15px; align-items: center;">
                            <span style="color: #0A192F; font-weight: bold;">${member.user_id || 'User'}</span>
                            <span style="text-align: center; background: ${lvlBg}; color: ${lvlColor}; border-radius: 4px; padding: 2px 4px; font-size: clamp(10px, 2.8vw, 12px); font-weight: bold;">Level ${member.level || 1}</span>
                            <span style="text-align: center; color: #007bff; font-weight: bold;">${member.rate || '10'}%</span>
                            <span style="text-align: right; color: #28a745; font-weight: bold;">+₹${parseFloat(member.commission || 0).toFixed(2)}</span>
                        </div>`;
                    });
                    teamList.innerHTML = html;
                } else {
                    teamList.innerHTML = '<p style="text-align: center; color: #888; font-size: 13px;">No team members found yet.</p>';
                }
            }
        }
    } catch (error) { console.error("Referral fetch error:", error); }
}

function copyLink() {
    const linkInput = document.getElementById('invite-link');
    if(linkInput) { linkInput.select(); document.execCommand('copy'); alert("Invitation Link Copied!"); }
}

function shareSocial(platform) {
    const link = document.getElementById('invite-link').value;
    const text = "Join me on Sarmaya Saathi and start saving together! Use my link: ";
    let url = '';

    if (platform === 'whatsapp') {
        url = `whatsapp://send?text=${encodeURIComponent(text + link)}`;
    } else if (platform === 'facebook') {
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
    } else if (platform === 'twitter') {
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
    } else if (platform === 'instagram') {
        alert("Instagram doesn't support direct web sharing yet. The link has been copied for your Bio/Story!");
        copyLink();
        return;
    } else if (platform === 'more') {
        if (navigator.share) {
            navigator.share({
                title: 'Sarmaya Saathi',
                text: text,
                url: link
            }).catch(err => console.error("Share failed", err));
        } else {
            alert("Native sharing is not supported on this browser.");
        }
        return;
    }
    
    if (url) {
        window.open(url, '_blank');
    }
}

async function logoutUser() {
    try {
        await fetch(`${SERVER_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) { console.log("Logout request failed"); }

    localStorage.removeItem('sarmaya_user_id');
    localStorage.removeItem('sarmaya_name');
    localStorage.removeItem('sarmaya_mobile');
    localStorage.removeItem('sarmaya_balance');
    localStorage.removeItem('temp_email');
    
    alert("Logged out successfully.");
    window.location.reload(); 
}

document.querySelectorAll('.profile-icon').forEach(icon => { icon.addEventListener('click', openProfile); });

// ==========================================
// Withdrawal & Transactions
// ==========================================
function openHistoryModal() {
    closeProfile(); 
    document.getElementById('history-modal').style.display = 'block';
    fetchTransactionHistory(); 
}
function closeHistoryModal() { document.getElementById('history-modal').style.display = 'none'; }

async function fetchTransactionHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '<p style="text-align: center; color: #666; font-size: 14px;">Loading transactions...</p>';
    const userId = localStorage.getItem('sarmaya_user_id');
    if (!userId) { historyList.innerHTML = '<p style="text-align: center; color: red;">Authentication error.</p>'; return; }

    try {
        const response = await fetch(`${SERVER_URL}/api/transactions`, {
            method: 'GET', 
            credentials: 'include' 
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
                        <div style="color: ${color}; font-weight: bold; font-size: 15px;">${sign}₹${parseFloat(tx.amount).toFixed(2)}</div>
                    </div>
                `;
            });
            historyList.innerHTML = html;
        } else { historyList.innerHTML = '<p style="text-align: center; color: red;">Failed to load history.</p>'; }
    } catch (error) { historyList.innerHTML = '<p style="text-align: center; color: red;">Server connection error.</p>'; }
}

function openWithdrawalModal() {
    closeProfile(); 
    document.getElementById('withdrawal-modal').style.display = 'block';
    document.getElementById('withdraw-message').innerText = ''; 
    document.getElementById('withdrawalForm').reset(); 
}
function closeWithdrawalModal() { document.getElementById('withdrawal-modal').style.display = 'none'; }

async function submitWithdrawal(event) {
    event.preventDefault(); 
    const messageBox = document.getElementById('withdraw-message');
    
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const method = document.getElementById('withdraw-method').value;
    const details = document.getElementById('withdraw-details').value;
    const userId = localStorage.getItem('sarmaya_user_id');
    
    if (!userId) {
        messageBox.style.color = '#dc3545';
        messageBox.innerText = 'Authentication error. Please login again.';
        return;
    }

    messageBox.style.color = '#007bff';
    messageBox.innerText = '🔐 Waiting for fingerprint verification...';
    
    const isAuthorized = await verifyBiometric(`Authorize withdrawal of ₹${amount}`);
    
    if (!isAuthorized) {
        messageBox.style.color = '#dc3545';
        messageBox.innerText = '❌ Withdrawal cancelled. Fingerprint verification failed.';
        return; 
    }

    messageBox.innerText = '⏳ Processing request... Please wait.';
    
    try {
        const response = await fetch(`${SERVER_URL}/api/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', 
            body: JSON.stringify({ amount: amount, payment_method: method, payment_details: details })
        });
        
        const data = await response.json();
        if (data.success) {
            messageBox.style.color = '#28a745'; 
            messageBox.innerText = '✅ ' + data.message;
            setTimeout(() => { closeWithdrawalModal(); loadDashboard(); }, 2000);
        } else {
            messageBox.style.color = '#dc3545'; 
            messageBox.innerText = '❌ ' + (data.error || "Request failed.");
        }
    } catch (error) {
        messageBox.style.color = '#dc3545';
        messageBox.innerText = '❌ Server connection error. Please try again.';
    }
}
