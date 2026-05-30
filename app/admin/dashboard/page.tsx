import React from 'react';
import Link from 'next/link';
import styles from '../styles/dashboard.module.css';
import { DashboardService } from '@/lib/Services/admin/DashboardService';

export const revalidate = 0; // Ensure dashboard is never cached

export default async function Dashboard() {
  const stats = await DashboardService.getDashboardStats();
  const transactions = await DashboardService.getRecentTransactions(10);

  return (
    <div className={styles.dashboard}>


      <div className={styles.topCards}>
        {/* Welcome Card */}
        <div className={`${styles.card} ${styles.welcomeCard}`}>
          <div className={styles.welcomeTitle}>Welcome Admin 🎉</div>
          <div className={styles.welcomeSubtitle}>Here is your store's performance for this month</div>
          <div className={styles.welcomeAmount}>Rs. {stats.currentMonthSales.toLocaleString()}</div>
          <div className={styles.welcomeTarget}>Current Month's Revenue</div>
          <button className={styles.viewDetailsBtn}>View Details</button>
        </div>

        {/* Total Orders Card */}
        <div className={styles.card}>
          <div className={styles.metricCardHeader}>
            <div className={styles.metricIcon}>🛒</div>
            <div className={`${styles.metricTrend} ${styles.trendUp}`}>+24% ↗</div>
          </div>
          <div className={styles.metricValue}>{stats.totalOrders}</div>
          <div className={styles.metricLabel}>Total Orders</div>
          <div className={styles.chartContainer}>
            <div className={styles.fakeLineChart}></div>
          </div>
        </div>

        {/* Total Sales Card */}
        <div className={styles.card}>
          <div className={styles.metricCardHeader}>
            <div className={styles.metricIcon} style={{color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)'}}>💰</div>
            <div className={`${styles.metricTrend} ${styles.trendUp}`}>+14% ↗</div>
          </div>
          <div className={styles.metricValue}>Rs. {stats.totalSales.toLocaleString()}</div>
          <div className={styles.metricLabel}>Total Sales</div>
          <div className={styles.chartContainer}>
            <div className={styles.fakeLineChartGreen}></div>
          </div>
        </div>

        {/* Total Visits Card */}
        <div className={styles.card}>
          <div className={styles.metricCardHeader}>
            <div className={styles.metricIcon} style={{color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)'}}>👁️</div>
            <div className={`${styles.metricTrend} ${styles.trendDown}`}>-35% ↘</div>
          </div>
          <div className={styles.metricValue}>{stats.totalUsers}</div>
          <div className={styles.metricLabel}>Total Users</div>
          <div className={styles.chartContainer}>
            <div className={styles.fakeLineChart}></div>
          </div>
        </div>

        {/* Bounce Rate Card */}
        <div className={styles.card}>
          <div className={styles.metricCardHeader}>
            <div className={styles.metricIcon} style={{color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)'}}>📈</div>
            <div className={`${styles.metricTrend} ${styles.trendUp}`}>+18% ↗</div>
          </div>
          <div className={styles.metricValue}>{stats.totalProducts}</div>
          <div className={styles.metricLabel}>Total Products</div>
          <div className={styles.chartContainer}>
            <div className={styles.fakeBarChart}>
              <div className={styles.bar} style={{height: '40%'}}></div>
              <div className={styles.bar} style={{height: '70%'}}></div>
              <div className={styles.bar} style={{height: '50%'}}></div>
              <div className={styles.bar} style={{height: '90%'}}></div>
              <div className={styles.bar} style={{height: '60%'}}></div>
              <div className={styles.bar} style={{height: '80%'}}></div>
              <div className={styles.bar} style={{height: '100%'}}></div>
              <div className={styles.bar} style={{height: '85%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Static charts temporarily hidden until full analytics are built */}
      {/* 
      <div className={styles.middleCharts}>
        ...
      </div> 
      */}

      <div className={styles.bottomSection} style={{ gridTemplateColumns: '1fr', marginTop: '24px' }}>
        {/* Transactions Table */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Recent Transactions</div>
          <div className={styles.tableResponsive}>
            <table className={styles.table} style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source Name</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? transactions.map((t) => {
                  const dateObj = new Date(t.date);
                  const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                  
                  // Status styles
                  let statusClass = '';
                  if (t.status === 'delivered') statusClass = styles.statusPaid;
                  else if (t.status === 'cancelled') statusClass = styles.statusUnpaid;
                  else statusClass = styles.statusPending || ''; // fallback if pending style not defined

                  return (
                    <tr key={t._id}>
                      <td>
                        <div style={{color: '#fff'}}>{formattedDate}</div>
                        <div style={{fontSize: '0.75rem', color: '#9ca3af'}}>{formattedTime}</div>
                      </td>
                      <td>
                        <div className={styles.sourceCell}>
                          <div className={styles.brandIcon} style={{background: '#1434CB', color: '#fff'}}>{t.paymentMethod.charAt(0).toUpperCase()}</div>
                          <div>
                            <div style={{color: '#fff'}}>{t.fullName}</div>
                            <div style={{fontSize: '0.75rem', color: '#9ca3af'}}>{t.paymentMethod}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${statusClass}`}>
                          {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                        </span>
                      </td>
                      <td style={{color: '#fff', fontWeight: '500'}}>Rs. {t.amount.toLocaleString()}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                      No recent transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Static widgets temporarily hidden */}
        {/*
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          ...
        </div>
        */}
      </div>
    </div>
  );
}
