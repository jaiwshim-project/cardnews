'use client';

import { forwardRef } from 'react';
import { CardData, Domain, CardType, DOMAIN_STYLES, CARD_TYPE_LABELS } from '@/types/cardnews';

interface CardTemplateProps {
  card: CardData;
  domain: Domain;
  cardIndex: number;
}

const CARD_TYPE_COLORS: Record<CardType, { bg: string; badge: string }> = {
  HOOK: { bg: 'from-blue-500 to-blue-600', badge: 'bg-blue-700' },
  EMPATHY: { bg: 'from-green-500 to-green-600', badge: 'bg-green-700' },
  PROBLEM: { bg: 'from-yellow-500 to-yellow-600', badge: 'bg-yellow-700' },
  SOLUTION: { bg: 'from-purple-500 to-purple-600', badge: 'bg-purple-700' },
  CTA: { bg: 'from-red-500 to-red-600', badge: 'bg-red-700' },
};

const CardTemplate = forwardRef<HTMLDivElement, CardTemplateProps>(
  ({ card, domain, cardIndex }, ref) => {
    const typeColor = CARD_TYPE_COLORS[card.type];
    const domainStyle = DOMAIN_STYLES[domain];

    return (
      <div
        ref={ref}
        className={`w-[400px] h-[500px] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br ${typeColor.bg} text-white flex flex-col`}
        style={{ fontFamily: domainStyle.fontFamily }}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <span className={`${typeColor.badge} px-3 py-1 rounded-full text-xs font-medium`}>
              {CARD_TYPE_LABELS[card.type]}
            </span>
            <span className="text-white/70 text-sm">{cardIndex + 1} / 5</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4 leading-tight">{card.title}</h2>
          <p className="text-lg leading-relaxed opacity-95">{card.content}</p>
          {card.subContent && (
            <p className="mt-4 text-sm opacity-80 border-t border-white/20 pt-4">
              {card.subContent}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4">
          <div className="flex justify-between items-center text-xs opacity-70">
            <span>AI CardNews Generator</span>
            <span>{card.type}</span>
          </div>
        </div>
      </div>
    );
  }
);

CardTemplate.displayName = 'CardTemplate';

export default CardTemplate;
