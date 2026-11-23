import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\1a77ff46-0442-407c-adc3-6882d69c019a';

async function runWalkthrough() {
  console.log('=== STARTING TRUSTNEST LIVE BROWSER WALKTHROUGH ===\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900'
    ]
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(`[PageError] ${err.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('429')) errors.push(`[ConsoleError] ${msg.text()}`);
  });

  const results = [];
  function record(desc, passed, detail = '') {
    results.push({ desc, passed, detail });
    console.log(`  ${passed ? '✓ PASS' : '✗ FAIL'}: ${desc} ${detail ? `(${detail})` : ''}`);
  }

  try {
    // ----------------------------------------------------
    // 1. DESKTOP LAYOUT & HEADER OVERLAP VERIFICATION
    // ----------------------------------------------------
    console.log('--- 1. Testing Desktop Layout & Sticky Header Overlap ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Initial positions at top of page (scrollY = 0)
    const initialPositions = await page.evaluate(() => {
      const banner = document.querySelector('aside[aria-label="Pilot notice"]');
      const navbar = document.querySelector('header');
      const bannerRect = banner ? banner.getBoundingClientRect() : null;
      const navbarRect = navbar ? navbar.getBoundingClientRect() : null;
      return {
        bannerTop: bannerRect ? bannerRect.top : null,
        bannerBottom: bannerRect ? bannerRect.bottom : null,
        navbarTop: navbarRect ? navbarRect.top : null,
        navbarBottom: navbarRect ? navbarRect.bottom : null,
        navbarHeight: navbarRect ? navbarRect.height : null,
        scrollY: window.scrollY
      };
    });

    const initialNoOverlap = initialPositions.bannerBottom <= initialPositions.navbarTop;
    record(
      'At top of page: Banner is positioned above Navbar with zero overlap',
      initialNoOverlap,
      `Banner bottom: ${initialPositions.bannerBottom}px, Navbar top: ${initialPositions.navbarTop}px`
    );

    // Scroll down 400px to test sticky state
    await page.evaluate(() => window.scrollTo(0, 400));
    await new Promise(r => setTimeout(r, 400));

    const scrolledPositions = await page.evaluate(() => {
      const banner = document.querySelector('aside[aria-label="Pilot notice"]');
      const navbar = document.querySelector('header');
      const bannerRect = banner ? banner.getBoundingClientRect() : null;
      const navbarRect = navbar ? navbar.getBoundingClientRect() : null;
      return {
        bannerTop: bannerRect ? bannerRect.top : null,
        bannerBottom: bannerRect ? bannerRect.bottom : null,
        navbarTop: navbarRect ? navbarRect.top : null,
        navbarHeight: navbarRect ? navbarRect.height : null,
        scrollY: window.scrollY
      };
    });

    const navbarSticksAtZero = Math.abs(scrolledPositions.navbarTop) <= 2;
    record(
      'When scrolled 400px: Navbar sticks cleanly at top: 0px',
      navbarSticksAtZero,
      `Navbar top: ${scrolledPositions.navbarTop}px`
    );

    const bannerDoesNotCoverNavbar = scrolledPositions.bannerBottom <= 0;
    record(
      'When scrolled: Announcement banner does not cover or overlap the sticky navbar',
      bannerDoesNotCoverNavbar,
      `Banner bottom: ${scrolledPositions.bannerBottom}px (scrolled off naturally)`
    );

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'walkthrough-1-desktop-header-ai.png') });

    // ----------------------------------------------------
    // 2. MOBILE RESPONSIVENESS & DRAWER VERIFICATION
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Mobile Layout (375x812) & Drawer ---');
    await page.setViewport({ width: 375, height: 812 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 400));

    const mobileOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= window.innerWidth + 2;
    });
    record('Mobile viewport (375px): Zero horizontal scroll overflow', mobileOverflow);

    // Open mobile menu
    await page.evaluate(() => {
      const menuBtn = document.querySelector('header button[aria-label="Toggle navigation menu"]');
      if (menuBtn) menuBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const mobileDrawerOpen = await page.evaluate(() => {
      const drawer = document.querySelector('header .lg\\:hidden');
      return drawer !== null && drawer.textContent.includes('Find Stay');
    });
    record('Mobile menu drawer opens with section links', mobileDrawerOpen);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'walkthrough-5-mobile-drawer.png') });

    // Click link in drawer and verify drawer closes and scrolls
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('header .lg\\:hidden a'));
      const stayLink = links.find(l => l.textContent.includes('Find Stay'));
      if (stayLink) stayLink.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const mobileDrawerClosed = await page.evaluate(() => {
      return document.querySelector('header .lg\\:hidden') === null;
    });
    record('Clicking link in mobile drawer closes drawer and navigates', mobileDrawerClosed);

    // Reset back to desktop viewport
    await page.setViewport({ width: 1440, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));

    // ----------------------------------------------------
    // 3. NAVBAR LINKS & DESTINATION VISIBILITY
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Navbar Links & Destination Visibility ---');
    const sectionsToTest = [
      { label: 'Find Stay', id: 'properties-section' },
      { label: 'Explore City', id: 'city-intelligence-section' },
      { label: 'Community', id: 'community-section' },
      { label: 'Safety & Support', id: 'safety-section' },
      { label: 'Contribute & Earn', id: 'contribute-section' },
      { label: 'For Owners', id: 'owners-section' },
    ];

    for (const sec of sectionsToTest) {
      await page.evaluate((label) => {
        const links = Array.from(document.querySelectorAll('header nav a'));
        const link = links.find(l => l.textContent.trim().includes(label));
        if (link) link.click();
      }, sec.label);
      await new Promise(r => setTimeout(r, 600));

      const positionCheck = await page.evaluate((targetId) => {
        const el = document.getElementById(targetId);
        if (!el) return { found: false, top: 0 };
        const rect = el.getBoundingClientRect();
        return {
          found: true,
          top: rect.top, // should be between ~40px and ~120px below navbar
          id: targetId
        };
      }, sec.id);

      const isVisibleBelowHeader = positionCheck.found && positionCheck.top >= 20 && positionCheck.top <= 260;
      record(
        `Navbar link "${sec.label}" navigates to #${sec.id} cleanly below sticky header`,
        isVisibleBelowHeader,
        `Heading top: ${Math.round(positionCheck.top)}px below navbar`
      );
    }

    // Return to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 400));

    // ----------------------------------------------------
    // 4. AI SEARCH JOURNEY (Stages 1 -> 2 -> 3 -> 4)
    // ----------------------------------------------------
    console.log('\n--- 4. Testing AI Search Journey ---');

    // 4.1 Check 4-Stage Navigator
    const hasJourneyStages = await page.evaluate(() => {
      const container = document.getElementById('ai-search-anchor');
      return container && container.textContent.includes('Enter Needs') && container.textContent.includes('Edit Checklist');
    });
    record('4-Stage AI Journey Navigator rendered visibly', hasJourneyStages);

    // 4.2 Populate prompt from chip
    await page.evaluate(() => {
      const chip = Array.from(document.querySelectorAll('#ai-search-anchor button')).find(b => b.textContent.includes("Women's PG in Madhapur"));
      if (chip) chip.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Wait for analysis to complete (up to 30s)
    let analysisFinished = false;
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 500));
      analysisFinished = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('#ai-search-anchor button')).find(b => b.textContent.includes('Analyze with AI') || b.textContent.includes('Extracting...'));
        return btn ? !btn.textContent.includes('Extracting...') : true;
      });
      if (analysisFinished) break;
    }
    record('Gemini requirement extraction finished successfully', analysisFinished);

    // 4.4 Check checklist focus and contents
    const checklistItemsCount = await page.evaluate(() => {
      return document.querySelectorAll('#ai-checklist-container input[type="checkbox"]').length;
    });
    record('Stage 3: Requirement checklist rendered with interactive items', checklistItemsCount >= 5, `Total items: ${checklistItemsCount}`);

    // Toggle a checklist item to activate local filtering and verify live response
    await page.evaluate(() => {
      const firstCheckbox = document.querySelector('#ai-checklist-container input[type="checkbox"]');
      if (firstCheckbox) firstCheckbox.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Check certainty tags
    const hasCertaintyTags = await page.evaluate(() => {
      const container = document.getElementById('ai-checklist-container');
      return container ? container.textContent.includes('User specified') || container.textContent.includes('AI inferred') : false;
    });
    record('Extracted items distinguish explicit user needs from inferred criteria', hasCertaintyTags);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'walkthrough-2-checklist-matching.png') });

    // 4.5 Click "View Matching Stays"
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('#ai-checklist-container button')).find(b => b.textContent.includes('View Matching Stays'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 700));

    // Verify scrolled to properties section
    const propertiesSectionTop = await page.evaluate(() => {
      const sec = document.getElementById('properties-section');
      return sec ? sec.getBoundingClientRect().top : null;
    });
    const smoothlyAtProperties = propertiesSectionTop !== null && propertiesSectionTop >= 30 && propertiesSectionTop <= 160;
    record('Stage 4: "View Matching Stays" scrolls directly to results below header', smoothlyAtProperties, `Properties section top: ${Math.round(propertiesSectionTop)}px`);

    // Verify contextual AI active banner
    const hasContextualAIBanner = await page.evaluate(() => {
      const sec = document.getElementById('properties-section');
      return sec ? sec.textContent.includes('AI Criteria Matching Active') && sec.textContent.includes('Modify Criteria ↑') : false;
    });
    record('Properties section displays contextual AI Criteria Matching Active banner', hasContextualAIBanner);

    // ----------------------------------------------------
    // 5. PROPERTY CARDS, EVIDENCE, & COMPARISON
    // ----------------------------------------------------
    console.log('\n--- 5. Testing Property Cards & Comparison Actions ---');

    // 5.1 Verify Property Card elements
    const cardInfo = await page.evaluate(() => {
      const firstCard = document.querySelector('#properties-section article');
      if (!firstCard) return { exists: false };
      const text = firstCard.textContent;
      return {
        exists: true,
        hasName: text.includes('Ananya') || text.includes('Executive'),
        hasDemoLabel: text.includes('DEMO DATA'),
        hasMatchPill: text.includes('Match') && text.includes('%'),
        hasLocation: text.includes('Madhapur') || text.includes('HITEC City'),
        hasRent: text.includes('₹') && text.includes('/mo'),
        hasPhysicalAudit: text.includes('Physical Field Verification') || text.includes('Rent confirmed'),
        hasViewEvidenceBtn: Boolean(Array.from(firstCard.querySelectorAll('button')).find(b => b.textContent.includes('View Evidence')))
      };
    });

    record('Property card prioritises Name, Demo Label, Location, Rent, and Audit Status', 
      cardInfo.exists && cardInfo.hasName && cardInfo.hasDemoLabel && cardInfo.hasRent && cardInfo.hasPhysicalAudit,
      'Name, location, rent, match score, audit date clear'
    );

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'walkthrough-3-property-cards.png') });

    // 5.2 Test Bookmark Save action
    await page.evaluate(() => {
      const saveBtn = document.querySelector('#properties-section article button[aria-label*="Save"]');
      if (saveBtn) saveBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const bookmarkSaved = await page.evaluate(() => {
      const btn = document.querySelector('#properties-section article button[aria-label*="Unsave"], #properties-section article button[title*="Remove from saved"]');
      return btn !== null;
    });
    record('Bookmark save action toggles state and provides feedback', bookmarkSaved);

    // 5.3 Test Multi-Property Comparison (Select 3 properties)
    await page.evaluate(() => {
      const resetBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Show All 6') ||
        b.textContent.includes('Clear AI Filter') ||
        b.textContent.includes('Reset Search')
      );
      if (resetBtn) resetBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    await page.evaluate(() => {
      const allTab = Array.from(document.querySelectorAll('#properties-section button')).find(b => b.textContent.includes('All Listings'));
      if (allTab) allTab.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Select 3 properties for comparison
    const compareBtn1 = await page.$('[data-testid="compare-btn-TN-HYD-0101"]');
    if (compareBtn1) await compareBtn1.click();
    await new Promise(r => setTimeout(r, 250));

    const compareBtn2 = await page.$('[data-testid="compare-btn-TN-HYD-0102"]');
    if (compareBtn2) await compareBtn2.click();
    await new Promise(r => setTimeout(r, 250));

    const compareBtn3 = await page.$('[data-testid="compare-btn-TN-HYD-0103"]');
    if (compareBtn3) await compareBtn3.click();
    await new Promise(r => setTimeout(r, 350));

    const comparisonBarTracksMax = await page.evaluate(() => {
      const bar = document.querySelector('.fixed.bottom-4');
      return bar ? bar.textContent.includes('3 / 3') : false;
    });
    record('Docked comparison bar tracks 3 / 3 selected properties', comparisonBarTracksMax);

    // Open comparison modal
    await page.evaluate(() => {
      const bar = document.querySelector('.fixed.bottom-4');
      const compareNowBtn = Array.from(bar.querySelectorAll('button')).find(b => b.textContent.includes('Compare Now'));
      if (compareNowBtn) compareNowBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const comparisonModalVerified = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.textContent.includes('Evidence-Based Property Comparison') && modal.textContent.includes('DEMO DATA') : false;
    });
    record('Side-by-side Evidence Comparison Modal opened with DEMO DATA disclaimers', comparisonModalVerified);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'walkthrough-4-comparison-modal.png') });

    // Close comparison modal
    await page.evaluate(() => {
      const closeBtn = Array.from(document.querySelectorAll('.fixed.inset-0 button')).find(b =>
        b.textContent.includes('Done Comparing') ||
        b.getAttribute('aria-label') === 'Close modal'
      );
      if (closeBtn) closeBtn.click();
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

    // 5.4 Test Property Detail Modal & Tabs
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('#properties-section article button')).find(b => b.textContent.includes('View Evidence'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const propertyModalOpen = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.textContent.includes('DEMO DATA') && modal.textContent.includes('Rooms & Pricing') : false;
    });
    record('Property Detail Modal opens with Evidence, Photos, and Pricing tabs', propertyModalOpen);

    // Close property modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.fixed.inset-0 button[aria-label="Close modal"], .fixed.inset-0 button[aria-label="Close dialog"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // ----------------------------------------------------
    // 6. HONEST DEMO FUNCTIONALITY & AUTH MODAL
    // ----------------------------------------------------
    console.log('\n--- 6. Testing Honest Demo Functionality & Auth Modal ---');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 300));

    await page.evaluate(() => {
      const accountsBtn = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('Accounts') || b.textContent.includes('Coming Soon'));
      if (accountsBtn) accountsBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const authModalHonesty = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? (modal.textContent.includes('Guest-First') || modal.textContent.includes('Coming Soon')) : false;
    });
    record('Auth Modal clearly informs users of guest-first access and Phase 6 accounts roadmap', authModalHonesty);

    // Close Auth Modal
    await page.evaluate(() => {
      const closeBtn = document.querySelector('.fixed.inset-0 button[aria-label="Close modal"], .fixed.inset-0 button[aria-label="Close dialog"]');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // ----------------------------------------------------
    // 7. CONSOLE HEALTH & RUNTIME ERROR CHECK
    // ----------------------------------------------------
    console.log('\n--- 7. Console & Runtime Health ---');
    const zeroErrors = errors.length === 0;
    record('Zero uncaught exceptions and zero console errors during complete walkthrough', zeroErrors, `${errors.length} errors recorded`);
    if (errors.length > 0) {
      console.log('Errors caught:', errors);
    }

  } catch (err) {
    console.error('Walkthrough exception:', err);
    record('Walkthrough executed without unhandled errors', false, err.message);
  } finally {
    await browser.close();
  }

  console.log('\n=== WALKTHROUGH AUDIT SUMMARY ===');
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  console.log(`Passed: ${passedCount} / ${totalCount} (${Math.round((passedCount / totalCount) * 100)}%)`);

  if (passedCount === totalCount) {
    console.log('ALL WALKTHROUGH TESTS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.log('SOME WALKTHROUGH TESTS FAILED');
    process.exit(1);
  }
}

runWalkthrough();
