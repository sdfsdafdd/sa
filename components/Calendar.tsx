
import React, { useState } from 'react';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  activeDates: string[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, activeDates }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate).getMonth());
  const year = 2026; // Fixed as requested

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
  const firstDay = new Date(year, currentMonth, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Start Monday

  const days = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrev = () => setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
  const handleNext = () => setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-semibold text-white">
          {monthNames[currentMonth]} {year}
        </h3>
        <div className="flex gap-2">
          <button onClick={handlePrev} className="p-1 hover:bg-white/10 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={handleNext} className="p-1 hover:bg-white/10 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(d => (
          <span key={d} className="text-[10px] font-bold text-slate-500 uppercase">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          
          const dateStr = `${year}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const hasActivity = activeDates.includes(dateStr);

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(dateStr)}
              className={`
                relative h-8 w-8 flex items-center justify-center rounded-lg text-xs transition-all
                ${isSelected ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              {day}
              {hasActivity && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-400 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
