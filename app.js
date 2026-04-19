document.addEventListener('DOMContentLoaded', () => {

    // --- Tab Switching Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Also handle dashboard icon buttons in topbar
    const topbarIcons = document.querySelectorAll('.icon-btn[data-target]');

    window.switchTab = function (targetId) {
        // Remove active class from all nav items and tabs
        navItems.forEach(nav => nav.classList.remove('active'));
        const dynamicPanes = document.querySelectorAll('.tab-pane');
        dynamicPanes.forEach(tab => tab.classList.remove('active'));

        // Add active class to corresponding tab
        const targetTab = document.getElementById(targetId);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Add active class to corresponding nav item in sidebar (if exists)
        const correspondingNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if (correspondingNav) {
            correspondingNav.classList.add('active');
        }

        // --- FULL STACK DYNAMIC ROUTING MAP ---
        if(targetId === 'home') window.loadLiveFeed();
        if(targetId === 'jobs') window.loadLiveJobs();
        if(targetId === 'funding') window.loadLiveFunding();
        if(targetId === 'events') window.loadEvents();
        if(targetId === 'wallet') window.loadWallet();
        if(targetId === 'services') window.loadLiveServices();
    }

    // Attach click events to Sidebar Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            window.switchTab(targetId);
        });
    });

    // Attach click events to Topbar Icons (like Rewards)
    topbarIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = icon.getAttribute('data-target');
            window.switchTab(targetId);
        });
    });

    // --- Modal Logic ---
    const createModal = document.getElementById('create-modal');
    const btnUniversalCreate = document.getElementById('btn-universal-create');
    const inlineCreateTrigger = document.getElementById('inline-create-trigger');

    function openModal() {
        const modal = document.getElementById('create-modal');
        if (modal) modal.classList.add('active');
        window.resetModalView(); // Ensure it opens to the main menu
    }

    // Open from topbar button
    if (btnUniversalCreate) {
        btnUniversalCreate.addEventListener('click', openModal);
    }

    // Open from inline composer on Home Feed
    if (inlineCreateTrigger) {
        const input = inlineCreateTrigger.querySelector('input');
        if (input) input.addEventListener('click', openModal);
    }

    // Close when clicking outside of modal content
    createModal.addEventListener('click', (e) => {
        if (e.target === createModal) {
            window.closeModal();
        }
    });

    setTimeout(() => {
        if (window.loadLiveFeed) window.loadLiveFeed();
    }, 400);
});

window.refreshJobFormDisplay = function () {
    const span = document.getElementById('job-company-display');
    if (!span) return;
    const userType = localStorage.getItem('currentUserType') || 'individual';
    let label = 'Your organization';
    if (userType === 'company') {
        const n = document.getElementById('comp-prof-name')?.innerText?.trim();
        label = n && n !== 'Company Name' ? n : 'Your company';
    } else {
        const n = document.getElementById('prof-fullname')?.innerText?.trim();
        label = n ? `${n} (hiring)` : 'Your profile';
    }
    span.replaceChildren();
    span.appendChild(document.createTextNode(label + ' '));
    const ic = document.createElement('i');
    ic.className = 'ph-fill ph-shield-check text-blue';
    span.appendChild(ic);
    const loc = document.getElementById('job-input-location');
    if (loc && !loc.value.trim()) {
        const pl = document.getElementById('prof-loc')?.innerText?.trim();
        if (pl && !pl.toLowerCase().includes('add')) loc.placeholder = pl;
    }
};

// Global functions for inline HTML event handlers
window.switchCreateView = function (viewId) {
    // Hide all views inside modal-body
    const views = document.querySelectorAll('.create-form-view, #create-view-menu');
    views.forEach(view => {
        if (view) view.style.display = 'none';
    });

    // Show the targeted view
    const target = document.getElementById('create-view-' + viewId);
    if (target) {
        target.style.display = (viewId === 'menu') ? 'grid' : 'block';
    }

    // Update header title based on view
    const titleObj = document.getElementById('modal-title');
    if (!titleObj) return;

    if (viewId === 'menu') titleObj.innerText = 'What would you like to create?';
    else if (viewId === 'update') titleObj.innerText = 'Post an Update';
    else if (viewId === 'event') titleObj.innerText = 'Create an Event';
    else if (viewId === 'job') titleObj.innerText = 'Post a Job';
    else if (viewId === 'offer') titleObj.innerText = 'Offer a Service';
    else if (viewId === 'request') titleObj.innerText = 'Request a Service';
    else if (viewId === 'funding') titleObj.innerText = 'Ask for Funding / Partnership';
    else if (viewId === 'edit-company') titleObj.innerText = 'Edit Company Profile';

    if (viewId === 'job') window.refreshJobFormDisplay();
};

window.resetModalView = function () {
    window.switchCreateView('menu');
};

window.closeModal = function () {
    window.resetModalView();
    const modals = document.querySelectorAll('.modal-overlay.active');
    modals.forEach(m => m.classList.remove('active'));
};

// Profile Dropdown Logic
window.togglePfpDropdown = function () {
    const dropdown = document.getElementById('pfp-dropdown');
    if (dropdown) {
        dropdown.style.display = (dropdown.style.display === 'none' || dropdown.style.display === '') ? 'block' : 'none';
    }
};

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('pfp-dropdown');
    const trigger = document.getElementById('pfp-trigger');

    if (dropdown && trigger) {
        if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    }
});

