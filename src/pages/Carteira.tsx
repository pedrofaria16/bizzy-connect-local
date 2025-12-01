import "../css/profile.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { apiJson } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Wallet } from "lucide-react";

const formatMoney = (v: number) => {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const Carteira = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: any = await apiJson('/api/transactions');
        if (!mounted) return;
        setTransactions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(t('Erro ao buscar transações da carteira'), e);
        setTransactions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [t]);

  const credited = transactions.filter(t => t && t.type === 'credit').reduce((s, it) => s + (Number(it.valor) || 0), 0);
  const debited = transactions.filter(t => t && t.type === 'debit').reduce((s, it) => s + (Number(it.valor) || 0), 0);
  const balance = credited - debited;

  const [showTransactions, setShowTransactions] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add'|'transfer'|'none'>('none');
  const [dialogAmount, setDialogAmount] = useState('');

  const displayedBalance = balance;

  const displayedTransactions = [...transactions].sort((a:any,b:any) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : (a.id || 0);
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : (b.id || 0);
    return tb - ta;
  });

  function openDialogFor(mode: 'add'|'transfer') {
    setDialogMode(mode);
    setDialogAmount('');
    setDialogOpen(true);
  }

  function confirmDialog() {
    const raw = dialogAmount.replace(/[^0-9,\.]/g, '').replace(',', '.');
    const val = Number(raw) || 0;
    if (val <= 0) {
      setDialogOpen(false);
      return;
    }
    (async () => {
      try {
        const payload = { 
          type: dialogMode === 'add' ? 'credit' : 'debit', 
          valor: val, 
          titulo: dialogMode === 'add' ? t('Inserção manual') : t('Transferência manual') 
        };
        const created: any = await apiJson('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        setTransactions(prev => [created, ...prev]);
      } catch (e) {
        console.error(t('Erro ao criar transação:'), e);
      } finally {
        setDialogOpen(false);
        setDialogMode('none');
      }
    })();
  }

  return (
    <div className="min-h-screen bg-background profile-page">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/feed')} className="hover:bg-secondary profile-icon-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{t('Carteira')}</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-6">
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full p-3 bg-primary text-primary-foreground">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('Saldo atual')}</div>
                <div className="text-3xl font-bold text-foreground">{formatMoney(displayedBalance)}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
            <div className="text-sm text-muted-foreground">{t('Gerenciar saldo')}</div>
            <div className="flex w-full sm:w-2/3 md:w-1/2 gap-3 sm:ml-auto">
              <Button onClick={() => openDialogFor('add')} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-150 rounded-md py-3 px-6 text-lg">
                {t('Inserir saldo')}
              </Button>
              <Button onClick={() => openDialogFor('transfer')} className="flex-1 bg-secondary text-darker-gray hover:bg-secondary/90 transition-colors duration-150 rounded-md py-3 px-6 text-lg">
                {t('Transferir saldo')}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('Transações')}</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowTransactions(s => !s)}>
                {showTransactions ? t('Ocultar') : t('Ver transações')}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-muted-foreground">{t('Carregando...')}</div>
          ) : (
            <div>
              {!showTransactions && (
                <div className="text-muted-foreground">{t('Transações ocultas. Clique em "Ver transações" para expandir.')}</div>
              )}
              {showTransactions && (
                <ul className="space-y-3">
                  {displayedTransactions.length === 0 && <li className="text-muted-foreground">{t('Nenhuma transação')}</li>}
                  {displayedTransactions.map((t:any) => (
                    <li key={t.id || Math.random()} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t.titulo || `${t('Serviço')} #${t.id}`}</div>
                        <div className="text-sm text-muted-foreground">
                          {t.status ? (t.status === 'feito' ? t('Concluído') : t.status) : ''}
                        </div>
                      </div>
                      <div className={`font-semibold ${t.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
                        {t.type === 'credit' ? `+ ${formatMoney(Number(t.valor) || 0)}` : `- ${formatMoney(Number(t.valor) || 0)}`}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) { setDialogMode('none'); } setDialogOpen(o); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{dialogMode === 'add' ? t('Inserir saldo') : t('Transferir saldo')}</DialogTitle>
                <DialogDescription>
                  {dialogMode === 'add' 
                    ? t('Escolha o valor em reais para adicionar à conta (sem API, operação local).')
                    : t('Escolha o valor em reais para remover da conta (sem API, operação local).')
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2 py-2">
                <Label>{t('Valor')}</Label>
                <Input value={dialogAmount} onChange={(e:any) => setDialogAmount(e.target.value)} placeholder={t('Ex: 50.00')} />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => { setDialogOpen(false); setDialogMode('none'); }}>
                  {t('Cancelar')}
                </Button>
                <Button onClick={confirmDialog}>
                  {dialogMode === 'add' ? t('Inserir') : t('Transferir')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </main>
    </div>
  );
};

export default Carteira;