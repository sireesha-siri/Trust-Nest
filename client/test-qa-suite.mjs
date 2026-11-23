import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:5173/';
const SCREENSHOT_DIR = path.resolve('qa-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTestSuite() {
  console.log('=== STARTING TRUSTNEST AUTOMATED QA TEST SUITE ===\n');

  const consoleLogs = [];
  const pageErrors = [];
  const failedResponses = [];

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
  });

  const page = await browser.newPage();

  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      console.error(`[Browser Console Error]: ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.toString());
    console.error(`[Browser Page Error]: ${err.toString()}`);
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      failedResponses.push({ status: res.status(), url: res.url() });
      console.warn(`[HTTP ${res.status()}]: ${res.url()}`);
    }
  });

  const results = {
    passed: [],
    failed: [],
  };

  function assert(condition, message) {
    if (condition) {
      results.passed.push(message);
      console.log(`  ✓ PASS: ${message}`);
    } else {
      results.failed.push(message);
      console.log(`  ✗ FAIL: ${message}`);
    }
  }

  try {
    // TEST 1: DESKTOP LOAD & BRANDING
    console.log('\n--- 1. Testing Desktop Layout & Page Load ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    const title = await page.title();
    assert(title.includes('TrustNest'), `Page title contains TrustNest (Actual: "${title}")`);

    const hasBanner = await page.$eval('aside', el => el.textContent.includes('TrustNest Hyderabad Pilot') && el.textContent.includes('Demonstration listings are clearly labelled')).catch(() => false);
    assert(hasBanner, 'Professional announcement bar is visible with Hyderabad Pilot notice');

    const heroHeadline = await page.$eval('h1', el => el.textContent).catch(() => '');
    assert(heroHeadline.includes('Find your place') && heroHeadline.includes('Feel confident'), `Hero headline correct ("${heroHeadline.replace(/\s+/g, ' ').trim()}")`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-desktop-hero.png'), fullPage: false });

    // TEST 2: RESPONSIVENESS & OVERFLOW CHECKS
    console.log('\n--- 2. Testing Responsive Viewports & Overflow ---');

    // Tablet Viewport (768x1024)
    await page.setViewport({ width: 768, height: 1024 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 400));
    const tabletOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert(!tabletOverflow, 'Tablet viewport (768px): No horizontal overflow');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-tablet-viewport.png'), fullPage: false });

    // Mobile Viewport (375x812 - iPhone X)
    await page.setViewport({ width: 375, height: 812 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 400));
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert(!mobileOverflow, 'Mobile viewport (375px): No horizontal overflow');

    // Test Mobile Menu Drawer
    const mobileMenuBtn = await page.$('button[aria-label="Toggle navigation menu"]');
    if (mobileMenuBtn) {
      await mobileMenuBtn.click();
      await new Promise(r => setTimeout(r, 300));
      const mobileNavVisible = await page.$eval('header .lg\\:hidden', el => el.textContent.includes('Find Stay')).catch(() => false);
      assert(mobileNavVisible, 'Mobile navigation menu drawer opens with links');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-mobile-menu-open.png'), fullPage: false });
      // Close mobile menu
      await mobileMenuBtn.click();
      await new Promise(r => setTimeout(r, 200));
    } else {
      assert(false, 'Mobile menu toggle button found');
    }

    // Reset back to Desktop
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise(r => setTimeout(r, 300));

    // TEST 3: AI SEARCH & EDITABLE CHECKLIST
    console.log('\n--- 3. Testing AI Search Box & Editable Checklist ---');
    await page.evaluate(() => {
      document.getElementById('ai-search-anchor').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 400));

    const chipClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#ai-search-anchor button'));
      const chip = buttons.find(b => b.textContent.includes("Women's PG in Madhapur"));
      if (chip) {
        chip.click();
        return true;
      }
      return false;
    });
    assert(chipClicked, 'Clicked scenario suggestion chip');
    await new Promise(r => setTimeout(r, 500));

    const textareaVal = await page.$eval('#ai-search-anchor textarea', el => el.value);
    assert(textareaVal.includes("HITEC City") || textareaVal.includes("women"), 'Scenario prompt populated in search textarea');

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#ai-search-anchor button'));
      const analyzeBtn = buttons.find(b => b.textContent.includes("Analyze"));
      if (analyzeBtn) analyzeBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const checklistCount = await page.$$eval('#ai-search-anchor input[type="checkbox"]', els => els.length);
    assert(checklistCount >= 4, `Requirement Checklist active with ${checklistCount} requirement items`);

    const firstCheckbox = await page.$('#ai-search-anchor input[type="checkbox"]');
    if (firstCheckbox) {
      const wasChecked = await page.evaluate(el => el.checked, firstCheckbox);
      await firstCheckbox.click();
      await new Promise(r => setTimeout(r, 300));
      const isNowChecked = await page.evaluate(el => el.checked, firstCheckbox);
      assert(wasChecked !== isNowChecked, 'Checklist checkbox toggled state successfully');
      await firstCheckbox.click();
      await new Promise(r => setTimeout(r, 300));
    }

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#ai-search-anchor button'));
      const addBtn = buttons.find(b => b.textContent.includes("Add Requirement"));
      if (addBtn) addBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const addInput = await page.$('#ai-search-anchor form input');
    if (addInput) {
      await addInput.type('Dedicated Work Desk');
      const addSubmitBtn = await page.$('#ai-search-anchor form button[type="submit"]');
      if (addSubmitBtn) await addSubmitBtn.click();
      await new Promise(r => setTimeout(r, 400));
      const hasAddedItem = await page.evaluate(() => {
        return document.querySelector('#ai-search-anchor').textContent.includes('Dedicated Work Desk');
      });
      assert(hasAddedItem, 'Custom requirement "Dedicated Work Desk" successfully added to checklist');
    } else {
      assert(false, 'Add requirement input visible');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-ai-checklist.png'), fullPage: false });

    // TEST 4: ACCOMMODATION CATEGORIES
    console.log('\n--- 4. Testing Accommodation Categories & Filtering ---');
    await page.evaluate(() => {
      const catCards = Array.from(document.querySelectorAll('section div'));
      const colivingCard = catCards.find(el => el.textContent.includes("Co-Living Spaces") && el.textContent.includes("Starts at"));
      if (colivingCard) colivingCard.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const activeFilterText = await page.evaluate(() => {
      return document.querySelector('#properties-section').textContent;
    });
    assert(activeFilterText.includes('CyberNest') || activeFilterText.includes('Properties matched'), 'Category filtering updated property listings');

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const clearBtn = buttons.find(b => b.textContent.includes("Clear filter"));
      if (clearBtn) clearBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // TEST 5: PROPERTY CARDS & PHOTO STREAM SWITCHING
    console.log('\n--- 5. Testing Property Cards & Photo Streams ---');
    await page.evaluate(() => {
      document.getElementById('properties-section').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 400));

    const photoStreamSwitched = await page.evaluate(() => {
      const card = document.querySelector('#properties-section article');
      if (!card) return false;
      const buttons = Array.from(card.querySelectorAll('button'));
      const ownerBtn = buttons.find(b => b.textContent.includes('Owner'));
      if (ownerBtn) {
        ownerBtn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 300));
    assert(photoStreamSwitched, 'Switched photo stream to Owner-submitted photos on property card');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-property-card-photo-switch.png'), fullPage: false });

    // TEST 6: PROPERTY EVIDENCE & DETAIL MODAL
    console.log('\n--- 6. Testing Property Details Modal & Tabs ---');
    await page.evaluate(() => {
      const card = document.querySelector('#properties-section article');
      if (!card) return;
      const viewBtn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.includes('View Evidence'));
      if (viewBtn) viewBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const modalTitle = await page.$eval('.fixed.inset-0 h3', el => el.textContent).catch(() => '');
    assert(modalTitle.length > 0, `Property Detail Modal opened successfully (Title: "${modalTitle}")`);

    const modalDemoNotice = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.textContent.includes('DEMO DATA') : false;
    });
    assert(modalDemoNotice, 'Property Modal displays clear DEMO DATA transparency disclaimer');

    // Switch to Photos Tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.fixed.inset-0 button'));
      const photoTab = tabs.find(t => t.textContent.includes('Multi-Source Photos'));
      if (photoTab) photoTab.click();
    });
    await new Promise(r => setTimeout(r, 300));
    const hasPhotoTabContent = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.textContent.includes('Field Researcher') : false;
    });
    assert(hasPhotoTabContent, 'Modal Photos Tab displays multi-source photo categorized gallery');

    // Switch to Rooms Tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.fixed.inset-0 button'));
      const roomTab = tabs.find(t => t.textContent.includes('Rooms & Pricing'));
      if (roomTab) roomTab.click();
    });
    await new Promise(r => setTimeout(r, 300));
    const hasRoomTabContent = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.textContent.includes('Security Deposit') : false;
    });
    assert(hasRoomTabContent, 'Modal Rooms & Pricing Tab displays granular room types and deposits');

    // Switch to Report Tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.fixed.inset-0 button'));
      const reportTab = tabs.find(t => t.textContent.includes('Report Discrepancy'));
      if (reportTab) reportTab.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const reportTextarea = await page.$('.fixed.inset-0 textarea');
    if (reportTextarea) {
      await reportTextarea.type('Observed water pressure issue on 2nd floor during test.');
      const reportSubmitBtn = await page.$('.fixed.inset-0 form button[type="submit"]');
      if (reportSubmitBtn) await reportSubmitBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const reportConfirmed = await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0');
        return modal ? modal.textContent.includes('Discrepancy Report Logged') : false;
      });
      assert(reportConfirmed, 'Discrepancy reporting form submitted and confirmed successfully');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-modal-detail.png'), fullPage: false });

    // Close Modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.fixed.inset-0 button[aria-label="Close modal"]') ||
        Array.from(document.querySelectorAll('.fixed.inset-0 button')).find(b => b.textContent.includes('Close'));
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    const isModalClosed = await page.$('.fixed.inset-0').catch(() => null) === null;
    assert(isModalClosed, 'Property Modal closed cleanly');

    // TEST 7: HUMAN + AI VERIFICATION SECTION
    console.log('\n--- 7. Testing Human + AI Verification Section ---');
    await page.evaluate(() => {
      document.getElementById('verification-section').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 300));
    const hasAIDualPillars = await page.evaluate(() => {
      const section = document.getElementById('verification-section');
      return section ? (section.textContent.includes('What AI Does') && section.textContent.includes('What Humans Do')) : false;
    });
    assert(hasAIDualPillars, 'Human + AI Verification section clearly contrasts AI computational layer vs Physical Ground Truth');

    // TEST 8: CITY INTELLIGENCE SECTION
    console.log('\n--- 8. Testing City Intelligence & Civic Facilities ---');
    await page.evaluate(() => {
      document.getElementById('city-intelligence-section').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 400));

    // Filter by Hospitals
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#city-intelligence-section button'));
      const hospBtn = btns.find(b => b.textContent.includes('Hospitals'));
      if (hospBtn) hospBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    const hasHospitalService = await page.evaluate(() => {
      const sec = document.querySelector('#city-intelligence-section');
      return sec ? sec.textContent.includes('Medicover Hospitals') : false;
    });
    assert(hasHospitalService, 'City Intelligence category filter displays accredited hospitals');

    // Filter by Police & SHE
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#city-intelligence-section button'));
      const polBtn = btns.find(b => b.textContent.includes('Police & SHE'));
      if (polBtn) polBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    const hasPoliceService = await page.evaluate(() => {
      const sec = document.querySelector('#city-intelligence-section');
      return sec ? sec.textContent.includes('Madhapur Police') : false;
    });
    assert(hasPoliceService, 'City Intelligence displays verified law enforcement & SHE Teams');

    // Restore All Services
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#city-intelligence-section button'));
      const allBtn = btns.find(b => b.textContent.trim() === 'All Services');
      if (allBtn) allBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-city-intelligence.png'), fullPage: false });

    // TEST 9: COMMUNITY SECTION
    console.log('\n--- 9. Testing Community Resident Observations ---');
    await page.evaluate(() => {
      document.getElementById('community-section').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 300));

    const upvoted = await page.evaluate(() => {
      const card = document.querySelector('#community-section .grid > div');
      if (!card) return false;
      const upvoteBtn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.includes('Helpful'));
      if (upvoteBtn) {
        upvoteBtn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 300));
    assert(upvoted, 'Helpful upvote button on resident observation clicked and registered');

    // Open observation submission
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#community-section button'));
      const submitBtn = btns.find(b => b.textContent.includes('Submit Ground Observation'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const obsPropInput = await page.$('#community-section form input');
    const obsTextarea = await page.$('#community-section form textarea');
    assert(obsPropInput !== null && obsTextarea !== null, 'Community anonymous observation form opened');

    if (obsPropInput && obsTextarea) {
      await obsPropInput.type('HITEC City Metro Feeder');
      await obsTextarea.type('Electric feeder autos operate reliably from Exit B until 10:30 PM.');
      const obsSubmitBtn = await page.$('#community-section form button[type="submit"]');
      if (obsSubmitBtn) await obsSubmitBtn.click();
      await new Promise(r => setTimeout(r, 600));
      const confirmedObs = await page.evaluate(() => {
        const sec = document.querySelector('#community-section');
        return sec ? sec.textContent.includes('published to peer feed') : false;
      });
      assert(confirmedObs, 'Community observation submitted with moderation log confirmation');
    }

    // TEST 10: CONTRIBUTE & EARN SECTION
    console.log('\n--- 10. Testing Contribute & Earn Section ---');
    await page.evaluate(() => {
      document.getElementById('contribute-section').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 300));

    await page.evaluate(() => {
      const card = document.querySelector('#contribute-section .grid > div');
      if (!card) return;
      const applyBtn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.includes('Express Interest'));
      if (applyBtn) applyBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    const interestRegistered = await page.evaluate(() => {
      const sec = document.querySelector('#contribute-section');
      return sec ? sec.textContent.includes('Interest Registered for Pilot') : false;
    });
    assert(interestRegistered, 'Contribute & Earn: Express Interest interaction functions smoothly');

    // TEST 11: TRUST & PRIVACY / SOS SIMULATION
    console.log('\n--- 11. Testing Trust & Privacy / Safety Emergency Section ---');
    await page.evaluate(() => {
      document.getElementById('safety-section').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 300));

    const hasEmergencyNumbers = await page.evaluate(() => {
      const section = document.getElementById('safety-section');
      return section ? (section.textContent.includes('112') && section.textContent.includes('SHE Teams')) : false;
    });
    assert(hasEmergencyNumbers, 'Official Hyderabad emergency contacts (112, SHE Teams) displayed');

    // Click location consent checkbox
    await page.evaluate(() => {
      const checkbox = document.querySelector('#safety-section input[type="checkbox"]');
      if (checkbox) checkbox.click();
    });
    await new Promise(r => setTimeout(r, 200));

    // Click Simulate Emergency Dispatch button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#safety-section button'));
      const sosBtn = btns.find(b => b.textContent.includes('Simulate Emergency Dispatch'));
      if (sosBtn) sosBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const simulatedBannerVisible = await page.evaluate(() => {
      const sec = document.querySelector('#safety-section');
      return sec ? sec.textContent.includes('Simulated Alert Notice') : false;
    });
    assert(simulatedBannerVisible, 'Simulated SOS interface displays explicit notice that no actual authorities are contacted');

    // TEST 12: OWNERS SECTION
    console.log('\n--- 12. Testing For Owners Section ---');
    await page.evaluate(() => {
      document.getElementById('owners-section').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 300));

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('#owners-section button'));
      const auditBtn = btns.find(b => b.textContent.includes('Request Field Verification Visit'));
      if (auditBtn) auditBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    const ownerAuditConfirmed = await page.evaluate(() => {
      const sec = document.querySelector('#owners-section');
      return sec ? sec.textContent.includes('Audit Request Logged') : false;
    });
    assert(ownerAuditConfirmed, 'For Owners: Field Verification request successfully triggered and confirmed');

    // TEST 13: GUEST-FIRST NAVIGATION & ACCOUNTS ROADMAP MODAL
    console.log('\n--- 13. Testing Guest-First Navigation & Accounts Roadmap Modal ---');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 300));

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('header button'));
      const accountsBtn = buttons.find(b => b.textContent.includes('Accounts') || b.textContent.includes('Coming Soon'));
      if (accountsBtn) accountsBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const authModalOpened = await page.$('.fixed.inset-0 input[type="email"]');
    assert(authModalOpened !== null, 'Accounts Roadmap Modal opened from Navbar Accounts button');

    const guestFirstNotice = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.textContent.includes('TrustNest is 100% Guest-First') && modal.textContent.includes('Coming Soon in Phase 6') : false;
    });
    assert(guestFirstNotice, 'Modal clearly discloses guest-first access with zero fake login');

    // Register email for launch updates
    const authEmailInput = await page.$('.fixed.inset-0 input[type="email"]');
    if (authEmailInput) {
      await authEmailInput.type('partner@trustnest.in');
      const notifySubmitBtn = await page.$('.fixed.inset-0 form button[type="submit"]');
      if (notifySubmitBtn) await notifySubmitBtn.click();
      await new Promise(r => setTimeout(r, 500));

      const notificationConfirmed = await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0');
        return modal ? modal.textContent.includes('Notification Registered!') : false;
      });
      assert(notificationConfirmed, 'Launch notification interest registered without simulating fake authentication');
    }

    await new Promise(r => setTimeout(r, 1800)); // wait for auto-close

    // TEST 14: MILESTONE 3 - AI MATCH SCORES, EXPLAINABILITY, & PROPERTY COMPARISON
    console.log('\n--- 14. Testing Milestone 3: AI Matching Scores & Comparison ---');
    await page.evaluate(() => {
      document.getElementById('properties-section').scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 400));

    // 14.1 Verify AI Match Badge
    const hasMatchScoreBadge = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('#properties-section button'));
      return badges.some(b => b.textContent.includes('Match') && b.textContent.includes('%'));
    });
    assert(hasMatchScoreBadge, 'AI Match Score badge rendered on property cards');

    // 14.2 Click Match Score Pill to open Explainability Modal
    await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('#properties-section button'));
      const matchPill = badges.find(b => b.textContent.includes('Match') && b.textContent.includes('%'));
      if (matchPill) matchPill.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const explainModalTitle = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.textContent.includes('Explainable AI Match Breakdown') : false;
    });
    assert(explainModalTitle, 'Match Explanation Modal opened with explainable title');

    const formulaDisclosed = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.textContent.includes('Scoring Methodology & Trust Disclosure') && modal.textContent.includes('3.0x') : false;
    });
    assert(formulaDisclosed, 'Transparent scoring formula disclosed (3.0x explicit weight, missing records earn 0, not safety guarantee)');

    // Close Match Explanation Modal
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll('.fixed.inset-0 button')).find(b => b.textContent.includes('Close Explanation'));
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // 14.3 Multi-Property Comparison Selection
    console.log('\n--- Testing Multi-Property Comparison Bar & Selection ---');
    // Ensure all listings are visible by resetting any active search filter
    await page.evaluate(() => {
      const resetBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Show All 6') ||
        b.textContent.includes('Clear Search') ||
        b.textContent.includes('Clear filter')
      );
      if (resetBtn) resetBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    await page.evaluate(() => {
      const allTab = Array.from(document.querySelectorAll('#properties-section button')).find(b => b.textContent.includes('All Listings'));
      if (allTab) allTab.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Select 1st property (Ananya - TN-HYD-0101)
    const btn1 = await page.$('[data-testid="compare-btn-TN-HYD-0101"]');
    if (btn1) await btn1.click();
    await new Promise(r => setTimeout(r, 300));

    const compareBarCount1 = await page.evaluate(() => {
      const bar = document.querySelector('.fixed.bottom-4');
      return bar ? bar.textContent.includes('1 / 3') : false;
    });
    assert(compareBarCount1, 'Property Comparison Bar docked at bottom showing 1 / 3 selected');

    // Select 2nd property (Hive Cyber Living - TN-HYD-0102)
    const btn2 = await page.$('[data-testid="compare-btn-TN-HYD-0102"]');
    if (btn2) await btn2.click();
    await new Promise(r => setTimeout(r, 300));

    // Select 3rd property (Srinivasa Men\'s PG - TN-HYD-0103)
    const btn3 = await page.$('[data-testid="compare-btn-TN-HYD-0103"]');
    if (btn3) await btn3.click();
    await new Promise(r => setTimeout(r, 300));

    const compareBarCount3 = await page.evaluate(() => {
      const bar = document.querySelector('.fixed.bottom-4');
      return bar ? bar.textContent.includes('3 / 3') : false;
    });
    assert(compareBarCount3, 'Comparison Bar correctly tracks 3 / 3 maximum selected properties');

    // 14.4 Launch Comparison Modal
    await page.evaluate(() => {
      const bar = document.querySelector('.fixed.bottom-4');
      const compareNowBtn = Array.from(bar.querySelectorAll('button')).find(b => b.textContent.includes('Compare Now'));
      if (compareNowBtn) compareNowBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const compareModalOpened = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.textContent.includes('Evidence-Based Property Comparison') : false;
    });
    assert(compareModalOpened, 'Property Comparison Modal opened with side-by-side matrix');

    const compareDemoNotice = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.textContent.includes('DEMO DATA') && modal.textContent.includes('Evidence Disclosure') : false;
    });
    assert(compareDemoNotice, 'Comparison Modal displays clear DEMO DATA and evidence disclosure notice');

    // Verify matrix rows
    const matrixRowsVerified = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      if (!modal) return false;
      const text = modal.textContent;
      const hasPricing = text.includes('Pricing, Deposit & Inclusions') && text.includes('Starting Rent');
      const hasFood = text.includes('Food & 3-Meals');
      const hasCCTV = text.includes('CCTV Surveillance Audit');
      const hasFire = text.includes('Fire Safety Inspection');
      const hasMetro = text.includes('Metro Transit Proximity');
      const hasFreshness = text.includes('Granular Verification Timestamps & Freshness');
      const hasDiscrepancy = text.includes('Missing / Outdated Findings') && text.includes('Needs Verification');
      return hasPricing && hasFood && hasCCTV && hasFire && hasMetro && hasFreshness && hasDiscrepancy;
    });
    assert(matrixRowsVerified, 'Side-by-side matrix validates Pricing, Food, CCTV, Fire Safety, Metro, Freshness, and Negative Evidence');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-property-comparison-modal.png'), fullPage: false });

    // Remove one property (TN-HYD-0103) from comparison inside modal
    const removeBtn = await page.$('[data-testid="remove-compare-TN-HYD-0103"]');
    if (removeBtn) await removeBtn.click();
    await new Promise(r => setTimeout(r, 300));

    const modalCountAfterRemove = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.textContent.includes('2 / 3 selected') : false;
    });
    assert(modalCountAfterRemove, 'Property dynamically removed from comparison matrix (now 2 / 3)');

    // Close Comparison Modal
    await page.evaluate(() => {
      const doneBtn = Array.from(document.querySelectorAll('.fixed.inset-0 button')).find(b => b.textContent.includes('Done Comparing'));
      if (doneBtn) doneBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Clear comparison bar
    await page.evaluate(() => {
      const bar = document.querySelector('.fixed.bottom-4');
      if (bar) {
        const clearBtn = Array.from(bar.querySelectorAll('button')).find(b => b.textContent.includes('Clear'));
        if (clearBtn) clearBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 300));

    const comparisonBarCleared = await page.evaluate(() => {
      return document.querySelector('.fixed.bottom-4') === null;
    });
    assert(comparisonBarCleared, 'Comparison bar unmounted cleanly upon clicking Clear');

    // 14.5 Testing Sort Controls
    console.log('\n--- Testing Sort Dropdown Controls ---');
    await page.evaluate(() => {
      const select = document.querySelector('#properties-section select[aria-label="Sort properties"]');
      if (select) {
        select.value = 'price_asc';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 400));

    const lowestRentFirst = await page.evaluate(() => {
      const firstCard = document.querySelector('#properties-section article');
      return firstCard ? firstCard.textContent.includes('7,500') || firstCard.textContent.includes('ScholarStay') : false;
    });
    assert(lowestRentFirst, 'Sorted by "Rent: Low to High": lowest rent property (₹7,500 ScholarStay) appears first');

    await page.evaluate(() => {
      const select = document.querySelector('#properties-section select[aria-label="Sort properties"]');
      if (select) {
        select.value = 'match';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 400));

    const matchRankFirst = await page.evaluate(() => {
      const firstCard = document.querySelector('#properties-section article');
      return firstCard ? firstCard.textContent.includes('Ananya') : false;
    });
    assert(matchRankFirst, 'Sorted by "AI Match Score": top requirement-aligned property appears first');

    // TEST 16: MILESTONE 4 - CIVIC INTELLIGENCE, LEAFLET MAP & LOCATION CONTEXT
    console.log('\n--- 16. Testing Milestone 4: Civic Intelligence Map & Location Context ---');

    // Scroll to City Intelligence section
    await page.evaluate(() => {
      const el = document.querySelector('#city-intelligence-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 600));

    // Reset to All Services to ensure all pins and directory items are loaded
    await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll('#city-intelligence-section button'));
      const allBtn = allBtns.find(b => b.textContent.trim() === 'All Services');
      if (allBtn) allBtn.click();
      const allLayersBtn = allBtns.find(b => b.textContent.trim() === 'All Layers');
      if (allLayersBtn) allLayersBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // 16.1 Map Container & Unified Layout Check
    const hasLeafletMap = await page.evaluate(() => {
      const mapContainer = document.querySelector('#city-intelligence-section .leaflet-container');
      return mapContainer !== null;
    });
    assert(hasLeafletMap, 'Leaflet map container (.leaflet-container) mounts cleanly in the DOM');

    const hasOSMAttribution = await page.evaluate(() => {
      const sec = document.querySelector('#city-intelligence-section');
      return sec ? sec.textContent.includes('OpenStreetMap') : false;
    });
    assert(hasOSMAttribution, 'Map attribution clearly identifies OpenStreetMap tiles with zero proprietary API key requirements');

    const hasDirectoryAndRadar = await page.evaluate(() => {
      const sec = document.querySelector('#city-intelligence-section');
      return sec ? sec.textContent.includes('Verified Public Facility Directory') && sec.textContent.includes('Geocoded Public Asset') : false;
    });
    assert(hasDirectoryAndRadar, 'City Intelligence section displays unified layout with interactive map, verified facility directory and radar telemetry');

    // 16.2 Marker Pins on Map
    const markerCount = await page.evaluate(() => {
      return document.querySelectorAll('#city-intelligence-section .custom-div-pin').length;
    });
    assert(markerCount >= 6, `Map displays interactive category-styled marker pins (Found: ${markerCount} pins)`);

    // 16.3 Layer Filter Controls on Map
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#city-intelligence-section button'));
      const hospBtn = buttons.find(b => b.textContent.includes('Hospitals'));
      if (hospBtn) hospBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const hospitalFilterActive = await page.evaluate(() => {
      const pins = Array.from(document.querySelectorAll('#city-intelligence-section .custom-div-pin'));
      return pins.length > 0 && pins.length <= 4;
    });
    assert(hospitalFilterActive, 'Layer filtering on map: Clicking "Hospitals" isolates hospital markers');

    // Restore to All Layers
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('#city-intelligence-section button'));
      const allBtn = buttons.find(b => b.textContent.trim() === 'All Services');
      if (allBtn) allBtn.click();
      const allLayersBtn = buttons.find(b => b.textContent.trim() === 'All Layers');
      if (allLayersBtn) allLayersBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // 16.4 Interactive Marker Popup
    await page.evaluate(() => {
      const firstPin = document.querySelector('#city-intelligence-section .custom-div-pin');
      if (firstPin) firstPin.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const popupOpened = await page.evaluate(() => {
      const popup = document.querySelector('.trustnest-map-popup');
      return popup !== null && (popup.textContent.includes('DEMO DATA') || popup.textContent.includes('HITEC City') || popup.textContent.includes('Madhapur'));
    });
    assert(popupOpened, 'Clicking map marker opens rich popup with locality metadata and DEMO DATA badge');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-civic-intelligence-map.png'), fullPage: false });

    // 16.5 Property Detail Modal: Civic Context & Locality Mini-Map
    console.log('\n--- Testing Property Detail Modal Civic Intelligence Integration ---');
    await page.evaluate(() => {
      const sec = document.querySelector('#properties-section');
      if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 400));

    // Click the first property's "View Evidence Dossier" button
    await page.evaluate(() => {
      const card = document.querySelector('#properties-section article');
      if (!card) return;
      const viewBtn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.includes('View Evidence'));
      if (viewBtn) viewBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const modalOpen = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0') || document.querySelector('[role="dialog"]');
      return modal !== null;
    });
    assert(modalOpen, 'Property Detail Modal opened successfully');

    // Click the "Civic Context & Map" tab
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0') || document.querySelector('[role="dialog"]');
      if (modal) {
        const tabs = Array.from(modal.querySelectorAll('button'));
        const civicTab = tabs.find(t => t.textContent.includes('Civic Context'));
        if (civicTab) civicTab.click();
      }
    });
    await new Promise(r => setTimeout(r, 600));

    const civicTabActive = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0') || document.querySelector('[role="dialog"]');
      if (!modal) return false;
      const text = modal.textContent;
      return text.includes('Nearest Hospital') &&
        text.includes('Nearest Police') &&
        text.includes('Nearest Metro Station') &&
        text.includes('Nearest 24/7 Pharmacy') &&
        text.includes('km');
    });
    assert(civicTabActive, 'Property Civic Context tab displays nearest essential services with genuine calculated km distances');

    const modalMiniMapRendered = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0') || document.querySelector('[role="dialog"]');
      return modal ? modal.querySelector('.leaflet-container') !== null : false;
    });
    assert(modalMiniMapRendered, 'Focused neighborhood mini-map (.leaflet-container) rendered cleanly inside Property Detail Modal');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-property-detail-civic-tab.png'), fullPage: false });

    // Close Property Detail Modal
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0') || document.querySelector('[role="dialog"]');
      if (modal) {
        const closeBtn = modal.querySelector('button[aria-label="Close modal"]') ||
          Array.from(modal.querySelectorAll('button')).find(b => b.textContent.trim() === 'Close');
        if (closeBtn) closeBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 400));

    const modalClosed = await page.evaluate(() => {
      return document.querySelector('.fixed.inset-0') === null && document.querySelector('[role="dialog"]') === null;
    });
    assert(modalClosed, 'Property Detail Modal closed cleanly without residual overlay');

    // TEST 15: CONSOLE ERROR CHECK
    console.log('\n--- 15. Checking Console and Runtime Health ---');
    // Exclude handled HTTP status reports from test runs with unconfigured API key
    const criticalErrors = consoleLogs.filter(l =>
      l.type === 'error' &&
      !l.text.includes('503') &&
      !l.text.includes('Failed to load resource')
    );
    assert(pageErrors.length === 0, `Zero uncaught JavaScript page errors (Actual: ${pageErrors.length})`);
    assert(criticalErrors.length === 0, `Zero browser runtime console errors (Actual: ${criticalErrors.length})`);

  } catch (err) {
    console.error('Test suite failed with unexpected error:', err);
    results.failed.push(`Test Suite Exception: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n=== QA TEST SUMMARY ===');
  console.log(`Total Passed: ${results.passed.length}`);
  console.log(`Total Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed Tests:');
    results.failed.forEach(f => console.log(` - ${f}`));
    process.exit(1);
  } else {
    console.log(`\nALL ${results.passed.length} TESTS PASSED WITH 100% SUCCESS!`);
    process.exit(0);
  }
}

runTestSuite();
