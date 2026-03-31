import { useCRM } from './CRMProvider';
import { formatCurrency, PROFESSION_LABELS, DEAL_SOURCE_LABELS, Profession, DealSource } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Target, PieChartIcon } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

export default function ReportingView() {
  const { deals } = useCRM();

  // MRR Signé vs Pipeline
  const signedDeals = deals.filter(d => d.stage === 'Signé');
  const pipelineDeals = deals.filter(d => d.stage !== 'Signé' && d.stage !== 'Perdu');
  const mrrSigned = signedDeals.reduce((s, d) => s + d.mrr, 0);
  const mrrPipeline = pipelineDeals.reduce((s, d) => s + d.mrr, 0);

  const mrrData = [
    { name: 'MRR Signé', value: mrrSigned, fill: '#10b981' },
    { name: 'MRR Pipeline', value: mrrPipeline, fill: '#3b82f6' },
  ];

  // Conversion by profession
  const professionStats = (['avocat', 'notaire', 'commissaire_de_justice', 'expert_comptable'] as Profession[]).map(p => {
    const profDeals = deals.filter(d => d.profession === p);
    const won = profDeals.filter(d => d.stage === 'Signé').length;
    const total = profDeals.length;
    return {
      name: PROFESSION_LABELS[p],
      taux: total > 0 ? Math.round((won / total) * 100) : 0,
      total,
      won,
    };
  }).filter(p => p.total > 0);

  // Volume by source
  const sourceStats = (['cold_email', 'linkedin', 'referral', 'other'] as DealSource[]).map(s => {
    const count = deals.filter(d => d.source === s).length;
    return { name: DEAL_SOURCE_LABELS[s], value: count };
  }).filter(s => s.value > 0);

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">MRR Signé</p>
            <p className="text-xl font-bold font-mono text-green-600">{formatCurrency(mrrSigned)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">MRR Pipeline</p>
            <p className="text-xl font-bold font-mono text-blue-600">{formatCurrency(mrrPipeline)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Deals signés</p>
            <p className="text-xl font-bold font-mono">{signedDeals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Pipeline actif</p>
            <p className="text-xl font-bold font-mono">{pipelineDeals.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MRR Signé vs Pipeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              MRR Signé vs Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mrrData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis type="number" tickFormatter={(v) => `${v}€`} className="text-[10px]" />
                <YAxis type="category" dataKey="name" width={100} className="text-xs" />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {mrrData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion by profession */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              Taux de conversion par profession
            </CardTitle>
          </CardHeader>
          <CardContent>
            {professionStats.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={professionStats} margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="name" className="text-[10px]" />
                  <YAxis tickFormatter={(v) => `${v}%`} className="text-[10px]" />
                  <Tooltip formatter={(v: number, name: string) => [name === 'taux' ? `${v}%` : v, name === 'taux' ? 'Taux' : name]} />
                  <Bar dataKey="taux" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Volume by source */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-blue-600" />
              Volume de deals par source
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sourceStats.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={sourceStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {sourceStats.map((_entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
