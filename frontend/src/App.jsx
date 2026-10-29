import React, { useState, useEffect } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import FilterBar from './components/Layout/FilterBar';

import Overview from './pages/Overview';
import DataImport from './pages/DataImport';
import WeatherRecords from './pages/WeatherRecords';
import TemperatureAnalytics from './pages/TemperatureAnalytics';
import HumidityAnalytics from './pages/HumidityAnalytics';
import RainfallAnalytics from './pages/RainfallAnalytics';
import CombinedAnalytics from './pages/CombinedAnalytics';
import MonthlyReports from './pages/MonthlyReports';
import DataQuality from './pages/DataQuality';
import Settings from './pages/Settings';

import { weatherApi } from './api/weatherApi';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const TAB_METADATA = {
  overview: {
    title: 'Climate Intelligence Dashboard',
    subtitle: 'Real-time meteorological aggregates, key climate metrics & temporal patterns',
    showFilters: true,
  },
  import: {
    title: 'Data Ingestion & Quality Gate',
    subtitle: 'Upload, validate, and preview weather CSV records with strict error detection',
    showFilters: false,
  },
  records: {
    title: 'Weather Records Archive',
    subtitle: 'Complete database of historical observations with search, sorting & range filters',
    showFilters: false,
  },
  temperature: {
    title: 'Thermal & Temperature Dynamics',
    subtitle: 'Daily thermal envelopes, monthly trends, distribution histograms & extreme records',
    showFilters: true,
  },
  humidity: {
    title: 'Atmospheric Moisture & Humidity',
    subtitle: 'Relative humidity trends, monthly saturation metrics, and geographical comparisons',
    showFilters: true,
  },
  rainfall: {
    title: 'Precipitation & Rainfall Analytics',
    subtitle: 'Cumulative rainfall volume, rainy day frequency, and drought period tracking',
    showFilters: true,
  },
  combined: {
    title: 'Synchronized Weather Analysis',
    subtitle: 'Simultaneous multi-parameter climate analysis across independent axes',
    showFilters: true,
  },
  reports: {
    title: 'Monthly Meteorological Reports',
    subtitle: 'Formal monthly climate summaries, completeness verification & exportable reports',
    showFilters: false,
  },
  quality: {
    title: 'Data Quality & Anomaly Detection',
    subtitle: 'Comprehensive sensor auditing, out-of-range detection & error tracking',
    showFilters: false,
  },
  settings: {
    title: 'System Settings & Theme Runtime',
    subtitle: 'MySQL connectivity, database maintenance, theme palette & sample data seeding',
    showFilters: false,
  },
};

function MainApp() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Filter State
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);

  // Database status
  const [dbStatus, setDbStatus] = useState(null);

  // Overview Data Cache
  const [overviewData, setOverviewData] = useState(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);

  // Seeding State
  const [isSeeding, setIsSeeding] = useState(false);

  const { theme } = useTheme();

  // Load Filter Metadata and DB Status
  const refreshMetadata = async () => {
    try {
      const [filterRes, dbRes] = await Promise.all([
        weatherApi.getFilterOptions(),
        weatherApi.getDbStatus(),
      ]);

      if (filterRes.success) {
        setLocations(filterRes.data.locations || []);
        setTotalRecords(filterRes.data.total_records || 0);
      }
      if (dbRes.success) {
        setDbStatus(dbRes.database);
      }
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  // Load Overview Data
  const refreshOverview = async () => {
    setIsOverviewLoading(true);
    try {
      const res = await weatherApi.getOverview({
        location: selectedLocation !== 'all' ? selectedLocation : '',
        start_date: startDate,
        end_date: endDate,
      });
      if (res.success) {
        setOverviewData(res.data);
      }
    } catch (err) {
      console.error('Failed to load overview:', err);
    } finally {
      setIsOverviewLoading(false);
    }
  };

  useEffect(() => {
    refreshMetadata();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      refreshOverview();
    }
  }, [selectedLocation, startDate, endDate, activeTab]);

  const handleResetFilters = () => {
    setSelectedLocation('all');
    setStartDate('');
    setEndDate('');
  };

  const handleDateChange = (start, end) => {
    setStartDate(start || '');
    setEndDate(end || '');
  };

  const handleSeedSampleData = async () => {
    setIsSeeding(true);
    try {
      const res = await weatherApi.seedSampleData();
      if (res.success) {
        await refreshMetadata();
        await refreshOverview();
        setActiveTab('overview');
      } else {
        alert(`Failed to seed data: ${res.error}`);
      }
    } catch (err) {
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDataReset = async () => {
    await refreshMetadata();
    await refreshOverview();
    setActiveTab('overview');
  };

  const handleImportSuccess = async () => {
    await refreshMetadata();
    await refreshOverview();
  };

  const currentMeta = TAB_METADATA[activeTab] || TAB_METADATA.overview;

  return (
    <div
      className="min-h-screen text-gray-100 flex flex-col selection:bg-violet-500 selection:text-white"
      style={{ backgroundColor: theme.bodyBg }}
    >
      {/* Collapsible Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Top Header */}
        <Header
          pageTitle={currentMeta.title}
          pageSubtitle={currentMeta.subtitle}
          dbStatus={dbStatus}
          onOpenMobile={() => setIsMobileMenuOpen(true)}
          onLoadSample={handleSeedSampleData}
          isSeeding={isSeeding}
          onRefresh={() => {
            refreshMetadata();
            if (activeTab === 'overview') refreshOverview();
          }}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* Global Filter Bar */}
          {currentMeta.showFilters && totalRecords > 0 && (
            <FilterBar
              locations={locations}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
              onResetFilters={handleResetFilters}
              totalRecords={totalRecords}
            />
          )}

          {/* Active Tab Router */}
          {activeTab === 'overview' && (
            <Overview
              overviewData={overviewData}
              isLoading={isOverviewLoading}
              onNavigateTab={setActiveTab}
              onLoadSample={handleSeedSampleData}
              isSeeding={isSeeding}
            />
          )}

          {activeTab === 'import' && (
            <DataImport
              onImportSuccess={handleImportSuccess}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'records' && (
            <WeatherRecords locations={locations} />
          )}

          {activeTab === 'temperature' && (
            <TemperatureAnalytics
              location={selectedLocation}
              startDate={startDate}
              endDate={endDate}
            />
          )}

          {activeTab === 'humidity' && (
            <HumidityAnalytics
              location={selectedLocation}
              startDate={startDate}
              endDate={endDate}
            />
          )}

          {activeTab === 'rainfall' && (
            <RainfallAnalytics
              location={selectedLocation}
              startDate={startDate}
              endDate={endDate}
            />
          )}

          {activeTab === 'combined' && (
            <CombinedAnalytics
              location={selectedLocation}
              startDate={startDate}
              endDate={endDate}
            />
          )}

          {activeTab === 'reports' && (
            <MonthlyReports locations={locations} />
          )}

          {activeTab === 'quality' && (
            <DataQuality />
          )}

          {activeTab === 'settings' && (
            <Settings
              dbStatus={dbStatus}
              onLoadSample={handleSeedSampleData}
              isSeeding={isSeeding}
              onDataReset={handleDataReset}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
