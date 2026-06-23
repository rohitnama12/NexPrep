"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MCQ_COLORS = ["#10b981", "#f59e0b", "#ef4444"]; // Emerald, Amber, Red

export function DSATopicsChart({ data }: { data: any[] }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === 'light';

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#e4e4e7" : "#3f3f46"} vertical={false} opacity={0.5} />
          <XAxis dataKey="name" stroke={isLight ? "#71717a" : "#a1a1aa"} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={isLight ? "#71717a" : "#a1a1aa"} fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isLight ? "rgba(255, 255, 255, 0.9)" : "rgba(24, 24, 27, 0.9)", 
              border: isLight ? "1px solid rgba(228, 228, 231, 0.8)" : "1px solid rgba(63, 63, 70, 0.5)", 
              borderRadius: "8px", 
              backdropFilter: "blur(12px)" 
            }}
            itemStyle={{ color: isLight ? "#18181b" : "#e4e4e7" }}
          />
          <Area
            type="monotone"
            dataKey="solved"
            stroke="#8b5cf6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSolved)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MCQPerformanceChart({ data }: { data: any[] }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === 'light';

  return (
    <div className="h-[250px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            animationDuration={1500}
          >
            {data.map((entry, index) => {
              // Ensure consistent colors based on name: Easy, Medium, Hard
              let color = MCQ_COLORS[0];
              if (entry.name === "Medium") color = MCQ_COLORS[1];
              if (entry.name === "Hard") color = MCQ_COLORS[2];
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isLight ? "rgba(255, 255, 255, 0.9)" : "rgba(24, 24, 27, 0.9)", 
              border: isLight ? "1px solid rgba(228, 228, 231, 0.8)" : "1px solid rgba(63, 63, 70, 0.5)", 
              borderRadius: "8px", 
              backdropFilter: "blur(12px)" 
            }}
            itemStyle={{ color: isLight ? "#18181b" : "#e4e4e7" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConsistencyHeatmap({ data }: { data: any[] }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && theme === 'light';

  // We need to inject a fake empty dataset if data is empty because the calendar requires at least one date.
  // We'll provide dummy dates going back 6 months.
  const calData = data.length > 0 ? data : [{
    date: new Date().toISOString().split("T")[0],
    count: 0,
    level: 0
  }];

  return (
    <div className="w-full flex items-center justify-start md:justify-center overflow-x-auto p-4 py-8">
      <div className="min-w-max">
        <ActivityCalendar
          data={calData}
          theme={{
            light: ['#f4f4f5', '#bbf7d0', '#4ade80', '#22c55e', '#166534'],
            dark: ['#27272a', '#064e3b', '#047857', '#10b981', '#34d399']
          }}
          colorScheme={isLight ? "light" : "dark"}
          labels={{
            totalCount: `{{count}} contributions in the last year`,
          }}
          blockSize={14}
          blockMargin={5}
          fontSize={14}
        />
      </div>
    </div>
  );
}