// --- Authentication Flow Logic ---
window.switchAuthView = function (viewId) {
    const views = document.querySelectorAll('.auth-form-container');
    views.forEach(v => {
        v.style.display = 'none';
        v.classList.remove('active');
    });

    const target = document.getElementById('auth-view-' + viewId);
    if (target) {
        target.style.display = 'flex';
        // tiny delay for animation feel if needed
        setTimeout(() => target.classList.add('active'), 10);
    }
};

window.populateProfileData = function () {
    const userType = window.localStorage.getItem('currentUserType') || 'individual';

    if (userType === 'individual') {
        const fName = document.getElementById('auth-fname') ? document.getElementById('auth-fname').value.trim() : '';
        const lName = document.getElementById('auth-lname') ? document.getElementById('auth-lname').value.trim() : '';
        const job = document.getElementById('auth-job') ? document.getElementById('auth-job').value.trim() : '';
        const company = document.getElementById('auth-company') ? document.getElementById('auth-company').value.trim() : '';
        const experience = document.getElementById('auth-experience') ? document.getElementById('auth-experience').value.trim() : '';
        const loc = document.getElementById('auth-loc') ? document.getElementById('auth-loc').value.trim() : '';
        const edu = document.getElementById('auth-edu') ? document.getElementById('auth-edu').value.trim() : '';
        const skills = document.getElementById('auth-skills') ? document.getElementById('auth-skills').value.trim() : '';
        const email = document.getElementById('indiv-reg-email') ? document.getElementById('indiv-reg-email').value.trim() : '';

        if (fName || lName) {
            let fullName = fName + (fName && lName ? ' ' : '') + lName;
            if (document.getElementById('prof-fullname')) document.getElementById('prof-fullname').innerText = fullName;
        }
        if (job && document.getElementById('prof-job')) document.getElementById('prof-job').innerText = job;
        if (company && document.getElementById('prof-company')) document.getElementById('prof-company').innerText = company;
        if (loc && document.getElementById('prof-loc')) document.getElementById('prof-loc').innerText = loc;
        if (email && document.getElementById('prof-email')) document.getElementById('prof-email').innerText = email;
        if (email && document.getElementById('indiv-verified-email')) document.getElementById('indiv-verified-email').value = email;
        if (edu && document.getElementById('prof-edu-display')) {
            document.getElementById('prof-edu-display').innerText = edu;
            document.getElementById('prof-edu-display').style.display = 'block';
        }
        if (experience && document.getElementById('prof-experience-display')) {
            document.getElementById('prof-experience-display').innerText = experience;
        }
        if (skills && document.getElementById('prof-skills-display')) {
            const skillsArr = skills.split(',').map(s => s.trim());
            const container = document.getElementById('prof-skills-display');
            container.innerHTML = '';
            skillsArr.forEach(s => {
                const pill = document.createElement('span');
                pill.className = 'pill';
                pill.innerText = s;
                container.appendChild(pill);
            });
        }
    } else {
        // Company Profile Mapping
        const compName = document.getElementById('comp-reg-name') ? document.getElementById('comp-reg-name').value.trim() : '';
        const compType = document.getElementById('comp-reg-type') ? document.getElementById('comp-reg-type').value : '';
        const compDesc = document.getElementById('comp-reg-desc') ? document.getElementById('comp-reg-desc').value.trim() : '';
        const compIndustry = document.getElementById('comp-reg-industry') ? document.getElementById('comp-reg-industry').value : '';
        const compEmail = document.getElementById('comp-reg-email') ? document.getElementById('comp-reg-email').value.trim() : '';
        const compYears = document.getElementById('comp-reg-years') ? document.getElementById('comp-reg-years').value.trim() : '';
        const compGst = document.getElementById('comp-reg-gst') ? document.getElementById('comp-reg-gst').value.trim() : '';
        const compWebsite = document.getElementById('comp-reg-website') ? document.getElementById('comp-reg-website').value.trim() : '';
        const compLinkedin = document.getElementById('comp-reg-linkedin') ? document.getElementById('comp-reg-linkedin').value.trim() : '';

        if (compName && document.getElementById('comp-prof-name')) document.getElementById('comp-prof-name').innerText = compName;
        if (compDesc && document.getElementById('comp-prof-desc')) document.getElementById('comp-prof-desc').innerText = compDesc;
        if (compIndustry && document.getElementById('comp-prof-industry')) document.getElementById('comp-prof-industry').innerText = compIndustry;
        if (compType && document.getElementById('comp-prof-type')) document.getElementById('comp-prof-type').innerText = compType;
        if (compEmail && document.getElementById('comp-prof-email')) document.getElementById('comp-prof-email').innerText = compEmail;
        if (compGst && document.getElementById('comp-prof-gst')) document.getElementById('comp-prof-gst').innerText = compGst;
        if (compYears && document.getElementById('comp-prof-years')) document.getElementById('comp-prof-years').innerText = compYears;
        if (compWebsite && document.getElementById('comp-prof-website')) document.getElementById('comp-prof-website').innerText = compWebsite;
        if (compLinkedin && document.getElementById('comp-prof-linkedin')) document.getElementById('comp-prof-linkedin').innerText = compLinkedin;
    }
};

