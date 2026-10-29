import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  TableProperties
} from 'lucide-react';
import GlassCard from '../components/Common/GlassCard';
import LoadingSpinner, { Badge } from '../components/Common/LoadingSpinner';
import { weatherApi } from '../api/weatherApi';

export default function WeatherRecords({ locations = [] }) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('observation_date');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [pagination, setPagination] = useState({ total_records: 0, total_pages: 1 });

  // Range filters
  const [showRangeFilters, setShowRangeFilters] = useState(false);
  const [minTemp, setMinTemp] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [minHum, setMinHum] = useState('');
  const [maxHum, setMaxHum] = useState('');
  const [minRain, setMinRain] = useState('');
  const [maxRain, setMaxRain] = useState('');

  const fetchRecords = async () => {
    setIsLoading(true);
    const params = {
      search,
      location: selectedLocation !== 'all' ? selectedLocation : '',
      start_date: startDate,
      end_date: endDate,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      page_size: pageSize,
      min_temp: minTemp || '',
      max_temp: maxTemp || '',
      min_hum: minHum || '',
      max_hum: maxHum || '',
      min_rain: minRain || '',
      max_rain: maxRain || '',
    };

    try {
      const res = await weatherApi.getRecords(params);
      if (res.success) {
        setRecords(res.data.records);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedLocation, startDate, endDate, sortBy, sortOrder, page, pageSize]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    setPage(1);
  };

  const resetAllFilters = () => {
    setSearch('');
    setSelectedLocation('all');
    setStartDate('');
    setEndDate('');
    setMinTemp('');
    setMaxTemp('');
    setMinHum('');
    setMaxHum('');
    setMinRain('');
    setMaxRain('');
    setPage(1);
    fetchRecords();
  };

  const exportUrl = weatherApi.getRecordsExportUrl({
    search,
    location: selectedLocation !== 'all' ? selectedLocation : '',
    start_date: startDate,
    end_date: endDate,
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Control Deck */}
      <GlassCard className="p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-4">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="records-search-input"
              type="text"
              placeholder="Search by location name or date (e.g. Seattle, 2026-03)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </form>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRangeFilters(!showRangeFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showRangeFilters
                  ? 'bg-violet-600/25 text-violet-300 border-violet-500/40 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Range Filters</span>
            </button>

            <a
              id="export-records-csv-btn"
              href={exportUrl}
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Primary Dropdowns (Location & Date) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by Location"
            className="px-3 py-2.5 rounded-xl glass-input text-xs cursor-pointer"
          >
            <option value="all">All Locations ({locations.length})</option>
            {locations.map((loc) => (
              <option key={loc} value={loc} className="bg-obsidian-900 text-white">
                {loc}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            placeholder="From Date"
            aria-label="From Date"
            className="px-3 py-2.5 rounded-xl glass-input text-xs"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            placeholder="To Date"
            aria-label="To Date"
            className="px-3 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Collapsible Range Filters */}
        {showRangeFilters && (
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-in fade-in duration-150">
            {/* Temp Range */}
            <div>
              <span className="text-gray-400 font-medium mb-1 block">Temperature Range (°C):</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min °C"
                  value={minTemp}
                  onChange={(e) => setMinTemp(e.target.value)}
                  className="w-1/2 p-2 rounded-lg glass-input text-xs"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max °C"
                  value={maxTemp}
                  onChange={(e) => setMaxTemp(e.target.value)}
                  className="w-1/2 p-2 rounded-lg glass-input text-xs"
                />
              </div>
            </div>

            {/* Humidity Range */}
            <div>
              <span className="text-gray-400 font-medium mb-1 block">Humidity Range (%):</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min %"
                  value={minHum}
                  onChange={(e) => setMinHum(e.target.value)}
                  className="w-1/2 p-2 rounded-lg glass-input text-xs"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max %"
                  value={maxHum}
                  onChange={(e) => setMaxHum(e.target.value)}
                  className="w-1/2 p-2 rounded-lg glass-input text-xs"
                />
              </div>
            </div>

            {/* Rainfall Range */}
            <div>
              <span className="text-gray-400 font-medium mb-1 block">Rainfall Range (mm):</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min mm"
                  value={minRain}
                  onChange={(e) => setMinRain(e.target.value)}
                  className="w-1/2 p-2 rounded-lg glass-input text-xs"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max mm"
                  value={maxRain}
                  onChange={(e) => setMaxRain(e.target.value)}
                  className="w-1/2 p-2 rounded-lg glass-input text-xs"
                />
                <button
                  onClick={() => {
                    setPage(1);
                    fetchRecords();
                  }}
                  className="px-3 py-2 rounded-lg bg-violet-600/30 text-violet-300 font-semibold hover:bg-violet-600/40"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Main Table */}
      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="py-20">
            <LoadingSpinner text="Retrieving verified weather records..." />
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs">
            <TableProperties className="w-10 h-10 mx-auto text-gray-600 mb-3" />
            <div className="text-sm font-bold text-white mb-1">No Weather Records Found</div>
            <p className="max-w-xs mx-auto mb-4">No observations matched your current filter criteria.</p>
            <button
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-violet-300 border border-white/10 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0D18] uppercase text-gray-400 font-semibold border-b border-white/5 sticky top-0 z-10">
                <tr>
                  <th
                    onClick={() => handleSort('record_id')}
                    className="p-3.5 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>ID</span>
                      {sortBy === 'record_id' ? (
                        sortOrder === 'ASC' ? <ArrowUp className="w-3.5 h-3.5 text-violet-400" /> : <ArrowDown className="w-3.5 h-3.5 text-violet-400" />
                      ) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('observation_date')}
                    className="p-3.5 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Observation Date</span>
                      {sortBy === 'observation_date' ? (
                        sortOrder === 'ASC' ? <ArrowUp className="w-3.5 h-3.5 text-violet-400" /> : <ArrowDown className="w-3.5 h-3.5 text-violet-400" />
                      ) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('location')}
                    className="p-3.5 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Station / Location</span>
                      {sortBy === 'location' ? (
                        sortOrder === 'ASC' ? <ArrowUp className="w-3.5 h-3.5 text-violet-400" /> : <ArrowDown className="w-3.5 h-3.5 text-violet-400" />
                      ) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('temperature')}
                    className="p-3.5 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Temperature (°C)</span>
                      {sortBy === 'temperature' ? (
                        sortOrder === 'ASC' ? <ArrowUp className="w-3.5 h-3.5 text-violet-400" /> : <ArrowDown className="w-3.5 h-3.5 text-violet-400" />
                      ) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('humidity')}
                    className="p-3.5 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Humidity (%)</span>
                      {sortBy === 'humidity' ? (
                        sortOrder === 'ASC' ? <ArrowUp className="w-3.5 h-3.5 text-violet-400" /> : <ArrowDown className="w-3.5 h-3.5 text-violet-400" />
                      ) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                    </div>
                  </th>

                  <th
                    onClick={() => handleSort('rainfall')}
                    className="p-3.5 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Rainfall (mm)</span>
                      {sortBy === 'rainfall' ? (
                        sortOrder === 'ASC' ? <ArrowUp className="w-3.5 h-3.5 text-violet-400" /> : <ArrowDown className="w-3.5 h-3.5 text-violet-400" />
                      ) : <ArrowUpDown className="w-3 h-3 text-gray-600" />}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-gray-300">
                {records.map((r) => (
                  <tr key={r.record_id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-mono text-gray-500">#{r.record_id}</td>
                    <td className="p-3.5 font-semibold text-white whitespace-nowrap">{r.observation_date}</td>
                    <td className="p-3.5 text-violet-300 font-semibold">{r.location}</td>
                    <td className="p-3.5">
                      {r.temperature !== null ? (
                        <span className={`font-semibold ${r.temperature > 30 ? 'text-rose-400' : r.temperature < 5 ? 'text-indigo-400' : 'text-amber-300'}`}>
                          {r.temperature}°C
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">NULL (Missing)</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {r.humidity !== null ? (
                        <span className="font-semibold text-emerald-400">{r.humidity}%</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">NULL (Missing)</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {r.rainfall !== null ? (
                        r.rainfall === 0.0 ? (
                          <span className="text-gray-400 font-mono">0.0 mm (Dry)</span>
                        ) : (
                          <span className="font-bold text-amber-300 font-mono">{r.rainfall} mm</span>
                        )
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">NULL (Missing)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-[#0A0D18] border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div>
            Showing <span className="font-semibold text-white">{records.length}</span> of{' '}
            <span className="font-semibold text-white">{pagination.total_records?.toLocaleString()}</span> records
          </div>

          <div className="flex items-center gap-3">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              aria-label="Rows per page"
              className="px-2.5 py-1 rounded-lg glass-input text-xs cursor-pointer"
            >
              <option value={15}>15 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-mono text-white text-xs">
                {page} / {pagination.total_pages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={page >= pagination.total_pages}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
