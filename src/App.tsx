/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  Upload, 
  FileSpreadsheet, 
  Activity, 
  Hospital, 
  ShieldCheck, 
  TrendingUp,
  Filter,
  Download,
  Users,
  Clock,
  Database,
  Link as LinkIcon,
  Menu,
  Bell,
  Mail,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface SISData {
  AÑO: number | string;
  MES: number | string;
  REGION: string;
  PROVINCIA: string;
  UBIGEO_DISTRITO: string;
  DISTRITO: string;
  COD_UNIDAD_EJECUTORA: string;
  DESC_UNIDAD_EJECUTORA: string;
  COD_IPRESS: string;
  DESC_IPRESS?: string;
  NIVEL_EESS: string;
  PLAN_DE_SEGURO: string;
  COD_SERVICIO: string;
  DESC_SERVICIO: string;
  SEXO: string;
  GRUPO_EDAD: string;
  ATENCIONES: number;
}

const THEME_COLORS = ['#1ABB9C', '#34495E', '#9B59B6', '#3498DB', '#E74C3C', '#F39C12', '#BDC3C7'];

export default function App() {
  const [data, setData] = useState<SISData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws) as SISData[];
      
      const cleanedData = jsonData.map(item => ({
        ...item,
        ATENCIONES: Number(item.ATENCIONES) || 0
      }));
      
      setData(cleanedData);
    };
    reader.readAsBinaryString(file);
  };

  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const totalAttentions = data.reduce((sum, item) => sum + item.ATENCIONES, 0);
    
    // Attentions by IPRESS
    const ipressMap = new Map<string, number>();
    data.forEach(item => {
      const key = item.DESC_UNIDAD_EJECUTORA || item.COD_IPRESS;
      ipressMap.set(key, (ipressMap.get(key) || 0) + item.ATENCIONES);
    });

    const ipressData = Array.from(ipressMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const totalIpress = ipressMap.size;

    // Attentions by Plan de Seguro
    const planMap = new Map<string, number>();
    data.forEach(item => {
      const key = item.PLAN_DE_SEGURO;
      planMap.set(key, (planMap.get(key) || 0) + item.ATENCIONES);
    });

    const planData = Array.from(planMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Trend Data (by Month/Year)
    const trendMap = new Map<string, number>();
    data.forEach(item => {
      const key = `${item.AÑO}-${String(item.MES).padStart(2, '0')}`;
      trendMap.set(key, (trendMap.get(key) || 0) + item.ATENCIONES);
    });

    const trendData = Array.from(trendMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      totalAttentions,
      totalIpress,
      ipressData,
      planData,
      trendData
    };
  }, [data]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      processFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#73879C] font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-[#EDEDED] border-b border-[#D9DEE4] h-14 flex items-center justify-between px-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Menu className="w-5 h-5 cursor-pointer text-[#5A738E]" />
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#1ABB9C]" />
            <span className="font-bold text-[#5A738E] hidden sm:inline">SIS DASHBOARD</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer">
            <Mail className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#1ABB9C] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">6</span>
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#D9DEE4] flex items-center justify-center overflow-hidden">
              <User className="w-5 h-5 text-[#73879C]" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">John Doe</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div 
              className={cn(
                "w-full max-w-2xl p-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-300",
                isDragging ? "border-[#1ABB9C] bg-[#1ABB9C]/5" : "border-[#D9DEE4] bg-white shadow-sm"
              )}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="bg-[#1ABB9C]/10 p-6 rounded-full mb-6">
                <Upload className="w-12 h-12 text-[#1ABB9C]" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-[#5A738E]">Cargar Datos SIS</h2>
              <p className="text-[#73879C] mb-8 text-center max-w-md">
                Sube tu archivo Excel para visualizar las atenciones realizadas.
              </p>
              <label className="cursor-pointer">
                <Button className="bg-[#1ABB9C] hover:bg-[#16a085] text-white px-10 py-6 rounded-md text-lg font-medium pointer-events-none">
                  Seleccionar Archivo
                </Button>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Row - Gentelella Style */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-white p-6 rounded shadow-sm border border-[#E6E9ED]">
              <div className="border-l-2 border-[#E6E9ED] pl-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-1">
                  <Users className="w-3 h-3" /> Total Atenciones
                </div>
                <div className="text-3xl font-bold text-[#34495E] leading-none mb-1">
                  {stats?.totalAttentions.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-[#1ABB9C]">
                  4% <span className="text-[#73879C] font-normal">From last Week</span>
                </div>
              </div>

              <div className="border-l-2 border-[#E6E9ED] pl-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-1">
                  <Clock className="w-3 h-3" /> Promedio Mensual
                </div>
                <div className="text-3xl font-bold text-[#34495E] leading-none mb-1">
                  {(stats!.totalAttentions / (stats!.trendData.length || 1)).toFixed(0)}
                </div>
                <div className="text-[10px] font-bold text-[#1ABB9C]">
                  3% <span className="text-[#73879C] font-normal">From last Week</span>
                </div>
              </div>

              <div className="border-l-2 border-[#E6E9ED] pl-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-1">
                  <Hospital className="w-3 h-3" /> Total IPRESS
                </div>
                <div className="text-3xl font-bold text-[#1ABB9C] leading-none mb-1">
                  {stats?.totalIpress.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-[#1ABB9C]">
                  34% <span className="text-[#73879C] font-normal">From last Week</span>
                </div>
              </div>

              <div className="border-l-2 border-[#E6E9ED] pl-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3 h-3" /> Planes SIS
                </div>
                <div className="text-3xl font-bold text-[#34495E] leading-none mb-1">
                  {stats?.planData.length}
                </div>
                <div className="text-[10px] font-bold text-[#E74C3C]">
                  12% <span className="text-[#73879C] font-normal">From last Week</span>
                </div>
              </div>

              <div className="border-l-2 border-[#E6E9ED] pl-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-1">
                  <Database className="w-3 h-3" /> Registros
                </div>
                <div className="text-3xl font-bold text-[#34495E] leading-none mb-1">
                  {data.length.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-[#1ABB9C]">
                  34% <span className="text-[#73879C] font-normal">From last Week</span>
                </div>
              </div>

              <div className="border-l-2 border-[#E6E9ED] pl-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider mb-1">
                  <LinkIcon className="w-3 h-3" /> Conexiones
                </div>
                <div className="text-3xl font-bold text-[#34495E] leading-none mb-1">
                  7,325
                </div>
                <div className="text-[10px] font-bold text-[#1ABB9C]">
                  34% <span className="text-[#73879C] font-normal">From last Week</span>
                </div>
              </div>
            </div>

            {/* Main Chart Section */}
            <Card className="border border-[#E6E9ED] shadow-sm rounded-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl font-normal text-[#34495E]">Actividades de Atención <span className="text-sm text-[#73879C]">Tendencia temporal</span></CardTitle>
                </div>
                <div className="flex items-center gap-2 bg-white border border-[#D9DEE4] px-3 py-1 rounded text-xs">
                  <Filter className="w-3 h-3" />
                  <span>Enero 2024 - Diciembre 2024</span>
                </div>
              </CardHeader>
              <CardContent className="h-[350px] p-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.trendData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1ABB9C" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1ABB9C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#73879C' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#73879C' }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #D9DEE4', borderRadius: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#1ABB9C" 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top IPRESS Performance */}
              <Card className="border border-[#E6E9ED] shadow-sm rounded-none lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg font-normal text-[#34495E]">Rendimiento por IPRESS</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {stats?.ipressData.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="truncate max-w-[80%]">{item.name}</span>
                          <span>{item.value.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-[#EDEDED] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1ABB9C] transition-all duration-1000" 
                            style={{ width: `${(item.value / stats.ipressData[0].value) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Usage (Plan de Seguro) */}
              <Card className="border border-[#E6E9ED] shadow-sm rounded-none">
                <CardHeader>
                  <CardTitle className="text-lg font-normal text-[#34495E]">Uso por Plan de Seguro</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.planData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats?.planData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full mt-4 space-y-2">
                    {stats?.planData.slice(0, 5).map((plan, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: THEME_COLORS[index % THEME_COLORS.length] }} />
                          <span className="truncate max-w-[120px]">{plan.name}</span>
                        </div>
                        <span className="font-bold">{((plan.value / stats.totalAttentions) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Table */}
            <Card className="border border-[#E6E9ED] shadow-sm rounded-none overflow-hidden">
              <CardHeader className="bg-[#F7F7F7] border-b border-[#E6E9ED] py-3">
                <CardTitle className="text-sm font-bold text-[#34495E] uppercase">Resumen Detallado de Atenciones</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="border-b border-[#E6E9ED]">
                      <TableHead className="text-[#34495E] font-bold">Plan de Seguro</TableHead>
                      <TableHead className="text-right text-[#34495E] font-bold">Atenciones</TableHead>
                      <TableHead className="text-right text-[#34495E] font-bold">% Participación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.planData.map((plan, index) => (
                      <TableRow key={index} className="border-b border-[#E6E9ED] hover:bg-[#F9FAFB]">
                        <TableCell className="font-medium text-[#73879C]">{plan.name}</TableCell>
                        <TableCell className="text-right text-[#73879C]">{plan.value.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-[10px] font-bold text-[#1ABB9C] bg-[#1ABB9C]/10 px-2 py-0.5 rounded">
                            {((plan.value / stats.totalAttentions) * 100).toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
