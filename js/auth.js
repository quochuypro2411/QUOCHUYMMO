const Auth = {
    init: () => {
        if(!localStorage.getItem('mmo_users')) {
            localStorage.setItem('mmo_users', JSON.stringify([]));
        }
        Auth.updateUI();
    },

    getUsers: () => JSON.parse(localStorage.getItem('mmo_users')),
    
    getCurrentUser: () => {
        const u = localStorage.getItem('mmo_currentUser');
        return u ? JSON.parse(u) : null;
    },

    getDefaultPermissions: (isAdmin = false) => {
        if (!isAdmin) {
            return { viewDashboard: true };
        }
        return {
            approveOrders: true,
            manageUsers: true,
            manageBalances: true,
            approveDeposits: true,
            viewReports: true
        };
    },

    hasPermission: (user, key) => {
        if (!user) return false;
        if (user.role === 'admin' || user.isAdmin) return true;
        return user.permissions?.[key] === true;
    },

    hashPassword: async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    login: async (username, password) => {
        const passwordHash = await Auth.hashPassword(password);
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const users = Auth.getUsers();
                let user = users.find(u => u.username === username && (u.passwordHash === passwordHash || u.password === password));
                if(user) {
                    // Upgrade plaintext password storage if needed
                    if(!user.passwordHash) {
                        user.passwordHash = passwordHash;
                        delete user.password;
                        const idx = users.findIndex(u => u.username === username);
                        if(idx > -1) {
                            users[idx] = user;
                            localStorage.setItem('mmo_users', JSON.stringify(users));
                        }
                    }
                    const isAdminUser = user.role === 'admin' || user.isAdmin;
                    if (!user.permissions) {
                        user.permissions = Auth.getDefaultPermissions(isAdminUser);
                        const idx = users.findIndex(u => u.username === username);
                        if (idx > -1) {
                            users[idx] = user;
                            localStorage.setItem('mmo_users', JSON.stringify(users));
                        }
                    }
                    localStorage.setItem('mmo_currentUser', JSON.stringify(user));
                    Auth.updateUI();
                    resolve(user);
                } else {
                    reject(new Error("Sai tài khoản hoặc mật khẩu"));
                }
            }, 800);
        });
    },

    register: async (username, password, email) => {
        const passwordHash = await Auth.hashPassword(password);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = Auth.getUsers();
                if(users.find(u => u.username === username)) {
                    reject(new Error("Tên đăng nhập đã tồn tại"));
                    return;
                }
                if(users.find(u => u.email === email)) {
                    reject(new Error("Email đã được sử dụng"));
                    return;
                }
                const isAdminUser = username.toLowerCase() === 'admin';
                const newUser = { 
                    username, 
                    email,
                    passwordHash,
                    balance: 0, 
                    transactions: [],
                    role: isAdminUser ? 'admin' : 'user',
                    permissions: Auth.getDefaultPermissions(isAdminUser),
                    createdAt: new Date().toISOString()
                };
                users.push(newUser);
                localStorage.setItem('mmo_users', JSON.stringify(users));
                resolve(newUser);
            }, 1000);
        });
    },

    resetPassword: async (email, password) => {
        const passwordHash = await Auth.hashPassword(password);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = Auth.getUsers();
                const userIndex = users.findIndex(u => u.email === email);
                if(userIndex === -1) {
                    reject(new Error('Email không tồn tại trong hệ thống'));
                    return;
                }
                users[userIndex].passwordHash = passwordHash;
                delete users[userIndex].password;
                localStorage.setItem('mmo_users', JSON.stringify(users));
                resolve(users[userIndex]);
            }, 1000);
        });
    },

    logout: () => {
        localStorage.removeItem('mmo_currentUser');
        Auth.updateUI();
        window.Router.navigate('/');
    },

    updateUI: () => {
        const user = Auth.getCurrentUser();
        const authArea = document.getElementById('auth-area');
        if(!authArea) return;
        
        if(user) {
            authArea.innerHTML = `
                <div class="user-dropdown">
                    <div class="user-dropdown-toggle" onclick="this.nextElementSibling.classList.toggle('show')">
                        <span class="user-greeting">Hi, ${user.username}</span>
                        <span class="user-balance" style="color:#10b981; font-weight: bold; margin-left:5px;">${user.balance.toLocaleString()}đ</span>
                    </div>
                    <div class="user-dropdown-menu">
                        <a href="/dashboard" data-link><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                        <a href="/deposit" data-link><i class="fas fa-wallet"></i> Nạp tiền</a>
                        <a href="#" onclick="Auth.logout(); return false;"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                    </div>
                </div>
            `;
        } else {
            authArea.innerHTML = `
                <a href="/auth?tab=login" id="link-login" data-link>ĐĂNG NHẬP</a>
                <a href="/auth?tab=register" id="link-register" data-link>ĐĂNG KÝ</a>
            `;
        }
    }
};

window.Auth = Auth;
