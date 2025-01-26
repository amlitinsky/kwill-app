'use client'

import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  TooltipProps,
  CartesianGrid
} from "recharts"
import { Meeting } from "@/lib/supabase-server"

interface MeetingChartsProps {
  metrics: Meeting['metrics']
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      name: string;
      value: number;
    };
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {payload[0].value} {label?.includes('Rate') ? '%' : label?.includes('Duration') ? ' min' : ''}
        </p>
      </div>
    )
  }
  return null
}

export function MeetingCharts({ metrics }: MeetingChartsProps) {
  if (!metrics) return null

  // Transform data for charts
  const speakerData = Object.entries(metrics.speaker_participation || {}).map(([name, value]) => ({
    name,
    value: Math.round(value)
  }))

  const topicData = Object.entries(metrics.topic_distribution || {}).map(([name, value]) => ({
    name,
    value: Math.round(value)
  }))

  const metricsData = [
    { 
      name: 'Duration', 
      value: Math.round(metrics.duration / 60), 
      unit: 'min',
      color: COLORS[0]
    },
    { 
      name: 'Fields', 
      value: metrics.fields_analyzed, 
      unit: '',
      color: COLORS[1]
    },
    { 
      name: 'Success Rate', 
      value: Math.round(metrics.success_rate), 
      unit: '%',
      color: COLORS[2]
    }
  ]

  return (
    <div className="space-y-8">
      {/* Key Metrics Bar Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={metricsData} 
              margin={{ top: 40, right: 50, left: 50, bottom: 20 }}
              barSize={30}
              maxBarSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground)/0.2)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--muted-foreground)/0.2)' }}
                tickLine={false}
                interval={0}
                height={60}
                angle={0}
                textAnchor="middle"
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--muted-foreground)/0.2)' }}
                tickLine={false}
                width={60}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                label={{
                  position: 'top',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12,
                  formatter: (value: number) => {
                    const metric = metricsData.find(d => d.value === value);
                    return `${value}${metric?.unit || ''}`;
                  }
                }}
              >
                {metricsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speaker Participation Pie Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Speaker Participation</h3>
          <div className="bg-muted/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={speakerData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ value }) => `${value}%`}
                  labelLine={false}
                >
                  {speakerData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {speakerData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name} ({entry.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Topic Distribution Pie Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Topic Distribution</h3>
          <div className="bg-muted/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topicData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ value }) => `${value}%`}
                  labelLine={false}
                >
                  {topicData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {topicData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name} ({entry.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Processing Progress Line Chart */}
      {metrics.progress !== undefined && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Processing Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[
              { name: 'Start', progress: 0 },
              { name: 'Current', progress: metrics.progress },
              { name: 'Target', progress: 100 }
            ]}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Progress']}
                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
              />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}