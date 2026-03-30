//Sewni - Simple PDF Report Generator

import jsPDF from 'jspdf';

export const generateSimplePDF = async (analyticsData, adminData, currentUser, apiClient) => {
  try {
    console.log("PDF Generation Started with jsPDF");
    console.log("Analytics Data:", analyticsData);

    // Get headers for API calls
    const headers = {
      'username': currentUser?.username || adminData?.username || 'admin'
    };

    // Fetch data with fallbacks
    const donationsResponse = await apiClient.get("/admin/donations", { headers }).catch(() => ({ data: [] }));
    const usersResponse = await apiClient.get("/admin/users", { headers }).catch(() => ({ data: [] }));
    const ngosResponse = await apiClient.get("/admin/ngos", { headers }).catch(() => ({ data: [] }));
    const complaintsResponse = await apiClient.get("/admin/complaints", { headers }).catch(() => ({ data: [] }));

    const donations = donationsResponse.data || [];
    const users = usersResponse.data || [];
    const ngos = ngosResponse.data || [];
    const complaints = complaintsResponse.data || [];

    // Calculate metrics using analytics data
    const totalUsers = (analyticsData?.platformSummary?.totalNgos || 0) + (analyticsData?.platformSummary?.totalDonators || 0);
    const resolutionRate = analyticsData?.platformSummary?.totalComplaints > 0 
      ? ((analyticsData.platformSummary.resolvedComplaints / analyticsData.platformSummary.totalComplaints) * 100).toFixed(1)
      : '0';
    
    // Use analytics data for active donations (donations that are not expired/cancelled/collected)
    const activeDonations = analyticsData?.fullReport?.donationAnalytics?.totalDonations || 0;
    
    // Use analytics data for pending verifications (both NGOs and donors)
    const verificationStatusData = analyticsData?.fullReport?.riskAnalytics?.verificationStatus || [];
    const pendingNgos = verificationStatusData.find(v => v._id === 'PENDING' && v.type === 'NGO')?.count || 0;
    const pendingDonors = verificationStatusData.find(v => v._id === 'PENDING' && v.type === 'DONOR')?.count || 0;
    const pendingVerifications = pendingNgos + pendingDonors;
    
    // Use analytics data for high priority complaints
    const highPriorityComplaints = analyticsData?.complaintImpact?.bySeverity?.find(s => s._id === 'HIGH')?.count || 0;

    // Create PDF document with professional styling
    const doc = new jsPDF();

    // Clean professional green color palette (simple business report colors)
    const colors = {
      primary: [0, 102, 51],           // #006633 (professional green)
      secondary: [0, 128, 64],        // #008040 (medium green)
      text: [0, 0, 0],                // #000000 (black text)
      muted: [64, 64, 64],            // #404040 (gray text)
      background: [255, 255, 255],   // #ffffff (white)
      lightGray: [245, 245, 245],     // #f5f5f5 (light gray)
      border: [200, 200, 200],        // #c8c8c8 (border gray)
      headerBg: [0, 102, 51],         // #006633 (header background)
      footerBg: [245, 245, 245],      // #f5f5f5 (footer background)
      accent: [0, 153, 76]            // #00994c (accent green)
    };

    // Helper function to add styled text
    const addText = (text, fontSize = 12, color = colors.text, x = 20, y = null, isBold = false, isItalic = false) => {
      if (y !== null) {
        // Ensure text is always a string
        const textString = String(text);
        doc.setTextColor(...color);
        
        // Set font style
        if (isBold && isItalic) {
          doc.setFont('helvetica-bolditalic');
        } else if (isBold) {
          doc.setFont('helvetica-bold');
        } else if (isItalic) {
          doc.setFont('helvetica-oblique');
        } else {
          doc.setFont('helvetica');
        }
        
        doc.setFontSize(fontSize);
        doc.text(textString, x, y);
      }
    };

    // Helper function to add colored rectangle
    const addRect = (x, y, width, height, color, fill = true) => {
      doc.setFillColor(...color);
      if (fill) {
        doc.rect(x, y, width, height, 'F');
      } else {
        doc.rect(x, y, width, height);
      }
    };

    // Helper function to add rounded rectangle (manual implementation)
    const addRoundedRect = (x, y, width, height, radius, fillColor, strokeColor = null, lineWidth = 0) => {
      if (fillColor) {
        doc.setFillColor(...fillColor);
      }
      if (strokeColor) {
        doc.setDrawColor(...strokeColor);
        doc.setLineWidth(lineWidth);
      }
      
      // Draw rounded rectangle manually
      doc.path([
        `M ${x + radius} ${y}`,
        `L ${x + width - radius} ${y}`,
        `Q ${x + width} ${y} ${x + width} ${y + radius}`,
        `L ${x + width} ${y + height - radius}`,
        `Q ${x + width} ${y + height} ${x + width - radius} ${y + height}`,
        `L ${x + radius} ${y + height}`,
        `Q ${x} ${y + height} ${x} ${y + height - radius}`,
        `L ${x} ${y + radius}`,
        `Q ${x} ${y} ${x + radius} ${y}`,
        'Z'
      ]);
      
      if (strokeColor && fillColor) {
        doc.strokeAndFill();
      } else if (strokeColor) {
        doc.stroke();
      } else if (fillColor) {
        doc.fill();
      }
    };

    // Helper function to add clean professional header
    const addHeader = (title, subtitle, y) => {
      // Simple header background
      addRect(0, y - 15, 210, 25, colors.headerBg);
      
      // White text on dark background
      addText(title, 16, [255, 255, 255], 105, y - 5, true);
      if (subtitle) {
        addText(subtitle, 10, [220, 255, 220], 105, y + 8);
      }
    };

    // Helper function to add clean metric card
    const addMetricCard = (title, value, description, x, y, width, height) => {
      // Simple shadow
      addRect(x + 1, y + 1, width, height, colors.lightGray);
      
      // Card background
      addRect(x, y, width, height, [255, 255, 255]);
      
      // Simple border
      doc.setLineWidth(1);
      doc.setDrawColor(...colors.border);
      doc.rect(x, y, width, height);
      
      // Top accent bar
      addRect(x, y, width, 2, colors.primary);
      
      // Title
      addText(title.toUpperCase(), 8, colors.muted, x + 8, y + 8);
      
      // Value
      addText(value, 20, colors.primary, x + 8, y + 20, true);
      
      // Simple divider line
      doc.setLineWidth(0.5);
      doc.setDrawColor(...colors.border);
      doc.line(x + 8, y + 32, x + width - 8, y + 32);
      
      // Description
      addText(description, 8, colors.muted, x + 8, y + 36);
    };

    // Helper function to add clean data table
    const addDataTable = (headers, data, startY) => {
      let currentY = startY;
      const tableWidth = 170;
      const cellWidth = tableWidth / headers.length;
      const cellHeight = 10;
      
      // Simple header background
      addRect(20, currentY, tableWidth, cellHeight, colors.lightGray);
      
      // Table header
      headers.forEach((header, i) => {
        doc.setLineWidth(0.5);
        doc.setDrawColor(...colors.border);
        doc.rect(20 + (i * cellWidth), currentY, cellWidth, cellHeight);
        addText(String(header).toUpperCase(), 9, colors.text, 20 + (i * cellWidth) + 2, currentY + 6, true);
      });
      
      currentY += cellHeight;
      
      // Table data
      data.forEach((row, rowIndex) => {
        const fillColor = rowIndex % 2 === 0 ? [255, 255, 255] : colors.lightGray;
        
        row.forEach((cell, cellIndex) => {
          addRect(20 + (cellIndex * cellWidth), currentY, cellWidth, cellHeight, fillColor);
          doc.setLineWidth(0.5);
          doc.setDrawColor(...colors.border);
          doc.rect(20 + (cellIndex * cellWidth), currentY, cellWidth, cellHeight);
          addText(String(cell), 8, colors.text, 20 + (cellIndex * cellWidth) + 2, currentY + 6);
        });
        
        currentY += cellHeight;
      });
      
      return currentY + 10;
    };

    // Helper function to add simple section divider
    const addSectionDivider = (y) => {
      doc.setLineWidth(1);
      doc.setDrawColor(...colors.primary);
      doc.line(20, y, 190, y);
    };

    let currentY = 20;

    // Clean and Professional Cover Page
    // Simple header
    addRect(0, 0, 210, 35, colors.primary);
    addText('ReFeed System', 24, [255, 255, 255], 105, 20, true);
    addText('Analytics & Impact Report', 12, [220, 255, 220], 105, 32);

    currentY = 70;

    // Simple report info card
    const cardWidth = 140;
    const cardHeight = 50;
    const cardX = (210 - cardWidth) / 2;
    
    // Simple shadow
    addRect(cardX + 1, currentY + 1, cardWidth, cardHeight, colors.lightGray);
    
    // Card background
    addRect(cardX, currentY, cardWidth, cardHeight, [255, 255, 255]);
    
    // Simple border
    doc.setLineWidth(1);
    doc.setDrawColor(...colors.border);
    doc.rect(cardX, currentY, cardWidth, cardHeight);
    
    // Card content
    addText('REPORT INFORMATION', 11, colors.primary, 105, currentY + 10, true);
    addText(`Generated By: ${adminData?.name || adminData?.username || 'Admin'}`, 9, colors.text, cardX + 10, currentY + 22);
    addText(`Generated On: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 9, colors.text, cardX + 10, currentY + 32);
    addText(`Report Period: Last 30 Days`, 9, colors.text, cardX + 10, currentY + 42);

    currentY += 80;

    // Executive Summary
    doc.addPage();
    currentY = 20;
    
    addHeader('EXECUTIVE SUMMARY', 'Key Performance Indicators', currentY);
    currentY += 40;

    addSectionDivider(currentY);
    currentY += 15;

    // Professional metric cards
    const metrics = [
      { title: 'Total Users', value: totalUsers, description: 'Combined NGOs and Donors' },
      { title: 'Total Donations', value: analyticsData?.fullReport?.donationAnalytics?.totalDonations || 0, description: 'All-time contributions' },
      { title: 'Resolution Rate', value: `${resolutionRate}%`, description: 'Complaint success rate' },
      { title: 'Active Donations', value: activeDonations, description: 'Currently available' },
      { title: 'Pending Verifications', value: pendingVerifications, description: 'Awaiting approval' },
      { title: 'High Priority Issues', value: highPriorityComplaints, description: 'Immediate attention required' }
    ];

    metrics.forEach((metric, index) => {
      const xPos = 20 + (index % 2) * 85;
      const yPos = currentY + Math.floor(index / 2) * 45;
      addMetricCard(metric.title, metric.value, metric.description, xPos, yPos, 80, 40);
    });

    currentY += 100;

    // Platform Overview
    doc.addPage();
    currentY = 20;
    
    addHeader('PLATFORM OVERVIEW', 'System Statistics', currentY);
    currentY += 40;

    addSectionDivider(currentY);
    currentY += 15;

    const platformData = [
      ['Metric', 'Count', 'Status', 'Description'],
      ['Total Admins', analyticsData?.platformSummary?.totalAdmins || 0, 'Active', 'System administrators'],
      ['Total NGOs', analyticsData?.platformSummary?.totalNgos || 0, 'Registered', 'Partner organizations'],
      ['Total Donors', analyticsData?.platformSummary?.totalDonators || 0, 'Registered', 'Food contributors'],
      ['Total Complaints', analyticsData?.platformSummary?.totalComplaints || 0, 'All Status', 'Incident reports'],
      ['Open Complaints', analyticsData?.platformSummary?.openComplaints || 0, 'Pending', 'Awaiting resolution'],
      ['Resolved Complaints', analyticsData?.platformSummary?.resolvedComplaints || 0, 'Completed', 'Successfully resolved']
    ];
    
    currentY = addDataTable(['Metric', 'Count', 'Status', 'Description'], platformData.slice(1), currentY);

    // Donation Analytics
    currentY += 20;
    addHeader('DONATION ANALYTICS', 'Contribution Metrics', currentY);
    currentY += 40;

    addSectionDivider(currentY);
    currentY += 15;

    // Summary stats with professional layout
    addText('Donation Summary', 12, colors.text, 20, currentY, true);
    currentY += 15;
    
    const donationStats = [
      ['Total Donations', analyticsData?.fullReport?.donationAnalytics?.totalDonations || 0],
      ['Expired Donations', analyticsData?.fullReport?.donationAnalytics?.expiredDonations || 0],
      ['Cancelled Donations', analyticsData?.fullReport?.donationAnalytics?.cancelledDonations || 0]
    ];
    
    donationStats.forEach(([label, value]) => {
      addText(label, 10, colors.text, 20, currentY);
      addText(String(value), 10, colors.primary, 170, currentY, true);
      currentY += 12;
    });
    
    currentY += 20;

    // Donation status table
    if (analyticsData?.fullReport?.donationAnalytics?.donationStatus) {
      addText('Donation Status Breakdown', 12, colors.text, 20, currentY, true);
      currentY += 15;
      
      const statusData = analyticsData.fullReport.donationAnalytics.donationStatus.map(item => [
        item._id || 'Unknown',
        item.count,
        `${((item.count / (analyticsData.fullReport.donationAnalytics.totalDonations || 1)) * 100).toFixed(1)}%`
      ]);
      
      currentY = addDataTable(['Status', 'Count', 'Percentage'], statusData, currentY);
    }

    // Food type breakdown
    if (analyticsData?.fullReport?.donationAnalytics?.foodTypeBreakdown) {
      addText('Food Type Distribution', 12, colors.text, 20, currentY, true);
      currentY += 15;
      
      const foodData = analyticsData.fullReport.donationAnalytics.foodTypeBreakdown.slice(0, 6).map(item => [
        item._id || 'Unknown',
        item.count,
        `${item.totalQuantity} units`,
        `${((item.count / (analyticsData.fullReport.donationAnalytics.totalDonations || 1)) * 100).toFixed(1)}%`
      ]);
      
      currentY = addDataTable(['Food Type', 'Donations', 'Total Quantity', 'Percentage'], foodData, currentY);
    }

    // Top Contributors
    doc.addPage();
    currentY = 20;
    
    addHeader('TOP CONTRIBUTORS', 'Leading Donors', currentY);
    currentY += 40;

    addSectionDivider(currentY);
    currentY += 15;

    if (analyticsData?.fullReport?.donationAnalytics?.topDonors) {
      analyticsData.fullReport.donationAnalytics.topDonors.slice(0, 10).forEach((item, index) => {
        // Rank circle with better styling
        addRect(20, currentY, 20, 20, colors.primary);
        addText(String(index + 1), 16, [255, 255, 255], 30, currentY + 10, true);
        
        // Contributor info with proper name display
        const displayName = item.name || item._id || 'Anonymous Donor';
        addText(displayName, 11, colors.text, 50, currentY + 3, true);
        addText(`${item.donations} donations • Leading Contributor`, 9, colors.muted, 50, currentY + 13);
        
        // Simple and reliable badge design
        let badgeText = '';
        let badgeColors = {
          primary: [240, 240, 240],
          text: [100, 100, 100],
          border: [200, 200, 200],
          shadow: [180, 180, 180]
        };
        
        if (index === 0) {
          badgeText = 'TOP';
          badgeColors = {
            primary: [255, 215, 0],    // Gold
            text: [0, 0, 0],          // Black text for better contrast
            border: [218, 165, 32],    // Goldenrod
            shadow: [184, 134, 11]     // Dark goldenrod
          };
        } else if (index === 1) {
          badgeText = 'ELITE';
          badgeColors = {
            primary: [192, 192, 192],  // Silver
            text: [0, 0, 0],          // Black text for better contrast
            border: [169, 169, 169],   // Dark silver
            shadow: [128, 128, 128]   // Gray
          };
        } else if (index === 2) {
          badgeText = 'PRO';
          badgeColors = {
            primary: [205, 127, 50],  // Bronze
            text: [255, 255, 255],     // White text
            border: [184, 115, 51],     // Dark bronze
            shadow: [139, 69, 19]      // Saddle brown
          };
        } else if (index === 3) {
          badgeText = 'STAR';
          badgeColors = {
            primary: [147, 112, 219],  // Medium purple
            text: [255, 255, 255],     // White text
            border: [138, 43, 226],     // Blue violet
            shadow: [75, 0, 130]       // Indigo
          };
        } else if (index === 4) {
          badgeText = 'RISE';
          badgeColors = {
            primary: [255, 99, 71],    // Tomato
            text: [255, 255, 255],     // White text
            border: [255, 69, 0],       // Red orange
            shadow: [220, 20, 60]      // Crimson
          };
        } else {
          badgeText = 'ACE';
          badgeColors = {
            primary: [64, 224, 208],   // Turquoise
            text: [0, 0, 0],          // Black text for better contrast
            border: [0, 206, 209],     // Dark turquoise
            shadow: [0, 139, 139]      // Dark cyan
          };
        }
        
        // Smaller badge positioned more to the center
        const badgeX = 155;
        const badgeY = currentY + 3;  // Moved up to align with name
        const badgeWidth = 45;
        const badgeHeight = 12;
        
        // Shadow
        addRect(badgeX + 1, badgeY + 1, badgeWidth, badgeHeight, badgeColors.shadow);
        
        // Main badge background
        addRect(badgeX, badgeY, badgeWidth, badgeHeight, badgeColors.primary);
        
        // Border
        doc.setDrawColor(...badgeColors.border);
        doc.setLineWidth(1.5);
        doc.rect(badgeX, badgeY, badgeWidth, badgeHeight);
        
        // Clean centered text
        addText(badgeText, 10, badgeColors.text, badgeX + badgeWidth/2, badgeY + badgeHeight/2 + 2, true);
        
        currentY += 30;
      });
    }

    // Complaint Analysis
    doc.addPage();
    currentY = 20;
    
    addHeader('COMPLAINT ANALYSIS', 'Issue Resolution Metrics', currentY);
    currentY += 40;

    addSectionDivider(currentY);
    currentY += 15;

    // Status breakdown
    if (analyticsData?.complaintImpact?.byStatus) {
      addText('Complaint Status Distribution', 12, colors.text, 20, currentY, true);
      currentY += 15;
      
      const statusData = analyticsData.complaintImpact.byStatus.map(item => [
        item._id || 'Unknown',
        item.count,
        `${((item.count / (analyticsData.platformSummary?.totalComplaints || 1)) * 100).toFixed(1)}%`
      ]);
      
      currentY = addDataTable(['Status', 'Count', 'Percentage'], statusData, currentY);
    }

    // Category breakdown
    if (analyticsData?.complaintImpact?.byCategory) {
      addText('Complaint Categories', 12, colors.text, 20, currentY, true);
      currentY += 15;
      
      const categoryData = analyticsData.complaintImpact.byCategory.map(item => [
        item._id || 'Unknown',
        item.count,
        `${((item.count / (analyticsData.platformSummary?.totalComplaints || 1)) * 100).toFixed(1)}%`
      ]);
      
      currentY = addDataTable(['Category', 'Count', 'Percentage'], categoryData, currentY);
    }

    // Severity breakdown
    if (analyticsData?.complaintImpact?.bySeverity) {
      addText('Severity Level Analysis', 12, colors.text, 20, currentY, true);
      currentY += 15;
      
      const severityData = analyticsData.complaintImpact.bySeverity.map(item => [
        item._id || 'Unknown',
        item.count,
        `${((item.count / (analyticsData.platformSummary?.totalComplaints || 1)) * 100).toFixed(1)}%`
      ]);
      
      currentY = addDataTable(['Severity', 'Count', 'Percentage'], severityData, currentY);
    }

    // Clean and Professional footer on each page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Simple footer background
      addRect(0, 270, 210, 27, colors.footerBg);
      
      // Simple footer line
      doc.setLineWidth(1);
      doc.setDrawColor(...colors.border);
      doc.line(20, 270, 190, 270);
      
      // Footer text
      addText('© 2024 ReFeed System - Analytics Report', 8, colors.muted, 105, 275);
      addText(`Page ${i} of ${pageCount}`, 8, colors.primary, 105, 283, true);
      addText('Confidential - For Authorized Personnel Only', 7, colors.muted, 105, 291);
    }

    // Save the PDF
    const fileName = `ReFeed-Analytics-Report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    console.log("Corporate PDF report generated and downloaded successfully");

  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Failed to generate PDF report: ' + error.message);
  }
};
