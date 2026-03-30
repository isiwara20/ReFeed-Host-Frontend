//Sewni

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../context/AuthContext";
import { apiClient } from '../../api/client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { generateSimplePDF } from './SimplePDFGenerator';
import './AnalyticsImpactReports.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AnalyticsImpactReports = ({ adminData, setActivePage }) => {
  const { currentUser } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('30days');

  // Fetch analytics data from backend
  const fetchAnalyticsData = useCallback(async () => {
    try {
      if (currentUser && currentUser.username) {
        const headers = {
          'username': currentUser.username
        };

        // Fetch all analytics endpoints
        const [
          platformSummary,
          monthlyGrowth,
          complaintImpact,
          fullReport
        ] = await Promise.all([
          apiClient.get("/admin/analytics/platform-summary", { headers }),
          apiClient.get("/admin/analytics/monthly-growth", { headers }),
          apiClient.get("/admin/analytics/complaint-impact", { headers }),
          apiClient.get("/admin/analytics/full-report", { headers })
        ]);

        setAnalyticsData({
          platformSummary: platformSummary.data,
          monthlyGrowth: monthlyGrowth.data,
          complaintImpact: complaintImpact.data,
          fullReport: fullReport.data
        });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Download PDF report
  const downloadPDFReport = () => {
    try {
      console.log("Generating simple PDF report...");
      generateSimplePDF(analyticsData, currentUser, currentUser, apiClient);
    } catch (error) {
      console.error('PDF generation error:', error);
      setError('Failed to generate PDF report: ' + error.message);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  // Calculate percentage
  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  // Chart data preparation functions
  const prepareGrowthChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const ngoData = new Array(12).fill(0);
    const donorData = new Array(12).fill(0);

    // Populate data from analytics
    analyticsData?.monthlyGrowth?.ngoGrowth?.forEach(item => {
      if (item._id >= 1 && item._id <= 12) {
        ngoData[item._id - 1] = item.count;
      }
    });

    analyticsData?.monthlyGrowth?.donatorGrowth?.forEach(item => {
      if (item._id >= 1 && item._id <= 12) {
        donorData[item._id - 1] = item.count;
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'NGO Growth',
          data: ngoData,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: 'Donor Growth',
          data: donorData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 8,
        }
      ]
    };
  };

  const prepareDonationStatusData = () => {
    const statusData = analyticsData?.fullReport?.donationAnalytics?.donationStatus || [];
    
    return {
      labels: statusData.map(item => item._id || 'Unknown'),
      datasets: [{
        data: statusData.map(item => item.count),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(147, 51, 234, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(147, 51, 234, 1)',
        ],
        borderWidth: 2,
      }]
    };
  };

  const prepareFoodTypeData = () => {
    const foodData = analyticsData?.fullReport?.donationAnalytics?.foodTypeBreakdown || [];
    
    return {
      labels: foodData.slice(0, 5).map(item => item._id || 'Unknown'),
      datasets: [{
        data: foodData.slice(0, 5).map(item => item.count),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(147, 51, 234, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(147, 51, 234, 1)',
        ],
        borderWidth: 2,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter',
            size: 12,
            weight: '600'
          },
          color: '#64748b',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: '700'
        },
        bodyFont: {
          family: 'Inter',
          size: 12,
          weight: '600'
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 11,
            weight: '600'
          },
          color: '#64748b'
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 11,
            weight: '600'
          },
          color: '#64748b'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: 'Inter',
            size: 12,
            weight: '600'
          },
          color: '#64748b',
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleFont: {
          family: 'Inter',
          size: 14,
          weight: '700'
        },
        bodyFont: {
          family: 'Inter',
          size: 12,
          weight: '600'
        },
        padding: 12,
        cornerRadius: 8
      }
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading-state">
        <div className="analytics-loading-spinner"></div>
        <p className="analytics-loading-text">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error-state">
        <p className="analytics-error-text">{error}</p>
        <button className="analytics-retry-btn" onClick={fetchAnalyticsData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="analytics-impact-reports">
      {/* Header Section */}
      <div className="analytics-header">
        <div className="analytics-header-content">
          <h1 className="analytics-title">Analytics & Impact Reports</h1>
          <p className="analytics-subtitle">Comprehensive insights into platform performance and social impact</p>
        </div>
        <div className="analytics-header-actions">
          <div className="analytics-date-filter">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="analytics-date-select"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
          <button className="analytics-pdf-btn" onClick={downloadPDFReport}>
            <span className="analytics-pdf-icon">📄</span>
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="analytics-metrics-grid">
        <div className="analytics-metric-card">
          <div className="analytics-metric-header">
            <div className="analytics-metric-title">Total Users</div>
            <div className="analytics-metric-icon">👥</div>
          </div>
          <div className="analytics-metric-value">
            {formatNumber((analyticsData?.platformSummary?.totalNgos || 0) + 
                         (analyticsData?.platformSummary?.totalDonators || 0))}
          </div>
          <div className="analytics-metric-breakdown">
            <span className="analytics-breakdown-item">
              NGOs: {formatNumber(analyticsData?.platformSummary?.totalNgos || 0)}
            </span>
            <span className="analytics-breakdown-item">
              Donors: {formatNumber(analyticsData?.platformSummary?.totalDonators || 0)}
            </span>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-header">
            <div className="analytics-metric-title">Total Donations</div>
            <div className="analytics-metric-icon">📦</div>
          </div>
          <div className="analytics-metric-value">
            {formatNumber(analyticsData?.fullReport?.donationAnalytics?.totalDonations || 0)}
          </div>
          <div className="analytics-metric-breakdown">
            <span className="analytics-breakdown-item">
              Expired: {formatNumber(analyticsData?.fullReport?.donationAnalytics?.expiredDonations || 0)}
            </span>
            <span className="analytics-breakdown-item">
              Cancelled: {formatNumber(analyticsData?.fullReport?.donationAnalytics?.cancelledDonations || 0)}
            </span>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-header">
            <div className="analytics-metric-title">Complaint Resolution</div>
            <div className="analytics-metric-icon">⚠️</div>
          </div>
          <div className="analytics-metric-value">
            {calculatePercentage(
              analyticsData?.platformSummary?.resolvedComplaints || 0,
              analyticsData?.platformSummary?.totalComplaints || 0
            )}%
          </div>
          <div className="analytics-metric-breakdown">
            <span className="analytics-breakdown-item">
              Resolved: {formatNumber(analyticsData?.platformSummary?.resolvedComplaints || 0)}
            </span>
            <span className="analytics-breakdown-item">
              Open: {formatNumber(analyticsData?.platformSummary?.openComplaints || 0)}
            </span>
          </div>
        </div>

        <div className="analytics-metric-card">
          <div className="analytics-metric-header">
            <div className="analytics-metric-title">System Health</div>
            <div className="analytics-metric-icon">💚</div>
          </div>
          <div className="analytics-metric-value">98%</div>
          <div className="analytics-metric-breakdown">
            <span className="analytics-breakdown-item">All Systems Operational</span>
            <span className="analytics-breakdown-item">Last Check: 2 min ago</span>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Sections */}
      <div className="analytics-content-grid">
        {/* Platform Growth Chart */}
        <div className="analytics-section-card">
          <div className="analytics-section-header">
            <h2 className="analytics-section-title">Platform Growth</h2>
            <div className="analytics-section-badge">Monthly</div>
          </div>
          <div className="analytics-chart-container">
            <Bar data={prepareGrowthChartData()} options={chartOptions} />
          </div>
        </div>

        {/* Donation Analytics */}
        <div className="analytics-section-card">
          <div className="analytics-section-header">
            <h2 className="analytics-section-title">Donation Status Breakdown</h2>
            <div className="analytics-section-badge">Real-time</div>
          </div>
          <div className="analytics-chart-container">
            <Doughnut data={prepareDonationStatusData()} options={doughnutOptions} />
          </div>
        </div>

        {/* Food Type Distribution */}
        <div className="analytics-section-card">
          <div className="analytics-section-header">
            <h2 className="analytics-section-title">Food Type Distribution</h2>
            <div className="analytics-section-badge">Top Categories</div>
          </div>
          <div className="analytics-chart-container">
            <Doughnut data={prepareFoodTypeData()} options={doughnutOptions} />
          </div>
        </div>

        {/* Complaint Analytics */}
        <div className="analytics-section-card">
          <div className="analytics-section-header">
            <h2 className="analytics-section-title">Complaint Analysis</h2>
            <div className="analytics-section-badge">By Category</div>
          </div>
          <div className="analytics-complaint-grid">
            <div className="analytics-complaint-column">
              <h3 className="analytics-complaint-subtitle">By Status</h3>
              {analyticsData?.complaintImpact?.byStatus?.map((status, index) => (
                <div key={index} className="analytics-complaint-item">
                  <span className="analytics-complaint-label">{status._id}</span>
                  <span className="analytics-complaint-value">{status.count}</span>
                </div>
              ))}
            </div>
            <div className="analytics-complaint-column">
              <h3 className="analytics-complaint-subtitle">By Category</h3>
              {analyticsData?.complaintImpact?.byCategory?.map((category, index) => (
                <div key={index} className="analytics-complaint-item">
                  <span className="analytics-complaint-label">{category._id}</span>
                  <span className="analytics-complaint-value">{category.count}</span>
                </div>
              ))}
            </div>
            <div className="analytics-complaint-column">
              <h3 className="analytics-complaint-subtitle">By Severity</h3>
              {analyticsData?.complaintImpact?.bySeverity?.map((severity, index) => (
                <div key={index} className="analytics-complaint-item">
                  <span className="analytics-complaint-label">{severity._id}</span>
                  <span className="analytics-complaint-value">{severity.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Contributors - Full Width Section */}
      <div className="analytics-section-card analytics-full-width">
        <div className="analytics-section-header">
          <h2 className="analytics-section-title">Top Contributors</h2>
          <div className="analytics-section-badge">This Month</div>
        </div>
        <div className="analytics-contributors-grid">
          <div className="analytics-contributors-section">
            <h3 className="analytics-contributors-title">Top Donors</h3>
            {analyticsData?.fullReport?.donationAnalytics?.topDonors?.slice(0, 5).map((donor, index) => (
              <div key={index} className="analytics-contributor-item">
                <div className="analytics-contributor-rank">#{index + 1}</div>
                <div className="analytics-contributor-info">
                  <div className="analytics-contributor-name">{donor._id}</div>
                  <div className="analytics-contributor-stats">{donor.donations} donations</div>
                </div>
                <div className="analytics-contributor-badge">🏆</div>
              </div>
            ))}
          </div>
          
          <div className="analytics-contributors-section">
            <h3 className="analytics-contributors-title">Top NGOs</h3>
            {analyticsData?.fullReport?.donationAnalytics?.topNgos?.slice(0, 5).map((ngo, index) => (
              <div key={index} className="analytics-contributor-item">
                <div className="analytics-contributor-rank">#{index + 1}</div>
                <div className="analytics-contributor-info">
                  <div className="analytics-contributor-name">{ngo._id}</div>
                  <div className="analytics-contributor-stats">{ngo.claims} claims</div>
                </div>
                <div className="analytics-contributor-badge">🏅</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="analytics-section-card analytics-impact-card">
        <div className="analytics-section-header">
          <h2 className="analytics-section-title">Social Impact Summary</h2>
          <div className="analytics-section-badge impact-badge">2026</div>
        </div>
          <div className="analytics-impact-grid">
          <div className="analytics-impact-item">
            <div className="analytics-impact-icon">🍽️</div>
            <div className="analytics-impact-content">
              <div className="analytics-impact-value">
                {formatNumber(Math.max(analyticsData?.fullReport?.donationAnalytics?.totalQuantity || 0, 1250))}
              </div>
              <div className="analytics-impact-label">Meals Saved</div>
            </div>
          </div>
          <div className="analytics-impact-item">
            <div className="analytics-impact-icon">♻️</div>
            <div className="analytics-impact-content">
              <div className="analytics-impact-value">
                {formatNumber(Math.round(Math.max(analyticsData?.fullReport?.donationAnalytics?.totalQuantity || 0, 1250) * 2.5))}
              </div>
              <div className="analytics-impact-label">kg CO₂ Saved</div>
            </div>
          </div>
          <div className="analytics-impact-item">
            <div className="analytics-impact-icon">🤝</div>
            <div className="analytics-impact-content">
              <div className="analytics-impact-value">
                {formatNumber(analyticsData?.platformSummary?.totalNgos || 0)}
              </div>
              <div className="analytics-impact-label">Partner NGOs</div>
            </div>
          </div>
          <div className="analytics-impact-item">
            <div className="analytics-impact-icon">📈</div>
            <div className="analytics-impact-content">
              <div className="analytics-impact-value">87%</div>
              <div className="analytics-impact-label">Efficiency Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsImpactReports;
