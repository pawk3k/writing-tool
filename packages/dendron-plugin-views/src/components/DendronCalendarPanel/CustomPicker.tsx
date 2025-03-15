"use client";

import { useState, useEffect, useRef } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMonths,
  addYears,
  subMonths,
  subYears,
  addDays,
  isSameDay,
  eachDayOfInterval,
  getMonth,
  getYear,
  setMonth,
  isSameMonth,
} from "date-fns";

type ViewMode = "week" | "month" | "year";

interface MultiViewDatePickerProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
}

export function MultiViewDatePicker({
  selected,
  onSelect,
  className = "",
}: MultiViewDatePickerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState<Date>(selected || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(selected);
  const [animationDirection, setAnimationDirection] = useState<
    "left" | "right" | null
  >(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) {
      setSelectedDate(selected);
      setCurrentDate(selected);
    }
  }, [selected]);

  // Close select dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsSelectOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    console.log("onSelect");
    if (onSelect && date) {
      console.log("onSelect in");
      onSelect(date);
    }
  };

  const handlePrevious = () => {
    setAnimationDirection("left");
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate);
      setCurrentDate(addDays(weekStart, -7));
    } else if (viewMode === "year") {
      setCurrentDate(subYears(currentDate, 1));
    }

    // Reset animation direction after animation completes
    setTimeout(() => setAnimationDirection(null), 300);
  };

  const handleNext = () => {
    setAnimationDirection("right");
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate);
      setCurrentDate(addDays(weekStart, 7));
    } else if (viewMode === "year") {
      setCurrentDate(addYears(currentDate, 1));
    }

    // Reset animation direction after animation completes
    setTimeout(() => setAnimationDirection(null), 300);
  };

  const getDateRangeText = () => {
    if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return `${format(weekStart, "MMM d")} - ${format(
        weekEnd,
        "MMM d, yyyy"
      )}`;
    } else if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy");
    } else {
      return format(currentDate, "yyyy");
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = setMonth(currentDate, monthIndex);
    setCurrentDate(newDate);
    setViewMode("month");
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setIsSelectOpen(false);
  };

  // Utility function to combine class names conditionally
  const cn = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(" ");
  };

  // Custom week view rendering
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div
        className={cn(
          "p-3 transition-transform duration-300 ease-in-out",
          animationDirection === "left" ? "translate-x-2 opacity-0" : "",
          animationDirection === "right" ? "-translate-x-2 opacity-0" : ""
        )}
      >
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="text-center text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map((day, index) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                type="button"
                key={index}
                className={cn(
                  "h-10 w-full rounded-md flex items-center justify-center text-sm transition-colors",
                  isSelected ? "bg-blue-600 text-white" : "",
                  isToday && !isSelected
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                    : "",
                  !isSelected && !isToday
                    ? "hover:bg-gray-100 dark:hover:bg-gray-700"
                    : ""
                )}
                onClick={() => handleDateSelect(day)}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Custom month view rendering
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div
        className={cn(
          "p-3 transition-transform duration-300 ease-in-out",
          animationDirection === "left" ? "translate-x-2 opacity-0" : "",
          animationDirection === "right" ? "-translate-x-2 opacity-0" : ""
        )}
      >
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, index) => (
            <div
              key={index}
              className="text-center text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <button
                type="button"
                key={index}
                className={cn(
                  "h-10 w-full rounded-md flex items-center justify-center text-sm transition-colors",
                  isSelected ? "bg-blue-600 text-white" : "",
                  isToday && !isSelected
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                    : "",
                  !isCurrentMonth && !isSelected
                    ? "text-gray-400 dark:text-gray-500 opacity-50"
                    : "",
                  !isSelected && !isToday
                    ? "hover:bg-gray-100 dark:hover:bg-gray-700"
                    : ""
                )}
                onClick={() => handleDateSelect(day)}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Custom year view rendering
  const renderYearView = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const currentYear = getYear(currentDate);
    const today = new Date();
    const currentMonth = getMonth(today);
    const isCurrentYear = getYear(today) === currentYear;

    return (
      <div
        className={cn(
          "p-3 transition-transform duration-300 ease-in-out",
          animationDirection === "left" ? "translate-x-2 opacity-0" : "",
          animationDirection === "right" ? "-translate-x-2 opacity-0" : ""
        )}
      >
        <div className="grid grid-cols-3 gap-4">
          {months.map((month, index) => {
            const isSelected =
              selectedDate &&
              getMonth(selectedDate) === index &&
              getYear(selectedDate) === currentYear;
            const isCurrentMonthAndYear =
              isCurrentYear && currentMonth === index;

            return (
              <button
                key={index}
                type="button"
                className={cn(
                  "p-4 rounded-lg flex flex-col items-center justify-center transition-colors border",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 dark:border-gray-700",
                  isCurrentMonthAndYear && !isSelected
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                    : "",
                  !isSelected && !isCurrentMonthAndYear
                    ? "hover:bg-gray-100 dark:hover:bg-gray-700"
                    : ""
                )}
                onClick={() => handleMonthSelect(index)}
              >
                <span className="text-sm font-medium">{month}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-800 ${className}`}
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Custom button for previous */}
          <button
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={handlePrevious}
            type="button"
          >
            {"<"}
          </button>

          <span className="font-medium min-w-32 text-center">
            {getDateRangeText()}
          </span>

          {/* Custom button for next */}
          <button
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={handleNext}
            type="button"
          >
            {">"}
          </button>
        </div>

        {/* Custom select dropdown */}
        <div className="relative" ref={selectRef}>
          <button
            className="h-9 px-3 flex items-center justify-between rounded-md border border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-[120px] text-sm"
            onClick={() => setIsSelectOpen(!isSelectOpen)}
            type="button"
          >
            <span>{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</span>V
          </button>

          {isSelectOpen && (
            <div className="absolute top-full mt-1 w-[120px] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md z-10">
              <div className="py-1">
                <button
                  className={`w-full text-left px-3 py-1.5 text-sm ${
                    viewMode === "week"
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleViewModeChange("week")}
                  type="button"
                >
                  Week
                </button>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-1.5 text-sm ${
                    viewMode === "month"
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleViewModeChange("month")}
                >
                  Month
                </button>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-1.5 text-sm ${
                    viewMode === "year"
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleViewModeChange("year")}
                >
                  Year
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {viewMode === "week" && renderWeekView()}
      {viewMode === "month" && renderMonthView()}
      {viewMode === "year" && renderYearView()}
    </div>
  );
}
