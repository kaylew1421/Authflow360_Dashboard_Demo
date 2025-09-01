import React from "react";
import WeeklyCalendar from "../components/WeeklyCalendar";
import TaskStatusPieChart from "../components/TaskStatusPieChart";
import TaskPriorityTable from "../components/TaskPriorityTable";
import DailyAssignments from "../components/DailyAssignments";
import TeamAnalytics from "../components/TeamAnalytics";
import Announcements from "../components/Announcements";

const Home = () => {
  return (
    <div className="min-h-screen bg-white p-6 space-y-8">
      {/* Page Title */}
      <header>
        <h1 className="text-2xl font-bold text-gray-800">🏠 AuthFlow360 Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here’s what’s happening this week.</p>
      </header>

      {/* Weekly Calendar */}
      <section>
        <WeeklyCalendar />
      </section>

      {/* Daily Assignments */}
      <section>
        <DailyAssignments />
      </section>

      {/* Task Analytics */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TaskStatusPieChart />
        <TaskPriorityTable />
      </section>

      {/* Team Analytics Overview */}
      <section>
        <TeamAnalytics />
      </section>

      {/* Company Announcements */}
      <section>
        <Announcements />
      </section>
    </div>
  );
};

export default Home;
