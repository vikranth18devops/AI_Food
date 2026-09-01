import React from 'react';
import { Salad, Shield, Cpu, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-850/80 bg-[#060911]/90 py-10 text-slate-400 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Salad className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-sm font-bold text-white heading-font">FoodLens AI Platform</span>
            <p className="text-[11px] text-slate-500">Event-driven Microservices Architecture</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 font-jura">
          <span className="flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-800">
            <Cpu className="h-3.5 w-3.5 text-emerald-400" /> NestJS Mesh
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-800">
            <Zap className="h-3.5 w-3.5 text-amber-400" /> RabbitMQ AMQP
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-800">
            <Shield className="h-3.5 w-3.5 text-sky-400" /> USDA Science
          </span>
        </div>

        <p className="text-xs text-slate-500 text-center sm:text-right">
          © {new Date().getFullYear()} FoodLens AI. Educational nutrition information. Not medical advice.
        </p>
      </div>
    </footer>
  );
};