window.enterApplication = function (userType = 'individual') {
    const loginEmail = document.getElementById('login-email')?.value.trim();
    const indivEmail = document.getElementById('indiv-reg-email')?.value.trim();
    const compEmail = document.getElementById('comp-reg-email')?.value.trim();
    const magicStored = window.localStorage.getItem('emailForSignIn');
    window.platformAuthEmail = indivEmail || compEmail || loginEmail || magicStored || 'user@local.dev';
    window.localStorage.setItem('platformAuthEmail', window.platformAuthEmail);

    // Save type to identify profile routing
    window.localStorage.setItem('currentUserType', userType);

    // Update the "View Profile" dropdown link target
    const viewProfileLink = document.getElementById('dropdown-view-profile');
    if (viewProfileLink) {
        if (userType === 'company') {
            viewProfileLink.setAttribute('data-target', 'company-detail');
        } else {
            viewProfileLink.setAttribute('data-target', 'profile');
        }
    }

    // Persist state from Onboarding to Profile Tab
    window.populateProfileData();
    if (window.refreshJobFormDisplay) window.refreshJobFormDisplay();

    // Hide Auth Portal
    document.getElementById('auth-portal').style.display = 'none';

    // Show Main App
    const appContainer = document.querySelector('.app-container');
    appContainer.style.display = 'flex';
    appContainer.style.animation = 'fadeIn 0.8s ease-in-out';

    // Role-based Navigation Visibility
    const fundingNav = document.querySelector('.nav-item[data-target="funding"]');
    const servicesNav = document.querySelector('.nav-item[data-target="services"]');
    if (userType === 'individual') {
        if (fundingNav) fundingNav.style.display = 'none';
        if (servicesNav) servicesNav.style.display = 'none';
    } else {
        if (fundingNav) fundingNav.style.display = 'flex';
        if (servicesNav) servicesNav.style.display = 'flex';
    }

    // Company accounts: block “apply / invest / bid” style actions, not posting jobs or funding.
    const restrictedButtons = document.querySelectorAll(`
        .job-card .btn-primary,
        .deal-card .btn,
        .services-layout .btn
    `);

    if (userType === 'company') {
        restrictedButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.title = 'Company accounts cannot perform this action on the network.';
        });
    } else {
        restrictedButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.title = '';
        });
    }
};


window.openEditCompanyModal = function (focusField = 'all') {
    // Populate form with current values from the page
    const name = document.getElementById('comp-prof-name') ? document.getElementById('comp-prof-name').innerText : '';
    const desc = document.getElementById('comp-prof-desc') ? document.getElementById('comp-prof-desc').innerText : '';
    const industry = document.getElementById('comp-prof-industry') ? document.getElementById('comp-prof-industry').innerText : '';
    const type = document.getElementById('comp-prof-type') ? document.getElementById('comp-prof-type').innerText : '';
    const email = document.getElementById('comp-prof-email') ? document.getElementById('comp-prof-email').innerText : '';
    const gst = document.getElementById('comp-prof-gst') ? document.getElementById('comp-prof-gst').innerText : '';
    const years = document.getElementById('comp-prof-years') ? document.getElementById('comp-prof-years').innerText : '';
    const website = document.getElementById('edit-comp-website') ? document.getElementById('edit-comp-website').value : ''; // Pull from hidden input or session if needed
    const linkedin = document.getElementById('edit-comp-linkedin') ? document.getElementById('edit-comp-linkedin').value : '';

    if (document.getElementById('edit-comp-name')) document.getElementById('edit-comp-name').value = name === 'Company Name' ? '' : name;
    if (document.getElementById('edit-comp-desc')) document.getElementById('edit-comp-desc').value = (desc.includes('Add organization') || desc.includes('Company overview')) ? '' : desc;
    if (document.getElementById('edit-comp-industry')) document.getElementById('edit-comp-industry').value = (industry.includes('Add Industry') || industry === 'Industry') ? 'IT / SaaS' : industry;
    if (document.getElementById('edit-comp-type')) document.getElementById('edit-comp-type').value = (type.includes('Add Type') || type === 'Pvt Ltd') ? 'Private Limited (Pvt Ltd)' : type;
    if (document.getElementById('edit-comp-email')) document.getElementById('edit-comp-email').value = (email.includes('Add Email') || email === 'admin@company.com') ? '' : email;
    if (document.getElementById('edit-comp-gst')) document.getElementById('edit-comp-gst').value = (gst.includes('Add GST') || gst.includes('Verified')) ? '' : gst.replace('Verified', '').trim();
    if (document.getElementById('edit-comp-years')) document.getElementById('edit-comp-years').value = (years.includes('Add Years') || years === '0') ? '' : years.replace('Years', '').trim();

    // Toggle visibility of specific fields based on user request
    const groups = document.querySelectorAll('.edit-group');
    groups.forEach(g => g.style.display = 'none');

    if (focusField === 'all') {
        groups.forEach(g => g.style.display = 'block');
    } else {
        const targetGroup = document.getElementById('edit-group-' + focusField);
        if (targetGroup) {
            targetGroup.style.display = 'block';
            // Auto focus the input if it's a single field
            setTimeout(() => {
                const input = targetGroup.querySelector('input, textarea, select');
                if (input) input.focus();
            }, 10);
        }
    }

    window.switchCreateView('edit-company');
    document.getElementById('create-modal').classList.add('active');
};

