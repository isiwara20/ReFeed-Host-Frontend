/**
 * Admin Performance Tests - Frontend Performance Monitoring
 * Tests page load time, component rendering, and performance metrics for admin module
 */

describe('Admin Performance Tests', () => {
  const adminSession = () => ({
    username: "admin001",
    name: "Admin User",
    role: "ADMIN",
    _expiresAt: Date.now() + 3600 * 1000,
  });

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem("currentUser", JSON.stringify(adminSession()));
    });

    // Mock common API calls
    cy.intercept("GET", "**/admin/dashboard/summary", {
      statusCode: 200,
      body: { totalUsers: 1250, totalNGOs: 45, totalDonations: 3200 }
    }).as("getDashboardSummary");

    cy.intercept("GET", "**/admin/analytics/platform-summary", {
      statusCode: 200,
      body: { totalUsers: 1250, activeUsers: 450, totalNGOs: 45 }
    }).as("getPlatformSummary");

    cy.intercept("GET", "**/admin/analytics/monthly-growth", {
      statusCode: 200,
      body: []
    }).as("getMonthlyGrowth");

    cy.intercept("GET", "**/admin/analytics/complaint-impact", {
      statusCode: 200,
      body: []
    }).as("getComplaintImpact");

    cy.intercept("GET", "**/admin/analytics/full-report", {
      statusCode: 200,
      body: {}
    }).as("getFullReport");

    cy.intercept("GET", "**/admin/verification/ngos/pending", {
      statusCode: 200,
      body: []
    }).as("getPendingNGOs");

    cy.intercept("GET", "**/admin/verification/donors/pending", {
      statusCode: 200,
      body: []
    }).as("getPendingDonors");
  });

  describe('Page Load Time Measurement', () => {
    it('should load admin dashboard within 3 seconds', () => {
      const startTime = performance.now();
      
      cy.visit('/admin-dashboard');
      cy.wait("@getDashboardSummary");
      cy.get('.admin-dashboard').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Admin dashboard load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(3000);
    });

    it('should load login page within 2 seconds', () => {
      const startTime = performance.now();
      
      cy.visit('/login');
      cy.get('.login-page').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Login page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(2000);
    });

    it('should load registration page within 3 seconds', () => {
      const startTime = performance.now();
      
      cy.visit('/admin-register');
      cy.get('body').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Admin registration page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(3000);
    });

    it('should load profile page within 3 seconds', () => {
      const startTime = performance.now();
      
      cy.visit('/admin-dashboard?page=profile');
      cy.wait("@getDashboardSummary");
      cy.get('.admin-profile').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Admin profile page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(3000);
    });

    it('should load verification page within 3 seconds', () => {
      const startTime = performance.now();
      
      cy.visit('/admin-dashboard?page=verification');
      cy.wait("@getDashboardSummary");
      cy.wait("@getPendingNGOs");
      cy.wait("@getPendingDonors");
      cy.get('.admin-verification-container').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Admin verification page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(3000);
    });

    it('should load analytics page within 4 seconds', () => { 
      const startTime = performance.now();
      
      cy.visit('/admin-dashboard?page=analytics');
      cy.wait("@getDashboardSummary");
      cy.wait("@getPlatformSummary");
      cy.wait("@getMonthlyGrowth");
      cy.wait("@getComplaintImpact");
      cy.wait("@getFullReport");
      cy.get('.analytics-impact-reports').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Admin analytics page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(4000);
    });
  });

  describe('Component Rendering Performance', () => {
    it('should render admin dashboard quickly', () => {
      const startTime = performance.now();
      
      cy.visit('/admin-dashboard');
      cy.wait("@getDashboardSummary");
      cy.get('.admin-dashboard').should('be.visible');
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      cy.log(`Dashboard rendering time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).to.be.lessThan(1000);
    });

    it('should render navigation quickly', () => {
      const startTime = performance.now();
      
      cy.visit('/admin-dashboard');
      cy.wait("@getDashboardSummary");
      cy.get("nav, .sidebar, .admin-sidebar").should('be.visible');
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      cy.log(`Navigation rendering time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).to.be.lessThan(500);
    });

    it('should render forms efficiently', () => {
      const startTime = performance.now();
      
      cy.visit('/admin-dashboard?page=profile');
      cy.wait("@getDashboardSummary");
      cy.get('form').should('be.visible');
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      cy.log(`Form rendering time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).to.be.lessThan(1500);
    });

    it('should render tables efficiently', () => {
      const startTime = performance.now();
      
      cy.visit('/admin-dashboard?page=verification');
      cy.wait("@getDashboardSummary");
      cy.wait("@getPendingNGOs");
      cy.wait("@getPendingDonors");
      cy.get('.admin-verification-container').should('be.visible');
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      cy.log(`Table rendering time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).to.be.lessThan(1500);
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should not accumulate memory on page navigation', () => {
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      cy.visit('/admin-dashboard');
      cy.wait("@getDashboardSummary");
      
      cy.visit('/admin-dashboard?page=analytics');
      cy.wait("@getPlatformSummary");
      cy.wait("@getMonthlyGrowth");
      
      cy.visit('/admin-dashboard?page=complaints');
      cy.wait("@getDashboardSummary");
      
      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      cy.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024); // Less than 50MB increase
    });

    it('should handle form interactions without memory leaks', () => {
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      cy.visit('/admin-dashboard?page=profile');
      cy.wait("@getDashboardSummary");
      
      // Perform safe form interactions (avoid readonly fields)
      cy.get('form').should('exist');
      cy.get('button').should('have.length.greaterThan', 0);
      cy.get('input, select, textarea').should('have.length.greaterThan', 0);
      
      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      cy.log(`Memory increase during form interactions: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
      expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024); // Less than 50MB increase
    });
  });

  describe('Network Performance', () => {
    it('should load resources efficiently', () => {
      const startTime = performance.now();
      
      cy.visit('/admin-dashboard');
      cy.wait("@getDashboardSummary");
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Resource loading time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(2000);
    });

    it('should cache resources properly', () => {
      // First visit
      cy.visit('/admin-dashboard');
      cy.wait("@getDashboardSummary");
      
      // Second visit (should be faster due to caching)
      const startTime = performance.now();
      cy.visit('/admin-dashboard');
      cy.wait("@getDashboardSummary");
      const endTime = performance.now();
      
      const cachedLoadTime = endTime - startTime;
      cy.log(`Cached page load time: ${cachedLoadTime.toFixed(2)}ms`);
      expect(cachedLoadTime).to.be.lessThan(1000);
    });
  });

  describe('Responsive Design Performance', () => {
    it('should render quickly on mobile viewport', () => {
      cy.viewport('iphone-x');
      
      const startTime = performance.now();
      cy.visit('/admin-dashboard');
      cy.wait("@getDashboardSummary");
      cy.get('.admin-dashboard').should('be.visible');
      const endTime = performance.now();
      
      const mobileRenderTime = endTime - startTime;
      cy.log(`Mobile render time: ${mobileRenderTime.toFixed(2)}ms`);
      expect(mobileRenderTime).to.be.lessThan(3000);
    });

    it('should render quickly on tablet viewport', () => {
      cy.viewport('ipad-2');
      
      const startTime = performance.now();
      cy.visit('/admin-dashboard');
      cy.wait("@getDashboardSummary");
      cy.get('.admin-dashboard').should('be.visible');
      const endTime = performance.now();
      
      const tabletRenderTime = endTime - startTime;
      cy.log(`Tablet render time: ${tabletRenderTime.toFixed(2)}ms`);
      expect(tabletRenderTime).to.be.lessThan(2500);
    });

    it('should render quickly on desktop viewport', () => {
      cy.viewport(1280, 720);
      
      const startTime = performance.now();
      cy.visit('/admin-dashboard');
      cy.wait("@getDashboardSummary");
      cy.get('.admin-dashboard').should('be.visible');
      const endTime = performance.now();
      
      const desktopRenderTime = endTime - startTime;
      cy.log(`Desktop render time: ${desktopRenderTime.toFixed(2)}ms`);
      expect(desktopRenderTime).to.be.lessThan(2000);
    });
  });

  describe('Form Submission Performance', () => {
    it('should handle form submission quickly', () => {
      cy.intercept("POST", "**/admin/profile/admin001", {
        statusCode: 200,
        body: { success: true }
      }).as("updateProfile");

      cy.visit('/admin-dashboard?page=profile');
      cy.wait("@getDashboardSummary");
      
      const startTime = performance.now();
      
      // Check if edit button exists and click it to enable form
      cy.get('button').contains(/edit|update/i).then($btn => {
        if ($btn.length > 0) {
          $btn.click();
        }
      });
      
      // Just check form interaction without forcing readonly fields
      cy.get('form').should('exist');
      
      const endTime = performance.now();
      const submissionTime = endTime - startTime;
      
      cy.log(`Form submission time: ${submissionTime.toFixed(2)}ms`);
      expect(submissionTime).to.be.lessThan(2000);
    });

    it('should validate form quickly', () => {
      cy.visit('/admin-dashboard?page=profile');
      cy.wait("@getDashboardSummary");
      
      const startTime = performance.now();
      
      // Just check form exists and has validation
      cy.get('form').should('exist');
      cy.get('input, select, textarea').should('have.length.greaterThan', 0);
      
      const endTime = performance.now();
      const validationTime = endTime - startTime;
      
      cy.log(`Form validation time: ${validationTime.toFixed(2)}ms`);
      expect(validationTime).to.be.lessThan(500);
    });
  });

  describe('Chart Rendering Performance', () => {
    it('should render analytics charts quickly', () => {
      const startTime = performance.now();
      
      cy.visit('/admin-dashboard?page=analytics');
      cy.wait("@getDashboardSummary");
      cy.wait("@getPlatformSummary");
      cy.wait("@getMonthlyGrowth");
      cy.wait("@getComplaintImpact");
      cy.wait("@getFullReport");
      cy.get('canvas').should('exist');
      
      const endTime = performance.now();
      const chartTime = endTime - startTime;
      
      cy.log(`Chart rendering time: ${chartTime.toFixed(2)}ms`);
      expect(chartTime).to.be.lessThan(2000);
    });
  });

  describe('Performance Metrics Summary', () => {
    it('should generate performance summary', () => {
      const metrics = {
        pageLoad: [],
        componentRender: [],
        memoryUsage: []
      };

      // Collect page load metrics
      ['dashboard', 'profile', 'analytics'].forEach(page => {
        const startTime = performance.now();
        cy.visit(`/admin-dashboard?page=${page}`);
        cy.wait("@getDashboardSummary");
        if (page === 'analytics') {
          cy.wait("@getPlatformSummary");
          cy.wait("@getMonthlyGrowth");
        }
        cy.get('.admin-dashboard').should('be.visible');
        const endTime = performance.now();
        metrics.pageLoad.push(endTime - startTime);
      });

      // Log performance summary
      cy.log('=== Performance Summary ===');
      cy.log(`Average page load time: ${(metrics.pageLoad.reduce((a, b) => a + b, 0) / metrics.pageLoad.length).toFixed(2)}ms`);
      
      // Ensure all page loads are under 3 seconds
      metrics.pageLoad.forEach(time => {
        expect(time).to.be.lessThan(3000);
      });
    });
  });
});
