import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Send,
  CalendarDays,
  Filter,
  Search,
  ArrowUpDown,
  X,
} from 'lucide-react';

import StatusBadge from '../../../common/components/StatusBadge';
import Button from '../../../common/components/Button';
import { formatCurrency } from '../../../common/utils/formatters';
import { platformApi, pageItems } from '../../../common/services/platformApi';

import './DueOverdue.css';


/* =========================================================
   DATE HELPERS
   ========================================================= */

const MONTHS = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};


const getToday = () => {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
};


const normalizeDate = (date) => {
  if (!date) {
    return null;
  }

  /* Already a Date object */
  if (date instanceof Date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  const value = String(date).trim();

  /* Today */
  if (value.toLowerCase() === 'today') {
    return getToday();
  }

  /*
    Supports:
    10-Sep-2026
    05-Sep-2026
    01-Oct-2026
  */
  const match = value.match(
    /^(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{4})$/
  );

  if (match) {
    const day = Number(match[1]);

    const monthText =
      match[2].substring(0, 3);

    const year = Number(match[3]);

    const month =
      MONTHS[
        monthText.charAt(0).toUpperCase() +
        monthText.slice(1).toLowerCase()
      ];

    if (
      month !== undefined &&
      !Number.isNaN(day) &&
      !Number.isNaN(year)
    ) {
      return new Date(
        year,
        month,
        day
      );
    }
  }

  /*
    Supports:
    YYYY-MM-DD
  */
  const isoMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (isoMatch) {
    return new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3])
    );
  }

  return null;
};


