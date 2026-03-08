import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, Save, Eye, Trash2, GripVertical, Settings,
  Sparkles, Palette, Globe, Megaphone, Clock, Gift, Users,
  ChevronDown, ChevronUp, Copy, ExternalLink, Loader2,
  Wand2, RefreshCw, Check, Languages, History
} from 'lucide-react';
import { SectionIcons } from '@/lib/icons';

// Block Editor Component
function BlockEditor({ block, onUpdate, onDelete, onMove }: any) {
  const [expanded, setExpanded] = useState(false);
  const Icon = SectionIcons[block.type] || Settings;

  return (
    <Card className="bg-card border-border overflow-hidden rounded-none mb-4 group relative">
      <CardHeader className="py-4 px-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="cursor-grab active:cursor-grabbing text-[#A1A1AA] hover:text-[#D4AF37]">
              <GripVertical className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 bg-[#D4AF37]/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-playfair text-[#F5F5F0] text-lg capitalize">{block.type.replace(/([A-Z])/g, ' $1')}</p>
              <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-bold mt-0.5">Section ID: {block.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" onClick={() => onMove('up')} className="h-8 w-8 p-0 text-[#A1A1AA] hover:text-[#D4AF37]"><ChevronUp className="w-4 h-4" /></Button>
             <Button variant="ghost" size="sm" onClick={() => onMove('down')} className="h-8 w-8 p-0 text-[#A1A1AA] hover:text-[#D4AF37]"><ChevronDown className="w-4 h-4" /></Button>
             <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="text-[#A1A1AA] hover:text-[#F5F5F0]">
               {expanded ? 'Collapse' : 'Edit Content'}
             </Button>
             <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10">
               <Trash2 className="w-4 h-4" />
             </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-8 bg-background/50">
          <div className="space-y-6">
             {/* Simplified recursive form renderer or direct JSON */}
             <div className="space-y-2">
               <Label className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold">Content Configuration (JSON)</Label>
               <Textarea
                 value={JSON.stringify(block.data, null, 2)}
                 onChange={(e) => {
                   try { onUpdate(JSON.parse(e.target.value)); } catch(err) {}
                 }}
                 className="min-h-[300px] bg-[#0F0F10] border-white/10 font-mono text-sm text-green-400 focus:border-[#D4AF37] rounded-none"
               />
             </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export function CMSEditorPage() {
  const { pageSlug } = useParams();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [activeLocale, setActiveLocale] = useState('en');
  const [hasChanges, setHasChanges] = useState(false);

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['cms-admin-page', pageSlug, activeLocale],
    queryFn: () => apiGet(`/cms/pages/${pageSlug}?locale=${activeLocale}`),
    enabled: !!pageSlug,
  });

  useEffect(() => {
    if (pageData) setCurrentPage(pageData);
  }, [pageData]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiPut(`/cms/admin/pages/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-admin-page'] });
      setHasChanges(false);
      toast.success('Omni-perfect State Saved');
    }
  });

  if (isLoading) return <div className="flex justify-center p-40"><Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" /></div>;

  return (
    <div className="min-h-screen bg-[#0F0F10] text-[#F5F5F0]">
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#161618] border-b border-white/5 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="text-[#A1A1AA] hover:text-[#F5F5F0]"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-playfair tracking-tight">Visual Page Builder</h1>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center bg-[#0F0F10] border border-white/10 rounded-none px-3 h-10">
             <Languages className="w-4 h-4 mr-2 text-[#D4AF37]" />
             <select
               value={activeLocale}
               onChange={(e) => setActiveLocale(e.target.value)}
               className="bg-transparent border-none outline-none text-sm font-bold tracking-widest"
             >
               <option value="en">EN</option>
               <option value="mt">MT</option>
             </select>
           </div>

           <Button variant="outline" className="border-white/10 rounded-none h-10 hover:bg-white/5"><History className="w-4 h-4 mr-2" /> Versions</Button>

           <Button
             onClick={() => saveMutation.mutate(currentPage)}
             disabled={!hasChanges || saveMutation.isPending}
             className="bg-[#D4AF37] text-[#0F0F10] rounded-none px-8 font-bold uppercase tracking-widest h-10 hover:bg-[#E5C158]"
           >
             {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
             Save Perfect State
           </Button>
        </div>
      </header>

      <main className="pt-24 pb-20 max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-playfair mb-2">{currentPage?.title}</h2>
            <p className="text-[#A1A1AA] text-sm uppercase tracking-[0.2em]">Editing path: /{currentPage?.slug}</p>
          </div>
          <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 uppercase tracking-widest px-4 py-1">{currentPage?.status}</Badge>
        </div>

        <div className="space-y-4">
          {currentPage?.sections?.sort((a: any, b: any) => a.order - b.order).map((section: any, idx: number) => (
            <BlockEditor
              key={section.id}
              block={section}
              onMove={(dir: string) => {
                const sections = [...currentPage.sections];
                const newIdx = dir === 'up' ? idx - 1 : idx + 1;
                if (newIdx < 0 || newIdx >= sections.length) return;
                [sections[idx].order, sections[newIdx].order] = [sections[newIdx].order, sections[idx].order];
                setCurrentPage({ ...currentPage, sections });
                setHasChanges(true);
              }}
              onUpdate={(data: any) => {
                const sections = currentPage.sections.map((s: any) => s.id === section.id ? { ...s, data } : s);
                setCurrentPage({ ...currentPage, sections });
                setHasChanges(true);
              }}
              onDelete={() => {
                const sections = currentPage.sections.filter((s: any) => s.id !== section.id);
                setCurrentPage({ ...currentPage, sections });
                setHasChanges(true);
              }}
            />
          ))}
        </div>

        <Button className="w-full mt-8 py-8 border-2 border-dashed border-white/10 bg-transparent text-[#A1A1AA] hover:border-[#D4AF37]/50 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-none transition-all">
          <Plus className="w-5 h-5 mr-2" /> Add New Section Block
        </Button>
      </main>
    </div>
  );
}
