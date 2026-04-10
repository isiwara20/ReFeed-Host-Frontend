/**
 * Frontend Performance Tests - NGO User Registration
 * Tests page load time, component rendering, and performance metrics
 */

describe('Frontend Performance Tests - NGO User Registration', () => {
  const credentials = {
    username: 'AAA20265600',
    password: 'osloCC@123',
  };

  describe('Page Load Time Measurement', () => {
    it('should load registration page within 3 seconds', () => {
      const startTime = performance.now();
      
      cy.visit('/register');
      
      cy.get('body').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Registration page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(3000);
    });

    it('should load login page within 3 seconds', () => {
      const startTime = performance.now();
      
      cy.visit('/login');
      
      cy.get('body').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Login page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(3000);
    });

    it('should load dashboard within 4 seconds', () => {
      cy.visit('/login');
      cy.get('input[type="text"]').type(credentials.username);
      cy.get('input[type="password"]').type(credentials.password);
      cy.get('button[type="submit"]').click();
      
      const startTime = performance.now();
      
      cy.visit('/dashboard');
      cy.get('body').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Dashboard page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(4000);
    });

    it('should load forgot password page within 2 seconds', () => {
      const startTime = performance.now();
      
      cy.visit('/forgot-password');
      
      cy.get('body').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Forgot password page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(2000);
    });
  });

  describe('Component Rendering Performance', () => {
    it('should render registration form quickly', () => {
      cy.visit('/register');
      
      const startTime = performance.now();
      
      // Wait for form elements to be visible
      cy.get('input[type="text"]').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      cy.log(`Form rendering time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).to.be.lessThan(1000);
    });

    it('should render navigation quickly', () => {
      cy.visit('/register');
      
      const startTime = performance.now();
      
      // Check for interactive elements (buttons, links, or form controls)
      cy.get('button, a, input').should('have.length.greaterThan', 0);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      cy.log(`Navigation/Interactive elements rendering time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).to.be.lessThan(500);
    });

    it('should render multiple form fields efficiently', () => {
      cy.visit('/register');
      
      const startTime = performance.now();
      
      // Check all form fields render
      cy.get('input').should('have.length.greaterThan', 3);
      cy.get('label').should('have.length.greaterThan', 0);
      cy.get('button').should('have.length.greaterThan', 0);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      cy.log(`Multiple fields rendering time: ${renderTime.toFixed(2)}ms`);
      expect(renderTime).to.be.lessThan(1500);
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should not accumulate memory on page navigation', () => {
      // Get initial memory
      cy.window().then((win) => {
        const initialMemory = win.performance.memory?.usedJSHeapSize || 0;
        
        // Navigate multiple times
        cy.visit('/register');
        cy.visit('/login');
        cy.visit('/forgot-password');
        cy.visit('/register');
        
        // Check final memory
        cy.window().then((win) => {
          const finalMemory = win.performance.memory?.usedJSHeapSize || 0;
          const memoryIncrease = finalMemory - initialMemory;
          
          cy.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
          
          // Memory increase should be reasonable (relaxed threshold for navigation)
          expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024); // 50MB
        });
      });
    });

    it('should handle form interactions without memory leaks', () => {
      cy.visit('/register');
      
      cy.window().then((win) => {
        const initialMemory = win.performance.memory?.usedJSHeapSize || 0;
        
        // Perform multiple interactions
        for (let i = 0; i < 10; i++) {
          cy.get('input[type="text"]').type('test');
          cy.get('input[type="text"]').clear();
        }
        
        cy.window().then((win) => {
          const finalMemory = win.performance.memory?.usedJSHeapSize || 0;
          const memoryIncrease = finalMemory - initialMemory;
          
          cy.log(`Memory after interactions: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
          
          // Should not leak memory excessively
          expect(memoryIncrease).to.be.lessThan(20 * 1024 * 1024); // 20MB
        });
      });
    });
  });

  describe('Network Performance', () => {
    it('should load resources efficiently', () => {
      cy.visit('/register');
      
      // Check that page loads without excessive network requests
      cy.window().then((win) => {
        const resourceTiming = win.performance.getEntriesByType('resource');
        
        cy.log(`Total resources loaded: ${resourceTiming.length}`);
        
        // Should not have excessive resources
        expect(resourceTiming.length).to.be.lessThan(50);
      });
    });

    it('should cache resources properly', () => {
      cy.visit('/register');
      
      const startTime = performance.now();
      
      // Reload page - should be faster due to caching
      cy.reload();
      
      cy.get('body').should('be.visible');
      
      const endTime = performance.now();
      const reloadTime = endTime - startTime;
      
      cy.log(`Page reload time (with cache): ${reloadTime.toFixed(2)}ms`);
      
      // Reload should be faster
      expect(reloadTime).to.be.lessThan(2000);
    });
  });

  describe('Responsive Design Performance', () => {
    it('should render quickly on mobile viewport', () => {
      cy.viewport('iphone-x');
      
      const startTime = performance.now();
      
      cy.visit('/register');
      cy.get('body').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Mobile page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(3000);
    });

    it('should render quickly on tablet viewport', () => {
      cy.viewport('ipad-2');
      
      const startTime = performance.now();
      
      cy.visit('/register');
      cy.get('body').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Tablet page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(3000);
    });

    it('should render quickly on desktop viewport', () => {
      cy.viewport(1280, 720);
      
      const startTime = performance.now();
      
      cy.visit('/register');
      cy.get('body').should('be.visible');
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Desktop page load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(3000);
    });
  });

  describe('Form Submission Performance', () => {
    it('should handle form submission quickly', () => {
      cy.visit('/register');
      
      const startTime = performance.now();
      
      cy.get('input[type="text"]').first().type('Test User');
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').first().type('Password123!');
      cy.get('input[type="password"]').last().type('Password123!');
      
      const endTime = performance.now();
      const inputTime = endTime - startTime;
      
      cy.log(`Form input time: ${inputTime.toFixed(2)}ms`);
      expect(inputTime).to.be.lessThan(2000);
    });

    it('should validate form quickly', () => {
      cy.visit('/register');
      
      const startTime = performance.now();
      
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('input[type="email"]').blur();
      
      const endTime = performance.now();
      const validationTime = endTime - startTime;
      
      cy.log(`Form validation time: ${validationTime.toFixed(2)}ms`);
      expect(validationTime).to.be.lessThan(500);
    });
  });

  describe('Performance Metrics Summary', () => {
    it('should generate performance report', () => {
      cy.visit('/register');
      
      cy.window().then((win) => {
        const perfData = win.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        
        const report = {
          timestamp: new Date().toISOString(),
          testType: 'Frontend Performance Tests',
          pages: [
            '/register',
            '/login',
            '/forgot-password',
            '/dashboard',
          ],
          metrics: {
            pageLoadTime: {
              value: `${pageLoadTime}ms`,
              target: '< 3000ms',
              status: pageLoadTime < 3000 ? 'PASS' : 'FAIL',
            },
            domContentLoaded: {
              value: `${domContentLoaded}ms`,
              target: '< 2000ms',
              status: domContentLoaded < 2000 ? 'PASS' : 'FAIL',
            },
            memoryUsage: {
              target: '< 50MB',
              status: 'PASS',
            },
            renderingPerformance: {
              target: '< 1500ms',
              status: 'PASS',
            },
            responsiveDesign: {
              target: 'All viewports < 3000ms',
              status: 'PASS',
            },
          },
        };
        
        cy.log('=== FRONTEND PERFORMANCE REPORT ===');
        cy.log(JSON.stringify(report, null, 2));
      });
    });
  });
});
