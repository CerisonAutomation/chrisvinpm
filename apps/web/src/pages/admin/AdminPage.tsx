import { useState } from 'react';
import { useAuthStore } from '@/store';
import { useAdminLogin, useAdminStats, useAdminConfig, useAdminTransactions, useAdminContacts, useAdminInquiries, useClearCache, useRefreshToken, useUpdateConfig } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Shield, Settings, Users, CreditCard, Database, RefreshCw,
  Trash2, Eye, EyeOff, Server, Mail, Home, LogOut, Loader2,
  CheckCircle, XCircle, Palette, FileText, Megaphone, Sparkles,
  BarChart3, Globe, Layers, Wand2, Copy
} from 'lucide-react';
import { apiPost } from '@/lib/api';

// Admin Dashboard Component
function AdminDashboard() {
  const { clearAuth } = useAuthStore();
  const { data: stats } = useAdminStats();
  const { data: config } = useAdminConfig();
  const updateConfigMutation = useUpdateConfig();

  return (
    <div className="min-h-screen bg-[#0F0F10] text-[#F5F5F0]">
      <header className="bg-[#161618] border-b border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#D4AF37] flex items-center justify-center font-bold text-black">CV</div>
          <div>
            <h1 className="text-xl font-playfair">Enterprise Console</h1>
            <p className="text-[10px] text-[#A1A1AA] uppercase tracking-[0.2em] font-bold">Horus Zenith Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Badge className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 uppercase tracking-widest px-3 py-1">Production Live</Badge>
           <Button variant="ghost" size="sm" onClick={clearAuth} className="text-[#A1A1AA] hover:text-[#F5F5F0]"><LogOut className="w-4 h-4 mr-2" /> Exit</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-4 gap-6 mb-10">
          <Link to="/admin/cms" className="col-span-1">
            <Card className="bg-[#161618] border-white/5 hover:border-[#D4AF37]/50 transition-all cursor-pointer group rounded-none h-full">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Palette className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="font-playfair text-lg mb-1">Visual Builder</h3>
                <p className="text-xs text-[#A1A1AA]">Manage pages & content</p>
              </CardContent>
            </Card>
          </Link>
          <div className="col-span-1">
            <Card className="bg-[#161618] border-white/5 rounded-none h-full">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="font-playfair text-lg mb-1">AI Marketing</h3>
                <p className="text-xs text-[#A1A1AA]">Gemini-powered tools</p>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-2">
            <Card className="bg-[#161618] border-white/5 rounded-none h-full flex flex-col justify-center px-10">
               <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-3xl font-playfair text-[#D4AF37] mb-1">1,248</h3>
                    <p className="text-xs text-[#A1A1AA] uppercase tracking-widest font-bold">Total Confirmed Stays</p>
                 </div>
                 <div className="h-12 w-px bg-white/5" />
                 <div>
                    <h3 className="text-3xl font-playfair text-green-400 mb-1">98.2%</h3>
                    <p className="text-xs text-[#A1A1AA] uppercase tracking-widest font-bold">Success Rate</p>
                 </div>
               </div>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="ai" className="space-y-8">
           <TabsList className="bg-[#161618] border border-white/5 p-1 rounded-none h-12">
             <TabsTrigger value="ai" className="rounded-none px-8 font-bold uppercase tracking-widest text-xs data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">AI Assistant</TabsTrigger>
             <TabsTrigger value="secrets" className="rounded-none px-8 font-bold uppercase tracking-widest text-xs data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">Secret Manager</TabsTrigger>
             <TabsTrigger value="system" className="rounded-none px-8 font-bold uppercase tracking-widest text-xs data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">System Status</TabsTrigger>
           </TabsList>

           <TabsContent value="ai">
              <Card className="bg-[#161618] border-white/5 rounded-none overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5">
                  <div className="flex items-center gap-3 text-blue-400">
                    <Sparkles className="w-5 h-5" />
                    <CardTitle className="font-playfair text-2xl">Gemini Marketing Suite</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                   <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <Label className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold mb-2 block">Generation Model</Label>
                          <select className="w-full bg-[#0F0F10] border border-white/10 p-3 text-sm font-bold outline-none focus:border-[#D4AF37]">
                            <option>Gemini 1.5 Pro (Omni-perfect)</option>
                            <option>Gemini 1.5 Flash (Speed)</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold mb-2 block">Context / Instructions</Label>
                          <Textarea id="ai-context" placeholder="Write a luxury property description for a sea-front penthouse in Valletta..." className="min-h-[150px] bg-[#0F0F10] border-white/10 rounded-none focus:border-[#D4AF37]" />
                        </div>
                        <Button
                          onClick={async () => {
                            const ctx = (document.getElementById('ai-context') as HTMLTextAreaElement).value;
                            if(!ctx) return toast.error('Context required');
                            toast.loading('Consulting Gemini...');
                            try {
                              const res = await apiPost<any>('/ai/generate', { type: 'marketing_copy', context: { text: ctx } });
                              const out = document.getElementById('ai-output');
                              if(out) out.innerText = res.content.text || JSON.stringify(res.content, null, 2);
                              toast.dismiss();
                              toast.success('Magic generated');
                            } catch(e) { toast.dismiss(); toast.error('Magic failed'); }
                          }}
                          className="w-full py-8 bg-[#D4AF37] text-black font-black uppercase tracking-[0.3em] rounded-none hover:bg-[#E5C158]"
                        >
                          <Wand2 className="w-5 h-5 mr-3" /> Generate Omni-Perfect Content
                        </Button>
                      </div>
                      <div className="bg-[#0F0F10] border border-white/10 p-8 relative group">
                         <Button variant="ghost" className="absolute top-4 right-4 text-[#A1A1AA] hover:text-[#D4AF37]"><Copy className="w-4 h-4" /></Button>
                         <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-black mb-4">Gemini Response</p>
                         <div id="ai-output" className="text-[#F5F5F0] leading-relaxed font-manrope whitespace-pre-wrap italic opacity-60">
                           AI-generated marketing magic will appear here...
                         </div>
                      </div>
                   </div>
                </CardContent>
              </Card>
           </TabsContent>

           <TabsContent value="secrets">
              <Card className="bg-[#161618] border-white/5 rounded-none">
                <CardHeader className="p-8 border-b border-white/5">
                   <div className="flex items-center gap-3 text-[#D4AF37]">
                    <Shield className="w-5 h-5" />
                    <CardTitle className="font-playfair text-2xl">Enterprise Secret Manager</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                   <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-8">
                         <div className="space-y-3">
                            <Label className="text-xs uppercase tracking-widest font-bold">Google Cloud / Gemini API Key</Label>
                            <div className="flex gap-2">
                               <Input type="password" placeholder="••••••••••••••••" className="bg-[#0F0F10] border-white/10 rounded-none h-12" />
                               <Button variant="outline" className="border-white/10 h-12 rounded-none hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] px-6 font-bold uppercase text-[10px]">Update</Button>
                            </div>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-xs uppercase tracking-widest font-bold">Stripe Production Secret Key</Label>
                            <div className="flex gap-2">
                               <Input type="password" placeholder="••••••••••••••••" className="bg-[#0F0F10] border-white/10 rounded-none h-12" />
                               <Button variant="outline" className="border-white/10 h-12 rounded-none hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] px-6 font-bold uppercase text-[10px]">Update</Button>
                            </div>
                         </div>
                      </div>
                      <div className="bg-[#0F0F10] border border-white/10 p-8">
                         <p className="text-[10px] text-[#A1A1AA] uppercase tracking-widest font-black mb-6">Security Status</p>
                         <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                               <span className="text-sm">Key Encryption</span>
                               <Badge className="bg-green-500/20 text-green-400 border-green-500/20">AES-256 GCM</Badge>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                               <span className="text-sm">Environment Sync</span>
                               <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                               <span className="text-sm">Persistence Layer</span>
                               <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20">Firestore Secured</Badge>
                            </div>
                         </div>
                      </div>
                   </div>
                </CardContent>
              </Card>
           </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export function AdminPage() {
  const { isAuthenticated } = useAuthStore();
  // Simplified for demo - would use a real login component
  if(!isAuthenticated) return <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center"><Button onClick={() => window.location.reload()} className="bg-[#D4AF37] text-black">Retry Connection</Button></div>;
  return <AdminDashboard />;
}