window.saveCompanyProfile = function () {
    // Get values from form
    const name = document.getElementById('edit-comp-name').value.trim();
    const desc = document.getElementById('edit-comp-desc').value.trim();
    const industry = document.getElementById('edit-comp-industry').value;
    const type = document.getElementById('edit-comp-type').value;
    const email = document.getElementById('edit-comp-email').value.trim();
    const gst = document.getElementById('edit-comp-gst').value.trim();
    const years = document.getElementById('edit-comp-years').value.trim();
    const website = document.getElementById('edit-comp-website').value.trim();
    const linkedin = document.getElementById('edit-comp-linkedin').value.trim();

    // Update Profile UI
    if (name) document.getElementById('comp-prof-name').innerText = name;

    const descEl = document.getElementById('comp-prof-desc');
    if (desc) descEl.innerText = desc;
    else descEl.innerHTML = '<i class="ph ph-plus-circle"></i> Add organization overview and short description...';

    if (industry) document.getElementById('comp-prof-industry').innerText = industry;

    const typeEl = document.getElementById('comp-prof-type');
    if (type) typeEl.innerText = type.replace(' (Pvt Ltd)', '');
    else typeEl.innerHTML = '<i class="ph-fill ph-plus-circle"></i> Add Type';

    const emailEl = document.getElementById('comp-prof-email');
    if (email) emailEl.innerText = email;
    else emailEl.innerHTML = '<i class="ph-fill ph-plus-circle"></i> Add Email';

    const gstEl = document.getElementById('comp-prof-gst');
    if (gst) gstEl.innerHTML = `<i class="ph-fill ph-shield-check"></i> ${gst}`;
    else gstEl.innerHTML = '<i class="ph-fill ph-plus-circle"></i> Add GST';

    const yearsEl = document.getElementById('comp-prof-years');
    if (years) yearsEl.innerText = years;
    else yearsEl.innerText = 'Add Years';

    if (website) {
        document.getElementById('comp-prof-website').innerText = 'Visit Website';
        document.getElementById('comp-prof-website-link').href = website.startsWith('http') ? website : 'https://' + website;
    } else {
        document.getElementById('comp-prof-website').innerText = 'Visit Website';
        document.getElementById('comp-prof-website-link').href = '#';
    }

    if (linkedin) {
        document.getElementById('comp-prof-linkedin').innerText = 'Visit LinkedIn';
        document.getElementById('comp-prof-linkedin-link').href = linkedin.startsWith('http') ? linkedin : 'https://' + linkedin;
    } else {
        document.getElementById('comp-prof-linkedin').innerText = 'Visit LinkedIn';
        document.getElementById('comp-prof-linkedin-link').href = '#';
    }

    // Persist to session (simulation)
    localStorage.setItem('comp_profile_updated', 'true');

    window.closeModal();
    alert('Company profile updated successfully!');
};

// ==========================================
// RENDER POSTGRESQL NATIVE API INTEGRATION
// ==========================================

if (typeof window.API_BASE === 'undefined') {
    window.API_BASE = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://127.0.0.1:5000'
        : '';
}

