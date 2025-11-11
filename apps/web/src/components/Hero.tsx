import { Bell, CheckCircle2, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export function Hero() {
  return (
    <div className="flex pt-4 justify-center min-h-[calc(100vh-4rem)]">
      <div className="px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-3 py-1 bg-emerald-100 text-emerald-800">
              Gerenciamento Colaborativo
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Organize suas tarefas com{' '}
              <span className="text-emerald-600">eficiência</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 mt-12 mx-auto">
              Gerencie projetos, colabore com sua equipe e receba notificações
              em tempo real. Tudo em um só lugar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="px-6 py-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Gestão Completa
                </h3>
                <p className="text-sm text-slate-600">
                  Organize tarefas com prioridades, status e prazos
                  personalizáveis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="px-6 py-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Colaboração
                </h3>
                <p className="text-sm text-slate-600">
                  Atribua tarefas, adicione comentários e trabalhe em equipe.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="px-6 py-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Tempo Real
                </h3>
                <p className="text-sm text-slate-600">
                  Receba notificações instantâneas sobre atualizações
                  importantes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