const dateToKey = (date) => {
  const parsed = normalizeDate(date);

  if (!parsed) {
    return '';
  }

  const year = parsed.getFullYear();

  const month = String(
    parsed.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    parsed.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


const monthToKey = (date) => {
  const parsed = normalizeDate(date);

  if (!parsed) {
    return '';
  }

  const year = parsed.getFullYear();

  const month = String(
    parsed.getMonth() + 1
  ).padStart(2, '0');

  return `${year}-${month}`;
};


const yearToKey = (date) => {
  const parsed = normalizeDate(date);

  if (!parsed) {
    return '';
  }

  return String(
    parsed.getFullYear()
  );
};


const formatDisplayDate = (date) => {
  const parsed = normalizeDate(date);

  if (!parsed) {
    return date || '-';
  }

  return parsed.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
};


/* =========================================================
   STATUS HELPERS
   ========================================================= */

const isOverdue = (item) => {
  const status =
    String(item.status || '')
      .toLowerCase();

  return (
    status.includes('overdue') ||
    Number(item.daysOverdue) > 0
  );
};


const isDue = (item) => {
  return !isOverdue(item);
};


/* =========================================================
   COMPONENT
   ========================================================= */

export default function DueOverdue() {

  const [items, setItems] = useState([]);
  const [pageError, setPageError] = useState('');
  useEffect(() => {
    platformApi.collections.list({ pageSize: 200 })
      .then((payload) => setItems(pageItems(payload).map((item) => ({ ...item, loanId: item.loanNumber, dueAmount: item.due, daysOverdue: item.daysPastDue, status: item.daysPastDue > 0 ? 'Overdue' : 'Due' }))))
      .catch((error) => setPageError(error.message));
  }, []);


  /* =======================================================
     FILTER STATE
     ======================================================= */

  const [activeTab, setActiveTab] =
    useState('due');


  const [dateFilter, setDateFilter] =
    useState('all');


  const [selectedDate, setSelectedDate] =
    useState('');


  const [selectedMonth, setSelectedMonth] =
    useState('');


  const [selectedYear, setSelectedYear] =
    useState('');


  const [search, setSearch] =
    useState('');


  const [sortOrder, setSortOrder] =
    useState('asc');


  /* =======================================================
     CLEAR FILTERS
     ======================================================= */

  const clearDateFilter = () => {

    setDateFilter('all');

    setSelectedDate('');

    setSelectedMonth('');

    setSelectedYear('');
  };


  /* =======================================================
     DATE MATCHING
     ======================================================= */

  const matchesDateFilter = useCallback((item) => {

    if (dateFilter === 'all') {
      return true;
    }


    if (dateFilter === 'date') {

      if (!selectedDate) {
        return true;
      }

      return (
        dateToKey(item.dueDate) ===
        selectedDate
      );
    }


    if (dateFilter === 'month') {

      if (!selectedMonth) {
        return true;
      }

      return (
        monthToKey(item.dueDate) ===
        selectedMonth
      );
    }


    if (dateFilter === 'year') {

      if (!selectedYear) {
        return true;
      }

      return (
        yearToKey(item.dueDate) ===
        selectedYear
      );
    }


    return true;
  }, [dateFilter, selectedDate, selectedMonth, selectedYear]);


  /* =======================================================
     FILTER + SORT
     ======================================================= */

  const filteredItems = useMemo(() => {

    const searchValue =
      search.trim().toLowerCase();


    const filtered = items.filter(
      (item) => {

        /* -----------------------------------------------
           TAB FILTER
           ----------------------------------------------- */

        const matchesTab =
          activeTab === 'overdue'
            ? isOverdue(item)
            : isDue(item);


        if (!matchesTab) {
          return false;
        }


        /* -----------------------------------------------
           DATE FILTER
           ----------------------------------------------- */

        if (
          !matchesDateFilter(item)
        ) {
          return false;
        }


        /* -----------------------------------------------
           SEARCH
           ----------------------------------------------- */

        if (!searchValue) {
          return true;
        }


        const customer =
          String(
            item.customer || ''
          ).toLowerCase();


        const loanId =
          String(
            item.loanId || ''
          ).toLowerCase();


        return (
          customer.includes(
            searchValue
          ) ||
          loanId.includes(
            searchValue
          )
        );
      }
    );


    /* -----------------------------------------------
       SORT BY DATE
       ----------------------------------------------- */

    filtered.sort((a, b) => {

      const dateA =
        normalizeDate(a.dueDate);

      const dateB =
        normalizeDate(b.dueDate);


      const timeA =
        dateA
          ? dateA.getTime()
          : Number.MAX_SAFE_INTEGER;


      const timeB =
        dateB
          ? dateB.getTime()
          : Number.MAX_SAFE_INTEGER;


      return sortOrder === 'asc'
        ? timeA - timeB
        : timeB - timeA;
    });


    return filtered;

  }, [
    items,
    activeTab,
    matchesDateFilter,
    search,
    sortOrder,
  ]);


  /* =======================================================
     SUMMARY
     ======================================================= */

  const summary = useMemo(() => {

    const dueItems =
      items.filter(isDue);

    const overdueItems =
      items.filter(isOverdue);


    const dueToday =
      dueItems.filter(
        (item) =>
          dateToKey(item.dueDate) ===
          dateToKey(new Date())
      );


    const dueTodayAmount =
      dueToday.reduce(
        (total, item) =>
          total +
          Number(item.dueAmount || 0),
        0
      );


    const dueThisWeek =
      dueItems.filter((item) => {

        const date =
          normalizeDate(
            item.dueDate
          );

        if (!date) {
          return false;
        }


        const today =
          getToday();


        const endOfWeek =
          new Date(today);


        const day =
          today.getDay();


        const daysToSunday =
          7 - day;


        endOfWeek.setDate(
          today.getDate() +
          daysToSunday
        );


        return (
          date >= today &&
          date <= endOfWeek
        );
      });


    const dueThisWeekAmount =
      dueThisWeek.reduce(
        (total, item) =>
          total +
          Number(item.dueAmount || 0),
        0
      );


    const overdueAmount =
      overdueItems.reduce(
        (total, item) =>
          total +
          Number(item.dueAmount || 0),
        0
      );


    return {
      dueTodayCount:
        dueToday.length,

      dueTodayAmount,

      dueWeekCount:
        dueThisWeek.length,

      dueWeekAmount:
        dueThisWeekAmount,

      overdueCount:
        overdueItems.length,

      overdueAmount,
    };

  }, [items]);


  /* =======================================================
     SEND REMINDER
     ======================================================= */

  const handleSendReminder = async (item) => {
    try {
      await platformApi.collections.remind(item.id, { type: 'PaymentReminder', notes: `Payment reminder queued for ${item.customer}` });
    } catch (error) {
      setPageError(error.message);
    }
  };


  /* =======================================================
     ACTIVE FILTER TEXT
     ======================================================= */

  const activeFilterText =
    dateFilter === 'date' &&
    selectedDate
      ? `Date: ${selectedDate}`
      : dateFilter === 'month' &&
        selectedMonth
        ? `Month: ${selectedMonth}`
        : dateFilter === 'year' &&
          selectedYear
          ? `Year: ${selectedYear}`
          : 'All Dates';


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      {pageError && <p role="alert">{pageError}</p>}

    <div className="fin-due-page animate-fade-in">


      {/* =================================================
          HEADER
         ================================================= */}

      <div className="fin-due-header">

        <div>

          <h1 className="fin-due-title">
            Due &amp; Overdue
          </h1>

          <p className="fin-due-subtitle">
            Track upcoming and overdue interest payments
          </p>

        </div>

      </div>


      {/* =================================================
          ALERT
         ================================================= */}

      {summary.overdueCount > 0 && (

        <div className="fin-due-alert">

          <div className="fin-due-alert-icon">
            <AlertTriangle size={18} />
          </div>

          <div>

            <strong>
              {summary.overdueCount}{' '}
              overdue payment
              {summary.overdueCount !== 1
                ? 's'
                : ''}{' '}
              totalling{' '}
              {formatCurrency(
                summary.overdueAmount
              )}
            </strong>

            <span>
              Action required
            </span>

          </div>

        </div>

      )}


      {/* =================================================
          SUMMARY CARDS
         ================================================= */}

      <div className="fin-due-summary-grid">


        {/* TODAY */}

        <div className="fin-due-summary-card">

          <div className="fin-due-icon-box fin-due-orange">
            <Clock size={18} />
          </div>

          <div>

            <span className="fin-due-card-label">
              Due Today
            </span>

            <h3 className="fin-due-card-val">
              {formatCurrency(
                summary.dueTodayAmount
              )}
            </h3>

            <span className="fin-due-card-sub">
              {summary.dueTodayCount}{' '}
              Account
              {summary.dueTodayCount !== 1
                ? 's'
                : ''}
            </span>

          </div>

        </div>


        {/* THIS WEEK */}

        <div className="fin-due-summary-card">

          <div className="fin-due-icon-box fin-due-amber">
            <CalendarDays size={18} />
          </div>

          <div>

            <span className="fin-due-card-label">
              Due This Week
            </span>

            <h3 className="fin-due-card-val">
              {formatCurrency(
                summary.dueWeekAmount
              )}
            </h3>

            <span className="fin-due-card-sub">
              {summary.dueWeekCount}{' '}
              Account
              {summary.dueWeekCount !== 1
                ? 's'
                : ''}
            </span>

          </div>

        </div>


        {/* OVERDUE ACCOUNTS */}

        <div className="fin-due-summary-card fin-due-card-alert">

          <div className="fin-due-icon-box fin-due-red">
            <AlertTriangle size={18} />
          </div>

          <div>

            <span className="fin-due-card-label">
              Overdue Accounts
            </span>

            <h3 className="fin-due-card-val fin-val-red">
              {summary.overdueCount}
            </h3>

            <span className="fin-due-card-sub fin-sub-red">
              Requires follow-up
            </span>

          </div>

        </div>


        {/* OVERDUE AMOUNT */}

        <div className="fin-due-summary-card fin-due-card-alert">

          <div className="fin-due-icon-box fin-due-red">
            <AlertTriangle size={18} />
          </div>

          <div>

            <span className="fin-due-card-label">
              Overdue Amount
            </span>

            <h3 className="fin-due-card-val fin-val-red">
              {formatCurrency(
                summary.overdueAmount
              )}
            </h3>

            <span className="fin-due-card-sub fin-sub-red">
              Principal + Penalty
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          FILTER BAR
         ================================================= */}

      <div className="fin-due-filter-card">


        {/* SEARCH */}

        <div className="fin-due-search">

          <Search size={16} />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search customer or loan ID..."
          />

          {search && (

            <button
              type="button"
              className="fin-due-clear-search"
              onClick={() =>
                setSearch('')
              }
            >
              <X size={14} />
            </button>

          )}

        </div>


        {/* DATE FILTER */}

        <div className="fin-due-date-filter">

          <div className="fin-due-filter-label">
            <Filter size={14} />
            Date Filter
          </div>


          <select
            value={dateFilter}
            onChange={(e) => {

              setDateFilter(
                e.target.value
              );

              setSelectedDate('');
              setSelectedMonth('');
              setSelectedYear('');
            }}
            className="fin-due-filter-select"
          >

            <option value="all">
              All Dates
            </option>

            <option value="date">
              Specific Date
            </option>

            <option value="month">
              Month
            </option>

            <option value="year">
              Year
            </option>

          </select>


          {dateFilter === 'date' && (

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
              className="fin-due-date-input"
            />

          )}


          {dateFilter === 'month' && (

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(
                  e.target.value
                )
              }
              className="fin-due-date-input"
            />

          )}


          {dateFilter === 'year' && (

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value
                )
              }
              className="fin-due-filter-select fin-due-year-select"
            >

              <option value="">
                Select Year
              </option>

              {Array.from(
                { length: 7 },
                (_, index) =>
                  new Date()
                    .getFullYear() -
                  index
              ).map((year) => (

                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>

              ))}

            </select>

          )}

        </div>


        {/* SORT */}

        <button
          type="button"
          className="fin-due-sort-btn"
          onClick={() =>
            setSortOrder(
              sortOrder === 'asc'
                ? 'desc'
                : 'asc'
            )
          }
        >

          <ArrowUpDown size={15} />

          <span>
            {sortOrder === 'asc'
              ? 'Earliest First'
              : 'Latest First'}
          </span>

        </button>


        {/* CLEAR */}

        {(
          dateFilter !== 'all' ||
          search
        ) && (

          <button
            type="button"
            className="fin-due-reset-btn"
            onClick={() => {

              clearDateFilter();
              setSearch('');
            }}
          >

            <X size={14} />

            Clear

          </button>

        )}

      </div>


      {/* =================================================
          TABS
         ================================================= */}

      <div className="fin-due-tabs-wrapper">

        <div className="fin-due-tabs">

          <button
            type="button"
            className={
              activeTab === 'due'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveTab('due')
            }
          >

            Due Payments

            <span>
              {
                items.filter(isDue)
                  .length
              }
            </span>

          </button>


          <button
            type="button"
            className={`
              fin-due-overdue-tab
              ${
                activeTab === 'overdue'
                  ? 'active'
                  : ''
              }
            `}
            onClick={() =>
              setActiveTab('overdue')
            }
          >

            Overdue

            <span>
              {
                items.filter(isOverdue)
                  .length
              }
            </span>

          </button>

        </div>


        <div className="fin-due-active-filter">

          {activeFilterText}

        </div>

      </div>


      {/* =================================================
          TABLE CARD
         ================================================= */}

      <div className="fin-due-table-card">


        <div className="fin-due-table-heading">

          <div>

            <h3>
              {activeTab === 'overdue'
                ? 'Overdue Payments'
                : 'Due Payments'}
            </h3>

            <p>
              {filteredItems.length}{' '}
              record
              {filteredItems.length !== 1
                ? 's'
                : ''}{' '}
              found
            </p>

          </div>

        </div>


        {/* =================================================
            EMPTY STATE
           ================================================= */}

        {filteredItems.length === 0 ? (

          <div className="fin-due-empty">

            <div className="fin-due-empty-icon">
              <CalendarDays size={24} />
            </div>

            <h3>
              No payments found
            </h3>

            <p>
              There are no{' '}
              {activeTab === 'overdue'
                ? 'overdue'
                : 'due'}{' '}
              payments matching the selected filters.
            </p>

            <button
              type="button"
              onClick={() => {

                clearDateFilter();
                setSearch('');
              }}
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <div className="fin-due-table-wrapper">

            <table className="fin-due-table">

              <thead>

                <tr>

                  <th>CUSTOMER</th>

                  <th>LOAN ID</th>

                  <th>AMOUNT</th>

                  <th>DUE DATE</th>

                  {activeTab === 'overdue' && (
                    <th>DAYS OVERDUE</th>
                  )}

                  <th>STATUS</th>

                  <th className="fin-due-action-head">
                    ACTIONS
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredItems.map(
                  (row, idx) => (

                    <tr
                      key={
                        row.loanId ||
                        `${row.customer}-${idx}`
                      }
                      className={
                        activeTab === 'overdue'
                          ? 'fin-due-row-overdue'
                          : ''
                      }
                    >


                      {/* CUSTOMER */}

                      <td data-label="Customer">

                        <div className="fin-due-customer">

                          <div className="fin-due-avatar">

                            {String(
                              row.customer || '?'
                            )
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <strong>
                            {row.customer}
                          </strong>

                        </div>

                      </td>


                      {/* LOAN ID */}

                      <td data-label="Loan ID">

                        <span className="fin-due-loan-id">
                          {row.loanId}
                        </span>

                      </td>


                      {/* AMOUNT */}

                      <td data-label="Amount">

                        <strong className="fin-due-amount">
                          {formatCurrency(
                            row.dueAmount
                          )}
                        </strong>

                      </td>


                      {/* DATE */}

                      <td data-label="Due Date">

                        <span
                          className={
                            dateToKey(
                              row.dueDate
                            ) ===
                            dateToKey(
                              new Date()
                            )
                              ? 'fin-due-today'
                              : ''
                          }
                        >

                          {formatDisplayDate(
                            row.dueDate
                          )}

                        </span>

                      </td>


                      {/* DAYS OVERDUE */}

                      {activeTab === 'overdue' && (

                        <td data-label="Days Overdue">

                          <span className="fin-due-days-pill">

                            {row.daysOverdue ||
                              0}{' '}

                            {Number(
                              row.daysOverdue
                            ) === 1
                              ? 'Day'
                              : 'Days'}{' '}

                            Overdue

                          </span>

                        </td>

                      )}


                      {/* STATUS */}

                      <td data-label="Status">

                        <StatusBadge
                          status={
                            activeTab === 'overdue'
                              ? 'Overdue'
                              : row.status
                          }
                        />

                      </td>


                      {/* ACTIONS */}

                      <td
                        data-label="Actions"
                        className="fin-due-action-cell"
                      >

                        <div className="fin-due-actions">

                          <Button
                            variant="secondary"
                            size="small"
                            icon={Send}
                            onClick={() =>
                              handleSendReminder(row)
                            }
                          >
                            Send Reminder
                          </Button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
    </>
  );
}