function apiUrl(path) {
    const base = (window.API_BASE || '').replace(/\/$/, '');
    const p = path.startsWith('/') ? path : '/' + path;
    return base + p;
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getFeedAuthorName() {
    const userType = localStorage.getItem('currentUserType') || 'individual';
    if (userType === 'company') {
        const t = document.getElementById('comp-prof-name')?.innerText?.trim() || '';
        return t && t !== 'Company Name' ? t : 'Verified company';
    }
    return document.getElementById('prof-fullname')?.innerText?.trim() || 'Member';
}

function getFeedAuthorRole() {
    const userType = localStorage.getItem('currentUserType') || 'individual';
    if (userType === 'company') {
        return document.getElementById('comp-prof-industry')?.innerText?.trim() || 'Company';
    }
    return document.getElementById('prof-job')?.innerText?.trim() || 'Professional';
}

function getJobCompanyName() {
    const userType = localStorage.getItem('currentUserType') || 'individual';
    if (userType === 'company') {
        const t = document.getElementById('comp-prof-name')?.innerText?.trim() || '';
        return t && t !== 'Company Name' ? t : 'Verified company';
    }
    const n = document.getElementById('prof-fullname')?.innerText?.trim();
    return n ? `${n} (hiring)` : 'Hiring team';
}

function getJobLocation() {
    const v = document.getElementById('job-input-location')?.value.trim();
    if (v) return v;
    const pl = document.getElementById('prof-loc')?.innerText?.trim() || '';
    if (pl && !pl.toLowerCase().includes('add')) return pl;
    return 'Remote';
}

function getFundingStartupName() {
    const userType = localStorage.getItem('currentUserType') || 'individual';
    if (userType === 'company') {
        const t = document.getElementById('comp-prof-name')?.innerText?.trim() || '';
        return t && t !== 'Company Name' ? t : 'Startup';
    }
    const n = document.getElementById('prof-fullname')?.innerText?.trim();
    return n ? `${n}'s venture` : 'Stealth startup';
}

window.loadLiveFeed = async function () {
    const mount = document.getElementById('live-feed-posts');
    if (!mount) return;
    mount.innerHTML =
        '<p style="text-align:center;color:var(--text-muted);padding:16px;">Loading feed…</p>';
    try {
        const res = await fetch(apiUrl('/api/feed'));
        const data = await res.json();
        if (!data.success) {
            mount.innerHTML =
                '<p style="color:#EF4444;padding:12px;">Could not load feed: ' +
                escapeHtml(data.error || 'Unknown error') +
                '</p>';
            return;
        }
        mount.innerHTML = '';
        const rows = data.data || [];
        if (rows.length === 0) {
            mount.innerHTML =
                '<div style="text-align:center;color:#94A3B8;padding:24px;">No posts yet — use <strong>New</strong> to publish an update. It will appear here for everyone.</div>';
            return;
        }
        rows.forEach((post) => {
            mount.innerHTML += `
                <div class="feed-item card margin-bottom fade-in">
                    <div class="user-meta" style="margin-bottom:12px;display:flex;gap:12px;align-items:flex-start;">
                        <div class="avatar"><i class="ph-fill ph-user-circle" style="font-size:36px;color:var(--trust-blue);"></i></div>
                        <div class="meta-info">
                            <h4 class="name" style="margin:0;">${escapeHtml(post.author_name)}</h4>
                            <p class="role" style="margin:4px 0 0;font-size:13px;color:var(--text-muted);">${escapeHtml(post.author_role)} • ${escapeHtml(post.date)}</p>
                        </div>
                    </div>
                    <p style="font-size:14px;line-height:1.6;color:var(--text-main);margin:0 0 12px;">${escapeHtml(post.content)}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border);padding-top:12px;">
                        <span class="btn btn-outline" style="border:none;color:var(--text-muted);pointer-events:none;"><i class="ph ph-heart"></i> ${escapeHtml(String(post.likes_count))}</span>
                        <span class="btn btn-outline" style="border:none;color:var(--text-muted);pointer-events:none;"><i class="ph ph-chat-circle"></i> ${escapeHtml(String(post.comments_count))} comments</span>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error('Feed load error:', err);
        mount.innerHTML =
            '<p style="color:#EF4444;padding:12px;">Network error — is the API running?</p>';
    }
};

window.submitLivePost = async function () {
    const inputArea = document.getElementById('create-post-textarea');
    if (!inputArea || !inputArea.value.trim()) return;

    const content = inputArea.value.trim();
    const btn = document.getElementById('btn-create-post-sql');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Publishing…';
    }

    try {
        const payload = {
            email:
                localStorage.getItem('platformAuthEmail') ||
                localStorage.getItem('emailForSignIn') ||
                'user@local.dev',
            name: getFeedAuthorName(),
            role: getFeedAuthorRole(),
            content: content,
        };

        const res = await fetch(apiUrl('/api/feed'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
            inputArea.value = '';
            closeModal();
            window.switchTab('home');
            loadLiveFeed();
        } else {
            alert(data.error || 'Could not save post.');
        }
    } catch (err) {
        console.error(err);
        alert('Server connection error.');
    }

    if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Publish Insight';
    }
};

window.loadLiveJobs = async function () {
    const mount = document.getElementById('live-jobs-list');
    if (!mount) return;
    mount.innerHTML =
        '<p style="color:var(--text-muted);font-size:13px;">Loading jobs…</p>';
    try {
        const res = await fetch(apiUrl('/api/jobs'));
        const data = await res.json();
        if (!data.success) {
            mount.innerHTML =
                '<p style="color:#EF4444;">' + escapeHtml(data.error || 'Error') + '</p>';
            return;
        }
        mount.innerHTML = '';
        const rows = data.data || [];
        if (rows.length === 0) {
            mount.innerHTML =
                '<p style="color:var(--text-muted);">No roles in the database yet. Post a job from <strong>New → Post Job</strong>.</p>';
            return;
        }
        rows.forEach((job) => {
            mount.innerHTML += `
                <div class="job-card fade-in" style="background-color: transparent; border:1px solid #E2E8F0; padding:16px; border-radius:12px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; gap:8px;">
                        <h3 style="font-size:15px;margin:0;">${escapeHtml(job.role_title)}</h3>
                        <span class="badge" style="background:#E0F2FE; color:#0369A1;white-space:nowrap;">${escapeHtml(job.tier)}</span>
                    </div>
                    <p style="color:#475569; font-size:13px; margin:6px 0 0;">${escapeHtml(job.company_name)} • ${escapeHtml(job.location)}</p>
                    <p style="font-weight:600; margin:10px 0 0;">${escapeHtml(job.salary)}</p>
                    <p style="color:#64748B; font-size:12px; margin:6px 0 0;"><i class="ph ph-tag"></i> ${escapeHtml(job.tags || '')}</p>
                </div>`;
        });
    } catch (err) {
        console.error(err);
        mount.innerHTML = '<p style="color:#EF4444;">Could not load jobs.</p>';
    }
};

window.loadLiveFunding = async function () {
    const mount = document.getElementById('live-funding-list');
    if (!mount) return;
    mount.innerHTML =
        '<p style="color:var(--text-muted);font-size:13px;">Loading deals…</p>';
    try {
        const res = await fetch(apiUrl('/api/funding'));
        const data = await res.json();
        if (!data.success) {
            mount.innerHTML =
                '<p style="color:#EF4444;">' + escapeHtml(data.error || 'Error') + '</p>';
            return;
        }
        mount.innerHTML = '';
        const rows = data.data || [];
        if (rows.length === 0) {
            mount.innerHTML =
                '<p style="color:var(--text-muted);grid-column:1/-1;">No funding rounds yet.</p>';
            return;
        }
        rows.forEach((deal) => {
            mount.innerHTML += `
                <div class="card deal-card fade-in" style="border:1px solid #FDE68A; padding:16px; border-radius:12px;">
                    <h3 style="font-size:17px; margin:0 0 8px; display:flex; align-items:center; gap:8px;"><i class="ph-fill ph-rocket"></i> ${escapeHtml(deal.startup_name)}</h3>
                    <p style="color:#92400E; font-size:13px; font-weight:600; margin:0;">${escapeHtml(deal.round_type)}</p>
                    <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #FDE68A;">
                        <span style="font-size:12px; color:#64748B;">Raised / target</span>
                        <p style="font-size:18px;font-weight:700;margin:4px 0 0;">${escapeHtml(deal.capital_raised)} <span style="font-size:12px;font-weight:400;color:#94A3B8;">/ ${escapeHtml(deal.target_capital)}</span></p>
                    </div>
                    <p style="color:#64748B; font-size:12px; margin:10px 0 0;">${escapeHtml(deal.domain_tags)}</p>
                </div>`;
        });
    } catch (err) {
        console.error(err);
        mount.innerHTML = '<p style="color:#EF4444;">Could not load funding data.</p>';
    }
};

window.loadLiveServices = async function () {
    const mount = document.getElementById('live-services-list');
    if (!mount) return;
    mount.innerHTML =
        '<p style="color:var(--text-muted);font-size:13px;">Loading services &amp; requests…</p>';
    try {
        const [svcRes, rfpRes] = await Promise.all([
            fetch(apiUrl('/api/services')),
            fetch(apiUrl('/api/procurement')),
        ]);
        let svcData = { success: false, error: 'Bad response' };
        let rfpData = { success: false, error: 'Bad response' };
        try {
            svcData = await svcRes.json();
        } catch (_) {}
        try {
            rfpData = await rfpRes.json();
        } catch (_) {}
        mount.innerHTML = '';

        const svcHeading = document.createElement('h4');
        svcHeading.style.cssText = 'font-size:14px;margin:0 0 8px;color:var(--text-main);';
        svcHeading.textContent = 'Published services (database)';
        mount.appendChild(svcHeading);

        if (!svcData.success) {
            const p = document.createElement('p');
            p.style.color = '#EF4444';
            p.textContent = svcData.error || 'Services unavailable';
            mount.appendChild(p);
        } else if (!(svcData.data || []).length) {
            const p = document.createElement('p');
            p.className = 'text-muted';
            p.style.fontSize = '13px';
            p.textContent = 'No services yet — use New → Publish Service.';
            mount.appendChild(p);
        } else {
            (svcData.data || []).forEach((s) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.style.padding = '16px';
                card.innerHTML =
                    '<h4 style="margin:0 0 6px;">' +
                    escapeHtml(s.agency_name) +
                    '</h4><p style="margin:0;font-size:13px;color:var(--text-muted);">' +
                    escapeHtml(s.service_domain) +
                    ' · ' +
                    escapeHtml(s.starting_price) +
                    '</p><p style="margin:10px 0 0;font-size:14px;">' +
                    escapeHtml(s.description) +
                    '</p><p style="margin:8px 0 0;font-size:11px;color:var(--text-muted);">' +
                    escapeHtml(s.created_at) +
                    '</p>';
                mount.appendChild(card);
            });
        }

        const rfpHeading = document.createElement('h4');
        rfpHeading.style.cssText =
            'font-size:14px;margin:20px 0 8px;color:var(--text-main);';
        rfpHeading.textContent = 'Procurement requests (database)';
        mount.appendChild(rfpHeading);

        if (!rfpData.success) {
            const p = document.createElement('p');
            p.style.color = '#EF4444';
            p.textContent = rfpData.error || 'Procurement list unavailable';
            mount.appendChild(p);
        } else if (!(rfpData.data || []).length) {
            const p = document.createElement('p');
            p.className = 'text-muted';
            p.style.fontSize = '13px';
            p.textContent = 'No RFPs yet — Post Procurement Request.';
            mount.appendChild(p);
        } else {
            (rfpData.data || []).forEach((r) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.style.cssText = 'padding:16px;border-left:3px solid #EF4444;';
                card.innerHTML =
                    '<span class="badge" style="background:#FEE2E2;color:#991B1B;">RFP</span>' +
                    '<p style="margin:10px 0 0;font-size:14px;">' +
                    escapeHtml(r.description) +
                    '</p>' +
                    '<p style="margin:8px 0 0;font-size:12px;color:var(--text-muted);">Budget: ' +
                    escapeHtml(r.budget || '—') +
                    ' · ' +
                    escapeHtml(r.vendor_tier || '') +
                    '</p><p style="margin:4px 0 0;font-size:11px;color:var(--text-muted);">' +
                    escapeHtml(r.created_at) +
                    '</p>';
                mount.appendChild(card);
            });
        }
    } catch (err) {
        console.error(err);
        mount.innerHTML = '<p style="color:#EF4444;">Could not load services.</p>';
    }
};

window.submitLiveJob = async function () {
    const title = document.getElementById('job-input-title')?.value.trim();
    const tier = document.getElementById('job-input-tier')?.value;
    const salary = document.getElementById('job-input-salary')?.value.trim();
    const tags = document.getElementById('job-input-tags')?.value.trim() || '';

    if (!title || !salary) {
        alert('Please add a job title and compensation.');
        return;
    }

    const companyName = getJobCompanyName();
    const payload = {
        role_title: title,
        company_name: companyName,
        location: getJobLocation(),
        tier: tier || 'Full Time',
        salary: salary,
        tags: tags,
    };

    const btn = document.getElementById('btn-submit-job');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Listing…';
    }

    try {
        const res = await fetch(apiUrl('/api/jobs'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('job-input-title').value = '';
            document.getElementById('job-input-salary').value = '';
            document.getElementById('job-input-tags').value = '';
            closeModal();
            window.switchTab('jobs');
            loadLiveJobs();
        } else {
            alert(data.error || 'Could not publish job.');
        }
    } catch (err) {
        alert('Failed to connect to backend.');
    }
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'List Role';
    }
};

window.submitLiveFunding = async function () {
    const target = document.getElementById('fund-input-target')?.value.trim();
    const round = document.getElementById('fund-input-round')?.value;
    const tags = document.getElementById('fund-input-tags')?.value.trim();

    if (!target || !tags) {
        alert('Please add target amount and startup / category details.');
        return;
    }

    const sName = getFundingStartupName().replace(/\s+/g, ' ').trim();

    const payload = {
        startup_name: sName,
        round_type: round || 'Seed',
        target_capital: target,
        domain_tags: tags,
    };

    const btn = document.getElementById('btn-submit-funding');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Submitting…';
    }

    try {
        const res = await fetch(apiUrl('/api/funding'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('fund-input-target').value = '';
            document.getElementById('fund-input-tags').value = '';
            closeModal();
            window.switchTab('funding');
            loadLiveFunding();
        } else {
            alert(data.error || 'Could not submit funding request.');
        }
    } catch (err) {
        alert('Failed to connect to backend.');
    }
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-rocket-launch"></i> Submit Request';
    }
};

window.submitLiveEvent = async function () {
    const eventName = document.getElementById('event-input-name')?.value.trim();
    const host = document.getElementById('event-input-host')?.value.trim();
    const dt = document.getElementById('event-input-datetime')?.value;
    const ticketRaw = document.getElementById('event-input-cost')?.value;
    const description = document.getElementById('event-input-description')?.value.trim() || '';

    if (!eventName || !host) {
        alert('Event name and host are required.');
        return;
    }

    const eventDate = dt
        ? dt.replace('T', ' ')
        : 'TBD';

    const btn = document.getElementById('btn-submit-event');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner"></i> Saving…';
    }

    try {
        const res = await fetch(apiUrl('/api/events'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_name: eventName,
                host_name: host,
                event_date: eventDate,
                ticket_cost: parseInt(ticketRaw, 10) || 0,
                description: description,
            }),
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('event-input-name').value = '';
            document.getElementById('event-input-host').value = '';
            document.getElementById('event-input-datetime').value = '';
            document.getElementById('event-input-cost').value = '0';
            document.getElementById('event-input-description').value = '';
            closeModal();
            window.switchTab('events');
            loadEvents();
        } else {
            alert(data.error || 'Could not create event.');
        }
    } catch (e) {
        alert('Server error creating event.');
    }
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-calendar-plus"></i> Launch Event';
    }
};

window.submitLiveService = async function () {
    const title = document.getElementById('service-input-title')?.value.trim();
    const domain = document.getElementById('service-input-domain')?.value.trim();
    const price = document.getElementById('service-input-price')?.value.trim();
    const desc = document.getElementById('service-input-description')?.value.trim();

    if (!title || !desc) {
        alert('Title and description are required.');
        return;
    }

    const userType = localStorage.getItem('currentUserType') || 'individual';
    const agencyName =
        userType === 'company'
            ? document.getElementById('comp-prof-name')?.innerText?.trim() ||
              'Agency'
            : document.getElementById('prof-fullname')?.innerText?.trim() ||
              'Consultant';

    const btn = document.getElementById('btn-submit-service');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Publishing…';
    }

    try {
        const res = await fetch(apiUrl('/api/services'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                agency_name: agencyName + ' — ' + title,
                service_domain: domain || 'General',
                starting_price: price || 'Contact for quote',
                description: desc,
            }),
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('service-input-title').value = '';
            document.getElementById('service-input-price').value = '';
            document.getElementById('service-input-description').value = '';
            closeModal();
            window.switchTab('services');
            loadLiveServices();
        } else {
            alert(data.error || 'Could not publish service.');
        }
    } catch (e) {
        alert('Server error.');
    }
    if (btn) {
        btn.disabled = false;
        btn.textContent = 'Publish Service';
    }
};

window.submitLiveServiceRequest = async function () {
    const desc = document.getElementById('service-request-description')?.value.trim();
    const budget = document.getElementById('service-request-budget')?.value.trim() || '';
    const tier =
        document.getElementById('service-request-vendor-tier')?.value.trim() || '';

    if (!desc) {
        alert('Please describe what you are looking to buy.');
        return;
    }

    const email =
        localStorage.getItem('platformAuthEmail') ||
        localStorage.getItem('emailForSignIn') ||
        '';

    const btn = document.getElementById('btn-submit-service-request');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner"></i> Posting…';
    }

    try {
        const res = await fetch(apiUrl('/api/procurement'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                buyer_email: email,
                budget: budget,
                vendor_tier: tier,
                description: desc,
            }),
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('service-request-description').value = '';
            document.getElementById('service-request-budget').value = '';
            closeModal();
            window.switchTab('services');
            loadLiveServices();
        } else {
            alert(data.error || 'Could not post request.');
        }
    } catch (e) {
        alert('Server error.');
    }
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-shopping-bag"></i> Post Bidding Request';
    }
};

/* ==================================================
   WALLET & EVENTS SYSTEM
================================================== */
window.loadWallet = async function () {
    const email =
        window.platformAuthEmail ||
        window.localStorage.getItem('platformAuthEmail') ||
        'sys@auth.local';
    try {
        const res = await fetch(apiUrl('/api/wallet/' + encodeURIComponent(email)));
        const data = await res.json();
        if (data.success) {
            document.querySelectorAll('.wallet-balance').forEach((b) => {
                b.innerText = data.balance;
            });

            const ledgerEl = document.getElementById('wallet-ledger');
            if (ledgerEl) {
                ledgerEl.innerHTML = '';
                (data.transactions || []).forEach((t) => {
                    const color = t.amount < 0 ? '#EF4444' : '#10B981';
                    const sign = t.amount < 0 ? '' : '+';
                    const row = document.createElement('div');
                    row.className = 'flex-between';
                    row.style.cssText =
                        'padding-bottom:12px; border-bottom:1px solid var(--border); margin-bottom:12px;';
                    row.innerHTML =
                        '<div>' +
                        '<span style="font-size:13px; font-weight:600; display:block; color:var(--text-main);">' +
                        escapeHtml(t.description) +
                        '</span>' +
                        '<span style="font-size:11px; color:var(--text-muted);">' +
                        escapeHtml(t.date) +
                        ' | ' +
                        escapeHtml(String(t.transaction_type || '').toUpperCase()) +
                        '</span>' +
                        '</div>' +
                        '<span style="font-weight:700; color:' +
                        color +
                        ';">' +
                        sign +
                        escapeHtml(String(t.amount)) +
                        ' Credits</span>';
                    ledgerEl.appendChild(row);
                });
            }
        }
    } catch (err) {
        console.error('Wallet Fetch Error:', err);
    }
};

window.purchaseTicket = async function (eventId, btnEl) {
    if (
        !confirm(
            'Purchase this ticket using wallet credits?'
        )
    ) {
        return;
    }
    const email =
        window.platformAuthEmail ||
        window.localStorage.getItem('platformAuthEmail') ||
        'sys@auth.local';
    const oldText = btnEl.innerHTML;
    btnEl.innerHTML = '<i class="ph ph-spinner"></i> Processing...';
    btnEl.disabled = true;
    try {
        const res = await fetch(apiUrl('/api/tickets/purchase'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, event_id: eventId }),
        });
        const data = await res.json();
        if (data.success) {
            btnEl.innerHTML = '<i class="ph ph-check"></i> Ticket Minted';
            btnEl.style.background = '#10B981';
            window.loadWallet();
        } else {
            alert(data.error || 'Purchase failed');
            btnEl.innerHTML = oldText;
            btnEl.disabled = false;
        }
    } catch (err) {
        alert('Transaction failed. Is the API running?');
        btnEl.innerHTML = oldText;
        btnEl.disabled = false;
    }
};

window.loadEvents = async function () {
    try {
        const res = await fetch(apiUrl('/api/events'));
        const data = await res.json();
        if (data.success) {
            const container = document.getElementById('events-container');
            if (container) {
                container.innerHTML = '';
                (data.data || []).forEach((e) => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.style.borderTop = '4px solid var(--trust-blue)';
                    card.innerHTML =
                        '<h3 style="font-size:18px; margin-bottom:4px; color:var(--text-main);">' +
                        escapeHtml(e.event_name) +
                        '</h3>' +
                        '<p style="font-size:13px; color:var(--text-muted); margin-bottom:12px;"><i class="ph-fill ph-calendar text-blue"></i> ' +
                        escapeHtml(e.event_date) +
                        ' | Hosted by: ' +
                        escapeHtml(e.host_name) +
                        '</p>' +
                        '<p style="font-size:14px; margin-bottom:16px; color:rgba(255,255,255,0.85);">' +
                        escapeHtml(e.description) +
                        '</p>' +
                        '<div class="flex-between" style="border-top:1px dashed var(--border); padding-top:16px;">' +
                        '<span style="font-size:16px; font-weight:700; color:var(--deal-green);"><i class="ph-fill ph-coin"></i> ' +
                        escapeHtml(String(e.ticket_cost)) +
                        ' Credits</span>' +
                        '</div>';
                    const buyWrap = card.querySelector('.flex-between');
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-primary';
                    btn.type = 'button';
                    btn.textContent = 'Purchase Ticket';
                    btn.addEventListener('click', function () {
                        window.purchaseTicket(e.id, btn);
                    });
                    buyWrap.appendChild(btn);
                    container.appendChild(card);
                });
            }
        }
    } catch (err) {
        console.error('Events Database Error:', err);
    }
};
